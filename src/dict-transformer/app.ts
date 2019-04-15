import * as readline from 'readline';
import * as fs from 'fs';

(function() {
    if (process.argv.length < 3) {
        console.log('USAGE: node app.ts source.txt destination.json');
        return;
    }

    const [,, source, destination] = process.argv;

    let processed = 0, added = 0, skipped = 0;

    const russianLetters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('');
    const allowedChars = russianLetters.concat(['-']);
    const stressChar = "'";

    const lineReader = readline.createInterface({
        input: fs.createReadStream(source)
    });

    // слово => номер букву под ударением.
    // для омонимичных слов с разным ударением будут коллизии, и последнее слово выиграет
    const result: { [word: string]: number } = {};

    lineReader.on('line', line => {
        line = line.trim();

        if (!line) return;

        const parts = line.split('|');
        let word = parts[0].trim();
        const stress = parts[2].trim();

        processed++;
        
        if (word.startsWith('*')) word = word.substring(1);

        if (!isWordToProcess(word)) {
            console.log('Skipping word ' + word);
            skipped++;
            return;
        }

        const stressedLetterIdx = stress.indexOf(stressChar);

        if (stressedLetterIdx == -1) {
            console.log('Skipping word ' + word);
            skipped++;
            return;
        };

        result[word] = stressedLetterIdx;
        added++;
    });

    lineReader.on('close', () => {
        fs.writeFileSync(destination, JSON.stringify(result, null, 2));
        console.log();
        console.log('Done!');
        console.log(`Processed ${processed}, added ${added}, skipped ${skipped}`);
    });

    function isWordToProcess(word: string): boolean {
        return word.split('')
            .every(c => c === stressChar || allowedChars.indexOf(c) >=0);
    }
})();