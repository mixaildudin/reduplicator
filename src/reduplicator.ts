import {StressManager} from './interfaces/stressManager';
import AlphabetHelper from './alphabetHelper';
import {ReduplicatorOptions} from './reduplicatorOptions';
import {OneSyllableWordReduplicationMode} from './oneSyllableWordReduplicationMode';

type Vowel = 'а' | 'е' | 'ё' | 'и' | 'о' | 'у' | 'ы' | 'э' | 'ю' | 'я';
type VowelPairs = Record<Vowel, Vowel>;

interface WordStress {
	letterIdx: number,
	syllableIdx: number
}

export interface ReduplicatorConfig {
	prefix: string;
	defaultPairVowel?: Vowel;
	stressedVowelPairs?: Readonly<VowelPairs>;
}

export class Reduplicator {
	private readonly vowels: Set<string>;
	private readonly consonants: Set<string>;
	private readonly minWordLength = 2;

	constructor(private readonly dictionaryManager: StressManager,
				private readonly configuration: ReduplicatorConfig) {
		if (!dictionaryManager) {
			throw new Error('No dictionary manager specified');
		}

		if (!configuration) {
			throw new Error('No configuration specified');
		}

		this.vowels = new Set<string>(AlphabetHelper.getVowels());
		this.consonants = new Set<string>(AlphabetHelper.getConsonants());

		this.validateConfiguration();
	}

	public validateConfiguration() {
		const c = this.configuration;

		if (!c.prefix || typeof c.prefix !== 'string') {
			throw new Error('Configuration should contain a valid prefix');
		}

		// если префикс не содержит гласных, то можно не указывать парные гласные, иначе - валидируем
		if (this.getSyllableCount(c.prefix) > 0) {
			if (!c.defaultPairVowel || !this.vowels.has(c.defaultPairVowel)) {
				throw new Error('Configuration should contain a valid default pair vowel');
			}

			if (!c.stressedVowelPairs || typeof c.stressedVowelPairs !== 'object') {
				throw new Error('Configuration should contain valid stressed vowel pairs');
			}

			for (const v of this.vowels) {
				const pair = c.stressedVowelPairs[v as Vowel];

				if (!pair || !this.vowels.has(pair)) {
					throw new Error(`Invalid pair vowel for the letter '${v}'`);
				}
			}
		}
	}

	public reduplicate(word: string, options?: ReduplicatorOptions): string | null {
		if (word.length < this.minWordLength) {
			return null;
		}

		const lowercasedWord = word.toLowerCase();
		const lowercasedWordLetters = lowercasedWord.split('');

		const syllableCount = this.getSyllableCount(lowercasedWordLetters);
		if (syllableCount === 0) {
			return null;
		}

		if (syllableCount === 1) {
			const mode = options?.oneSyllableWordHandling ?? OneSyllableWordReduplicationMode.Default;
			if (mode === OneSyllableWordReduplicationMode.AddPrefix) {
				return this.configuration.prefix + this.configuration.defaultPairVowel + lowercasedWord;
			}
		}

		const stressInfo = this.getStressInfo(word);

		// слова с неизвестным ударением, слова из двух слогов и слова с ударением на первый слог редуплицируем простым алгоритмом.
		if (!stressInfo || syllableCount === 2 || (stressInfo?.syllableIdx === 0)) {
			return this.reduplicateSimply(lowercasedWordLetters, stressInfo);
		} else {
			return this.reduplicateAdvanced(lowercasedWordLetters, stressInfo);
		}
	}

	private reduplicateSimply(wordLetters: string[], stressInfo: WordStress | null): string | null {
		const knownStressedLetterIdx = stressInfo?.letterIdx;

		for (let i = 0; i < wordLetters.length - 1; i++) {
			const curLetter = wordLetters[i];
			const nextLetter = wordLetters[i + 1];

			if (this.vowels.has(curLetter)) {
				if (knownStressedLetterIdx == null || knownStressedLetterIdx === i || this.consonants.has(nextLetter)) {
					return this.configuration.prefix + this.getVowelPair(curLetter as Vowel, knownStressedLetterIdx == null || knownStressedLetterIdx === i ) + wordLetters.slice(i + 1).join('');
				}
			}
		}

		return null;
	}

	private reduplicateAdvanced(wordLetters: string[], stressInfo: WordStress): string {
		const prefixSyllableCount = this.getSyllableCount(this.configuration.prefix);

		let letterNumber, syllableNumber = 0, vowel: Vowel | null = null;

		// найдем гласную букву, которая будет идти после префикса
		for (letterNumber = 0; letterNumber < wordLetters.length; letterNumber++) {
			if (this.vowels.has(wordLetters[letterNumber])) {
				syllableNumber++;
				vowel = wordLetters[letterNumber] as Vowel;
			}

			if (syllableNumber === prefixSyllableCount + 1) {
				break;
			}
		}

		if (!vowel) {
			throw new Error('Vowel not found, something went wrong');
		}

		const pairVowel = this.getVowelPair(vowel, !stressInfo || stressInfo.syllableIdx === prefixSyllableCount);
		return this.configuration.prefix + pairVowel + wordLetters.slice(letterNumber + 1).join('');
	}

	private getSyllableCount(word: string | string[]): number {
		const letters = Array.isArray(word) ? word : word.split('');
		return letters.filter(x => this.vowels.has(x.toLowerCase())).length;
	}

	private getVowelPair(vowel: Vowel, forStressedVowel: boolean): string {
		// если в префиксе нет гласных, то оставляем исходную, иначе подберем парную в зависимости от ударности
		if (this.getSyllableCount(this.configuration.prefix) === 0) {
			return vowel;
		}

		return (forStressedVowel
			? this.configuration.stressedVowelPairs![vowel]
			: this.configuration.defaultPairVowel!);
	}

	private getStressInfo(word: string): WordStress | null {
		// TODO: подумать, что со словами с дефисами, пока что такой костылик. считаем, что для них ударение нам не известно
		if (word.includes('-')) {
			return null;
		}

		const letterIdx = this.dictionaryManager.getStressedLetterIndex(word);
		if (letterIdx == null) return null;

		const stressedSyllableIdx = this.getSyllableCount(word.substring(0, letterIdx + 1).split('')) - 1;

		return {
			letterIdx,
			syllableIdx: stressedSyllableIdx
		};
	}
}