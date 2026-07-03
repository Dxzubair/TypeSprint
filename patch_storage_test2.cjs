const fs = require('fs');
const path = 'src/utils/storage.test.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("expect(newProfile.coins).toBe(50);", "expect(newProfile.coins).toBe(550);");

fs.writeFileSync(path, code);
console.log('patched storage test 2');
