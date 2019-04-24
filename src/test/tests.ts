import { it, describe } from 'mocha';
import { expect } from 'chai';
import Reduplicator from '../reduplicator';

describe('Reduplicator', () => {
    const r = new Reduplicator('./src/dict/dict.json');

    describe('#reduplicate', () => {
        it('should correctly reduplicate words from the dictionary', () => {            
            expect(r.reduplicate('окно')).to.equal('хуекно');
            expect(r.reduplicate('бомба')).to.equal('хуёмба');
            expect(r.reduplicate('пятёрочка')).to.equal('хуёрочка');
            expect(r.reduplicate('бомба')).to.equal('хуёмба');
            expect(r.reduplicate('яишница')).to.equal('хуишница');
            expect(r.reduplicate('поезд')).to.equal('хуёезд');
            expect(r.reduplicate('поезда')).to.equal('хуезда');
            expect(r.reduplicate('баунти')).to.equal('хуяунти');

            expect(r.reduplicate('горка')).to.equal('хуёрка');
            expect(r.reduplicate('доска')).to.equal('хуеска');

            expect(r.reduplicate('засветло')).to.equal('хуясветло');
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
            expect(r.reduplicate('кот')).to.equal('хуекот');
            expect(r.reduplicate('пёс')).to.equal('хуепёс');
            expect(r.reduplicate('караганда')).to.equal('хуяганда');
            expect(r.reduplicate('балтика')).to.equal('хуялтика');
        });

        it('should correctly reduplicate words not found in the dictionary', () => {            
            expect(r.reduplicate('дикси')).to.equal('хуикси');
            expect(r.reduplicate('кампьютер')).to.equal('хуямпьютер');
        });

        it('should not reduplicate word if it is too short or has no vowels', () => {            
            expect(r.reduplicate('птрт')).to.be.null;
            expect(r.reduplicate('а')).to.be.null;
            expect(r.reduplicate('ад')).to.be.null;
        });
    });
});