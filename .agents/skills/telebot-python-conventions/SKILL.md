---
name: telebot-python-conventions
description: Authoritative guide for adding new Bot API methods, Handlers, Filters, Scheduler RRule features, Storage Persistence drivers, or Sphinx docstrings to the Python framework in packages/python (telebot_py), and for keeping version/release parity across telebot-ts, telebot-go, and telebot-py. Use whenever developing, modifying, or reviewing code in packages/python.
---

# Telebot Python Framework Conventions

## 1. Overview
`telebot_py` (located in `packages/python/`) is an async-first Python implementation of the Telegram Bot framework mirroring python-telegram-bot's API in native snake_case. Python ≥ 3.10; the sole required runtime dependency is `httpx`.
When adding new methods, features, handlers, or storage drivers, agents must strictly follow the mixin/domain structure, naming conventions, dependency policy, TDD workflow, file length limit (< 500 lines), and Sphinx autodoc documentation standards.

---

## 2. Naming Conventions & File Length Ceiling

| Kind | Rule | Example |
|---|---|---|
| **Method you call (`x()`)** | `snake_case` (PTB parity) | `send_message`, `add_handler`, `run_polling`, `delete_user_data` |
| **Property / Storage key / API option** | `snake_case` Telegram field names | `context.user_data`, `context.chat_data`, `chat_id`, `message_id`, `first_name` |
| **Class / Filter constant** | `PascalCase` / `UPPER_SNAKE_CASE` | `CommandHandler`, `RRule`, `filters.TEXT`, `filters.ChatType.PRIVATE` |
| **Filter combinators** | Native operators | `&`, <code>\|</code>, `~`; aliases `and_()/or_()/not_()` (bare `.and()` is a syntax error) |
| **Filenames & Folders** | lowercase `snake_case` modules | `conversation.py`, `chat_management.py`, `invite_links.py` |
| **File Length Constraint** | Strictly `< 500` lines per file | Decompose larger files into dedicated subpackages |
| **Module Exports** | Re-export through `__init__.py` | Public API available from `telebot_py` and each subpackage root |

---

## 3. How to Add a New Bot API Method (Mixin Pattern)

The `Bot` client in `packages/python/src/telebot_py/bot/` composes domain mixins onto `Bot` in `client.py`:

1. **Step 1: Define/verify types in `src/telebot_py/types/`**
   - Frozen dataclasses subclassing `TelegramObject` (`types/base.py` provides `from_dict`/`to_dict`, wire mapping `from` → `from_user`, tolerance of unknown fields).
   - **Fields come from `scripts/bot-api-oracle.json`, not from `packages/node`.** Node is a peer implementation, not ground truth, and has been wrong repeatedly (it exposed no `ChatFullInfo` for its first releases; its `Chat` declares 43 fields where the docs table lists 8, while go's `Chat` declares exactly 8). Query the oracle offline:
     `node -e "const o=require('./scripts/bot-api-oracle.json');console.log(JSON.stringify(o.types['ChatFullInfo'].fields,null,1))"` → `{wire_name: {type, optional}}`.
   - Declare **every** field of that row, required *and optional*, **inside the dataclass itself**. The fidelity audit resolves `extends` only for TypeScript, so a field you inherit from another docs type still reads as missing — python types stay flat, and one duplicated field is cheaper than a red gate. `npm run audit:fidelity` checks this against the committed baseline.
   - Docs-required ⇒ no dataclass default; docs-optional ⇒ a default. Never guess a field name or optionality.
   - One module per docs domain (`chat_full_info.py`, `message_service.py`, `input_media.py`, `gifts.py`, `rich_blocks.py`, …). The directory holds ~37 modules, far more than any list here can stay current — `ls src/telebot_py/types/` and reuse a module before creating one; re-export via `types/__init__.py`.
2. **Step 2: Implement in the matching domain mixin file** under `src/telebot_py/bot/` (Go-style split: `messages.py`, `chats.py`, `edits.py`, `rich_messages.py`, `checklists.py`, `owned_gifts.py`, `managed_bot.py`, `verification.py`, `webhook.py`, …). The directory holds ~34 mixins — `ls src/telebot_py/bot/` and extend the existing domain file rather than adding a new one.
   - Use the `Requester.request(method, payload)` helper from `bot/base.py` plus `clean_payload` (omit unset kwargs), `parse_flag`, `to_wire` (accepts `Mapping | SupportsToDict` for markup params).
   - **A documented method argument counts as sendable only if it is enumerable**: the fidelity audit (`scripts/bot-api-params.mjs`) reads the explicit keyword arguments on the `async def` that reach `clean_payload(...)`, so every documented param of that method must be an explicit kwarg. A `**kwargs` catch-all is reported as an *unmeasurable method* — the audit never invents a key list it cannot read, so routing arguments through it is a regression, not a shortcut.
   - Return the type the docs say the method returns. `getChat` returns **`ChatFullInfo`**, so `get_chat` decodes into `ChatFullInfo`, not `Chat`; `Chat` is what rides inside `Message`.
   - Do **not** add a `get_chat_full_info` alias to close the parity gap: the Bot API defines no such method, go's `GetChatFullInfo` is a convenience alias over the same `getChat` wire call, and python's `get_chat` already returns the full object. `parity_audit.py`'s `ALLOWLIST` records that reasoning — a stale allowlist entry is an error, so leave the entry alone unless you also change go.
   - Compose the mixin onto `Bot` in `client.py` and re-export in `bot/__init__.py`.
3. **Step 3: Add complete Sphinx-ready docstrings (Google style)**
   - One-line summary, an `Example:` doctest-style snippet, `Args:`, `Returns:`, `Raises:` listing `InvalidTokenError` / `TelegramApiError` / `NetworkError`.
   - Close the docstring with a final `Telegram API: https://core.telegram.org/bots/api#<slug>` line for every documented method/type: `<slug>` is the wire name from the `self.request(...)` literal (or the class name) fully lowercased, and MUST be present in the oracle's anchor list — `node -e "const o=require('./scripts/bot-api-oracle.json');console.log(o.anchors.includes('sendmessage'))"` — never recalled from memory. Fetch the live page only if you suspect the oracle is stale, then `npm run audit:docs`. Skip the line for framework extensions and helpers.
4. **Step 4: TDD unit tests in `tests/unit/bot/test_methods_<domain>.py`**
   - Use the `bot_transport` MockTransport fixtures + `record_into` helpers from `tests/conftest.py`; assert URL path, snake_case payload serialization, typed results, and `TelegramApiError` on error responses. NO real HTTP ever.

---

## 4. How to Add a New Handler

1. Create `src/telebot_py/routing/handlers/<name>.py` subclassing `BaseHandler`.
2. Contract: `check_update(update) -> match` returns `None`/`False` for no match, else a truthy payload (truthiness rule is `result is not None and result is not False`); `handle_update(update, context, match)` awaits the user callback `(update, context)`.
3. Parity reference: `packages/node/src/routing/handlers/*.ts` — mirror its handler inventory and options exactly.
4. Re-export from `handlers/__init__.py` and `routing/__init__.py`.
5. TDD tests in `tests/unit/routing/test_handlers*.py` built from realistic Update payloads (extend `tests/conftest.py` factories as needed).

---

## 5. How to Add a New Filter

1. Subclass `MessageFilter` in `src/telebot_py/filters/` (`base.py`); set `data_filter = True` when the filter attaches extracted data to the context.
2. Combinators come free: `&`, `|`, `~`. Add constants/matchers to the `filters` namespace via `filters/__init__.py`.
3. TDD tests in `tests/unit/filters/test_filters.py`.

---

## 6. How to Add a New Storage Persistence Driver

All drivers implement the `BasePersistence` ABC (`src/telebot_py/storage/base.py`) behind the driver interface in `storage/driver.py`:

1. Implement the async contract: `get_conversations/update_conversation`, `get/update/refresh` for `chat_data`, `user_data`, `bot_data`.
2. **Never block the event loop**: file I/O via `asyncio.to_thread`; SQLite via the single dedicated worker-thread pattern used in `storage/sqlite.py` (WAL, `queue.Queue` submission, `loop.call_soon_threadsafe` results).
3. JSON drivers must write atomically (tmp file + `os.replace`).
4. Parametrize contract tests across backends in `tests/unit/storage/test_persistence.py`; add a restart-resume integration case in `tests/integration/test_persistence_restart.py` when semantics change.

---

## 7. Scheduler & RRule

- `JobQueue`/`Job` live in `src/telebot_py/scheduler/`; RRule semantics are a field-for-field port of `packages/go/pkg/scheduler/rrule/` — when changing RRule behavior, port the Go change AND its test cases together (`tests/unit/scheduler/test_rrule.py`).
- Never call `time.monotonic()`/`asyncio.sleep` directly in scheduler logic; use the injected `clock`/`sleep` seams so tests run fake time.

---

## 8. Plugins

- Subclass `Plugin` (`src/telebot_py/plugins/plugin.py`) with optional async `response`/`error` hooks; register via `application.add_plugin(plugin, order=...)`.
- Response hooks fire around successful handler results in declared order; error hooks fire in the error flow (see `kernel/dispatcher.py` seams). Namespaced state via `PluginManager`.

---

## 9. Quality Gates (must pass before any PR, from `packages/python/`)

```bash
source .venv/bin/activate
python -m pytest -q                 # offline, no TEST_BOT_TOKEN needed
ruff check . && ruff format --check .
mypy --strict src
python scripts/parity_audit.py      # SC-007 parity table; gaps fail CI
cd ../.. && npm run audit:fidelity  # docs field-fidelity ratchet (runs from repo root)
```

- TDD is mandatory (AGENTS.md): write the test, watch it fail, implement.
- Coverage gate: > 80% (`--cov-fail-under=80`).
- Live tests: mark `pytest.mark.live`, use the `live_token` fixture; they auto-skip without `TEST_BOT_TOKEN` (FR-017). Never add network calls to the default suite.
- Dependency policy: `httpx` is the ONLY runtime dependency. Anything else requires amending `specs/004-python-framework/spec.md` Assumptions first.
- Retry semantics (FR-012): only 429/5xx retried, backoff 1s/2s/4s/8s capped 30s, honor `retry_after`; other 4xx raise immediately. Never bypass via `bot/retry.py`.

---

## 10. Examples

Every major feature keeps a runnable example in `packages/python/examples/` (echo_bot, conversation, scheduler, plugins_i18n, webhook, persistence, ptb_reference_echo for the SC-001 porting proof). Examples are not imported by tests and are excluded from coverage.

---

## 11. Versioning & Release Parity (node = go = python)

All three frameworks share ONE version number (currently `1.5.0`):

- `packages/node/package.json` → npm (`telebot-ts`), released by semantic-release on pushes to `main`; node tags are `vX.Y.Z`.
- `packages/go` → GitHub Releases only; tags `packages/go/vX.Y.Z` are mirrored by `.github/workflows/release-pipeline.yml` with the same version.
- `packages/python/pyproject.toml` + `src/telebot_py/__init__.py` (`__version__`) → PyPI (`telebot-py`); tags `packages/python/vX.Y.Z` are mirrored the same way, and `python-release.yml` is dispatched at the mirrored tag to build, create the GitHub Release, and publish to PyPI via trusted publishing (OIDC). The release job must declare `environment: pypi`, matching the Environment name registered in the PyPI trusted publisher — a missing/mismatched environment claim makes PyPI reject the publish with `invalid-publisher`.

Rules:

- When cutting or referencing a release, all three versions/tags must match. If you bump `pyproject.toml`, bump `__version__` in `src/telebot_py/__init__.py` in the same change (`docs/conf.py` reads from `pyproject.toml` and never drifts).
- Never hand-push `packages/python/v*` tags ahead of the node line; the pipeline mirrors them. `python-release.yml` stamps the tag's version into `pyproject.toml`/`__init__.py` before building, so the wheel always matches its tag.
- Release notes come from conventional commits via git-cliff (`packages/python/cliff.toml`); use `feat(py)`/`fix(py)` scopes.
- Verify releases locally before tagging: `python -m build` then `twine check dist/*`.
