import fs from 'fs';
let code = fs.readFileSync('src/storage/base.persistence.ts', 'utf8');
code = code.replace(/export abstract class BasePersistence implements Persistence \{/,
`export abstract class BasePersistence implements Persistence {\n  protected abstract getRaw(key: string): Promise<string | null>;\n  protected abstract setRaw(key: string, value: string): Promise<void>;\n  protected abstract deleteRaw(key: string): Promise<void>;`);
fs.writeFileSync('src/storage/base.persistence.ts', code);
