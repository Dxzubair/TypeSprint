const fs = require('fs');
const path = 'src/setupTests.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('scrollIntoView')) {
  code += `\nwindow.HTMLElement.prototype.scrollIntoView = function() {};\n`;
  fs.writeFileSync(path, code);
}
console.log('patched setupTests');
