"""Built-in internationalization plugin (T045).

Parity with ``packages/node/src/plugins/i18n.ts``: per-update locale
resolution (stored preference in ``context.user_data``, then the sender's
Telegram ``language_code``, then the default locale), missing-key fallback
to the default locale table and finally the key itself, and
``{placeholder}`` interpolation. The per-user preference lives in
``user_data`` and therefore rides on persistence automatically.
"""

from __future__ import annotations

import typing as t
from collections.abc import Mapping, Sequence

from telebot_py.plugins.plugin import Plugin

if t.TYPE_CHECKING:
    from telebot_py.kernel.context import CallbackContext

DEFAULT_LOCALE_KEY = "_telebot_locale"


class I18nSession:
    """Per-update translation session for one resolved locale.

    Created by :meth:`I18nPlugin.session_for`; not constructed directly.

    Attributes:
        locale: The locale code resolved for the current update.
    """

    def __init__(self, plugin: I18nPlugin, context: CallbackContext, locale: str) -> None:
        """Bind the session to its plugin, context, and resolved locale.

        Args:
            plugin: The owning i18n plugin (supplies the locale tables).
            context: The update context; ``user_data`` stores the preference.
            locale: The resolved locale code.
        """
        self.locale = locale
        self._plugin = plugin
        self._context = context

    def t(self, key: str, params: Mapping[str, str | int] | None = None) -> str:
        """Translate a message key for this session's locale.

        Falls back to the default locale's table, then to the key itself.
        ``{placeholder}`` tokens are replaced from ``params``.

        Args:
            key: Message key in the translation tables.
            params: Optional placeholder values.

        Returns:
            The translated, interpolated string.

        Example:
            >>> session.t("hello", {"name": "Nam"})
            'Xin chào, Nam!'
        """
        return self._plugin.translate(self.locale, key, params)

    def set_locale(self, locale: str) -> None:
        """Persist the user's locale preference for all future updates.

        Writes into ``context.user_data``; when the update carries no user
        data this is a harmless no-op (node parity).

        Args:
            locale: Locale code to use from now on.
        """
        data = self._context.user_data
        if data is not None:
            data[self._plugin.locale_key] = locale


class I18nPlugin(Plugin):
    """Internationalization plugin: locale tables plus per-user preference.

    The kernel integration pass can attach a session per update via
    :meth:`session_for`; bot handlers translate through the session's
    :meth:`I18nSession.t`.

    Example:
        >>> plugin = I18nPlugin(
        ...     default_locale="en",
        ...     locales={"en": {"hello": "Hello, {name}!"}},
        ... )
        >>> session = plugin.session_for(context)
        >>> await context.bot.send_message(chat_id, session.t("hello", {"name": "Nam"}))

    Attributes:
        default_locale: Locale used when the user's preferred locale has no
            translation table.
        locales: Translation tables keyed by locale code, then message key.
        locale_key: Key inside ``context.user_data`` storing the preference.
    """

    depends_on: Sequence[str] = ()

    def __init__(
        self,
        *,
        default_locale: str,
        locales: Mapping[str, Mapping[str, str]],
        locale_key: str = DEFAULT_LOCALE_KEY,
        name: str = "telebot-plugin-i18n",
    ) -> None:
        """Configure the translation tables.

        Args:
            default_locale: Fallback locale for missing tables/keys.
            locales: Translation tables keyed by locale code.
            locale_key: ``user_data`` key storing the chosen locale.
            name: Plugin identifier.
        """
        self.name = name
        self.default_locale = default_locale
        self.locales: Mapping[str, Mapping[str, str]] = locales
        self.locale_key = locale_key

    def session_for(self, context: CallbackContext) -> I18nSession:
        """Resolve the locale for an update and open a translation session.

        Resolution order (node parity): stored preference in ``user_data``,
        then the sender's ``language_code``, then ``default_locale``; a
        preferred locale without a translation table falls back to the
        default.

        Args:
            context: The callback context of the current update.

        Returns:
            A session bound to the resolved locale.
        """
        stored: object = None
        if context.user_data is not None:
            stored = context.user_data.get(self.locale_key)
        preferred: str | None
        if isinstance(stored, str) and stored:
            preferred = stored
        else:
            user = context.update.effective_user
            preferred = user.language_code if user is not None and user.language_code else None
        locale = preferred if preferred is not None and preferred in self.locales else None
        return I18nSession(self, context, locale if locale is not None else self.default_locale)

    def translate(
        self,
        locale: str,
        key: str,
        params: Mapping[str, str | int] | None = None,
    ) -> str:
        """Translate a key for an explicit locale.

        Args:
            locale: Locale code to look up first.
            key: Message key in the translation tables.
            params: Optional placeholder values.

        Returns:
            The translated string; falls back to the default locale's table,
            then to the key itself, with placeholders interpolated.
        """
        text = self.locales.get(locale, {}).get(key)
        if text is None:
            text = self.locales.get(self.default_locale, {}).get(key)
        if text is None:
            text = key
        if params:
            for param, value in params.items():
                text = text.replace(f"{{{param}}}", str(value))
        return text
