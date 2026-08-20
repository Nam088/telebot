# Contract: `Bot` HTTP client

Public surface a bot author calls directly (FR-2). Full method list (80+ Bot API methods) is in `technical-context.md`'s "API Contracts" section; this contract documents the shape every method shares, not each signature again.

## Shared method contract

```ts
class Bot {
  constructor(token: string, options?: BotOptions);
  // One method per Telegram Bot API method, e.g.:
  getMe(): Promise<User>;
  sendMessage(options: SendMessageOptions): Promise<Message>;
  pinChatMessage(chatId: number | string, messageId: number, options?: { disable_notification?: boolean }): Promise<true>;
  // ...
}
```

- **Naming**: method name is the Telegram method name converted PTB-snake_case → camelCase (Naming Conventions). Options-object keys that mirror a Telegram field stay snake_case (`chat_id`, `disable_notification`), per the same rule.
- **Return value**: resolves with Telegram's `result` field, typed per method (`Promise<Message>`, `Promise<boolean>`, `Promise<true>`, etc.) — never the raw envelope (`{ok, result}`).
- **Failure**: rejects with a `TelegramApiError` (never a bare `Error`), carrying `error_code: number` and `description: string` from Telegram's `{ok: false, error_code, description}` response.
- **Retry**: on `429`/`5xx`, retries internally with exponential backoff (`1s,2s,4s,8s`, cap `30s`); `429` additionally honors `retry_after` exactly. Other 4xx codes are not retried — they reject immediately (research.md's Error handling entry).
- **Transport override**: `BotOptions` accepts a custom `fetch` implementation (the "Custom HTTP Adapter" escape hatch), used by tests to avoid real network calls and by advanced users needing a proxy.

## Multipart methods

Methods that accept file uploads (`sendPhoto`, `sendDocument`, `sendAudio`, `sendVideo`, `sendAnimation`, `sendVoice`, `sendVideoNote`, `sendMediaGroup`, `setChatPhoto`) additionally accept an `InputFile` (FR-8) wherever Telegram accepts a file: a `file_id` string, a URL string, or a local buffer/stream, encoded as `multipart/form-data` via `src/utils/http.ts`.
