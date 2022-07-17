import {Reduplicator} from './reduplicator';
import {StressManager} from './interfaces/stressManager';
import {ReduplicatorOptions} from './reduplicatorOptions';

export class Hueficator {
	private readonly redupicator: Reduplicator;
	
	constructor(dictionaryManager: StressManager) {
		this.redupicator = new Reduplicator(dictionaryManager, {
			defaultPairVowel: 'е',
			prefix: 'ху',
			stressedVowelPairs: {
				'а': 'я',
				'е': 'е',
				'ё': 'ё',
				'и': 'и',
				'о': 'ё',
				'у': 'ю',
				'ы': 'и',
				'э': 'е',
				'ю': 'ю',
				'я': 'я'
			}
		});
	}

	public reduplicate(word: string, options?: ReduplicatorOptions): string | null {
		return this.redupicator.reduplicate(word, options);
	}
}