import * as fs from 'fs';
import AlphabetHelper from './alphabetHelper';
import {DefaultStressManager} from './defaultStressManager';

type StressDictionary = { [word: string]: number | undefined };

export class DynamicStressManager extends DefaultStressManager {
	private readonly vowels: Set<string>;

	private readonly customDictPath: string | undefined;
	private readonly customDict: StressDictionary = {};
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

	public getStressedLetterIndex(word: string): number | null {
		const [ stressIdx, isCustom ] = this.getStress(word);

		const shouldUpdateDictionary = stressIdx != null && isCustom && this.customDictPath && !this.isCustomDictionaryReadOnly;
		if (shouldUpdateDictionary) {
			this.saveCustomStress(this.normalizeWord(word), stressIdx);
		}

		return stressIdx;
	}

	private getStress(word: string): [ stressIdx: number | null, isCustom: boolean ] {
		const isStressedVowel = (letter: string) => this.vowels.has(letter.toLowerCase()) && DynamicStressManager.isUpperCase(letter);

		const customStressedVowels = word.split('').map((letter, idx) => { return { letter, idx } }).filter(x => isStressedVowel(x.letter));

		if (customStressedVowels.length === 1) {
			const stressIdx = customStressedVowels[0].idx;
			return [ stressIdx, true ];
		}

		const normalizedWord = this.normalizeWord(word);
		let stressIdx = this.customDict[normalizedWord] ?? super.getStressedLetterIndex(normalizedWord);
		return [ stressIdx, false ];
	}

	private saveCustomStress(word: string, stressIdx: number): void {
		this.customDict[word] = stressIdx;
		fs.writeFileSync(this.customDictPath!, JSON.stringify(this.customDict, null, 2), { encoding: 'UTF8' });
	}

	private static isUpperCase(c: string): boolean {
		return !!c && (c === c.toUpperCase());
	}
}