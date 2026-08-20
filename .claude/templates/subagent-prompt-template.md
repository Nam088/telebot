# Subagent Prompt Template

Use this structured template when dispatching instructions or assigning tasks to sub-agents.

---

```markdown
### 🎯 MISSION & SCOPE
You are acting as the **[Role Name, e.g., Senior TypeScript Framework Engineer]** in repository `[Repo Name/Path]`.
Your objective is to implement **[Phase / Feature / Task IDs, e.g., Phase 4: User Story 2 (Tasks T024 - T031)]**.

### 📂 TARGET FILES & DIRECTORIES
- **Unit & Integration Tests**: `[e.g., tests/unit/ext/handlers.test.ts, tests/unit/ext/filters.test.ts]`
- **Source Implementations**: `[e.g., src/ext/handlers.ts, src/ext/filters.ts, src/telegram/bot.ts]`
- **Examples / Documentation**: `[e.g., examples/inlinekeyboard.ts, docs/]`

### 🔍 RESEARCH & GROUND TRUTH (ZERO-HALLUCINATION)
- Proactively call `context7` MCP tools (`resolve-library-id` and `query-docs`) and refer to official API specifications (e.g., Telegram Bot API) to verify parameters, payloads, and return types.
- **NEVER GUESS OR ASSUME** outdated signatures or deprecated behavior. Verify against official ground truth before writing code.

### 📐 TECHNICAL CONSTRAINTS & CODING RULES
1. **Repository Conventions**: Read and strictly adhere to `AGENTS.md` and `.agents/rules/*.md`.
2. **Naming Convention (Strict PTB Parity)**:
   - **Verbs / Methods to invoke**: `camelCase` (e.g., `sendMessage`, `getUpdates`, `checkUpdate`, `.and()`, `.or()`, `.not()`).
   - **Nouns / Properties / Payloads**: `snake_case` (e.g., `chat_id`, `user_data`, `chat_data`, `reply_markup`, `effective_user`).
   - **Filenames**: Use dot `.` as separator (e.g., `conversation.handler.ts`, `job.queue.ts`).
3. **Strict Type Safety**:
   - Must strictly satisfy `strict: true` and `noUncheckedIndexedAccess: true`.
   - **Zero loose `any`**: Use explicit generics, discriminated unions, or `unknown` with narrowing type guards.
4. **Comprehensive TSDoc / TypeDoc**:
   - Every public symbol must include: concise summary, `@param` / `@typeParam`, exactly one `@returns`, `@example` code block, `@throws`, `@defaultValue`, and `@remarks`.
   - Must compile cleanly with TypeDoc with **0 errors and 0 warnings**.

### 🧪 TEST-DRIVEN DEVELOPMENT (TDD) WORKFLOW
1. Write unit/integration tests covering both happy paths and edge cases first.
2. Run tests to confirm they fail (**Red**).
3. Implement the minimal clean code to make tests pass (**Green**).
4. Refactor and ensure no regressions.

### ✅ DEFINITION OF DONE (MANDATORY QUALITY GATES)
Before reporting completion, you **MUST** run and verify the following commands pass with zero failures:
1. `npm run build` → 0 TypeScript compilation errors.
2. `npm run test:coverage` → 100% tests passing and line coverage **> 80%** on target source directories.
3. `npm run docs` (or `npx typedoc`) → Documentation generated with **0 errors and 0 warnings**.
4. Update `tasks.md` to mark all completed task IDs as `[X]`.

Provide a concise final summary listing modified files, test coverage metrics, and verification results.
```
