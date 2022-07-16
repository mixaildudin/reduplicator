import * as readline from 'readline';
import {DynamicStressManager} from './dynamicStressManager';
import {Hueficator} from './hueficator';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const stressManager = new DynamicStressManager();
const r = new Hueficator(stressManager);

console.log('Reduplicator REPL. Type your word, then hit <Enter> to huefy it.');

rl.on('line', (input) => {
	console.log(r.reduplicate(input));
	console.log();
});
