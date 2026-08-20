import fs from 'fs';
let code = fs.readFileSync('tests/unit/scheduler/queue.test.ts', 'utf8');
code = code.replace(/import \{ JobQueue, Job \} from "\.\.\/\.\.\/\.\.\/src\/scheduler\/queue\.js";/, 
`import { JobQueue } from "../../../src/scheduler/queue.js";\nimport { Job } from "../../../src/scheduler/job.js";`);
fs.writeFileSync('tests/unit/scheduler/queue.test.ts', code);

let code2 = fs.readFileSync('tests/unit/scheduler/rrule.test.ts', 'utf8');
code2 = code2.replace(/import \{ JobQueue, Job \} from "\.\.\/\.\.\/\.\.\/src\/scheduler\/queue\.js";/, 
`import { JobQueue } from "../../../src/scheduler/queue.js";\nimport { Job } from "../../../src/scheduler/job.js";`);
fs.writeFileSync('tests/unit/scheduler/rrule.test.ts', code2);
