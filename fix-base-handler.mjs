import fs from 'fs';
let code = fs.readFileSync('src/routing/handlers/base.ts', 'utf8');
code = code.replace(/\/\*\*\n   \* Executes the registered handler callback with the given update and context\.\n   \*\n   \* @param update - The Telegram update to process\.\n   \* @param context - Callback context instance\.\n   \* @returns The value returned by the callback function\.\n   \*\/\n  abstract checkUpdate\(update: Update\): boolean \| Promise<boolean>;\n\n  async handleUpdate\(update: Update, context: C\): Promise<R> \{/,
`  /**
   * Checks if the incoming update should be handled by this handler.
   *
   * @param update - The Telegram update to process.
   * @returns \`true\` if it matches, \`false\` otherwise.
   */
  abstract checkUpdate(update: Update): boolean | Promise<boolean>;

  /**
   * Executes the registered handler callback with the given update and context.
   *
   * @param update - The Telegram update to process.
   * @param context - Callback context instance.
   * @returns The value returned by the callback function.
   */
  async handleUpdate(update: Update, context: C): Promise<R> {`);
fs.writeFileSync('src/routing/handlers/base.ts', code);
