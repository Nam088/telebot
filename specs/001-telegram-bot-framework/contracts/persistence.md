# Contract: `Persistence` (FR-6, FR-7)

The interface a custom persistence backend must implement (beyond the three built-ins) — see `data-model.md`'s `Persistence interface` entity for the full method table. This contract covers the behavioral guarantees a conforming implementation must uphold, since the method signatures alone don't capture them.

```ts
interface Persistence {
  getUserData(userId: number): Promise<Record<string, any>>;
  setUserData(userId: number, data: Record<string, any>): Promise<void>;
  getChatData(chatId: number | string): Promise<Record<string, any>>;
  setChatData(chatId: number | string, data: Record<string, any>): Promise<void>;
  getBotData(): Promise<Record<string, any>>;
  setBotData(data: Record<string, any>): Promise<void>;
  getConversations(): Promise<Map<string, number | string>>;
  updateConversation(key: string, state: number | string): Promise<void>;
  getJobs(): Promise<PersistedJob[]>;
  setJobs(jobs: PersistedJob[]): Promise<void>;
}
```

## Behavioral guarantees

- **Read-your-writes**: a `set*` followed by the corresponding `get*` on the same key must return the just-written value, even if the backend batches or debounces the underlying write (e.g. `JsonFilePersistence` writing to disk).
- **Missing key defaults**: `getUserData`/`getChatData` for a key never seen before resolve to `{}`, not `undefined` and not a rejected promise — callers rely on always getting an object they can read properties off of.
- **`getConversations`/`updateConversation`**: keys are conversation identifiers as defined by `ConversationHandler` (typically `"${handlerName}:${chatId}"` or similar); the persistence layer treats the key as an opaque string and must not parse or validate its structure.
- **`getJobs`/`setJobs`**: `setJobs` receives the full current set of `PersistedJob`s each time (not a delta) and must replace, not merge, the persisted set — mirroring how `getUserData`/`setUserData` behave.
- **No implicit expiry**: nothing in this interface auto-expires data; if a backend wants TTL behavior, that's a backend-specific option, not something callers can assume.

## Conformance

Any new `Persistence` implementation must pass the shared persistence contract test suite (one test file exercising all guarantees above against every implementation, per AGENTS.md's Testing section) before being considered a valid built-in.
