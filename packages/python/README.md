# telebot-py

> Async-first Telegram Bot Framework for Python, mirroring [python-telegram-bot](https://python-telegram-bot.org)'s public API.

<!-- Badges: activate once the package is published and CI workflows are live.
[![PyPI version](https://img.shields.io/pypi/v/telebot-py)](https://pypi.org/project/telebot-py/)
[![Python](https://img.shields.io/pypi/pyversions/telebot-py)](https://pypi.org/project/telebot-py/)
[![CI](https://github.com/Nam088/telegram-bot-node/actions/workflows/ci.yml/badge.svg)](https://github.com/Nam088/telegram-bot-node/actions/workflows/ci.yml)
-->

`telebot-py` is the third language implementation of this repository's Telegram bot
framework, alongside [`telebot-ts`](../node) (TypeScript) and
[`telebot-go`](../go) (Go). It is built from scratch in native Python
(asyncio-first) and mirrors the python-telegram-bot API in native snake_case,
including native `&` / `|` / `~` filter operators.

## Features

- **Bot client** over `httpx` (the single required runtime dependency) with retry
  semantics (429/5xx exponential backoff, `retry_after` honored) and a pluggable
  transport for offline testing.
- **Application kernel**: builder, dispatcher with ordered handler groups,
  long polling and webhook modes, full lifecycle management.
- **Handlers**: command, message, callback query, conversation
  (standard/linear/async forms), and the extended handler set.
- **Composable filters** with native Python operators.
- **Scheduler**: `JobQueue` with one-shot, repeating, and RRule schedules.
- **Persistence**: memory, JSON file, and SQLite backends behind one contract.
- **Plugins** with hooks, ordering, and built-in i18n; **components** for menus
  and keyboards.

## Installation

Requires Python 3.10+. telebot-py is versioned in lockstep with telebot-ts and
telebot-go (currently `1.4.0`). Install from PyPI:

```bash
pip install telebot-py
```

Or from source:

```bash
pip install packages/python          # from the repo root
```

## Quick Start

```python
from telebot_py import ApplicationBuilder, CallbackContext, CommandHandler, MessageHandler, filters
from telebot_py.types import Update


async def start(update: Update, context: CallbackContext) -> None:
    await context.bot.send_message(chat_id=update.effective_chat.id, text="Hello!")


async def echo(update: Update, context: CallbackContext) -> None:
    await context.bot.send_message(
        chat_id=update.effective_chat.id, text=update.effective_message.text
    )


app = ApplicationBuilder().token("YOUR_BOT_TOKEN").build()
app.add_handler(CommandHandler("start", start))
app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))
app.run_polling()
```

## Documentation

Full API reference (kernel, bot, routing, filters, scheduler, storage, plugins,
components, types) lives in [`docs/`](docs/) and is generated with Sphinx from
the in-source docstrings. The published site is served by GitHub Pages at
`https://nam088.github.io/telegram-bot-node/python/` (see the combined
[docs site](https://nam088.github.io/telegram-bot-node/)).

Build the docs locally (requires the `[dev]` extra):

```bash
cd packages/python
source .venv/bin/activate
sphinx-build -W --keep-going docs docs/_build
open docs/_build/index.html   # macOS
```

`-W --keep-going` treats warnings as errors, matching CI. `docs/_build/` is
gitignored and never committed.

## Development

```bash
cd packages/python
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

ruff check src tests scripts && ruff format --check src tests scripts
mypy --strict src
pytest --cov=telebot_py --cov-fail-under=80
python scripts/parity_audit.py   # node/go/python API parity (CI-enforced)
```

Tests that need a live bot are marked `@pytest.mark.live` and auto-skip unless
`TEST_BOT_TOKEN` is set. The default suite runs fully offline.

## Releasing

Releases are automated: pushing a tag of the form `packages/python/vX.Y.Z`
triggers [`python-release.yml`](../../.github/workflows/python-release.yml),
which builds the package, generates changelog notes from conventional commits
via [git-cliff](https://git-cliff.org) (scoped to `packages/python/*` in
[`cliff.toml`](cliff.toml)), creates a GitHub Release, and publishes to PyPI
using trusted publishing (OIDC — no stored API tokens).

To cut a release locally and verify it before tagging:

```bash
cd packages/python
source .venv/bin/activate

python -m build            # produces dist/telebot_py-X.Y.Z.tar.gz + .whl
twine check dist/*         # validates metadata/README rendering
sphinx-build -W --keep-going docs docs/_build   # docs gate

git tag packages/python/vX.Y.Z
git push origin packages/python/vX.Y.Z
```

Pre-release checklist (manual steps, not automatable offline):

1. Confirm the PyPI name is still available: `pip index versions telebot-py`
   or browse <https://pypi.org/project/telebot-py/>. If squatted, the fallback
   name is `telebot-python` (update `pyproject.toml` `[project].name` and the
   workflow `packages-dir` accordingly).
2. Bump `version` in [`pyproject.toml`](pyproject.toml) — `docs/conf.py` and
   the build backend both read it from there.
3. Ensure CI (`ci.yml`) and the parity audit are green on the commit to tag.

## License

MIT — see [LICENSE](LICENSE).
