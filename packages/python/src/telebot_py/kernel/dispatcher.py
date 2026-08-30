"""Update dispatcher: group-ordered routing and error handler fan-out (T020)."""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Awaitable, Callable
from inspect import isawaitable
from typing import TYPE_CHECKING, Any

from telebot_py.kernel.context import CallbackContext
from telebot_py.routing.handlers import BaseHandler
from telebot_py.types import Update

if TYPE_CHECKING:
    from telebot_py.kernel.app import Application

logger = logging.getLogger("telebot_py.dispatcher")

#: Error handler signature (python-telegram-bot parity): the update being
#: processed (``None`` for errors not tied to one) and a context whose
#: ``error`` attribute carries the raised exception.
ErrorHandler = Callable[[Update | None, CallbackContext], Awaitable[None] | None]


class Dispatcher:
    """Routes updates to handler groups and failures to error handlers.

    Groups are processed in ascending key order; within a group the first
    handler whose ``check_update`` returns something other than ``None`` or
    ``False`` wins and the remaining handlers of that group are skipped. A
    winning handler with ``block=True`` (the default) consumes the update:
    higher groups never see it. With ``block=False`` the callback is fired as
    a background task and higher groups still get their chance.

    Exceptions raised by ``check_update`` or a handler callback never escape
    :meth:`process_update`; they are logged and routed to every registered
    error handler, and subsequent groups keep running (FR-013). Plugin hooks
    wrap the same stage: response hooks run around every successful handler
    result, error hooks observe failures after the error handlers ran.

    Example:
        >>> dispatcher.add_handler(handler, group=0)
        >>> await dispatcher.process_update(update)

    Attributes:
        application: The application owning this dispatcher.
        bot: Shortcut to the application's Bot client.
    """

    def __init__(self, application: Application) -> None:
        """Initialize an empty dispatcher bound to ``application``.

        Args:
            application: The application whose bot and data stores back
                dispatched contexts.
        """
        self.application = application
        self.bot = application.bot
        self._handlers: dict[int, list[BaseHandler]] = {}
        self._error_handlers: list[ErrorHandler] = []
        self._background_tasks: set[asyncio.Task[None]] = set()

    @property
    def handlers(self) -> dict[int, list[BaseHandler]]:
        """Handler groups keyed by group number, registration order within."""
        return self._handlers

    @property
    def error_handlers(self) -> list[ErrorHandler]:
        """Registered error handler callbacks, in registration order."""
        return self._error_handlers

    @property
    def groups(self) -> list[int]:
        """Group numbers in ascending dispatch order."""
        return sorted(self._handlers)

    @property
    def background_tasks(self) -> set[asyncio.Task[None]]:
        """Snapshot of in-flight background tasks from non-blocking handlers."""
        return set(self._background_tasks)

    def add_handler(self, handler: BaseHandler, group: int = 0) -> None:
        """Register a handler into a group (lower groups run first).

        Args:
            handler: The handler to register.
            group: Group number; defaults to 0.

        Example:
            >>> dispatcher.add_handler(CommandHandler("start", callback), group=0)
        """
        self._handlers.setdefault(group, []).append(handler)

    def remove_handler(self, handler: BaseHandler, group: int = 0) -> None:
        """Unregister a handler from a group.

        Args:
            handler: The handler to remove.
            group: Group the handler was registered in.

        Raises:
            ValueError: If the handler is not registered in that group.
        """
        handlers = self._handlers.get(group, [])
        if handler not in handlers:
            msg = f"handler {handler!r} is not registered in group {group}"
            raise ValueError(msg)
        handlers.remove(handler)

    def add_error_handler(self, callback: ErrorHandler) -> None:
        """Register a callback invoked with ``(update, context)`` on handler errors.

        Args:
            callback: Sync or async callable; ``context.error`` carries the
                raised exception.

        Example:
            >>> async def on_error(update, context):
            ...     logging.error("update failed", exc_info=context.error)
            >>> dispatcher.add_error_handler(on_error)
        """
        self._error_handlers.append(callback)

    def remove_error_handler(self, callback: ErrorHandler) -> None:
        """Unregister an error handler; no-op when not registered.

        Args:
            callback: The previously registered callback.
        """
        self._error_handlers = [
            handler for handler in self._error_handlers if handler is not callback
        ]

    async def process_update(self, update: Update) -> None:
        """Dispatch one update through all handler groups; never raises.

        Args:
            update: The incoming update.

        Returns:
            None. Handler exceptions are routed to the error handlers instead
            of propagating (FR-013).
        """
        for group in self.groups:
            for handler in list(self._handlers.get(group, [])):
                try:
                    check = handler.check_update(update)
                except Exception as exc:
                    logger.exception("check_update failed for handler %r", handler)
                    context = CallbackContext.from_update(update, self.application)
                    await self._dispatch_error(update, context, exc)
                    break
                if check is None or check is False:
                    continue

                context = CallbackContext.from_update(update, self.application)
                if handler.block:
                    try:
                        result = await handler.handle_update(update, context, check)
                    except Exception as exc:
                        await self._dispatch_error(update, context, exc)
                    else:
                        await self._dispatch_response(update, context, result)
                        # A blocking handler consumed the update: higher
                        # groups are skipped (python-telegram-bot semantics).
                        return
                else:
                    self._spawn_non_blocking(handler, update, context, check)
                break  # only the first matching handler per group runs

    def _spawn_non_blocking(
        self, handler: BaseHandler, update: Update, context: CallbackContext, check: Any
    ) -> None:
        task = asyncio.create_task(self._run_non_blocking(handler, update, context, check))
        self._background_tasks.add(task)
        task.add_done_callback(self._background_tasks.discard)

    async def _run_non_blocking(
        self, handler: BaseHandler, update: Update, context: CallbackContext, check: Any
    ) -> None:
        try:
            result = await handler.handle_update(update, context, check)
        except Exception as exc:
            await self._dispatch_error(update, context, exc)
        else:
            await self._dispatch_response(update, context, result)

    async def _dispatch_response(
        self, update: Update, context: CallbackContext, result: Any
    ) -> None:
        """Run plugin response hooks around a successful handler result.

        A raising hook is routed through the error-handler flow like any
        handler failure; hooks never break dispatch (FR-013).

        Args:
            update: The update whose handler succeeded.
            context: The callback context of that dispatch.
            result: The value the handler returned.
        """
        try:
            await self.application.plugin_manager.dispatch_response(context, result)
        except Exception as exc:
            logger.exception("Plugin response hook failed for update %s", update.update_id)
            await self._dispatch_error(update, context, exc)

    async def _dispatch_error(
        self, update: Update | None, context: CallbackContext, error: Exception
    ) -> None:
        context.error = error
        update_id = update.update_id if isinstance(update, Update) else None
        logger.error("Error while processing update %s: %s", update_id, error, exc_info=error)
        if not self._error_handlers:
            logger.error("No error handlers are registered for this application.")
        for error_handler in list(self._error_handlers):
            try:
                result = error_handler(update, context)
                if isawaitable(result):
                    await result
            except Exception:
                logger.exception("Error handler %r raised while handling %r", error_handler, error)
        try:
            await self.application.plugin_manager.dispatch_error(context, error)
        except Exception:  # noqa: BLE001 - plugin hooks must not mask the original error
            logger.exception("Plugin error hook failed while handling %r", error)
