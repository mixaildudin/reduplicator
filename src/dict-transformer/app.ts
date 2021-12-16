import * as readline from 'readline';
import * as fs from 'fs';
import AlphabetHelper from '../alphabetHelper';
import {EncodingManager} from '../encodingManager';
const { deflateSync } = require('zlib');

(function() {
	if (process.argv.length < 4) {
		console.log('USAGE: node app.js source.txt destination.gz [-v]');
		return;
	}

	const [,, source, destination, ...rest] = process.argv;
	const isVerbose = rest.includes('-v');

	console.log('Starting...');

	let processed = 0, added = 0, skipped = 0;

	const allowedChars = AlphabetHelper.getAll();
	const stressMarker = "'";

	const lineReader = readline.createInterface({
		input: fs.createReadStream(source)
	});

	// слово => номер буквы под ударением.
	// для омонимичных слов с разным ударением будут коллизии, и последнее слово выиграет
	let result: { [word: string]: number } | null = {};

	lineReader.on('line', line => {
		line = line.trim();

		if (!line) return;

		const parts = line.split('|');
		let word = parts[0].trim().toLowerCase();
		let stress = parts[2].trim();

		processed++;

		if (processed % 100_000 === 0) {
			console.log(`${processed.toLocaleString()} words processed`);
		}

		if (word.startsWith('*')) word = word.substring(1);

		if (!isWordValid(word)) {
			if (isVerbose) console.log(`Skipping word ${word}`);
			skipped++;
			return;
		}

		if (word.length < 3) {
			if (isVerbose) console.log(`Skipping word ${word} because it is too short`);
			skipped++;
			return;
		}

		if (word.length > 17) {
			if (isVerbose) console.log(`Skipping word ${word} because it is too long`);
			skipped++;
			return;
		}

		if (!isStressValid(stress)) {
			if (isVerbose) console.log(`Skipping word ${word} because stress is invalid`);
			skipped++;
			return;
		}

		// оставляем только "главное" ударение, обозначенное одинарной кавычкой, обратные кавычки убираем
		stress = stress.replace(/`/g, '');

		const stressCharIdx = stress.indexOf(stressMarker);

		if (stressCharIdx == -1) {
			if (isVerbose) console.log(`Skipping word ${word} as no stress found`);
			skipped++;
			return;
		}

		const stressedLetterIdx = stressCharIdx - 1;

		const firstVowelIdx = word.split('').findIndex(l => AlphabetHelper.getVowels().includes(l));
		if (firstVowelIdx === stressedLetterIdx) {
			if (isVerbose) console.log(`Skipping word ${word} because the first vowel is stressed`);
			skipped++;
			return;
		}

		result![word] = stressedLetterIdx;
		added++;
	});

	lineReader.on('close', () => {
		console.log('Writing dictionary file...');

		const encodingManager = new EncodingManager();
		let fileDescriptor: number | null = null;
		let words: string[];

		try {
			fileDescriptor = fs.openSync(destination, 'w');

			words = Object.keys(result!).sort((x, y) => x.localeCompare(y));

			const resultFileContent = words.map(word => word + result![word]).join('');
			result = null; // делаем доступным для GC перед тяжелой записью
			fs.writeFileSync(destination, deflateSync(encodingManager.encode(resultFileContent)), { encoding: 'binary' });
		} finally {
			if (fileDescriptor != null) {
				fs.closeSync(fileDescriptor);
			}
		}

		console.log();
		console.log('Done!');
		console.log(`Processed ${processed.toLocaleString()}, added ${added.toLocaleString()}, skipped ${skipped.toLocaleString()}, ${words.length.toLocaleString()} entries in the output dictionary`);
	});

	function isWordValid(word: string): boolean {
		return word.split('').every(c => allowedChars.includes(c));
	}

	function isStressValid(wordWithStress: string): boolean {
		return !!wordWithStress && wordWithStress.split('').filter(c => c === stressMarker).length === 1;
	}
})();