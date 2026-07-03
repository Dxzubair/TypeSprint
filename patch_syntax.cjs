const fs = require('fs');
const path = 'src/App.test.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/expect\(screen\.getAllByText\(\/Home\/i\)\)\.length\)/g, "expect(screen.getAllByText(/Home/i).length");
code = code.replace(/expect\(screen\.getAllByText\(\/Lessons\/i\)\)\.length\)/g, "expect(screen.getAllByText(/Lessons/i).length");
code = code.replace(/expect\(screen\.getAllByText\(\/Analytics\/i\)\)\.length\)/g, "expect(screen.getAllByText(/Analytics/i).length");

fs.writeFileSync(path, code);
console.log('patched app syntax');
