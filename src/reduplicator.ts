import WordStress from './interfaces/wordStress';
import {StressManager} from './interfaces/stressManager';
import AlphabetHelper from './alphabetHelper';
import {ReduplicatorOptions} from './reduplicatorOptions';
import {OneSyllableWordReduplicationMode} from './oneSyllableWordReduplicationMode';

export class Reduplicator {
	private readonly minWordLength = 2;
	private readonly vowels: Set<string>;
	private readonly consonants: Set<string>;
	private readonly dictionaryManager: StressManager;

	private readonly defaultVowelPairs: { [letter: string]: string } = {
		"а": "е",
		"е": "е",
		"ё": "е",
		"и": "е",
		"о": "е",
		"у": "е",
		"ы": "е",
		"э": "е",
		"ю": "е",
		"я": "е"
	};

	private readonly stressedVowelPairs: { [letter: string]: string } = {
		"а": "я",
		"е": "е",
		"ё": "ё",
		"и": "и",
		"о": "ё",
		"у": "ю",
		"ы": "и",
		"э": "е",
		"ю": "ю",
		"я": "я"
	};

	private readonly prefix = 'ху';

	private readonly oneSyllableWordPrefix = 'хуе';

	constructor(dictionaryManager: StressManager) {
		this.vowels = new Set<string>(AlphabetHelper.getVowels());
		this.consonants = new Set<string>(AlphabetHelper.getConsonants());

		this.dictionaryManager = dictionaryManager;
	}

	public reduplicate(word: string, options?: ReduplicatorOptions): string {
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

	private getSyllableCount(wordLetters: string[]): number {
		return wordLetters.filter(x => this.vowels.has(x.toLowerCase())).length;
	}

	private getVowelPair(vowel: string, forStressedVowel: boolean): string {
		return (forStressedVowel
			? this.stressedVowelPairs[vowel]
			: this.defaultVowelPairs[vowel]);
	}

	private getStressInfo(word: string): WordStress {
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

	private reduplicateSimply(wordLetters: string[], stressInfo: WordStress): string {
		const knownStressedLetterIdx = stressInfo?.letterIdx;

		for (let i = 0; i < wordLetters.length - 1; i++) {
			const curLetter = wordLetters[i];
			const nextLetter = wordLetters[i + 1];

			if (this.vowels.has(curLetter)) {
				if (knownStressedLetterIdx == null || knownStressedLetterIdx === i || this.consonants.has(nextLetter)) {
					return this.prefix + this.getVowelPair(curLetter, knownStressedLetterIdx == null || knownStressedLetterIdx === i ) + wordLetters.slice(i + 1).join('');
				}
			}
		}

		return null;
	}

	private reduplicateAdvanced(wordLetters: string[], stressInfo: WordStress): string {
		const prefixSyllableCount = 2;

		let letterNumber, syllableNumber = 0, vowel: string = null;

		// найдем гласную букву, соответствующую второму слогу
		for (letterNumber = 0; letterNumber < wordLetters.length; letterNumber++) {
			if (this.vowels.has(wordLetters[letterNumber])) {
				syllableNumber++;
				vowel = wordLetters[letterNumber];
			}

			if (syllableNumber === prefixSyllableCount) {
				break;
			}
		}

		const pairVowel = this.getVowelPair(vowel, !stressInfo || stressInfo.syllableIdx === prefixSyllableCount - 1);
		return this.prefix + pairVowel + wordLetters.slice(letterNumber + 1).join('');
	}
}