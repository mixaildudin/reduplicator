import * as readline from 'readline';
import * as fs from 'fs';
import AlphabetHelper from '../alphabetHelper';

(function() {
	if (process.argv.length < 3) {
		console.log('USAGE: node app.js source.txt destination.txt');
		return;
	}

	const [,, source, destination] = process.argv;

	let processed = 0, added = 0, skipped = 0;

	const allowedChars = AlphabetHelper.getAll().concat('-');
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
		let word = parts[0].trim().toLowerCase();
		const stress = parts[2].trim();

		processed++;

		if (word.startsWith('*')) word = word.substring(1);

		if (!isWordToProcess(word)) {
			console.log('Skipping word ' + word);
			skipped++;
			return;
		}

		const stressCharIdx = stress.indexOf(stressChar);

		if (stressCharIdx == -1) {
			console.log(`Skipping word ${word} as no stress found`);
			skipped++;
			return;
		}

		const stressedLetterIdx = stressCharIdx - 1;

		const firstVowelIdx = word.split('').findIndex(l => AlphabetHelper.getVowels().includes(l));
		if (firstVowelIdx === stressedLetterIdx) {
			console.log(`Skipping word ${word} because the first vowel is stressed`);
			skipped++;
			return;
		}

		result[word] = stressedLetterIdx;
		added++;
	});

	lineReader.on('close', () => {
		const resultFileContent = Object.keys(result).map(word => `${word}:${result[word]}`).join('\n');
		fs.writeFileSync(destination, resultFileContent, { encoding: 'utf8' });
		console.log();

		console.log('Done!');
		console.log(`Processed ${processed}, added ${added}, skipped ${skipped}`);
	});

	function isWordToProcess(word: string): boolean {
		return word.split('')
			.every(c => c === stressChar || allowedChars.indexOf(c) >= 0);
	}
})();