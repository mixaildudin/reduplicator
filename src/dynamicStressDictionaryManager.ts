import * as fs from 'fs';
import { StressDictionaryManager } from "./interfaces/stressDictionaryManager";
import { StressDictionary } from "./interfaces/stressDictionary";
import AlphabetHelper from './alphabetHelper';

export default class DynamicStressDictionaryManager implements StressDictionaryManager {
	private readonly dict: StressDictionary;
	private readonly vowels: Set<string>;

	private customDictPath: string;
	private customDict: StressDictionary;

	constructor(stressDictionaryPath: string, customDictionaryPath: string) {
		const dictContent = fs.readFileSync(stressDictionaryPath);
		this.dict = JSON.parse(dictContent.toString());

		this.vowels = new Set<string>(AlphabetHelper.getVowels());

		this.customDictPath = customDictionaryPath;

		if (customDictionaryPath && fs.existsSync(customDictionaryPath)) {
			const content = fs.readFileSync(customDictionaryPath);
			this.customDict = JSON.parse(content.toString());

			Object.assign(this.dict, this.customDict);
		}
	}

	public getStressedLetterIndex(word: string): number {
		const wordLetters = word.split('');

		const shouldSaveCustomStress = this.customDictPath && wordLetters.some(this.isUpperCase);
		if (shouldSaveCustomStress) {
			this.saveCustomStress(wordLetters, this.customDictPath);
		}

		return this.dict[word.toLowerCase().replace(/ё/g, 'е')];
	}

	private saveCustomStress(wordLetters: string[], customDictPath: string): void {
		const isVowelStressedPredicate = (letter: string) => this.vowels.has(letter.toLowerCase()) && this.isUpperCase(letter);

		const stressedVowels = wordLetters.filter(isVowelStressedPredicate);
		if (stressedVowels.length !== 1) {
			return;
		}

		const word = wordLetters.join('').toLowerCase();
		const stressedLetterIdx = wordLetters.findIndex(isVowelStressedPredicate);

		if (!this.customDict) {
			this.customDict = {};
		}

		this.dict[word] = this.customDict[word] = stressedLetterIdx;
		fs.writeFileSync(customDictPath, JSON.stringify(this.customDict, null, 2), { encoding: 'UTF8' });
	}

	private isUpperCase(c: string): boolean {
		return c && (c === c.toUpperCase());
	}
}