---
name: feature-development-and-maintenance
trigger: always_on
---

# Feature Development, Method Addition & Architecture Maintenance Rule

Whenever adding new features, Telegram Bot API methods, storage drivers, handlers, or scheduler capabilities:

## 1. Domain-Driven Modular Organization
- **Bot API Methods**: Place in `src/client/methods/<domain>.ts` (`messages.ts`, `chats.ts`, `stickers.ts`, `payments.ts`, `topics.ts`, `business.ts`).
- **Types & Interfaces**: Place in `src/client/types.ts` with comprehensive property-level JSDoc comments.
- **Persistence Drivers**: Extend `BasePersistence` in `src/storage/`.
- **Routing & Handlers**: Place in `src/routing/handlers.ts` or dedicated module.
- **Scheduler & Recurrence**: Place in `src/scheduler/`.

## 2. Strict Naming & Brand Protection
- **Methods**: `camelCase` (`sendMessage`, `runRRule`, `deleteUserData`).
- **Data Properties / Telegram Fields**: `snake_case` (`user_data`, `chat_data`, `chat_id`, `message_id`).
- **Brand Protection**: **NEVER** mention Python, `python-telegram-bot`, or "migration from Python" in public JSDoc/TSDoc, generated docs, README, or types.

## 3. Dependency Constraint
- Zero external runtime dependencies in `"dependencies"`. Only Node.js built-ins (`fetch`, `http`, `https`, `fs`, `path`, `crypto`, `util`, `events`, `sqlite`).
- `pino` is the only allowed optional peer dependency.

## 4. Test-Driven Quality Gates (Mandatory)
Before finishing any task:
1. Write unit tests under `tests/unit/` mirroring the source structure.
2. Run `npm run build` (0 errors).
3. Run `npm test` (100% pass).
4. Run `npm run docs` (0 errors, 0 warnings).
5. Run `npm run test:coverage` (ensure coverage >90%).
