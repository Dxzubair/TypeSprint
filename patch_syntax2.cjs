const fs = require('fs');
const path = 'src/App.test.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/expect\(screen\.getAllByText\(\/Home\/i\)\.length\.toBeGreaterThan\(0\);/g, "expect(screen.getAllByText(/Home/i).length).toBeGreaterThan(0);");
code = code.replace(/expect\(screen\.getAllByText\(\/Lessons\/i\)\.length\.toBeGreaterThan\(0\);/g, "expect(screen.getAllByText(/Lessons/i).length).toBeGreaterThan(0);");
code = code.replace(/expect\(screen\.getAllByText\(\/Analytics\/i\)\.length\.toBeGreaterThan\(0\);/g, "expect(screen.getAllByText(/Analytics/i).length).toBeGreaterThan(0);");

fs.writeFileSync(path, code);
console.log('patched app syntax 2');
