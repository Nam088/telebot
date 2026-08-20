# 🏛️ TELE-BOT CODING STANDARDS & ARCHITECTURAL RULES

## 1. Naming & Case Convention (The Golden Rule)
- **Verbs / Methods you call (`()`)**: Strictly use `camelCase`.
  - Examples: `bot.sendMessage()`, `app.runPolling()`, `app.runWebhook()`, `app.addHandler()`, `jobQueue.runOnce()`, `job.scheduleRemoval()`.
- **Data / Schema / Properties (Nouns / Telegram Data)**: Strictly use `snake_case` matching Telegram API schema.
  - Examples: `context.user_data`, `context.chat_data`, `context.bot_data`, `context.job_queue`, `update.effective_user`, `update.effective_chat`, `chat_id`, `message_id`.
- **Classes, Types & Filters**: Use `PascalCase` and `UPPER_SNAKE_CASE`.
  - Examples: `Application`, `CommandHandler`, `filters.TEXT`, `filters.ChatType.PRIVATE`.

## 2. Zero Runtime Dependency Policy
- No required runtime packages in `"dependencies"`.
- Built strictly on Node.js 22+ built-ins (`node:sqlite`, `node:http`, `node:crypto`, `node:fs`, `node:path`, global `fetch`, `setTimeout`).
- Exactly one allowed optional peer dependency: `pino`.

## 3. Strict Type Safety & Clean Contracts
- Compiler settings: `strict: true` and `noUncheckedIndexedAccess: true`.
- Zero loose `any`. Use `unknown` + Type Guards (`isInputFile`, `instanceof TelegramApiError`).
- Explicit return types on all public API methods.

## 4. Documentation & TSDoc Standard
- Every public export must include complete TypeDoc tags:
  - `@param` for each parameter.
  - Exactly one `@returns`.
  - `@example` with runnable TypeScript snippet.
  - `@throws {@link TelegramApiError}` on rejecting methods.
- `npm run docs` must generate documentation with **0 errors and 0 warnings**.

## 5. Quality Gates (Mandatory Verification Before Commit)
1. `npm run build` -> 0 TypeScript compilation errors.
2. `npm run test` -> 100% tests pass.
3. `npm run test:coverage` -> Line coverage **> 80%** (Target: >90%).
4. `npm run docs` -> 0 errors, 0 warnings.
