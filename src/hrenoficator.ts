import {Reduplicator} from './reduplicator';
import {StressManager} from './interfaces/stressManager';
import {ReduplicatorOptions} from './reduplicatorOptions';

export class Hrenoficator {
	private readonly redupicator: Reduplicator;

	constructor(dictionaryManager: StressManager) {
		this.redupicator = new Reduplicator(dictionaryManager, {
			defaultPairVowel: 'о',
			prefix: 'хрен',
			stressedVowelPairs: {
				'а': 'а',
				'е': 'е',
				'ё': 'ё',
				'и': 'и',
				'о': 'о',
				'у': 'у',
				'ы': 'ы',
				'э': 'э',
				'ю': 'ю',
				'я': 'я'
			}
		});
	}

	public reduplicate(word: string, options?: ReduplicatorOptions): string | null {
		return this.redupicator.reduplicate(word, options);
	}
}