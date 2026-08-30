"""Application lifecycle state machine (data-model.md section 2).

The kernel moves through ``STOPPED -> INITIALIZING -> RUNNING -> STOPPING ->
STOPPED``; transitions are enforced by :class:`~telebot_py.kernel.app.Application`
raising :class:`~telebot_py.bot.errors.ApplicationError` on misuse.
"""

from __future__ import annotations

import enum


class ApplicationState(enum.Enum):
    """Lifecycle state of an :class:`~telebot_py.kernel.app.Application`.

    Attributes:
        STOPPED: Built but not initialized, or fully stopped after ``stop()``.
        INITIALIZING: ``initialize()`` succeeded; ``start()`` has not run yet.
        RUNNING: The application is processing updates.
        STOPPING: ``stop()`` is draining in-flight updates.
    """

    STOPPED = "stopped"
    INITIALIZING = "initializing"
    RUNNING = "running"
    STOPPING = "stopping"
