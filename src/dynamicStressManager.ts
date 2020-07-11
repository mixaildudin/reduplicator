import * as fs from 'fs';
import {StressDictionary} from "./interfaces/stressDictionary";
import AlphabetHelper from './alphabetHelper';
import {StressManagerWithBuiltInDictionary} from './stressManagerWithBuiltInDictionary';

export class DynamicStressManager extends StressManagerWithBuiltInDictionary {
	private readonly vowels: Set<string>;

	private readonly customDictPath: string;
	private customDict: StressDictionary = {};
	private readonly isCustomDictionaryReadOnly: boolean = false;

	constructor(customDictionaryPath?: string, isCustomDictionaryReadOnly?: boolean) {
		super();
		this.isCustomDictionaryReadOnly = isCustomDictionaryReadOnly || false;

		this.vowels = new Set<string>(AlphabetHelper.getVowels());

		this.customDictPath = customDictionaryPath;

		if (customDictionaryPath && fs.existsSync(customDictionaryPath)) {
			const content = fs.readFileSync(customDictionaryPath);
			this.customDict = JSON.parse(content.toString());
		}
	}

	public getStressedLetterIndex(word: string): number {
		const stressInfo = this.getStress(word);

		const shouldUpdateDictionary = stressInfo.isCustom && this.customDictPath && !this.isCustomDictionaryReadOnly;
		if (shouldUpdateDictionary) {
			this.saveCustomStress(DynamicStressManager.normalizeWord(word), stressInfo.stressIdx);
		}

		return stressInfo.stressIdx;
	}

	private getStress(word: string): { stressIdx: number, isCustom: boolean } {
		const isStressedVowel = (letter: string) => this.vowels.has(letter.toLowerCase()) && DynamicStressManager.isUpperCase(letter);

		const stressedVowels = word.split('').map((letter, idx) => { return { letter, idx } }).filter(x => isStressedVowel(x.letter));
		if (stressedVowels.length !== 1) {
			const normalizedWord = DynamicStressManager.normalizeWord(word);
			let stressIdx = this.customDict[normalizedWord] ?? super.getStressedLetterIndex(normalizedWord);
			return { stressIdx, isCustom: false };
		}

		const stressIdx = stressedVowels[0].idx;
		return { stressIdx, isCustom: true };
	}

	private saveCustomStress(word: string, stressIdx: number): void {
		if (!this.customDict) {
			this.customDict = {};
		}

		this.customDict[word] = stressIdx;
		fs.writeFileSync(this.customDictPath, JSON.stringify(this.customDict, null, 2), { encoding: 'UTF8' });
	}

	private static isUpperCase(c: string): boolean {
		return c && (c === c.toUpperCase());
	}

	private static normalizeWord(word: string): string {
		return word.toLowerCase().replace(/ё/g, 'е');
	}
}