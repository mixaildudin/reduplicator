import * as fs from 'fs';

declare type StressDictionary = { [word: string]: number };

interface WordStressInfo {
    letterNumber: number,
    syllableNumber: number
}

export default class Reduplicator {
    private readonly minWordLength = 3;
    private readonly vowels: Set<string>;
    private readonly consonants: Set<string>;
    private readonly dict: StressDictionary;

    private customDictPath: string;
    private customDict: StressDictionary;

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

    constructor(stressDictPath: string, customDictPath?: string) {
        this.vowels = new Set<string>('аеёиоуыэюя'.split(''));
        this.consonants = new Set<string>('бвгджзйклмнпрстфхцчшщ'.split(''));

        this.customDictPath = customDictPath;
        
        const dictContent = fs.readFileSync(stressDictPath);
        this.dict = JSON.parse(dictContent.toString());

        if (customDictPath && fs.existsSync(customDictPath)) {
            const content = fs.readFileSync(customDictPath);
            this.customDict = JSON.parse(content.toString());

            Object.assign(this.dict, this.customDict);
        }
    }

    reduplicate(word: string): string {
        if (word.length < this.minWordLength) {
            return null;
        }

        const lowercasedWord = word.toLowerCase();

        const wordLetters = word.split('');
        const lowercasedWordLetters = lowercasedWord.split('');

        const syllableCount = this.getSyllableCount(lowercasedWordLetters);
        if (syllableCount === 0) {
            return null;
        }

        if (syllableCount === 1) {
            return this.singleSyllableWordPrefix + lowercasedWord;
        }

        const shouldSaveCustomStress = this.customDictPath && wordLetters.some(this.isUpperCase);
        if (shouldSaveCustomStress) {
            this.saveCustomStress(wordLetters, this.customDictPath);
        }

        const stressInfo = this.getStressInfo(word);

        // слова из двух слогов и слова с ударением на первый слог редуплицируем дефолтным алгоритмом.
        // от слов с 3 и менее слогами отрезается слишком много, поэтому слова с неизвестным ударением и в которых менее трех слогов
        // тоже обрабатываем дефолтным алгоритмом
        if (syllableCount === 2 || (stressInfo && stressInfo.syllableNumber === 0) || (!stressInfo && syllableCount <= 3)) {
            return this.reduplicateSimply(lowercasedWordLetters, stressInfo);
        } else {
            return this.reduplicateAdvanced(lowercasedWordLetters, stressInfo);
        }
    }

    private getSyllableCount(wordLetters: string[]): number {
        return wordLetters.filter(x => this.vowels.has(x)).length;
    }

    private getVowelPair(vowel: string, forStressedVowel: boolean): string {
        return (forStressedVowel
            ? this.stressedVowelPairs[vowel] 
            : this.defaultVowelPairs[vowel]);
    }

    private getStressInfo(word: string): WordStressInfo {
        word = word.toLowerCase();

        const letterNumber = this.dict[word] || this.dict[word.replace(/ё/g, 'е')];
        if (letterNumber == null) return null;

        const syllableNumber = this.getSyllableCount(word.substring(0, letterNumber + 1).split('')) - 1;

        return { letterNumber, syllableNumber };
    }

    private reduplicateSimply(wordLetters: string[], stressInfo: WordStressInfo): string {
        const knownStressedLetterIdx = stressInfo && stressInfo.letterNumber;

        for (let i = 0; i < wordLetters.length - 1; i++) {
            const curLetter = wordLetters[i];
            const nextLetter = wordLetters[i + 1];

            if (this.vowels.has(curLetter)) {
                // если буква ударная или за ней идет согласная, редуплицируем
                if (knownStressedLetterIdx === i || this.consonants.has(nextLetter)) {
                    return this.prefix + this.getVowelPair(curLetter, knownStressedLetterIdx == null || knownStressedLetterIdx === i ) + wordLetters.slice(i + 1).join('');
                }
            }
        }

        return null;
    }

    private reduplicateAdvanced(wordLetters: string[], stressInfo: WordStressInfo): string {
        const prefixSyllableCount = 2;

        let letterNumber = 0, syllableNumber = 0, vowel: string = null;

        // найдем гласную букву, соответствующую второму слогу
        for (letterNumber = 0; letterNumber < wordLetters.length; letterNumber++) {
            if (this.vowels.has(wordLetters[letterNumber])) {
                syllableNumber++;
                vowel = wordLetters[letterNumber];
            }

            if (syllableNumber === prefixSyllableCount) {
                break;
            }
        }

        const pairVowel = this.getVowelPair(vowel, !stressInfo || stressInfo.syllableNumber === prefixSyllableCount - 1);
        return this.prefix + pairVowel + wordLetters.slice(letterNumber + 1).join('');
    }

    private isUpperCase(c: string): boolean {
        return c && (c === c.toUpperCase());
    }

    private saveCustomStress(wordLetters: string[], customDictPath: string): void {
        const isVowelStressedPredicate = (letter: string) => this.vowels.has(letter.toLowerCase()) && this.isUpperCase(letter);

        const stressedVowels = wordLetters.filter(isVowelStressedPredicate);
        if (stressedVowels.length !== 1) {
            return;
        }

        const word = wordLetters.join('').toLowerCase();
        const stressedLetterIdx = wordLetters.findIndex(isVowelStressedPredicate);

        if (!this.customDict) {
            this.customDict = {};
        }

        this.dict[word] = this.customDict[word] = stressedLetterIdx;
        fs.writeFileSync(customDictPath, JSON.stringify(this.customDict, null, 2), { encoding: 'UTF8' });
    }
}