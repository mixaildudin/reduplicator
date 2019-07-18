import Reduplicator from './reduplicator';

import * as readline from 'readline';
import DefaultStressDictionaryManager from './defaultStressDictionaryManager';
import DynamicStressDictionaryManager from './dynamicStressDictionaryManager';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const dict = new DefaultStressDictionaryManager('./dict/dict.json');
// const dict = new CustomDictionaryManager('./dict/dict.json', './dict/custom.json');
const r = new Reduplicator(dict);

console.log('Reduplicator REPL');

rl.on('line', (input) => {
	console.log(r.reduplicate(input));
	console.log();
});