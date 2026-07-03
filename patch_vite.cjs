const fs = require('fs');
const path = 'vite.config.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace("import {defineConfig} from 'vite';", "import { defineConfig } from 'vitest/config';");

const serverRegex = /server: \{/;
code = code.replace(serverRegex, `test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/setupTests.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/vite-env.d.ts', 'src/types.ts'],
      },
    },
    server: {`);

fs.writeFileSync(path, code);
console.log('patched vite config');
