import {Reduplicator} from './reduplicator';

import * as readline from 'readline';
import {DynamicStressManager} from './dynamicStressManager';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

console.log('Initialization...');

const dict = new DynamicStressManager();
const r = new Reduplicator(dict);

console.log('Ready!');
console.log();
console.log('Reduplicator REPL');

rl.on('line', (input) => {
	console.log(r.reduplicate(input));
	console.log();
});