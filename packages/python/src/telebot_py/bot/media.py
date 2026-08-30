"""Media-sending Bot API methods (parity with packages/go/pkg/bot/media.go)."""

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
from telebot_py.types.common import MessageEntity
from telebot_py.types.message import Message


class MediaMixin(Requester):
    """Bot methods for sending audio, video, venues, polls, dice, and albums.

    Media parameters accept ``file_id`` strings or HTTP URLs; multipart file
    uploads are intentionally out of scope (JSON payloads only).
    """

    async def send_audio(
        self,
        chat_id: int | str,
        audio: str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MessageEntity] | None = None,
        duration: int | None = None,
        performer: str | None = None,
        title: str | None = None,
        thumbnail: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send an audio file by ``file_id`` or HTTP URL.

        Example:
            >>> msg = await bot.send_audio(123456, "audio_file_id", caption="song")

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            audio: Audio file to send as a ``file_id`` string or HTTP URL.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            caption: Audio caption, 0-1024 characters.
            parse_mode: Parse mode for the caption.
            caption_entities: Special entities for the caption.
            duration: Duration of the audio in seconds.
            performer: Performer of the audio.
            title: Track name.
            thumbnail: Thumbnail file_id or URL of the file sent.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendaudio
        """
        payload = clean_payload(
            chat_id=chat_id,
            audio=audio,
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[entity.to_dict() for entity in caption_entities]
            if caption_entities is not None
            else None,
            duration=duration,
            performer=performer,
            title=title,
            thumbnail=thumbnail,
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendAudio", payload))

    async def send_video(
        self,
        chat_id: int | str,
        video: str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        duration: int | None = None,
        width: int | None = None,
        height: int | None = None,
        thumbnail: str | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MessageEntity] | None = None,
        show_caption_above_media: bool | None = None,
        has_spoiler: bool | None = None,
        supports_streaming: bool | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a video file by ``file_id`` or HTTP URL.

        Example:
            >>> msg = await bot.send_video(123456, "video_file_id", width=1920, height=1080)

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            video: Video to send as a ``file_id`` string or HTTP URL.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            duration: Duration of the video in seconds.
            width: Video width.
            height: Video height.
            thumbnail: Thumbnail file_id or URL of the file sent.
            caption: Video caption, 0-1024 characters.
            parse_mode: Parse mode for the caption.
            caption_entities: Special entities for the caption.
            show_caption_above_media: Show the caption above the media.
            has_spoiler: Mark the video as covered with a spoiler.
            supports_streaming: Pass True if the video is suitable for
                streaming.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendvideo
        """
        payload = clean_payload(
            chat_id=chat_id,
            video=video,
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            duration=duration,
            width=width,
            height=height,
            thumbnail=thumbnail,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[entity.to_dict() for entity in caption_entities]
            if caption_entities is not None
            else None,
            show_caption_above_media=show_caption_above_media,
            has_spoiler=has_spoiler,
            supports_streaming=supports_streaming,
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendVideo", payload))

    async def send_animation(
        self,
        chat_id: int | str,
        animation: str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        duration: int | None = None,
        width: int | None = None,
        height: int | None = None,
        thumbnail: str | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MessageEntity] | None = None,
        show_caption_above_media: bool | None = None,
        has_spoiler: bool | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send an animation (GIF or H.264/MPEG-4 AVC without sound).

        Example:
            >>> msg = await bot.send_animation(123456, "anim_file_id", has_spoiler=True)

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            animation: Animation to send as a ``file_id`` string or HTTP URL.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            duration: Duration of the animation in seconds.
            width: Animation width.
            height: Animation height.
            thumbnail: Thumbnail file_id or URL of the file sent.
            caption: Animation caption, 0-1024 characters.
            parse_mode: Parse mode for the caption.
            caption_entities: Special entities for the caption.
            show_caption_above_media: Show the caption above the media.
            has_spoiler: Mark the animation as covered with a spoiler.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendanimation
        """
        payload = clean_payload(
            chat_id=chat_id,
            animation=animation,
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            duration=duration,
            width=width,
            height=height,
            thumbnail=thumbnail,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[entity.to_dict() for entity in caption_entities]
            if caption_entities is not None
            else None,
            show_caption_above_media=show_caption_above_media,
            has_spoiler=has_spoiler,
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendAnimation", payload))

    async def send_voice(
        self,
        chat_id: int | str,
        voice: str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        caption_entities: Sequence[MessageEntity] | None = None,
        duration: int | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send an audio file for display as a voice message.

        Example:
            >>> msg = await bot.send_voice(123456, "voice_file_id", duration=10)

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            voice: Voice message to send as a ``file_id`` string or HTTP URL;
                OGG encoded with OPUS.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            caption: Voice message caption, 0-1024 characters.
            parse_mode: Parse mode for the caption.
            caption_entities: Special entities for the caption.
            duration: Duration of the voice message in seconds.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendvoice
        """
        payload = clean_payload(
            chat_id=chat_id,
            voice=voice,
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            caption=caption,
            parse_mode=parse_mode,
            caption_entities=[entity.to_dict() for entity in caption_entities]
            if caption_entities is not None
            else None,
            duration=duration,
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendVoice", payload))

    async def send_video_note(
        self,
        chat_id: int | str,
        video_note: str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        duration: int | None = None,
        length: int | None = None,
        thumbnail: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a square video message (video note).

        Example:
            >>> msg = await bot.send_video_note(123456, "vn_file_id", length=240)

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            video_note: Video note to send as a ``file_id`` string or HTTP URL.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            duration: Duration of the video in seconds.
            length: Video width and height, i.e. diameter of the video note.
            thumbnail: Thumbnail file_id or URL of the file sent.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendvideonote
        """
        payload = clean_payload(
            chat_id=chat_id,
            video_note=video_note,
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            duration=duration,
            length=length,
            thumbnail=thumbnail,
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendVideoNote", payload))

    async def send_media_group(
        self,
        chat_id: int | str,
        media: Sequence[MarkupLike],
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
    ) -> list[Message]:
        """Send a group of photos, videos, documents or audios as one message.

        Example:
            >>> msgs = await bot.send_media_group(123456, [{"type": "photo", "media": "id"}])

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            media: InputMedia items as dicts or ``to_dict`` objects, e.g.
                ``{"type": "photo", "media": "photo_file_id"}``; 2-10 items.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to.

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
            disable_notification=disable_notification,
            protect_content=protect_content,
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
        horizontal_accuracy: float | None = None,
        live_period: int | None = None,
        heading: int | None = None,
        proximity_alert_radius: int | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
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
            horizontal_accuracy: Radius of uncertainty for the location, in
                meters; 0-1500.
            live_period: Period in seconds during which the location will be
                updated; 60-86400.
            heading: Direction in which the user is moving, in degrees; 1-360.
            proximity_alert_radius: Maximum distance for proximity alerts
                about approaching another chat member, in meters.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to.
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
            horizontal_accuracy=horizontal_accuracy,
            live_period=live_period,
            heading=heading,
            proximity_alert_radius=proximity_alert_radius,
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
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
        foursquare_id: str | None = None,
        foursquare_type: str | None = None,
        google_place_id: str | None = None,
        google_place_type: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
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
            foursquare_id: Foursquare identifier of the venue.
            foursquare_type: Foursquare type of the venue.
            google_place_id: Google Places identifier of the venue.
            google_place_type: Google Places type of the venue.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to.
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
            foursquare_id=foursquare_id,
            foursquare_type=foursquare_type,
            google_place_id=google_place_id,
            google_place_type=google_place_type,
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
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
        last_name: str | None = None,
        vcard: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
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
            last_name: Contact's last name.
            vcard: Additional data about the contact in the vCard format.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to.
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
            last_name=last_name,
            vcard=vcard,
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendContact", payload))

    async def send_poll(
        self,
        chat_id: int | str,
        question: str,
        options: Sequence[str],
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        is_anonymous: bool | None = None,
        type: str | None = None,
        allows_multiple_answers: bool | None = None,
        correct_option_id: int | None = None,
        explanation: str | None = None,
        explanation_parse_mode: str | None = None,
        explanation_entities: Sequence[MessageEntity] | None = None,
        open_period: int | None = None,
        close_date: int | None = None,
        is_closed: bool | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
        reply_markup: MarkupLike | None = None,
    ) -> Message:
        """Send a native poll.

        Example:
            >>> msg = await bot.send_poll(123456, "Q?", ["A", "B"])

        Args:
            chat_id: Unique identifier for the target chat or channel username.
            question: Poll question, 1-300 characters.
            options: List of answer options, 2-10 strings of 1-100 characters.
            business_connection_id: Unique identifier of the business
                connection on behalf of which the message will be sent.
            message_thread_id: Unique identifier for the target message thread.
            is_anonymous: Whether the poll is anonymous; omitted by default.
            type: Poll type, ``quiz`` or ``regular``.
            allows_multiple_answers: Whether multiple answers can be chosen.
            correct_option_id: 0-based identifier of the correct answer option
                (quiz mode).
            explanation: Text shown when a user gives a wrong answer.
            explanation_parse_mode: Parse mode for the explanation.
            explanation_entities: Special entities for the explanation.
            open_period: Seconds the poll stays active, 5-600.
            close_date: Unix time when the poll is closed automatically.
            is_closed: Create an immediately closed poll.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to.
            reply_markup: Markup for the message; dict or ``to_dict`` object.

        Returns:
            The sent Message.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.

        Telegram API: https://core.telegram.org/bots/api#sendpoll
        """
        payload = clean_payload(
            chat_id=chat_id,
            question=question,
            options=list(options),
            business_connection_id=business_connection_id,
            message_thread_id=message_thread_id,
            is_anonymous=is_anonymous,
            type=type,
            allows_multiple_answers=allows_multiple_answers,
            correct_option_id=correct_option_id,
            explanation=explanation,
            explanation_parse_mode=explanation_parse_mode,
            explanation_entities=[entity.to_dict() for entity in explanation_entities]
            if explanation_entities is not None
            else None,
            open_period=open_period,
            close_date=close_date,
            is_closed=is_closed,
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendPoll", payload))

    async def send_dice(
        self,
        chat_id: int | str,
        *,
        business_connection_id: str | None = None,
        message_thread_id: int | None = None,
        emoji: str | None = None,
        disable_notification: bool | None = None,
        protect_content: bool | None = None,
        message_effect_id: str | None = None,
        reply_parameters: MarkupLike | None = None,
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
            emoji: Emoji on which the dice throw animation is based.
            disable_notification: Send silently.
            protect_content: Protect the content from forwarding and saving.
            message_effect_id: Unique identifier of the message effect to add.
            reply_parameters: Description of the message to reply to.
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
            emoji=emoji,
            disable_notification=disable_notification,
            protect_content=protect_content,
            message_effect_id=message_effect_id,
            reply_parameters=to_wire(reply_parameters),
            reply_markup=to_wire(reply_markup),
        )
        return parse_result(Message, await self.request("sendDice", payload))
