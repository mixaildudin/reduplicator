import { it, describe } from 'mocha';
import { expect } from 'chai';
import Reduplicator from '../reduplicator';

describe('Reduplicator', () => {
    const r = new Reduplicator('./src/dict/dict.json');

    describe('#reduplicate', () => {
        it('should correctly reduplicate words from the dictionary', () => {            
            expect(r.reduplicate('окно')).to.equal('хуекно');
            expect(r.reduplicate('бомба')).to.equal('хуёмба');
            expect(r.reduplicate('пятерочка')).to.equal('хуетерочка');
            expect(r.reduplicate('бомба')).to.equal('хуёмба');
            expect(r.reduplicate('яишница')).to.equal('хуишница');
            expect(r.reduplicate('поезд')).to.equal('хуёезд');
            expect(r.reduplicate('поезда')).to.equal('хуезда');
            expect(r.reduplicate('баунти')).to.equal('хуяунти');
        });

        it('should correctly reduplicate words with capital letters', () => {
            expect(r.reduplicate('Умный')).to.equal('хуюмный');
            expect(r.reduplicate('ПРИвет')).to.equal('хуевет');
        });

        it('should correctly reduplicate single-syllable words', () => {            
            expect(r.reduplicate('кот')).to.equal('хуекот');
            expect(r.reduplicate('пёс')).to.equal('хуепёс');
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