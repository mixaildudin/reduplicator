import {Reduplicator, Vowel, VowelPairs} from './reduplicator';
import {StressManager} from './interfaces/stressManager';

export class Hueficator extends Reduplicator {
	constructor(dictionaryManager: StressManager) {
		super(dictionaryManager);
	}

	private stressedPairs: Readonly<VowelPairs> = Object.freeze({
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
	});

	protected get defaultPairVowel(): Vowel {
		return 'е';
	}

	protected get stressedVowelPairs(): Readonly<VowelPairs> {
		return this.stressedPairs;
	}

	protected get prefix() {
		return 'ху';
	}

	protected get oneSyllableWordPrefix() {
		return 'хуе';
	}
}