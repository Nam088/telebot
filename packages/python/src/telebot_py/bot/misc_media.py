"""Album, location, venue, contact, and dice Bot API methods.

Split out of ``media.py`` for file-length reasons; parity with
packages/go/pkg/bot/media.go.
"""

from __future__ import annotations

from collections.abc import Sequence

from telebot_py.bot.base import (
    MarkupLike,
    Requester,
    clean_payload,
    parse_list_result,
    parse_result,
    to_wire,
)
from telebot_py.types.input_media import InputMediaLike
from telebot_py.types.message import Message
from telebot_py.types.message_extras import EphemeralMessageParameters, ReplyParameters
from telebot_py.types.suggested_post_types import SuggestedPostParameters


class MiscMediaMixin(Requester):
    """Bot methods for sending media albums, locations, venues, contacts, and dice.

    Media parameters accept ``file_id`` strings or HTTP URLs; multipart file
    uploads are intentionally out of scope (JSON payloads only).
    """

    async def send_media_group(
        self,
        chat_id: int | str,
        media: Sequence[InputMediaLike],
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        direct_messages_topic_id: int | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
    ) -> list[Message]:
        """Send a group of photos, videos, documents or audios as one message.

        Example:
            >>> from telebot_py.types import InputMediaPhoto, InputMediaVideo
            >>> msgs = await bot.send_media_group(
            ...     123456,
            ...     [
            ...         InputMediaPhoto(media="photo_file_id"),
            ...         InputMediaVideo(media="video_file_id"),
            ...     ],
            ... )

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            media: InputMedia items, e.g. ``InputMediaPhoto(media="photo_file_id")``
                or the equivalent mapping ``{"type": "photo", "media":
                "photo_file_id"}``; 2-10 items.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to, as a
                ``ReplyParameters`` object or a mapping.

        Returns:
            The sent Messages (one per album item).

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendmediagroup
        """
        payload = clean_payload(
            chat_id=chat_id,
            media=[to_wire(item) for item in media],
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            direct_messages_topic_id=direct_messages_topic_id,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
        )
        return parse_list_result(Message, await self.request("sendMediaGroup", payload))

    async def send_location(
        self,
        chat_id: int | str,
        latitude: float,
        longitude: float,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        direct_messages_topic_id: int | None = None,
        ephemeral_message_parameters: EphemeralMessageParameters | MarkupLike | None = None,
        horizontal_accuracy: float | None = None,
        live_period: int | None = None,
        heading: int | None = None,
        proximity_alert_radius: int | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a point on the map.

        Example:
            >>> msg = await bot.send_location(123456, 40.7, -74.0, live_period=60)

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            latitude: Latitude of the location.
            longitude: Longitude of the location.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            ephemeral_message_parameters: EphemeralMessageParameters as a
                ``to_dict`` object or dict.
            horizontal_accuracy: Radius of uncertainty for the location, in
                meters; 0-1500.
            live_period: Period in seconds during which the location will be
                updated; 60-86400.
            heading: Direction in which the user is moving, in degrees; 1-360.
            proximity_alert_radius: Maximum distance for proximity alerts
                about approaching another chat member, in meters.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.
            reply_parameters: Description of the message to reply to, as a
                ``ReplyParameters`` object or a mapping.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendlocation
        """
        payload = clean_payload(
            chat_id=chat_id,
            latitude=latitude,
            longitude=longitude,
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            direct_messages_topic_id=direct_messages_topic_id,
            ephemeral_message_parameters=to_wire(ephemeral_message_parameters),
            horizontal_accuracy=horizontal_accuracy,
            live_period=live_period,
            heading=heading,
            proximity_alert_radius=proximity_alert_radius,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendLocation", payload))

    async def send_venue(
        self,
        chat_id: int | str,
        latitude: float,
        longitude: float,
        title: str,
        address: str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        direct_messages_topic_id: int | None = None,
        ephemeral_message_parameters: EphemeralMessageParameters | MarkupLike | None = None,
        foursquare_id: str | None = None,
        foursquare_type: str | None = None,
        google_place_id: str | None = None,
        google_place_type: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send information about a venue.

        Example:
            >>> msg = await bot.send_venue(123456, 40.7, -74.0, "Cafe", "1 Main St")

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            latitude: Latitude of the venue.
            longitude: Longitude of the venue.
            title: Name of the venue.
            address: Address of the venue.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            ephemeral_message_parameters: EphemeralMessageParameters as a
                ``to_dict`` object or dict.
            foursquare_id: Foursquare identifier of the venue.
            foursquare_type: Foursquare type of the venue.
            google_place_id: Google Places identifier of the venue.
            google_place_type: Google Places type of the venue.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.
            reply_parameters: Description of the message to reply to, as a
                ``ReplyParameters`` object or a mapping.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendvenue
        """
        payload = clean_payload(
            chat_id=chat_id,
            latitude=latitude,
            longitude=longitude,
            title=title,
            address=address,
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            direct_messages_topic_id=direct_messages_topic_id,
            ephemeral_message_parameters=to_wire(ephemeral_message_parameters),
            foursquare_id=foursquare_id,
            foursquare_type=foursquare_type,
            google_place_id=google_place_id,
            google_place_type=google_place_type,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendVenue", payload))

    async def send_contact(
        self,
        chat_id: int | str,
        phone_number: str,
        first_name: str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        direct_messages_topic_id: int | None = None,
        ephemeral_message_parameters: EphemeralMessageParameters | MarkupLike | None = None,
        last_name: str | None = None,
        vcard: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a phone contact.

        Example:
            >>> msg = await bot.send_contact(123456, "+123", "Alice", last_name="Smith")

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            phone_number: Contact's phone number.
            first_name: Contact's first name.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            ephemeral_message_parameters: EphemeralMessageParameters as a
                ``to_dict`` object or dict.
            last_name: Contact's last name.
            vcard: Additional data about the contact in the vCard format.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.
            reply_parameters: Description of the message to reply to, as a
                ``ReplyParameters`` object or a mapping.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendcontact
        """
        payload = clean_payload(
            chat_id=chat_id,
            phone_number=phone_number,
            first_name=first_name,
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            direct_messages_topic_id=direct_messages_topic_id,
            ephemeral_message_parameters=to_wire(ephemeral_message_parameters),
            last_name=last_name,
            vcard=vcard,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendContact", payload))

    async def send_dice(
        self,
        chat_id: int | str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        direct_messages_topic_id: int | None = None,
        emoji: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        allow_paid_broadcast: bool | None = None,
        message_effect_id: str | None = None,
        suggested_post_parameters: SuggestedPostParameters | MarkupLike | None = None,
        reply_parameters: ReplyParameters | MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send an animated emoji message with a random value (dice).

        Example:
            >>> msg = await bot.send_dice(123456, emoji="🎲")

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            direct_messages_topic_id: Identifier of the direct messages topic to
                which the message will be sent; required if the message is sent
                to a direct messages chat.
            emoji: Emoji on which the dice throw animation is based.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            allow_paid_broadcast: Pass True to ignore broadcasting limits for a
                fee of 0.1 Telegram Stars per message.
            message_effect_id: Unique identifier of the message effect to add.
            suggested_post_parameters: SuggestedPostParameters as a ``to_dict``
                object or dict; for direct messages chats only.
            reply_parameters: Description of the message to reply to, as a
                ``ReplyParameters`` object or a mapping.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#senddice
        """
        payload = clean_payload(
            chat_id=chat_id,
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            direct_messages_topic_id=direct_messages_topic_id,
            emoji=emoji,
            disable_notification=disable_notification,
            protect_content=protect_content,
            allow_paid_broadcast=allow_paid_broadcast,
            message_effect_id=message_effect_id,
            suggested_post_parameters=to_wire(suggested_post_parameters),
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendDice", payload))
