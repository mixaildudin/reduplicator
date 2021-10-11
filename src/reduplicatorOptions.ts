import {OneSyllableWordReduplicationMode} from './oneSyllableWordReduplicationMode';

export interface ReduplicatorOptions {
	/**
	 * Позволяет указать, как обрабатывать слова из одного слога, см. {@link OneSyllableWordReduplicationMode}
	 */
	oneSyllableWordHandling?: OneSyllableWordReduplicationMode;
}