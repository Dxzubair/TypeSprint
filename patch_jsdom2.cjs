const fs = require('fs');
const path = 'src/setupTests.ts';
let code = fs.readFileSync(path, 'utf8');

code += `\nwindow.Element.prototype.scrollIntoView = function() {};\n`;
fs.writeFileSync(path, code);
console.log('patched setupTests Element');
