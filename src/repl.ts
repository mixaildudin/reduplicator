import Reduplicator from './reduplicator';

import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

const r = new Reduplicator('./dict/dict.json');

console.log('Reduplicator REPL');

rl.on('line', (input) => {
    console.log(r.reduplicate(input));
    console.log();
});