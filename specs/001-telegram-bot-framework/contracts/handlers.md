# Contract: Handlers and dispatch (FR-3, FR-4)

## `BaseHandler` (abstract)

```ts
abstract class BaseHandler {
  abstract checkUpdate(update: Update): boolean | Promise<boolean>;
  abstract handleUpdate(update: Update, context: CallbackContext): Promise<any>;
}
```

Every concrete handler (`CommandHandler`, `MessageHandler`, `CallbackQueryHandler`, `ConversationHandler`, `InlineQueryHandler`, `ChosenInlineResultHandler`, `PollAnswerHandler`, `ChatMemberHandler`, `TypeHandler`) implements both methods. `checkUpdate` must be a pure predicate — no side effects — since the dispatch loop may call it on handlers that ultimately don't run (earlier handlers in the same group can match first).

## Registration contract

```ts
application.addHandler(handler: BaseHandler, group?: number): void;   // group defaults to 0
application.addErrorHandler(callback: ErrorHandlerCallback): void;
```

## Dispatch contract

For each incoming `Update`:

1. Handler groups run in ascending numeric order (group `0` before group `1`, etc.).
2. Within a group, handlers run in registration order; dispatch stops at the **first** handler whose `checkUpdate` resolves `true` — that handler's `handleUpdate` runs, and no other handler in that group runs for this update.
3. Other groups still run regardless of what happened in an earlier group (groups are independent passes over the same update, not short-circuited by each other).
4. If `handleUpdate` throws or rejects, the dispatch loop catches it, routes it to every registered `addErrorHandler` callback (each receiving `context.error`), and logs it — it does not stop dispatch to subsequent groups, and does not stop `runPolling`/`runWebhook`.

## `ConversationHandler` contract

```ts
new ConversationHandler({
  entry_points: BaseHandler[],
  states: Record<string | number, BaseHandler[]>,
  fallbacks: BaseHandler[],
});
```

- `entry_points` are checked like any handler; matching one moves the conversation to whichever state key its `handleUpdate` returns.
- Subsequent updates for the same conversation key are checked only against the current state's handler list, then `fallbacks` if none match.
- Conversation state persists across process restarts only when the `Application` is configured with a non-`MemoryPersistence` backend (data-model.md's `BaseHandler` state-transition note).
