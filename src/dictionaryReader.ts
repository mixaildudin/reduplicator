import * as fs from 'fs';
import {StressDictionary} from './interfaces/stressDictionary';

export class DictionaryReader {
	public static read(path: string): StressDictionary {
		if (!fs.existsSync(path)) {
			throw 'No dictionary found. Check the path: ' + path;
		}

		let result: StressDictionary = {};
		const fileDescriptor = fs.openSync(path, 'r');

		try {
			const chunkSize = 1048576;
			let buffer: Buffer;
			let fileOffset = 0;

			let currentWord = '';
			let currentWordStressIdxStr = '';

			const lineBreakCode = 0x0a;
			let bufferLeftover: number[] = [];

			while (true) {
				buffer = Buffer.alloc(chunkSize + bufferLeftover.length);
				for (let i = 0; i < bufferLeftover.length; i++) {
					buffer[i] = bufferLeftover[i];
				}

				const bytesReadCount = fs.readSync(fileDescriptor, buffer, bufferLeftover.length, chunkSize, fileOffset);
				const lastItemIdx = bytesReadCount + bufferLeftover.length - 1;
				const isLastChunk = bytesReadCount < chunkSize;

				bufferLeftover = [];

				if (bytesReadCount === 0) {
					break;
				}

				let lastLineBreakIdx = lastItemIdx;

				if (!isLastChunk) {
					for (let i = lastItemIdx; i >= 0; i--) {
						if (buffer[i] === lineBreakCode) {
							lastLineBreakIdx = i;
							break;
						}

						bufferLeftover.push(buffer[i]);
					}

					bufferLeftover.reverse();
				}

				const stringRead = buffer.toString('utf8', 0, lastLineBreakIdx + 1);

				for (let i = 0; i < stringRead.length; i++) {
					const char = stringRead[i];
					const isFileEndReached = isLastChunk && (i === (stringRead.length - 1));

					if (isLetter(char)) {
						currentWord += char;
					} else if (isDigit(char)) {
						currentWordStressIdxStr += char;
					}

					if (char === '\n' || isFileEndReached) {
						result[currentWord] = parseInt(currentWordStressIdxStr);

						currentWord = '';
						currentWordStressIdxStr = '';
					}
				}

				if (isLastChunk) {
					break;
				}

				fileOffset += bytesReadCount;
			}

			return result;
		} finally {
			if (fileDescriptor != null) {
				fs.closeSync(fileDescriptor);
			}
		}

		function isDigit(c: string) {
			return c >= '0' && c <= '9';
		}

		function isLetter(c: string) {
			return (c >= 'a' && c <= 'я') || c === 'ё';
		}
	}
}
