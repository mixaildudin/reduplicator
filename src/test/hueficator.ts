import {describe, it} from 'mocha';
import {expect} from 'chai';
import {Hueficator} from '../hueficator';
import {DefaultStressManager} from '../defaultStressManager';
import {DynamicStressManager} from '../dynamicStressManager';
import {OneSyllableWordReduplicationMode} from '../oneSyllableWordReduplicationMode';

describe('Hueficator with DefaultStressManager', () => {
	const dict = new DefaultStressManager();
	const r = new Hueficator(dict);

	describe('#reduplicate', () => {
		it('should correctly reduplicate words from the dictionary', () => {
			expect(r.reduplicate('окно')).to.equal('хуекно');
			expect(r.reduplicate('бомба')).to.equal('хуёмба');
			expect(r.reduplicate('пятёрочка')).to.equal('хуёрочка');
			expect(r.reduplicate('яичница')).to.equal('хуичница');
			expect(r.reduplicate('поезд')).to.equal('хуёезд');
			expect(r.reduplicate('поезда')).to.equal('хуезда');

			expect(r.reduplicate('горка')).to.equal('хуёрка');
			expect(r.reduplicate('доска')).to.equal('хуеска');

			expect(r.reduplicate('засветло')).to.equal('хуясветло');
			expect(r.reduplicate('балтика')).to.equal('хуялтика');
			expect(r.reduplicate('творожник')).to.equal('хуёжник');
			expect(r.reduplicate('мобильный')).to.equal('хуильный');
			expect(r.reduplicate('татары')).to.equal('хуяры');
			expect(r.reduplicate('борода')).to.equal('хуеда');
			expect(r.reduplicate('бородка')).to.equal('хуёдка');

			expect(r.reduplicate('выставивший')).to.equal('хуиставивший');
			expect(r.reduplicate('студенческий')).to.equal('хуенческий');
			expect(r.reduplicate('казачество')).to.equal('хуячество');
			expect(r.reduplicate('холодильник')).to.equal('хуедильник');
			expect(r.reduplicate('переворот')).to.equal('хуеворот');
			expect(r.reduplicate('переболеть')).to.equal('хуеболеть');

			expect(r.reduplicate('выпотрошила')).to.equal('хуипотрошила');
			expect(r.reduplicate('дизайнерские')).to.equal('хуяйнерские');
			expect(r.reduplicate('положение')).to.equal('хуежение');
			expect(r.reduplicate('перевороты')).to.equal('хуевороты');
			expect(r.reduplicate('полуфабрикат')).to.equal('хуефабрикат');

			expect(r.reduplicate('объяснительная')).to.equal('хуеснительная');
		});

		it('should correctly reduplicate words with capital letters', () => {
			expect(r.reduplicate('Умный')).to.equal('хуюмный');
			expect(r.reduplicate('ПРИвет')).to.equal('хуевет');
		});

		it('should correctly reduplicate single-syllable words', () => {
			expect(r.reduplicate('кот', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.AddPrefix })).to.equal('хуекот');
			expect(r.reduplicate('кот')).to.equal('хуёт');
			expect(r.reduplicate('кот', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.Default })).to.equal('хуёт');
			expect(r.reduplicate('пёс', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.AddPrefix })).to.equal('хуепёс');
			expect(r.reduplicate('пёс')).to.equal('хуёс');
			expect(r.reduplicate('пёс', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.Default })).to.equal('хуёс');
			expect(r.reduplicate('да', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.AddPrefix })).to.equal('хуеда');
			expect(r.reduplicate('да')).to.be.null;
			expect(r.reduplicate('да', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.Default })).to.be.null;
			expect(r.reduplicate('что', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.AddPrefix })).to.equal('хуечто');
			expect(r.reduplicate('что', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.Default })).to.be.null;
			expect(r.reduplicate('что')).to.be.null;
		});

		it('should correctly reduplicate words not found in the dictionary', () => {
			expect(r.reduplicate('дикси')).to.equal('хуикси');
			expect(r.reduplicate('кампьютер')).to.equal('хуямпьютер');
		});

		it('should not reduplicate word if it is too short or has no vowels', () => {
			expect(r.reduplicate('птрт')).to.be.null;
			expect(r.reduplicate('а')).to.be.null;
		});

		it('should correctly reduplicate words with hyphens', () => {
			expect(r.reduplicate('англо-саксонский')).to.equal('хуянгло-саксонский');
			expect(r.reduplicate('русско-английский')).to.equal('хуюсско-английский');
			expect(r.reduplicate('русско-немецко-французский')).to.equal('хуюсско-немецко-французский');
			expect(r.reduplicate('из-за')).to.equal('хуиз-за');
		});
	});
});

describe('Hueficator with DynamicStressManager', () => {
	const dict = new DynamicStressManager();
	const r = new Hueficator(dict);

	describe('#reduplicate', () => {
		it('should correctly reduplicate words with custom stress', () => {
			expect(r.reduplicate('собака')).to.equal('хуяка');
			expect(r.reduplicate('сОбака')).to.equal('хуёбака');
			expect(r.reduplicate('собакА')).to.equal('хуека');
		});

		it('should ignore ambiguous custom stress', () => {
			expect(r.reduplicate('сОбАка')).to.equal('хуяка');
			expect(r.reduplicate('хОлОдильник')).to.equal('хуедильник');
		});

		it('should not treat capital consonants as custom stress', () => {
			expect(r.reduplicate('СобаКа')).to.equal('хуяка');
			expect(r.reduplicate('СОбаКа')).to.equal('хуёбака');
			expect(r.reduplicate('ХоЛоДиЛьНик')).to.equal('хуедильник');
			expect(r.reduplicate('холодильниК')).to.equal('хуедильник');
		});

		it('should correctly reduplicate words with hyphens regardless of the stress', () => {
			expect(r.reduplicate('англо-саксОнский')).to.equal('хуянгло-саксонский');
			expect(r.reduplicate('Англо-саксонский')).to.equal('хуянгло-саксонский');
			expect(r.reduplicate('русско-англИйский')).to.equal('хуюсско-английский');
			expect(r.reduplicate('рУсско-английский')).to.equal('хуюсско-английский');
		});
	});
});