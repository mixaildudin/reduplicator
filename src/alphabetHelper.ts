export default class AlphabetHelper {
	private static vowels: string[] = 'аеёиоуыэюя'.split('');
	private static consonants: string[] = 'бвгджзйклмнпрстфхцчшщ'.split('');

	public static getVowels(): string[] {
		return this.vowels.slice();
	}

	public static getConsonants(): string[] {
		return this.consonants.slice();
	}
}