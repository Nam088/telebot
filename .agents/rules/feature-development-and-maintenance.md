---
name: feature-development-and-maintenance
trigger: always_on
---

# Feature Development, Method Addition & Architecture Maintenance Rule

Whenever adding new features, Telegram Bot API methods, storage drivers, handlers, or scheduler capabilities:

## 1. Domain-Driven Modular Organization (< 500 Lines per File)
- **Hard Limit**: Every source file in `src/` must remain **strictly < 500 lines** (target: 100–450 lines). Whenever a file grows beyond 500 lines, immediately decompose it into a dedicated domain folder.
- **Bot API Methods**: Place in domain subfolders under `src/client/methods/<domain>/` (`messages/`, `chats/`, `topics/`, `business/`, `stickers.ts`, `payments.ts`, `base.ts`) and re-export cleanly through `src/client/methods/index.ts`.
- **Types & Interfaces**: Place in domain subfolders under `src/client/types/<domain>/` (`common/`, `messages/`, `chats/`, `stickers/`, `payments/`, `topics/`, `business/`, `rich/`) and re-export through `src/client/types/index.ts`.
- **Persistence Drivers**: Extend `BasePersistence` in `src/storage/` and re-export via `src/storage/index.ts`.
- **Routing & Handlers**: Place in `src/routing/handlers/`, `src/routing/async-conversation/`, etc., and re-export via `src/routing/index.ts`.
- **Scheduler & Recurrence**: Place in `src/scheduler/rrule/`, `src/scheduler/queue.ts`, `src/scheduler/job.ts`, and re-export via `src/scheduler/index.ts`.
- **Components**: Place in `src/components/menu/`, `src/components/keyboard/`, etc., and re-export via `src/components/index.ts`.

## 2. Clean Exports & Zero Loose Bridge Files
- **No Single-File Bridge Re-exports**: Never keep duplicate single-file bridge re-exports alongside subfolders (e.g. do not keep a loose `messages.ts` next to `messages/index.ts`).
- **Index-Based Exports**: All consumers and internal modules must import from `../<module>/index.js` or top-level package index.

## 3. Strict Naming & Brand Protection
- **Methods**: `camelCase` (`sendMessage`, `runRRule`, `deleteUserData`).
- **Data Properties / Telegram Fields**: `snake_case` (`user_data`, `chat_data`, `chat_id`, `message_id`).
- **Brand Protection**: **NEVER** mention Python, `python-telegram-bot`, or "migration from Python" in public JSDoc/TSDoc, generated docs, README, or types.

## 4. Git Branching & PR Workflow
- **Never Push Directly to `main`**: Always check out a dedicated branch (`feat/...` or `refactor/...`).
- Commit with conventional commit messages and push to the feature branch to open/update Pull Requests.

## 5. Dependency Constraint
- Zero external runtime dependencies in `"dependencies"`. Only Node.js built-ins (`fetch`, `http`, `https`, `fs`, `path`, `crypto`, `util`, `events`, `sqlite`).
- `pino` is the only allowed optional peer dependency.

## 6. Test-Driven Quality Gates (Mandatory)
Before finishing any task:
1. Write unit tests under `tests/unit/` mirroring the source structure.
2. Run `npm run format && npm run format:check` (0 errors).
3. Run `npm run lint` (0 errors, 0 warnings).
4. Run `npm run typecheck` (0 errors under `strict`).
5. Run `npm run build` (0 errors, ESM + DTS).
6. Run `npm test` (100% pass).
7. Run `npm run test:coverage` (ensure coverage >90%).
8. Run `npm run docs` (0 errors, 0 warnings).
