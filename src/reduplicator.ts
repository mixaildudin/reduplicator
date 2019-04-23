import * as fs from 'fs';

declare type StressDictionary = { [word: string]: number };

export default class Reduplicator {
    private readonly minWordLength = 3;
    private readonly vowels: Set<string>;
    private readonly consonants: Set<string>;
    private readonly dict: StressDictionary;

    private readonly defaultVowelPairs: { [letter: string]: string } = {
        "а": "е",
        "е": "е",
        "ё": "е",
        "и": "е",
        "о": "е",
        "у": "е",
        "ы": "е",
        "э": "е",
        "ю": "е",
        "я": "е"
    };

    private readonly stressedVowelPairs: { [letter: string]: string } = {
        "а": "я",
        "е": "е",
        "ё": "ё",
        "и": "и",
        "о": "ё",
        "у": "ю",
        "ы": "и",
        "э": "е",
        "ю": "ю",
        "я": "я"
    };

    private readonly prefix = 'ху';

    private readonly singleSyllableWordPrefix = 'хуе';

    constructor(stressDictPath: string) {
        this.vowels = new Set<string>('аеёиоуыэюя'.split(''));
        this.consonants = new Set<string>('бвгджзйклмнпрстфхцчшщ'.split(''));

        const dictContent = fs.readFileSync(stressDictPath);
        this.dict = <StressDictionary>JSON.parse(dictContent.toString());
    }

    reduplicate(word: string): string {
        if (word.length < this.minWordLength) {
            return null;
        }

        word = word.toLowerCase();
        const wordLetters = word.split('');

        const syllableCount = this.getSyllableCount(wordLetters);
        if (syllableCount === 1) {
            return this.singleSyllableWordPrefix + word;
        }

        const knownStressedLetterIdx = this.dict[word];

        for (let i = 0; i < wordLetters.length - 1; i++) {
            const curLetter = wordLetters[i];
            const nextLetter = wordLetters[i + 1];

            if (this.vowels.has(curLetter)) {
                // если буква ударная или за ней идет согласная, редуплицируем
                if (knownStressedLetterIdx === i || this.consonants.has(nextLetter)) {
                    return this.prefix + this.getVowelPair(word, curLetter, i, knownStressedLetterIdx) + word.substring(i + 1);
                }
            }
        }

        return null;
    }

    private getSyllableCount(wordLetters: string[]): number {
        return wordLetters.filter(x => this.vowels.has(x)).length;
    }

    private getVowelPair(word: string, vowel: string, vowelIdx: number, knownStressedLetterIdx: number): string {
        return (knownStressedLetterIdx === undefined || knownStressedLetterIdx === vowelIdx 
            ? this.stressedVowelPairs[vowel] 
            : this.defaultVowelPairs[vowel]);
    }
}