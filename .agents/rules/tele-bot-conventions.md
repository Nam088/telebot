# 🏛️ TELE-BOT CODING STANDARDS & ARCHITECTURAL RULES

## 1. Modular Architecture & Line Ceiling (< 500 Lines per File)
- **Ceiling**: No source file in `src/` may exceed **500 lines**. Target: 100–450 lines.
- **Domain Submodules**: Complex domains (`messages`, `chats`, `topics`, `business`, `rich`, `menu`, `keyboard`, `rrule`, `async-conversation`) must be organized into dedicated folders with an `index.ts`.
- **Zero Loose Bridge Files**: Never keep 1-line re-export bridge files alongside module directories. All modules must export and import through `index.js`.

## 2. Naming & Case Convention (The Golden Rule)
- **Verbs / Methods you call (`()`)**: Strictly use `camelCase`.
  - Examples: `bot.sendMessage()`, `app.runPolling()`, `app.runWebhook()`, `app.addHandler()`, `jobQueue.runOnce()`, `job.scheduleRemoval()`.
- **Data / Schema / Properties (Nouns / Telegram Data)**: Strictly use `snake_case` matching Telegram API schema.
  - Examples: `context.user_data`, `context.chat_data`, `context.bot_data`, `context.job_queue`, `update.effective_user`, `update.effective_chat`, `chat_id`, `message_id`.
- **Classes, Types & Filters**: Use `PascalCase` and `UPPER_SNAKE_CASE`.
  - Examples: `Application`, `CommandHandler`, `filters.TEXT`, `filters.ChatType.PRIVATE`.

## 3. Zero Runtime Dependency Policy
- No required runtime packages in `"dependencies"`.
- Built strictly on Node.js 22+ built-ins (`node:sqlite`, `node:http`, `node:crypto`, `node:fs`, `node:path`, global `fetch`, `setTimeout`).
- Exactly one allowed optional peer dependency: `pino`.

## 4. Strict Type Safety & Clean Contracts
- Compiler settings: `strict: true` and `noUncheckedIndexedAccess: true`.
- Zero loose `any`. Use `unknown` + Type Guards (`isInputFile`, `instanceof TelegramApiError`).
- Explicit return types on all public API methods.

## 5. Documentation & TSDoc Standard
- Every public export must include complete TypeDoc tags:
  - `@param` for each parameter.
  - Exactly one `@returns`.
  - `@example` with runnable TypeScript snippet.
  - `@throws {@link TelegramApiError}` on rejecting methods.
- `npm run docs` must generate documentation with **0 errors and 0 warnings**.

## 6. Git Branching & PR Standard
- Never push directly to `main`.
- Always work on dedicated feature or refactoring branches (`feat/...`, `refactor/...`) and submit work via Pull Requests.

## 7. Quality Gates (Mandatory Verification Before Commit)
1. `npm run format && npm run format:check` -> Formatting check.
2. `npm run lint` -> ESLint analysis (0 errors, 0 warnings).
3. `npm run typecheck` -> TypeScript type checking (0 errors).
4. `npm run build` -> ESM + DTS build (0 errors).
5. `npm test` -> 100% test suites pass.
6. `npm run test:coverage` -> Line coverage **> 90%**.
7. `npm run docs` -> 0 errors, 0 warnings.
