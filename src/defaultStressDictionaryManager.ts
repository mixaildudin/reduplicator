import * as fs from 'fs';
import { StressDictionaryManager } from "./interfaces/stressDictionaryManager";
import { StressDictionary } from "./interfaces/stressDictionary";

export default class DefaultStressDictionaryManager implements StressDictionaryManager {
	private readonly dict: StressDictionary;

	constructor(stressDictionaryPath: string) {
		const dictContent = fs.readFileSync(stressDictionaryPath);
		this.dict = JSON.parse(dictContent.toString());
	}

	getStressedLetterIndex(word: string): number {
		return this.dict[word.toLowerCase().replace(/ё/g, 'е')];
	}
}