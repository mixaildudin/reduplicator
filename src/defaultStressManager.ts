import * as fs from 'fs';
import * as path from 'path';
import { StressManager } from "./interfaces/stressManager";
import { StressDictionary } from "./interfaces/stressDictionary";

export default class DefaultStressManager implements StressManager {
	private readonly dict: StressDictionary;

	constructor() {
		const stressDictionaryPath = path.join(__dirname, '../dict/dict.json');

		const dictContent = fs.readFileSync(stressDictionaryPath);
		this.dict = JSON.parse(dictContent.toString());
	}

	getStressedLetterIndex(word: string): number {
		return this.dict[word.toLowerCase().replace(/ё/g, 'е')];
	}
}