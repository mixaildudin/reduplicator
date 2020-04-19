import * as path from 'path';
import {StressManager} from "./interfaces/stressManager";
import {StressDictionary} from "./interfaces/stressDictionary";
import {DictionaryReader} from './dictionaryReader';

export class DefaultStressManager implements StressManager {
	private readonly dict: StressDictionary;

	constructor() {
		this.dict = DictionaryReader.read(path.join(__dirname, '../dict/dict.txt'));
	}

	getStressedLetterIndex(word: string): number {
		return this.dict[word.toLowerCase().replace(/ё/g, 'е')];
	}
}