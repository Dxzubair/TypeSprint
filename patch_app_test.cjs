const fs = require('fs');
const path = 'src/App.test.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/getByText\(\/Practice\/i\)/, "getByText(/Lessons/i)");
code = code.replace(/getByText\(\/Settings\/i\)/, "getByText(/Analytics/i)");

fs.writeFileSync(path, code);
console.log('patched app test');
