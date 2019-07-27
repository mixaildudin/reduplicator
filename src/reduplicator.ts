import WordStress from './interfaces/wordStress';
import { StressManager } from './interfaces/stressManager';
import AlphabetHelper from './alphabetHelper';

export class Reduplicator {
	private readonly minWordLength = 3;
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

	private readonly singleSyllableWordPrefix = 'хуе';

	constructor(dictionaryManager: StressManager) {
		this.vowels = new Set<string>(AlphabetHelper.getVowels());
		this.consonants = new Set<string>(AlphabetHelper.getConsonants());

		this.dictionaryManager = dictionaryManager;
	}

	public reduplicate(word: string): string {
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
			return this.singleSyllableWordPrefix + lowercasedWord;
		}

		const stressInfo = this.getStressInfo(word);

		// слова из двух слогов и слова с ударением на первый слог редуплицируем дефолтным алгоритмом.
		// от слов с 3 и менее слогами отрезается слишком много, поэтому слова с неизвестным ударением и в которых менее трех слогов
		// тоже обрабатываем дефолтным алгоритмом
		if (syllableCount === 2 || (stressInfo && stressInfo.syllableIdx === 0) || (!stressInfo && syllableCount <= 3)) {
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
		const letterIdx = this.dictionaryManager.getStressedLetterIndex(word);
		if (letterIdx == null) return null;

		const stressedSyllableIdx = this.getSyllableCount(word.substring(0, letterIdx + 1).split('')) - 1;

		return {
			letterIdx, 
			syllableIdx: stressedSyllableIdx
		};
	}

	private reduplicateSimply(wordLetters: string[], stressInfo: WordStress): string {
		const knownStressedLetterIdx = stressInfo && stressInfo.letterIdx;

		for (let i = 0; i < wordLetters.length - 1; i++) {
			const curLetter = wordLetters[i];
			const nextLetter = wordLetters[i + 1];

			if (this.vowels.has(curLetter)) {
				// если буква ударная или за ней идет согласная, редуплицируем
				if (knownStressedLetterIdx === i || this.consonants.has(nextLetter)) {
					return this.prefix + this.getVowelPair(curLetter, knownStressedLetterIdx == null || knownStressedLetterIdx === i ) + wordLetters.slice(i + 1).join('');
				}
			}
		}

		return null;
	}

	private reduplicateAdvanced(wordLetters: string[], stressInfo: WordStress): string {
		const prefixSyllableCount = 2;

		let letterNumber = 0, syllableNumber = 0, vowel: string = null;

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