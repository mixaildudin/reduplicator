import {StressManager} from './interfaces/stressManager';
import AlphabetHelper from './alphabetHelper';
import {ReduplicatorOptions} from './reduplicatorOptions';
import {OneSyllableWordReduplicationMode} from './oneSyllableWordReduplicationMode';

export type Vowel = 'а' | 'е' | 'ё' | 'и' | 'о' | 'у' | 'ы' | 'э' | 'ю' | 'я';

export type VowelPairs = Record<Vowel, Vowel>;

interface WordStress {
	letterIdx: number,
	syllableIdx: number
}

export abstract class Reduplicator {
	protected readonly vowels: Set<string>;
	protected readonly consonants: Set<string>;
	protected readonly dictionaryManager: StressManager;
	protected readonly minWordLength = 2;

	protected abstract get defaultPairVowel(): Vowel;
	protected abstract get stressedVowelPairs(): Readonly<VowelPairs>;
	protected abstract get oneSyllableWordPrefix(): string;
	protected abstract get prefix(): string;

	protected constructor(dictionaryManager: StressManager) {
		this.vowels = new Set<string>(AlphabetHelper.getVowels());
		this.consonants = new Set<string>(AlphabetHelper.getConsonants());

		this.dictionaryManager = dictionaryManager;
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
				return this.oneSyllableWordPrefix + lowercasedWord;
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
					return this.prefix + this.getVowelPair(curLetter as Vowel, knownStressedLetterIdx == null || knownStressedLetterIdx === i ) + wordLetters.slice(i + 1).join('');
				}
			}
		}

		return null;
	}

	private reduplicateAdvanced(wordLetters: string[], stressInfo: WordStress): string {
		const prefixSyllableCount = 2;

		let letterNumber, syllableNumber = 0, vowel: Vowel | null = null;

		// найдем гласную букву, соответствующую второму слогу
		for (letterNumber = 0; letterNumber < wordLetters.length; letterNumber++) {
			if (this.vowels.has(wordLetters[letterNumber])) {
				syllableNumber++;
				vowel = wordLetters[letterNumber] as Vowel;
			}

			if (syllableNumber === prefixSyllableCount) {
				break;
			}
		}

		const pairVowel = this.getVowelPair(vowel!, !stressInfo || stressInfo.syllableIdx === prefixSyllableCount - 1);
		return this.prefix + pairVowel + wordLetters.slice(letterNumber + 1).join('');
	}

	private getSyllableCount(wordLetters: string[]): number {
		return wordLetters.filter(x => this.vowels.has(x.toLowerCase())).length;
	}

	private getVowelPair(vowel: Vowel, forStressedVowel: boolean): string {
		return (forStressedVowel
			? this.stressedVowelPairs[vowel]
			: this.defaultPairVowel);
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