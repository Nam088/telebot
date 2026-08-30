"""Scheduler: JobQueue with in-house RRule (US3, FR-008).

Wired into the kernel by T043: ``ApplicationBuilder.job_queue()`` attaches a
queue to ``Application``; ``initialize()`` starts it once the bot is ready,
``stop()``/``shutdown()`` stop it, and every dispatched context exposes it
as ``context.job_queue``.
"""

from telebot_py.scheduler.job import Job, JobCallback
from telebot_py.scheduler.queue import Clock, JobQueue, SleepFn
from telebot_py.scheduler.rrule import Frequency, RRule, RRuleOptions

__all__ = [
    "Clock",
    "Frequency",
    "Job",
    "JobCallback",
    "JobQueue",
    "RRule",
    "RRuleOptions",
    "SleepFn",
]
