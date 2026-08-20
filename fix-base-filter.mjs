import fs from 'fs';
let code = fs.readFileSync('src/filters/base.ts', 'utf8');
code = code.replace(/export abstract class BaseFilter \{/,
`export abstract class BaseFilter {\n    abstract checkUpdate(update: Update): boolean | Promise<boolean>;`);
fs.writeFileSync('src/filters/base.ts', code);
