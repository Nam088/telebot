---
name: typescript-docs-and-types
trigger: always_on
---

# TypeScript Typing, Documentation & Agent Execution Rule

## 1. Subagent Mandatory Context & Guidelines
Whenever subagents are invoked for coding, refactoring, or documentation tasks:
- Subagents MUST read and strictly adhere to `AGENTS.md`, `specs/001-telegram-bot-framework/spec.md`, and this rule file.
- Subagents MUST follow Test-Driven Development (TDD): write unit/integration tests first, confirm failure, then implement.
- Subagents MUST verify the build (`npm run build`), test suite (`npm test`), and docs generation (`npm run docs`) with zero errors and zero warnings before completing tasks.

## 2. Naming Conventions (Strict Parity with PTB)
- **Verbs (methods to call)** → `camelCase`: `addHandler`, `sendMessage`, `getUpdates`, `checkUpdate`, `handleUpdate`. Filter combinators must be `.and()`, `.or()`, `.not()`.
- **Nouns (properties/data read or written)** → `snake_case`: `user_data`, `chat_data`, `bot_data`, `job_queue`, `chat_id`, `message_id`, `first_name`, `effective_user`, `effective_chat`, `effective_message`.
- **Filenames**: Multi-word source files use `.` as separator (e.g. `conversation.handler.ts`, `job.queue.ts`).

## 3. Strict Type Annotations
- Every function, method, parameter, class property, and return value must have explicit, precise TypeScript types.
- Avoid loose `any`. Use specific generic types, unions, or `unknown` with type guards where appropriate.
- Maintain 100% strict compliance with `strict: true` and `noUncheckedIndexedAccess: true`.

## 4. Comprehensive TSDoc / JSDoc Comments
Every public class, interface, method, type alias, and export must include full TSDoc tags recognized by TypeDoc:
- **One-line summary**: Concise description of what the symbol does.
- **`@param` / `@typeParam`**: Document every parameter and generic with description.
- **`@returns`**: Exactly one tag describing the return value.
- **`@example`**: Practical usage code snippet on every public entry point.
- **`@throws`**: Document errors (e.g. `@throws {@link TelegramApiError} ...`).
- **`@defaultValue`**: Document runtime defaults for optional properties/parameters.
- **`@remarks`**: Highlight behavior details or differences from python-telegram-bot (PTB).
