const fs = require('fs');
const path = 'package.json';
let code = JSON.parse(fs.readFileSync(path, 'utf8'));
code.scripts.test = 'vitest run';
code.scripts['test:coverage'] = 'vitest run --coverage';
fs.writeFileSync(path, JSON.stringify(code, null, 2));
console.log('patched package.json');
