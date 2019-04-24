import Reduplicator from './reduplicator';

import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

const r = new Reduplicator('./lib/dict.json');

console.log('Reduplicator CLI');

rl.on('line', (input) => {
    console.log(r.reduplicate(input));
    console.log();
});