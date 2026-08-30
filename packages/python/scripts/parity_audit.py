#!/usr/bin/env python3
"""Cross-language parity audit for telebot_py (T055, SC-007, research R10).

Generates a method/handler x {node, go, python} table into
``scripts/PARITY.md`` and exits non-zero when any node or go entry lacks a
python counterpart outside the explicit :data:`ALLOWLIST`.

Sources inventoried:

- python: public coroutine methods of ``telebot_py.bot.Bot`` (introspection)
  and ``*Handler`` classes in ``telebot_py.routing.handlers``.
- node: ``public async <name>(`` declarations in
  ``packages/node/src/client/methods/**/*.ts`` and ``*Handler`` class
  declarations in ``packages/node/src/routing/handlers/*.ts``.
- go: ``func (b *Bot) <Name>(`` receivers in ``packages/go/pkg/bot/*.go``.

Names are normalized camelCase/PascalCase -> snake_case before comparison.
"""

from __future__ import annotations

import inspect
import re
from pathlib import Path

from telebot_py.bot import Bot
from telebot_py.routing import handlers as handlers_module
from telebot_py.routing.handlers import BaseHandler

REPO_ROOT = Path(__file__).resolve().parents[3]
NODE_METHODS_DIR = REPO_ROOT / "packages/node/src/client/methods"
NODE_HANDLERS_DIR = REPO_ROOT / "packages/node/src/routing/handlers"
GO_BOT_DIR = REPO_ROOT / "packages/go/pkg/bot"
PARITY_MD = Path(__file__).resolve().parent / "PARITY.md"

#: Infrastructure members of the python Bot that are not Bot API methods.
PYTHON_INFRA = frozenset({"request", "shutdown"})

#: Infrastructure members of the node Bot that are not Bot API methods:
#: ``sleep`` is a rate-limit helper; ``initialize`` and ``shutdown`` are
#: lifecycle helpers. (``request`` never matches the parse pattern because
#: of its ``<T>``.)
NODE_INFRA = frozenset({"sleep", "initialize", "shutdown"})

#: Infrastructure members of the go Bot that are not Bot API methods:
#: token accessor, hook registration, raw request plumbing, and the
#: webhook HTTP server helpers.
GO_INFRA = frozenset(
    {"token", "on_response", "on_error", "request", "run_webhook", "webhook_handler"}
)

#: Shared reason for node-only methods that Go has not implemented yet;
#: telebot_py tracks Go parity, so these are deferred to a future
#: cross-language parity pass rather than implemented python-first.
NODE_ONLY_GAP_REASON = (
    "node-only method (not yet implemented in Go); telebot_py tracks Go parity"
    " — deferred to a future cross-language parity pass"
)

_NODE_ONLY_DEFERRED = frozenset(
    {
        "answer_chat_join_request_query",
        "answer_guest_query",
        "approve_suggested_post",
        "convert_gift_to_stars",
        "decline_suggested_post",
        "delete_business_messages",
        "delete_ephemeral_message",
        "delete_story",
        "edit_ephemeral_message_caption",
        "edit_ephemeral_message_media",
        "edit_ephemeral_message_reply_markup",
        "edit_ephemeral_message_text",
        "edit_message_checklist",
        "edit_story",
        "get_available_gifts",
        "get_business_account_gifts",
        "get_business_account_star_balance",
        "get_business_connection",
        "get_chat_gifts",
        "get_managed_bot_access_settings",
        "get_managed_bot_token",
        "get_user_gifts",
        "get_user_personal_chat_messages",
        "get_user_profile_audios",
        "gift_premium_subscription",
        "read_business_message",
        "remove_business_account_profile_photo",
        "replace_managed_bot_token",
        "repost_story",
        "save_prepared_keyboard_button",
        "send_chat_join_request_web_app",
        "send_checklist",
        "send_gift",
        "send_live_photo",
        "send_message_draft",
        "send_paid_media",
        "send_rich_message",
        "send_rich_message_draft",
        "set_business_account_bio",
        "set_business_account_gift_settings",
        "set_business_account_name",
        "set_business_account_username",
        "set_managed_bot_access_settings",
        "transfer_business_account_stars",
        "transfer_gift",
        "upgrade_gift",
    }
)

#: Intentional parity gaps: node/go methods deliberately absent from python.
#: Every entry must carry a reason; stale entries are flagged as errors.
ALLOWLIST: dict[str, str] = {
    # Upload-only method: the Bot API accepts a fresh InputFile upload only
    # (no file_id/URL alternative), unlike setMyProfilePhoto which telebot_py
    # implements with a ``photo`` file_id string. Multipart file uploads are
    # deferred for this phase — see MessagesMixin.send_document ("file uploads
    # are out of scope").
    "set_business_account_profile_photo": (
        "multipart-upload-only method; file uploads deferred for this phase"
    ),
    **dict.fromkeys(_NODE_ONLY_DEFERRED, NODE_ONLY_GAP_REASON),
}

NODE_METHOD_RE = re.compile(r"public async (\w+)\(")
GO_METHOD_RE = re.compile(r"^func \(b \*Bot\) ([A-Z]\w*)\(", re.MULTILINE)
NODE_HANDLER_RE = re.compile(r"export (?:abstract )?class (\w+Handler)")


def snake(name: str) -> str:
    """Normalize camelCase/PascalCase to snake_case."""
    spaced = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", spaced).lower()


def python_methods() -> set[str]:
    """Public coroutine methods of the python Bot, minus infrastructure."""
    names = {
        name
        for name, member in inspect.getmembers(Bot)
        if not name.startswith("_") and inspect.iscoroutinefunction(member)
    }
    return names - PYTHON_INFRA


def node_methods() -> set[str]:
    """Node Bot API methods parsed from the client method mixins."""
    names: set[str] = set()
    for ts_file in sorted(NODE_METHODS_DIR.rglob("*.ts")):
        names.update(NODE_METHOD_RE.findall(ts_file.read_text(encoding="utf-8")))
    return {snake(name) for name in names} - NODE_INFRA


def go_methods() -> set[str]:
    """Go Bot API methods parsed from the exported *Bot receivers."""
    names: set[str] = set()
    for go_file in sorted(GO_BOT_DIR.glob("*.go")):
        if go_file.name.endswith("_test.go"):
            continue
        names.update(GO_METHOD_RE.findall(go_file.read_text(encoding="utf-8")))
    return {snake(name) for name in names} - GO_INFRA


def python_handlers() -> set[str]:
    """Handler classes exported from telebot_py.routing.handlers."""
    return {
        name
        for name, obj in inspect.getmembers(handlers_module, inspect.isclass)
        if name.endswith("Handler") and issubclass(obj, BaseHandler)
    }


def node_handlers() -> set[str]:
    """Handler classes declared in packages/node/src/routing/handlers."""
    names: set[str] = set()
    for ts_file in sorted(NODE_HANDLERS_DIR.glob("*.ts")):
        names.update(NODE_HANDLER_RE.findall(ts_file.read_text(encoding="utf-8")))
    return names


def mark(present: bool) -> str:
    """Table cell marker for presence."""
    return "yes" if present else "**missing**"


def render_markdown(
    node_ms: set[str],
    go_ms: set[str],
    py_ms: set[str],
    node_hs: set[str],
    py_hs: set[str],
    gaps: list[str],
    stale: list[str],
) -> str:
    """Render the parity tables as a Markdown document."""
    lines = [
        "# telebot_py Parity Audit",
        "",
        "Generated by `scripts/parity_audit.py` (T055, SC-007) — do not edit by hand.",
        "",
        f"- Bot API methods: node={len(node_ms)}, go={len(go_ms)}, python={len(py_ms)}",
        f"- Handlers: node={len(node_hs)}, python={len(py_hs)}",
        f"- Missing python counterparts (outside allowlist): {len(gaps)}",
        "",
        "## Bot API methods",
        "",
        "| method | node | go | python |",
        "| --- | --- | --- | --- |",
    ]
    for name in sorted(node_ms | go_ms | py_ms):
        lines.append(
            f"| {name} | {mark(name in node_ms)} | {mark(name in go_ms)} | {mark(name in py_ms)} |"
        )
    lines += [
        "",
        "## Handlers",
        "",
        "| handler | node | python |",
        "| --- | --- | --- |",
    ]
    for name in sorted(node_hs | py_hs):
        lines.append(f"| {name} | {mark(name in node_hs)} | {mark(name in py_hs)} |")
    lines += ["", "## Allowlisted intentional gaps", ""]
    if ALLOWLIST:
        lines += ["| method | reason |", "| --- | --- |"]
        lines += [f"| {name} | {reason} |" for name, reason in sorted(ALLOWLIST.items())]
    else:
        lines.append("(none)")
    lines += ["", "## Gaps (missing python counterpart)", ""]
    if gaps:
        lines += [f"- {name}" for name in gaps]
    else:
        lines.append("(none — parity complete)")
    if stale:
        lines += ["", "## Stale allowlist entries", ""]
        lines += [f"- {name}" for name in stale]
    return "\n".join(lines) + "\n"


def main() -> int:
    """Run the audit, write PARITY.md, and return the process exit code."""
    node_ms, go_ms, py_ms = node_methods(), go_methods(), python_methods()
    node_hs, py_hs = node_handlers(), python_handlers()

    gaps = sorted((node_ms | go_ms) - py_ms - ALLOWLIST.keys())
    # Keep the allowlist honest: entries the python side already covers, or
    # that no sibling exposes, must be removed.
    stale = sorted(name for name in ALLOWLIST if name in py_ms or name not in node_ms | go_ms)

    PARITY_MD.write_text(
        render_markdown(node_ms, go_ms, py_ms, node_hs, py_hs, gaps, stale),
        encoding="utf-8",
    )

    print(f"Parity audit: {len(py_ms)} python methods vs {len(node_ms)} node, {len(go_ms)} go")
    print(f"Handlers: {len(py_hs)} python vs {len(node_hs)} node")
    print(f"PARITY.md written to {PARITY_MD}")

    handler_gaps = sorted(node_hs - py_hs)
    if handler_gaps:
        print("Missing python handlers:")
        for name in handler_gaps:
            print(f"  - {name}")
    if gaps:
        print("Missing python Bot API methods (outside allowlist):")
        for name in gaps:
            print(f"  - {name}")
    if stale:
        print("Stale allowlist entries (remove them):")
        for name in stale:
            print(f"  - {name}")
    if gaps or handler_gaps or stale:
        return 1
    print("Parity complete: zero gaps outside the allowlist.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
