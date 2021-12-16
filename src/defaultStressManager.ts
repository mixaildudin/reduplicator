import {EncodingManager} from './encodingManager';
import * as fs from 'fs';
import * as path from 'path';
import {unzipSync} from 'zlib';
import {StressManager} from './interfaces/stressManager';

export class DefaultStressManager implements StressManager {
	private readonly dict: Buffer;
	private encoding: EncodingManager;

	constructor() {
		const gzipContent: Buffer = fs.readFileSync(path.join(__dirname, '../dict/dict.gz'));
		this.dict = unzipSync(gzipContent);
		this.encoding = new EncodingManager();
	}

	protected normalizeWord(word: string): string {
		return word.toLowerCase().replace(/ё/g, 'е');
	}

	getStressedLetterIndex(word: string): number | null {
		if (!word) {
			return null;
		}

		word = this.normalizeWord(word);

		let left = 0,
			right = this.dict.length - 1,
			middle: number;

		while (left < right) {
			middle = Math.floor((left + right) / 2);

			let currentWord = '';
			let currentWordStressIdxString = '';

			for (let i = middle; i >= 0; i--) {
				const charCode = this.dict[i];
				const curChar = this.encoding.decodeOne(charCode);
				const isDigit = this.encoding.isDigit(curChar);

				if (isDigit) {
					currentWordStressIdxString = curChar + currentWordStressIdxString;
				} else {
					currentWord = curChar + currentWord;
				}

				if (i === 0) {
					break;
				}

				const isPrevCharDigit = this.encoding.isCodeOfDigit(this.dict[i - 1]);

				// если текущий - буква, а предыдущий - цифра, мы дошли до начала записи
				if (!isDigit && isPrevCharDigit) {
					break;
				}
			}

			for (let i = middle; i < this.dict.length; i++) {
				const charCode = this.dict[i];
				const curChar = this.encoding.decodeOne(charCode);
				const isDigit = this.encoding.isDigit(curChar);

				// серединный символ уже обработали
				if (i !== middle) {
					if (isDigit) {
						currentWordStressIdxString += curChar;
					} else {
						currentWord += curChar;
					}
				}

				if (i === this.dict.length - 1) {
					break;
				}

				const isNextCharDigit = this.encoding.isCodeOfDigit(this.dict[i + 1]);

				// если текущий символ - цифра, а следующий - буква, мы дошли до конца записи
				if (isDigit && !isNextCharDigit) {
					break;
				}
			}

			if (currentWord === word) {
				return parseInt(currentWordStressIdxString);
			}

			if (word < currentWord) {
				right = middle;
			} else {
				left = middle + 1;
			}
		}

		return null;
	}
}