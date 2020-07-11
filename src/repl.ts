import {Reduplicator} from './reduplicator';

import * as readline from 'readline';
import {DynamicStressManager} from './dynamicStressManager';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const stressManager = new DynamicStressManager();
const r = new Reduplicator(stressManager);

console.log('Reduplicator REPL. Type your word, then hit <Enter>.');

rl.on('line', (input) => {
	console.log(r.reduplicate(input));
	console.log();
});
