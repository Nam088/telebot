"""Plugin contract for telebot_py (T044, contracts/public-api.md section 8).

A plugin hooks into the update pipeline through optional async response and
error hooks. The kernel wiring (T043) calls
:meth:`PluginManager.dispatch_response` around every successful handler
result and :meth:`PluginManager.dispatch_error` after the error handlers
ran; nothing here imports the kernel at runtime.
"""

from __future__ import annotations

import typing as t
from abc import ABC
from collections.abc import Sequence

if t.TYPE_CHECKING:
    from telebot_py.kernel.context import CallbackContext


class Plugin(ABC):
    """A named, self-contained bundle of bot behavior.

    Subclasses set :attr:`name` (and optionally :attr:`depends_on`) and
    override whichever hooks they need; un-overridden hooks are inert.

    Example:
        >>> class LoggingPlugin(Plugin):
        ...     name = "logging"
        ...     async def on_response(self, context, response):
        ...         print("handled", context.update.update_id)
        ...         return response

    Attributes:
        name: Unique identifier of the plugin. Registering two plugins with
            the same name raises ValueError.
        depends_on: Names of plugins that must hook before this one; a cycle
            raises PluginOrderingError at registration.
    """

    name: str
    depends_on: Sequence[str] = ()

    async def on_response(self, context: CallbackContext, response: object) -> object:
        """Process a handler pipeline result before it is finalized.

        Called in declared hook order; the returned value is handed to the
        next plugin's hook. The default implementation passes the response
        through unchanged.

        Args:
            context: The callback context of the update being processed.
            response: The current pipeline result.

        Returns:
            The (possibly transformed) response.
        """
        return response

    async def on_error(self, context: CallbackContext, error: Exception) -> None:
        """Observe a handler failure after the error handlers ran.

        Called in declared hook order. The default implementation does
        nothing.

        Args:
            context: The callback context of the failed update; the raised
                exception is also available as ``context.error``.
            error: The exception the handler raised.
        """
        return
