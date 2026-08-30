"""Base handler contract for routing updates to callbacks."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from inspect import isawaitable
from typing import Any

from telebot_py.types import Update

#: Handler callback signature. The second argument is the kernel's
#: ``CallbackContext`` once built by dispatch; it is duck-typed here (a plain
#: object accepting attribute assignment) so handlers do not depend on the
#: kernel module existing yet.
HandlerCallback = Callable[[Update, Any], Awaitable[Any] | Any]


class BaseHandler:
    """Base class for all update handlers.

    Mirrors python-telegram-bot's ``BaseHandler`` with a snake_case contract:
    :meth:`check_update` decides whether an update matches (returning a truthy
    check result), :meth:`collect_additional_context` enriches the callback
    context with data derived from that result, and :meth:`handle_update`
    runs the callback. Group ordering and blocking across handlers are the
    dispatcher's concern.

    Attributes:
        callback: The callable invoked when this handler matches. May be a
            coroutine function or a plain function.
        block: Whether the dispatcher should await the callback before
            processing subsequent handlers.
    """

    def __init__(self, callback: HandlerCallback, block: bool = True) -> None:
        """Initialize the handler.

        Args:
            callback: Callable executed when this handler matches an update.
            block: Whether dispatch awaits the callback before moving on.
        """
        self.callback = callback
        self.block = block

    def check_update(self, update: object) -> Any:
        """Determine whether ``update`` should be handled by this handler.

        Callers must test the result with
        ``check_result is not None and check_result is not False`` rather than
        truthiness: a matched command without arguments yields an empty list,
        which is falsy but still a match (parity with python-telegram-bot).

        Args:
            update: The incoming update (typed ``object`` so handlers can
                reject any non-update value, parity with python-telegram-bot).

        Returns:
            A check result on a match (``True``, an args list, or a
            data-filter dict), ``None``/``False`` otherwise.
        """
        raise NotImplementedError

    def collect_additional_context(self, context: Any, update: Update, check_result: Any) -> None:
        """Enrich ``context`` with data derived from ``check_result``.

        The base implementation merges dict-valued check results (produced by
        data filters) onto the context as attributes.

        Args:
            context: The callback context being populated.
            update: The update being processed.
            check_result: The value :meth:`check_update` returned.
        """
        if isinstance(check_result, dict):
            for key, value in check_result.items():
                setattr(context, key, value)

    async def handle_update(self, update: Update, context: Any, check_result: Any = None) -> Any:
        """Collect context data and invoke :attr:`callback`.

        Args:
            update: The update being processed.
            context: The callback context for this dispatch.
            check_result: The value :meth:`check_update` returned.

        Returns:
            Whatever the callback returns.
        """
        self.collect_additional_context(context, update, check_result)
        result = self.callback(update, context)
        if isawaitable(result):
            return await result
        return result
