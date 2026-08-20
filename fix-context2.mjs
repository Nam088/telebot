import fs from 'fs';
let code = fs.readFileSync('src/kernel/context.ts', 'utf8');
code = code.replace(/import type \{ JobQueue, Job \} from "\.\.\/scheduler\/queue\.js";/,
`import type { JobQueue } from "../scheduler/queue.js";\nimport type { Job } from "../scheduler/job.js";`);
fs.writeFileSync('src/kernel/context.ts', code);
