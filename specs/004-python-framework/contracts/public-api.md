# Contract: Public API — `telebot_py`

**Feature**: `specs/004-python-framework` | Contract type: library public API | **Date**: 2026-08-30

This contract defines the stable public surface bot authors code against. Signatures are normative; bodies live in implementation. Data-model details: [../data-model.md](../data-model.md).

## 1. Top-level exports (`import telebot_py`)

```python
from telebot_py import Application, ApplicationBuilder, CallbackContext
from telebot_py import filters
from telebot_py import (
    CommandHandler, MessageHandler, CallbackQueryHandler,
    ConversationHandler, LinearConversationHandler, AsyncConversationHandler,
)
from telebot_py.ext_errors import TelegramApiError, NetworkError, InvalidTokenError
```

## 2. Application kernel

```python
class ApplicationBuilder:
    def __init__(self) -> None: ...
    def token(self, token: str) -> Self: ...
    def transport(self, transport: httpx.AsyncBaseTransport) -> Self: ...   # test seam
    def persistence(self, persistence: BasePersistence) -> Self: ...
    def job_queue(self, enabled: bool = True) -> Self: ...
    def post_init(self, callback: Callable[[Application], Awaitable[None]]) -> Self: ...
    def post_shutdown(self, callback: Callable[[Application], Awaitable[None]]) -> Self: ...
    def build(self) -> Application: ...        # raises on invalid combination (FR-014)

class Application:
    bot: Bot
    job_queue: JobQueue | None
    def add_handler(self, handler: BaseHandler, group: int = 0) -> None: ...
    def add_error_handler(self, callback: ErrorCallback) -> None: ...
    async def initialize(self) -> None: ...
    async def start(self) -> None: ...
    async def stop(self) -> None: ...
    async def shutdown(self) -> None: ...
    def run_polling(self, *, allowed_updates: Sequence[str] | None = None,
                    drop_pending_updates: bool = False, ...) -> None: ...   # blocks until signal
    def run_webhook(self, *, listen: str = "127.0.0.1", port: int = 8443,
                    url_path: str = "", secret_token: str | None = None, ...) -> None: ...
```

**Lifecycle contract**: `initialize → start → stop → shutdown` order enforced; calling `run_polling()` then `run_webhook()` on the same application raises `ApplicationError`. Handler exceptions never escape `process_update`; they route to error handlers (FR-013).

## 3. Bot client

```python
class Bot:
    async def send_message(self, chat_id: int | str, text: str, *,
                           parse_mode: str | None = None, reply_markup=None, ...) -> Message: ...
    async def get_me(self) -> User: ...
    async def get_updates(self, *, offset: int | None = None, timeout: int = 0,
                          allowed_updates: Sequence[str] | None = None) -> list[Update]: ...
    # ... full method set per parity inventory (research R10), each:
    #   - snake_case name, snake_case kwargs matching Telegram fields
    #   - returns typed result objects
    #   - raises TelegramApiError / NetworkError (contract below)
```

**Retry contract** (FR-012): 429/5xx retried with backoff 1s→2s→4s→8s capped 30s; 429 waits `max(step, retry_after)`; other 4xx raise immediately. Transport injection (builder `.transport(...)`) replaces only the wire layer — retry/error mapping stays active in tests.

## 4. Handlers & filters

```python
class CommandHandler(BaseHandler):
    def __init__(self, command: str | Sequence[str],
                 callback: HandlerCallback, *, filters: MessageFilter | None = None) -> None: ...
    # empty command → ValueError at construction (FR-014)

class MessageHandler(BaseHandler):
    def __init__(self, filters: MessageFilter, callback: HandlerCallback) -> None: ...

HandlerCallback = Callable[[Update, CallbackContext], Awaitable[None]]
```

Filter algebra contract (FR-002): `f1 & f2`, `f1 | f2`, `~f` return filters; evaluation short-circuits. Named aliases are `and_()/or_()/not_()` (bare `.and()` is a Python syntax error) for porting code from the TypeScript `.and()/.or()/.not()` API.

## 5. Conversations

```python
class ConversationHandler(BaseHandler):
    def __init__(self, *, entry_points: list[BaseHandler],
                 states: dict[object, list[BaseHandler]],
                 fallbacks: list[BaseHandler],
                 per_message: bool = False, timeout: float | None = None,
                 name: str | None = None, persistent: bool = False) -> None: ...
```

State contract: returning a state key from a callback moves the conversation; returning `ConversationHandler.END` closes it; timeout (if set) routes to `ConversationHandler.TIMEOUT` state when present, else ends. Persistent conversations restore across restarts via persistence backend (SC-005).

## 6. Scheduler

```python
class JobQueue:
    def run_once(self, callback: JobCallback, when: float | datetime, *,
                 data=None, name: str | None = None) -> Job: ...
    def run_repeating(self, callback: JobCallback, interval: float | TimeOfDay, *,
                      first: float | datetime | None = None, ...) -> Job: ...
    def run_daily(self, callback: JobCallback, time: datetime.time, ...) -> Job: ...
    def run_custom(self, rrule: RRule, callback: JobCallback, ...) -> Job: ...

class Job:
    name: str
    def cancel(self) -> None: ...   # idempotent
```

## 7. Persistence

```python
class BasePersistence(ABC):
    async def get_conversations(self, name: str) -> dict[tuple, object]: ...
    async def update_conversation(self, name: str, key: tuple, state: object,
                                  data: dict | None = None) -> None: ...
    async def get_chat_data(self) -> dict[int, dict]: ...
    async def get_user_data(self) -> dict[int, dict]: ...
    async def get_bot_data(self) -> dict: ...
    async def refresh_* / update_* counterparts ...: ...
```

Backends interchangeable; none block the event loop.

## 8. Plugins

```python
class Plugin(ABC):
    name: str
    async def on_response(self, ctx, response) -> response: ...   # optional hook
    async def on_error(self, ctx, error) -> None: ...              # optional hook

application.add_plugin(plugin, *, order: int = 0) -> None
application.remove_plugin(name: str) -> None
```

Hooks fire in declared `order`; removal takes effect before the next update; plugin state namespaced by plugin name.

## 9. Error contract

All public APIs raise typed errors only:

| Error | Raised when |
|---|---|
| `TelegramApiError` | Bot API responds not-ok; carries `error_code`, `description`, `retry_after?` |
| `InvalidTokenError` (⊂ TelegramApiError) | 401 during startup checks |
| `NetworkError` | transport failure after retries exhausted |
| `ApplicationError` | lifecycle misuse (double run mode, dispatch before init) |
| `ValueError` | programmer errors at construction (empty command, invalid builder combos) |

## 10. Stability promise

- v0.x: minor bumps may break; breaking changes listed in changelog.
- v1.0: this contract frozen except additive changes; parity audit table (research R10) enforced in CI.
