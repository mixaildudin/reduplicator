import {Reduplicator} from './reduplicator';

import * as readline from 'readline';
import {DefaultStressManager} from './defaultStressManager';
import {DynamicStressManager} from './dynamicStressManager';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// const dict = new DefaultStressManager();
// const dict = new DynamicStressManager('./custom.json');
const dict = new DynamicStressManager();
const r = new Reduplicator(dict);

console.log('Reduplicator REPL');

rl.on('line', (input) => {
	console.log(r.reduplicate(input));
	console.log();
});