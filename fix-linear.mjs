import fs from 'fs';
let code = fs.readFileSync('src/routing/linear.conversation.ts', 'utf8');
code = code.replace(/import type \{ BaseFilter \} from "\.\.\/filters\/matchers\.js";/,
`import type { BaseFilter } from "../filters/base.js";`);
fs.writeFileSync('src/routing/linear.conversation.ts', code);
