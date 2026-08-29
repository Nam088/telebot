---
name: telegram-api-updater
description: Check open Telegram Bot API update issues on GitHub, read official Bot API documentation, and execute the end-to-end implementation workflow (TDD, domain types, methods, unit tests, TypeDoc, and issue checklist resolution). Use whenever implementing newly released Telegram Bot API features or resolving API update issues.
---

# Telegram Bot API Issue Resolver & Updater Skill

This skill provides an authoritative, end-to-end guide for an AI Agent to autonomously scan open Telegram API update issues, inspect official Telegram Bot API specs, implement types and methods following `telebot-ts` conventions, verify quality gates, and update GitHub Issues.

---

## 🔄 End-to-End Workflow Overview

```
1. Scan GitHub Issues  ──▶ 2. Read Bot API Docs  ──▶ 3. Map to Domains & Types
          │                                                    │
          ▼                                                    ▼
6. Close Issue & Commit ◀── 5. Quality Gate Pass ◀── 4. TDD & Implementation
```

---

## Phase 1: Discover & Select Open API Update Issues

1. **List all open Telegram API update issues:**
   ```bash
   gh issue list --label telegram-api-update --state open --repo Nam088/telebot-ts
   ```
2. **Read the selected issue details:**
   ```bash
   gh issue view <issue_number> --repo Nam088/telebot-ts
   ```
3. Extract the:
   - Target Version (e.g. `Bot API 10.3`)
   - Release Date (e.g. `August 24, 2026`)
   - Checklist of Action Items (grouped by category: *Rich Messages, Ephemeral Messages, Reply Markup, General*, etc.)

---

## Phase 2: Inspect Official Telegram Bot API Documentation

Before writing any type or method, **NEVER hallucinate or guess parameter names or types**. Fetch ground truth directly:

1. **Read Changelog & Official Specs:**
   - Fetch section anchors from `https://core.telegram.org/bots/api#<type-or-method>` using tool `read_url_content` or Context7 MCP.
   - For example:
     - `https://core.telegram.org/bots/api#sendrichmessage`
     - `https://core.telegram.org/bots/api#ephemeralmessageparameters`
     - `https://core.telegram.org/bots/api#richmessagebutton`
2. **Analyze Exact Fields:**
   - Field names (must remain in `snake_case`, e.g. `is_compact`, `can_send_welcome_messages`).
   - Required vs optional parameters (mark optional with `?`).
   - Expected return types (e.g. `Promise<Message>`, `Promise<boolean>`).

---

## Phase 3: Domain Placement & File Architecture

Follow the domain-driven modular structure of `telebot-ts`:

| API Domain / Item Type | Target File Location | Reference Mixin / Base |
|---|---|---|
| **Message / Media / Polls / Reactions** | `src/client/methods/messages.ts`<br>`src/client/types/messages.ts` | `MessagesMixin` |
| **Chats / Admins / Permissions / Invites** | `src/client/methods/chats.ts`<br>`src/client/types/chats.ts` | `ChatsMixin` |
| **Stickers / Emojis / Custom Reactions** | `src/client/methods/stickers.ts`<br>`src/client/types/stickers.ts` | `StickersMixin` |
| **Payments / Telegram Stars / Subscriptions** | `src/client/methods/payments.ts`<br>`src/client/types/payments.ts` | `PaymentsMixin` |
| **Topics / Bot Profile / Commands / Menu** | `src/client/methods/topics.ts`<br>`src/client/types/topics.ts` | `TopicsMixin` |
| **Business / Stories / Gifts / Verification** | `src/client/methods/business.ts`<br>`src/client/types/business.ts` | `BusinessMixin` |
| **Incoming Updates / Update Types** | `src/kernel/update.ts`<br>`src/client/types/common.ts` | `Update` class |
| **Routing / Event Handlers** | `src/routing/handlers/<type>.ts`<br>`src/routing/handlers.ts` | `BaseHandler` |
| **Filter Matchers** | `src/filters/matchers.ts` | `Filter` |

---

## Phase 4: Test-Driven Development (TDD) Implementation

For every item in the issue checklist:

### 1. Write Failing Unit Test First (Red)
Create or update tests in `tests/unit/client/methods/<domain>.test.ts` or `tests/unit/kernel/`:
```typescript
it("sends rich message with ephemeral parameters correctly", async () => {
  const fakeHttp = createFakeHttpAdapter({ ok: true, result: { message_id: 999 } });
  const bot = new Bot({ token: "TEST_TOKEN", httpAdapter: fakeHttp });

  const res = await bot.sendRichMessage({
    chat_id: 123456,
    rich_message: { /* ... */ },
    ephemeral_message_parameters: { replace_callback_query_message: true },
  });

  expect(res.message_id).toBe(999);
  expect(fakeHttp.lastRequest?.method).toBe("sendRichMessage");
  expect(fakeHttp.lastRequest?.body.ephemeral_message_parameters).toEqual({
    replace_callback_query_message: true,
  });
});
```

### 2. Implement Types & Methods (Green)
- Define TypeScript interfaces in `src/client/types/<domain>.ts` with comprehensive JSDoc.
- Implement method in `src/client/methods/<domain>.ts`:
```typescript
/**
 * Sends a rich message with interactive layout and optional ephemeral controls.
 *
 * @param options - Parameters for sending rich message.
 * @returns The sent {@link Message} object wrapped in Promise.
 * @throws {@link TelegramApiError} When Telegram API returns an error.
 * @example
 * ```ts
 * await bot.sendRichMessage({
 *   chat_id: 123456,
 *   rich_message: { ... },
 * });
 * ```
 */
async sendRichMessage(options: SendRichMessageOptions): Promise<Message> {
  return this.callApi<Message>("sendRichMessage", options);
}
```

---

## Phase 5: Brand Protection & Strict Constraints

1. **Zero External Runtime Dependencies**:
   - Only Node.js built-ins (`fetch`, `http`, `crypto`, `events`, `sqlite`, etc.).
   - No npm dependencies in `"dependencies"`.
2. **Naming Rules**:
   - Method verbs → `camelCase` (`sendRichMessage`, `editEphemeralMessageText`).
   - Fields / Options → `snake_case` (`chat_id`, `is_compact`, `receiver_user_id`).
3. **Brand Protection**:
   - **NEVER** mention Python, `python-telegram-bot`, or migration in any public JSDoc, comments, README, or types.

---

## Phase 6: Mandatory Quality Gate Checks

Run and ensure all 5 quality checks pass with **0 errors and 0 warnings**:

```bash
# 1. TypeCheck
npm run typecheck

# 2. Code Build
npm run build

# 3. Unit Tests
npm test

# 4. Coverage (>90%)
npm run test:coverage

# 5. TypeDoc Documentation
npm run docs
```

---

## Phase 7: Update Issue Checklist & Commit

1. **Update Issue Checklist or Post Progress Comment:**
   ```bash
   gh issue comment <issue_number> --body "✅ Implemented Rich Messages & Ephemeral Messages support with 100% test coverage." --repo Nam088/telebot-ts
   ```
2. **Close Issue once all items are completed:**
   ```bash
   gh issue close <issue_number> --comment "Completed all checklist items for Telegram Bot API version. Released with tests and docs." --repo Nam088/telebot-ts
   ```
3. **Git Commit following Conventional Commits:**
   ```bash
   git add .
   git commit -m "feat(api): implement Telegram Bot API <version> support (closes #<issue_number>)"
   git push origin main
   ```
