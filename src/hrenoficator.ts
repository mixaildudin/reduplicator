import {Reduplicator, Vowel, VowelPairs} from './reduplicator';
import {StressManager} from './interfaces/stressManager';

export class Hrenoficator extends Reduplicator {
	constructor(dictionaryManager: StressManager) {
		super(dictionaryManager);
	}

	protected get stressedVowelPairs(): Readonly<VowelPairs> {
		return Object.freeze({
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
		});
	}

	protected get defaultPairVowel(): Vowel {
		return 'о';
	}

	protected get prefix(): string {
		return 'хрен';
	}

	protected get oneSyllableWordPrefix(): string {
		return 'хрено';
	}
}