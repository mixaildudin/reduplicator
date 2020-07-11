import AlphabetHelper from './alphabetHelper';

export class EncodingManager {
	private static readonly allCharacters = AlphabetHelper.getAll().concat('1234567890'.split(''));

	private charToCode: {[letter: string]: number} = {};
	private codeToChar: string[] = new Array(EncodingManager.allCharacters.length);

	constructor() {
		for (let i = 0; i < EncodingManager.allCharacters.length; i++) {
			const letter = EncodingManager.allCharacters[i];

			this.charToCode[letter] = i;
			this.codeToChar[i] = letter;
		}
	}

	public encode(s: string): Buffer {
		if (!s) {
			return Buffer.from([]);
		}

		const result = Buffer.alloc(s.length);

		for (let i = 0; i < s.length; i++) {
			const char = s[i];
			const code = this.charToCode[char];
			if (code == null) {
				throw new Error('Unknown character ' + char);
			}

			result[i] = code;
		}

		return result;
	}

	public decodeOne(code: number): string {
		if (code == null) {
			return '';
		}

		const char = this.codeToChar[code];
		if (char == null) {
			throw new Error('Unknown code ' + code);
		}

		return char;
	}

	public isCodeOfLetter(code: number): boolean {
		// TODO: волшебство, но зато выше производительность. возможно, стоит написать нормально
		return code >= 0 && code <= 32;
	}

	public isCodeOfDigit(code: number): boolean {
		// TODO: волшебство, но зато выше производительность. возможно, стоит написать нормально
		return code >= 33 && code <= 42;
	}

	public isDigit(c: string): boolean {
		return c >= '0' && c <= '9';
	}

	public isLetter(c: string): boolean {
		return (c >= 'a' && c <= 'я') || c === 'ё';
	}
}