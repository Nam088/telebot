"""Unit tests for the built-in I18nPlugin (T039, i18n half).

Parity with packages/node/src/plugins/i18n.ts: per-user locale resolution
(stored preference, then Telegram ``language_code``, then default locale),
missing-key fallback to the default locale table then the key itself, and
``{placeholder}`` interpolation.
"""

from __future__ import annotations

from typing import Any

from telebot_py import ApplicationBuilder, CallbackContext
from telebot_py.plugins import I18nPlugin, PluginManager
from telebot_py.types import Update

ME_PAYLOAD = {"id": 999, "is_bot": True, "first_name": "EchoBot", "username": "echo_bot"}

LOCALES: dict[str, dict[str, str]] = {
    "en": {"hello": "Hello, {name}!", "only_en": "English only"},
    "vi": {"hello": "Xin chào, {name}!"},
}


def make_plugin(**kwargs: Any) -> I18nPlugin:
    return I18nPlugin(default_locale="en", locales=LOCALES, **kwargs)


def make_context(
    bot_transport: Any,
    ok_response: Any,
    make_update: Any,
    *,
    language_code: str | None = None,
    user_id: int = 42,
) -> CallbackContext:
    """Build a CallbackContext whose effective user may carry a language_code."""
    app = (
        ApplicationBuilder()
        .token("123456:TEST")
        .transport(bot_transport(ok_response(ME_PAYLOAD)))
        .build()
    )
    from_user: dict[str, Any] = {"id": user_id, "is_bot": False, "first_name": "Alice"}
    if language_code is not None:
        from_user["language_code"] = language_code
    payload = make_update(message=make_update_message(from_user=from_user))
    return CallbackContext(app, Update.from_dict(payload))


def make_update_message(
    from_user: dict[str, Any] | None = None, **overrides: Any
) -> dict[str, Any]:
    message: dict[str, Any] = {
        "message_id": 1,
        "date": 1_700_000_000,
        "chat": {"id": 100, "type": "private"},
        "from": from_user
        if from_user is not None
        else {"id": 42, "is_bot": False, "first_name": "Alice"},
        "text": "hello",
    }
    message.update(overrides)
    return message


class TestLocaleResolution:
    def test_language_code_selects_matching_locale(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        plugin = make_plugin()
        ctx = make_context(bot_transport, ok_response, make_update, language_code="vi")

        session = plugin.session_for(ctx)
        assert session.locale == "vi"
        assert session.t("hello", {"name": "Nam"}) == "Xin chào, Nam!"

    def test_unknown_language_code_falls_back_to_default(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        plugin = make_plugin()
        ctx = make_context(bot_transport, ok_response, make_update, language_code="fr")

        assert plugin.session_for(ctx).locale == "en"

    def test_missing_language_code_falls_back_to_default(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        plugin = make_plugin()
        ctx = make_context(bot_transport, ok_response, make_update)

        assert plugin.session_for(ctx).locale == "en"

    def test_stored_preference_overrides_language_code(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        plugin = make_plugin()
        ctx = make_context(bot_transport, ok_response, make_update, language_code="en")
        assert ctx.user_data is not None
        ctx.user_data["_telebot_locale"] = "vi"

        assert plugin.session_for(ctx).locale == "vi"

    def test_stored_preference_without_table_falls_back(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        plugin = make_plugin()
        ctx = make_context(bot_transport, ok_response, make_update)
        assert ctx.user_data is not None
        ctx.user_data["_telebot_locale"] = "de"  # no translation table

        assert plugin.session_for(ctx).locale == "en"


class TestTranslation:
    def test_missing_key_falls_back_to_default_locale(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        plugin = make_plugin()
        ctx = make_context(bot_transport, ok_response, make_update, language_code="vi")
        session = plugin.session_for(ctx)

        assert session.t("only_en") == "English only"

    def test_missing_key_everywhere_returns_key_itself(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        plugin = make_plugin()
        ctx = make_context(bot_transport, ok_response, make_update, language_code="vi")

        assert plugin.session_for(ctx).t("no.such.key") == "no.such.key"

    def test_placeholder_interpolation(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        plugin = make_plugin()
        ctx = make_context(bot_transport, ok_response, make_update)

        assert plugin.session_for(ctx).t("hello", {"name": "Nam"}) == "Hello, Nam!"

    def test_interpolation_replaces_every_occurrence(self) -> None:
        plugin = I18nPlugin(
            default_locale="en",
            locales={"en": {"twice": "{x} and {x}"}},
        )
        assert plugin.translate("en", "twice", {"x": "1"}) == "1 and 1"


class TestPerUserSwitch:
    def test_set_locale_persists_preference_for_future_updates(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        plugin = make_plugin()
        ctx = make_context(bot_transport, ok_response, make_update)
        session = plugin.session_for(ctx)
        assert session.locale == "en"

        session.set_locale("vi")
        assert ctx.user_data is not None
        assert ctx.user_data["_telebot_locale"] == "vi"

        # A fresh session for the same user now resolves the stored locale.
        assert plugin.session_for(ctx).locale == "vi"

    def test_custom_locale_key_is_honored(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        plugin = make_plugin(locale_key="my_locale")
        ctx = make_context(bot_transport, ok_response, make_update)
        plugin.session_for(ctx).set_locale("vi")

        assert ctx.user_data == {"my_locale": "vi"}
        assert plugin.session_for(ctx).locale == "vi"

    def test_separate_users_keep_separate_preferences(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        plugin = make_plugin()
        alice = make_context(bot_transport, ok_response, make_update, user_id=1)
        bob = make_context(bot_transport, ok_response, make_update, user_id=2)

        plugin.session_for(alice).set_locale("vi")

        assert plugin.session_for(alice).locale == "vi"
        assert plugin.session_for(bob).locale == "en"


class TestPluginIntegration:
    def test_is_a_named_plugin(self) -> None:
        plugin = make_plugin()
        assert plugin.name == "telebot-plugin-i18n"
        assert plugin.depends_on == ()

    async def test_installs_into_plugin_manager_and_passes_responses_through(
        self, bot_transport: Any, ok_response: Any, make_update: Any
    ) -> None:
        manager = PluginManager()
        plugin = make_plugin()
        manager.add_plugin(plugin)
        ctx = make_context(bot_transport, ok_response, make_update)

        assert await manager.dispatch_response(ctx, "payload") == "payload"

    def test_missing_default_locale_table_falls_back_to_key(self) -> None:
        plugin = I18nPlugin(default_locale="de", locales=LOCALES)
        # Neither the user locale nor the default locale has this key.
        assert plugin.translate("vi", "only_en") == "only_en"


class TestEdgeCases:
    def test_update_without_user_resolves_default_locale(
        self, bot_transport: Any, ok_response: Any
    ) -> None:
        plugin = make_plugin()
        app = (
            ApplicationBuilder()
            .token("123456:TEST")
            .transport(bot_transport(ok_response(ME_PAYLOAD)))
            .build()
        )
        # A callback-query-less, user-less update (e.g. a channel post).
        payload = {
            "update_id": 1,
            "message": {
                "message_id": 1,
                "date": 1_700_000_000,
                "chat": {"id": -100, "type": "channel", "title": "Chan"},
                "text": "post",
            },
        }
        ctx = CallbackContext(app, Update.from_dict(payload))

        session = plugin.session_for(ctx)
        assert session.locale == "en"
        session.set_locale("vi")  # no user data available: harmless no-op
        assert session.t("hello", {"name": "x"}) == "Hello, x!"  # still default table
