import * as fs from 'fs';
import * as path from 'path';
import {StressManager} from "./interfaces/stressManager";
import {StressDictionary} from "./interfaces/stressDictionary";
import AlphabetHelper from './alphabetHelper';
import {DictionaryReader} from './dictionaryReader';

export class DynamicStressManager implements StressManager {
	private readonly dict: StressDictionary;
	private readonly vowels: Set<string>;

	private customDictPath: string;
	private customDict: StressDictionary;
	private isCustomDictionaryReadOnly: boolean = false;

	constructor(customDictionaryPath?: string, isCustomDictionaryReadOnly?: boolean) {
		this.dict = DictionaryReader.read(path.join(__dirname, '../dict/dict.txt'));

		this.isCustomDictionaryReadOnly = isCustomDictionaryReadOnly || false;

		this.vowels = new Set<string>(AlphabetHelper.getVowels());

		this.customDictPath = customDictionaryPath;

		if (customDictionaryPath && fs.existsSync(customDictionaryPath)) {
			const content = fs.readFileSync(customDictionaryPath);
			this.customDict = JSON.parse(content.toString());

			Object.assign(this.dict, this.customDict);
		}
	}

	public getStressedLetterIndex(word: string): number {
		const stressInfo = this.getStress(word);

		const shouldUpdateDictionary = stressInfo.isCustom && this.customDictPath && !this.isCustomDictionaryReadOnly;
		if (shouldUpdateDictionary) {
			this.saveCustomStress(this.normalizeWord(word), stressInfo.stressIdx);
		}

		return stressInfo.stressIdx;
	}

	private getStress(word: string): { stressIdx: number, isCustom: boolean } {
		const isStressedVowel = (letter: string) => this.vowels.has(letter.toLowerCase()) && this.isUpperCase(letter);

		const stressedVowels = word.split('').map((letter, idx) => { return { letter, idx } }).filter(x => isStressedVowel(x.letter));
		if (stressedVowels.length !== 1) {
			const stressIdx = this.dict[this.normalizeWord(word)];
			return { stressIdx, isCustom: false };
		}

		const stressIdx = stressedVowels[0].idx;
		return { stressIdx, isCustom: true };
	}

	private saveCustomStress(word: string, stressIdx: number): void {
		if (!this.customDict) {
			this.customDict = {};
		}

		this.dict[word] = this.customDict[word] = stressIdx;
		fs.writeFileSync(this.customDictPath, JSON.stringify(this.customDict, null, 2), { encoding: 'UTF8' });
	}

	private isUpperCase(c: string): boolean {
		return c && (c === c.toUpperCase());
	}

	private normalizeWord(word: string): string {
		return word.toLowerCase().replace(/ё/g, 'е');
	}
}