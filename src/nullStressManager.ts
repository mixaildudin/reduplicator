import {StressManager} from './interfaces/stressManager';

export class NullStressManager implements StressManager {
	getStressedLetterIndex(word: string): number {
		return null;
	}
}