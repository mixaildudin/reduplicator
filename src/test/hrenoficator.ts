import {describe, it} from 'mocha';
import {expect} from 'chai';
import {DefaultStressManager} from '../defaultStressManager';
import {DynamicStressManager} from '../dynamicStressManager';
import {OneSyllableWordReduplicationMode} from '../oneSyllableWordReduplicationMode';
import {Hrenoficator} from '../hrenoficator';

describe('Hrenoficator with DefaultStressManager', () => {
	const dict = new DefaultStressManager();
	const r = new Hrenoficator(dict);

	describe('#reduplicate', () => {
		it('should correctly reduplicate words from the dictionary', () => {
			expect(r.reduplicate('окно')).to.equal('хренокно');
			expect(r.reduplicate('бомба')).to.equal('хреномба');
			expect(r.reduplicate('пятёрочка')).to.equal('хренёрочка');
			expect(r.reduplicate('яичница')).to.equal('хреничница');
			expect(r.reduplicate('поезд')).to.equal('хреноезд');
			expect(r.reduplicate('поезда')).to.equal('хренозда');

			expect(r.reduplicate('горка')).to.equal('хренорка');
			expect(r.reduplicate('доска')).to.equal('хреноска');

			expect(r.reduplicate('засветло')).to.equal('хренасветло');
			expect(r.reduplicate('балтика')).to.equal('хреналтика');
			expect(r.reduplicate('творожник')).to.equal('хреножник');
			expect(r.reduplicate('мобильный')).to.equal('хренильный');
			expect(r.reduplicate('татары')).to.equal('хренары');
			expect(r.reduplicate('борода')).to.equal('хренода');
			expect(r.reduplicate('бородка')).to.equal('хренодка');

			expect(r.reduplicate('выставивший')).to.equal('хреныставивший');
			expect(r.reduplicate('студенческий')).to.equal('хрененческий');
			expect(r.reduplicate('казачество')).to.equal('хреначество');
			expect(r.reduplicate('холодильник')).to.equal('хренодильник');
			expect(r.reduplicate('переворот')).to.equal('хреноворот');
			expect(r.reduplicate('переболеть')).to.equal('хреноболеть');

			expect(r.reduplicate('выпотрошила')).to.equal('хреныпотрошила');
			expect(r.reduplicate('дизайнерские')).to.equal('хренайнерские');
			expect(r.reduplicate('положение')).to.equal('хреножение');
			expect(r.reduplicate('перевороты')).to.equal('хреновороты');
			expect(r.reduplicate('полуфабрикат')).to.equal('хренофабрикат');

			expect(r.reduplicate('объяснительная')).to.equal('хреноснительная');
		});

		it('should correctly reduplicate words with capital letters', () => {
			expect(r.reduplicate('Умный')).to.equal('хренумный');
			expect(r.reduplicate('ПРИвет')).to.equal('хреновет');
		});

		it('should correctly reduplicate single-syllable words', () => {
			expect(r.reduplicate('кот', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.AddPrefix })).to.equal('хренокот');
			expect(r.reduplicate('кот')).to.equal('хренот');
			expect(r.reduplicate('кот', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.Default })).to.equal('хренот');
			expect(r.reduplicate('пёс', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.AddPrefix })).to.equal('хренопёс');
			expect(r.reduplicate('пёс')).to.equal('хренёс');
			expect(r.reduplicate('пёс', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.Default })).to.equal('хренёс');
			expect(r.reduplicate('да', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.AddPrefix })).to.equal('хренода');
			expect(r.reduplicate('да')).to.be.null;
			expect(r.reduplicate('да', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.Default })).to.be.null;
			expect(r.reduplicate('что', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.AddPrefix })).to.equal('хреночто');
			expect(r.reduplicate('что', { oneSyllableWordHandling: OneSyllableWordReduplicationMode.Default })).to.be.null;
			expect(r.reduplicate('что')).to.be.null;
		});

		it('should correctly reduplicate words not found in the dictionary', () => {
			expect(r.reduplicate('дикси')).to.equal('хреникси');
			expect(r.reduplicate('кампьютер')).to.equal('хренампьютер');
		});

		it('should not reduplicate word if it is too short or has no vowels', () => {
			expect(r.reduplicate('птрт')).to.be.null;
			expect(r.reduplicate('а')).to.be.null;
		});

		it('should correctly reduplicate words with hyphens', () => {
			expect(r.reduplicate('англо-саксонский')).to.equal('хренангло-саксонский');
			expect(r.reduplicate('русско-английский')).to.equal('хренусско-английский');
			expect(r.reduplicate('русско-немецко-французский')).to.equal('хренусско-немецко-французский');
			expect(r.reduplicate('из-за')).to.equal('хрениз-за');
		});
	});
});

describe('Hrenoficator with DynamicStressManager', () => {
	const dict = new DynamicStressManager();
	const r = new Hrenoficator(dict);

	describe('#reduplicate', () => {
		it('should correctly reduplicate words with custom stress', () => {
			expect(r.reduplicate('собака')).to.equal('хренака');
			expect(r.reduplicate('сОбака')).to.equal('хренобака');
			expect(r.reduplicate('собакА')).to.equal('хренока');
		});

		it('should ignore ambiguous custom stress', () => {
			expect(r.reduplicate('сОбАка')).to.equal('хренака');
			expect(r.reduplicate('хОлОдильник')).to.equal('хренодильник');
		});

		it('should not treat capital consonants as custom stress', () => {
			expect(r.reduplicate('СобаКа')).to.equal('хренака');
			expect(r.reduplicate('СОбаКа')).to.equal('хренобака');
			expect(r.reduplicate('ХоЛоДиЛьНик')).to.equal('хренодильник');
			expect(r.reduplicate('холодильниК')).to.equal('хренодильник');
		});

		it('should correctly reduplicate words with hyphens regardless of the stress', () => {
			expect(r.reduplicate('англо-саксОнский')).to.equal('хренангло-саксонский');
			expect(r.reduplicate('Англо-саксонский')).to.equal('хренангло-саксонский');
			expect(r.reduplicate('русско-англИйский')).to.equal('хренусско-английский');
			expect(r.reduplicate('рУсско-английский')).to.equal('хренусско-английский');
		});
	});
});