"""Rich message Bot API methods.

Ported from node ``client/methods/business/ephemeral.ts`` (sendRichMessage,
sendRichMessageDraft); the parameter set follows the official Bot API 10.3
documentation, which is the source of truth for these two methods.
"""

from __future__ import annotations

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_flag,
    parse_result,
    to_wire,
)
from telebot_py.types.message import Message
from telebot_py.types.message_extras import ReplyParameters
from telebot_py.types.rich_blocks_input import InputRichMessage


class RichMessagesMixin(Requester):
    """Bot methods for sending rich messages and streaming rich drafts."""

    async def send_rich_message(
        self,
        chat_id: int | str,
        rich_message: InputRichMessage | MarkupLike,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        direct_messages_topic_id: int | None = None,
        ephemeral_message_parameters: MarkupLike | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: MarkupLike | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a rich message.

        Remarks:
            ``rich_message`` is an InputRichMessage — either an
            :class:`~telebot_py.types.InputRichMessage` instance or a plain dict
            using Telegram's field names (``blocks``, ``html``, ``markdown``,
            ``media``, ``is_rtl``, ``skip_entity_detection``), where exactly one
            of ``blocks``, ``html`` and ``markdown`` describes the content.
            ``ephemeral_message_parameters`` and ``suggested_post_parameters``
            are passed through as mappings because those objects have no typed
            dataclass yet.

        Example:
            >>> from telebot_py.types import InputRichBlockParagraph, InputRichMessage
            >>> message = await bot.send_rich_message(
            ...     123,
            ...     InputRichMessage(blocks=[InputRichBlockParagraph(text="Hello")]),
            ... )

        Args:
            chat_id: Unique identifier for the target chat or username of the
                target bot, supergroup or channel in the format ``@username``.
            rich_message: The message to be sent.
            business_connection_id: Unique identifier of the business connection
                on behalf of which the message will be sent.
            message_thread_id: Unique identifier of the target message thread
                (topic) of a forum.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            ephemeral_message_parameters: EphemeralMessageParameters as a
                ``to_dict`` object or dict.
            disable_notification: Sends the message silently.
            protect_content: Protects the contents from forwarding and saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add;
                for private chats only.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.
            reply_parameters: ReplyParameters object describing the message to
                reply to.
            reply_markup: Inline keyboard, reply keyboard, remove-keyboard or
                force-reply markup; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendrichmessage
        """
        payload = clean_payload(
            business_connection_id=business_connection_id,
            chat_id=chat_id,
            message_thread_id=message_thread_id,
            direct_messages_topic_id=direct_messages_topic_id,
            ephemeral_message_parameters=to_wire(ephemeral_message_parameters),
            rich_message=to_wire(rich_message),
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendRichMessage", payload))

    async def send_rich_message_draft(
        self,
        chat_id: int,
        draft_id: int,
        rich_message: InputRichMessage | MarkupLike,
        *,
        message_thread_id: int | None = None,
        can_stop: bool | None = None,
        keep_on_stop: bool | None = None,
    ) -> bool:
        """Stream a partial rich message while the final message is generated.

        Remarks:
            The streamed draft is ephemeral and acts as a temporary 30-second
            preview: once the output is finalized the bot must call
            :meth:`send_rich_message` with the complete message to persist it.
            Direct upload of new files and explicit upload by URL aren't
            supported in the draft content.

        Example:
            >>> from telebot_py.types import InputRichBlockDivider, InputRichMessage
            >>> ok = await bot.send_rich_message_draft(
            ...     123, 1, InputRichMessage(blocks=[InputRichBlockDivider()])
            ... )

        Args:
            chat_id: Unique identifier for the target private chat.
            draft_id: Unique identifier of the message draft; must be non-zero.
                Drafts sharing an identifier are animated.
            rich_message: The partial message to be streamed.
            message_thread_id: Unique identifier of the target message thread.
            can_stop: Whether to show the user a button stopping further drafts.
            keep_on_stop: Whether to keep the draft in the chat when the stop
                button is pressed.

        Returns:
            True on success.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendrichmessagedraft
        """
        payload = clean_payload(
            chat_id=chat_id,
            message_thread_id=message_thread_id,
            draft_id=draft_id,
            rich_message=to_wire(rich_message),
            can_stop=can_stop,
            keep_on_stop=keep_on_stop,
        )
        return parse_flag(await self.request("sendRichMessageDraft", payload))
