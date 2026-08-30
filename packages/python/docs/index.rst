telebot-py
==========

Async-first Telegram Bot framework for Python, mirroring
`python-telegram-bot <https://python-telegram-bot.org>`__'s public API in
native snake_case.

These pages are generated with Sphinx autodoc straight from the source
docstrings and cover the full public API surface.

telebot_py (top-level)
----------------------

.. automodule:: telebot_py
   :no-members:

The top-level namespace re-exports the most common entry points; each is
documented on its own page:

* :class:`~telebot_py.kernel.app.Application` and
  :class:`~telebot_py.kernel.builder.ApplicationBuilder` — :doc:`kernel`
* :class:`~telebot_py.routing.context.CallbackContext` and the handlers
  (:class:`~telebot_py.routing.handlers.command.CommandHandler`,
  :class:`~telebot_py.routing.handlers.message.MessageHandler`,
  :class:`~telebot_py.routing.handlers.callback_query.CallbackQueryHandler`,
  :class:`~telebot_py.routing.handlers.conversation.ConversationHandler`,
  :class:`~telebot_py.routing.handlers.linear_conversation.LinearConversationHandler`,
  :class:`~telebot_py.routing.handlers.async_conversation.AsyncConversationHandler`,
  :class:`~telebot_py.routing.handlers.base.BaseHandler`) — :doc:`routing`
* :mod:`~telebot_py.filters` — :doc:`filters`
* Error types (:class:`~telebot_py.bot.errors.TelebotError`,
  :class:`~telebot_py.bot.errors.NetworkError`,
  :class:`~telebot_py.bot.errors.TelegramApiError`,
  :class:`~telebot_py.bot.errors.InvalidTokenError`,
  :class:`~telebot_py.bot.errors.ApplicationError`) and
  :class:`~telebot_py.kernel.app.ApplicationState` — :doc:`bot` / :doc:`kernel`

.. toctree::
   :maxdepth: 2
   :caption: Modules

   kernel
   bot
   routing
   filters
   scheduler
   storage
   plugins
   components
   types

Indices
-------

* :ref:`genindex`
* :ref:`search`
