"""Live smoke tests against a real bot (L6 in quickstart.md).

Require TEST_BOT_TOKEN; auto-skipped when it is unset (FR-017).
"""

from __future__ import annotations

import os

import pytest

from telebot_py import ApplicationBuilder

pytestmark = pytest.mark.live


async def test_live_get_me(live_token: str) -> None:
    """The configured token authenticates and returns the bot identity."""
    app = ApplicationBuilder().token(live_token).build()
    await app.initialize()
    try:
        me = await app.bot.get_me()
        assert me.is_bot is True
        assert me.id > 0
    finally:
        await app.shutdown()


async def test_live_get_updates_round_trip(live_token: str) -> None:
    """A real getUpdates round-trip parses without errors."""
    app = ApplicationBuilder().token(live_token).build()
    await app.initialize()
    try:
        updates = await app.bot.get_updates(limit=1, timeout=0)
        assert isinstance(updates, list)
    finally:
        await app.shutdown()


@pytest.mark.skipif(
    os.environ.get("TEST_CHAT_ID") is None,
    reason="live send test requires TEST_CHAT_ID",
)
async def test_live_send_message(live_token: str) -> None:
    """Send a message to the configured test chat and echo-check the result."""
    chat_id = int(os.environ["TEST_CHAT_ID"])
    app = ApplicationBuilder().token(live_token).build()
    await app.initialize()
    try:
        message = await app.bot.send_message(chat_id, "telebot_py live smoke test")
        assert message.message_id > 0
        await app.bot.delete_message(chat_id, message.message_id)
    finally:
        await app.shutdown()
