import fs from 'fs';
let code = fs.readFileSync('src/routing/handlers/message.ts', 'utf8');
code = code.replace(/import \{ filters as filtersModule, BaseFilter, RegexFilter \} from "\.\.\/\.\.\/filters\/matchers\.js";/,
`import { filters as filtersModule, RegexFilter } from "../../filters/matchers.js";\nimport { BaseFilter } from "../../filters/base.js";`);
fs.writeFileSync('src/routing/handlers/message.ts', code);

let code2 = fs.readFileSync('src/routing/handlers/command.ts', 'utf8');
code2 = code2.replace(/import \{ BaseFilter \} from "\.\.\/\.\.\/filters\/matchers\.js";/,
`import { BaseFilter } from "../../filters/base.js";`);
fs.writeFileSync('src/routing/handlers/command.ts', code2);
