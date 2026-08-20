import fs from 'fs';
let code = fs.readFileSync('src/kernel/context.ts', 'utf8');
code = code.replace(/import \{ JobQueue, Job \} from "\.\.\/scheduler\/queue\.js";/,
`import { JobQueue } from "../scheduler/queue.js";\nimport { Job } from "../scheduler/job.js";`);
fs.writeFileSync('src/kernel/context.ts', code);
