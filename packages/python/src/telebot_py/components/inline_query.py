"""Inline query result builders (parity with node inline-query.ts).

Python has no inline-result dataclasses yet (answer_inline_query lands in
US4), so the builders return plain Bot API JSON dicts ready to hand to the
future ``answer_inline_query`` method.
"""

from __future__ import annotations

import typing as t

from telebot_py.types import InlineKeyboardMarkup

ResultDict = dict[str, t.Any]


class ArticleResultBuilder:
    """Builder for article results; call :meth:`text` to finalize.

    Attributes:
        id: Unique identifier for this result, 1-64 bytes.
        title: Title of the result.
    """

    def __init__(
        self,
        id: str,  # noqa: A002 - Telegram field name
        title: str,
        *,
        description: str | None = None,
        url: str | None = None,
        hide_url: bool | None = None,
        thumbnail_url: str | None = None,
        thumbnail_width: int | None = None,
        thumbnail_height: int | None = None,
        reply_markup: InlineKeyboardMarkup | None = None,
    ) -> None:
        """Configure the article result envelope.

        Args:
            id: Unique identifier for this result, 1-64 bytes.
            title: Title of the result.
            description: Short description of the result.
            url: URL of the result.
            hide_url: Pass True to hide the URL in the message.
            thumbnail_url: URL of the thumbnail for the result.
            thumbnail_width: Thumbnail width.
            thumbnail_height: Thumbnail height.
            reply_markup: Inline keyboard attached to the message.
        """
        self.id = id
        self.title = title
        self._options: ResultDict = {
            "description": description,
            "url": url,
            "hide_url": hide_url,
            "thumbnail_url": thumbnail_url,
            "thumbnail_width": thumbnail_width,
            "thumbnail_height": thumbnail_height,
            "reply_markup": reply_markup,
        }

    def text(
        self,
        message_text: str,
        *,
        parse_mode: str | None = None,
        disable_web_page_preview: bool | None = None,
    ) -> ResultDict:
        """Finalize with a text message content.

        Args:
            message_text: Text of the message to be sent, 1-4096 characters.
            parse_mode: Mode for parsing entities in the message text.
            disable_web_page_preview: Disables link previews for the message.

        Returns:
            The article result dict ready for ``answer_inline_query``.
        """
        content: ResultDict = {"message_text": message_text}
        if parse_mode is not None:
            content["parse_mode"] = parse_mode
        if disable_web_page_preview is not None:
            content["disable_web_page_preview"] = disable_web_page_preview
        result: ResultDict = {
            "type": "article",
            "id": self.id,
            "title": self.title,
            "input_message_content": content,
        }
        for key, value in self._options.items():
            if value is not None:
                result[key] = value
        return result


def _with_options(base: ResultDict, options: t.Mapping[str, t.Any]) -> ResultDict:
    """Merge non-None options into a result dict (node spread parity)."""
    for key, value in options.items():
        if value is not None:
            base[key] = value
    return base


class InlineQueryResultBuilder:
    """Static factory building typed inline query result dicts.

    Example:
        >>> results = [
        ...     InlineQueryResultBuilder.article("1", "Search Google")
        ...     .text("https://google.com"),
        ...     InlineQueryResultBuilder.photo(
        ...         "2", "https://example.com/img.jpg", title="Wallpaper"
        ...     ),
        ... ]
        >>> await context.bot.answer_inline_query(query_id, results)
    """

    @staticmethod
    def article(
        id: str,  # noqa: A002 - Telegram field name
        title: str,
        **options: t.Any,
    ) -> ArticleResultBuilder:
        """Create an article result builder.

        Args:
            id: Unique identifier for this result, 1-64 bytes.
            title: Title of the result.
            **options: Article options: description, url, hide_url,
                thumbnail_url, thumbnail_width, thumbnail_height,
                reply_markup.

        Returns:
            A builder; configure the message content via its ``text()``.
        """
        return ArticleResultBuilder(id, title, **options)

    @staticmethod
    def photo(
        id: str,  # noqa: A002
        photo_url: str,
        *,
        title: str | None = None,
        description: str | None = None,
        caption: str | None = None,
        parse_mode: str | None = None,
        show_caption_above_media: bool | None = None,
        thumbnail_url: str | None = None,
        reply_markup: InlineKeyboardMarkup | None = None,
    ) -> ResultDict:
        """Create a photo result; thumbnail defaults to the photo URL.

        Args:
            id: Unique identifier for this result.
            photo_url: A valid URL of the photo (JPEG, <= 5MB).
            title: Title for the result.
            description: Short description of the result.
            caption: Caption of the photo, 0-1024 characters.
            parse_mode: Mode for parsing entities in the caption.
            show_caption_above_media: Show the caption above the media.
            thumbnail_url: URL of the thumbnail; defaults to photo_url.
            reply_markup: Inline keyboard attached to the message.

        Returns:
            The photo result dict.
        """
        return _with_options(
            {
                "type": "photo",
                "id": id,
                "photo_url": photo_url,
                "thumbnail_url": thumbnail_url if thumbnail_url is not None else photo_url,
            },
            {
                "title": title,
                "description": description,
                "caption": caption,
                "parse_mode": parse_mode,
                "show_caption_above_media": show_caption_above_media,
                "reply_markup": reply_markup,
            },
        )

    @staticmethod
    def video(
        id: str,  # noqa: A002
        video_url: str,
        mime_type: str,
        thumbnail_url: str,
        title: str,
        **options: t.Any,
    ) -> ResultDict:
        """Create a video result.

        Args:
            id: Unique identifier for this result.
            video_url: URL for the embedded video player or video file.
            mime_type: Mime type of the video URL ('text/html' or 'video/mp4').
            thumbnail_url: URL of the thumbnail (JPEG or GIF).
            title: Title for the result.
            **options: Extra fields: caption, parse_mode, video_width,
                video_height, video_duration, description, reply_markup.

        Returns:
            The video result dict.
        """
        return _with_options(
            {
                "type": "video",
                "id": id,
                "video_url": video_url,
                "mime_type": mime_type,
                "thumbnail_url": thumbnail_url,
                "title": title,
            },
            options,
        )

    @staticmethod
    def audio(
        id: str,  # noqa: A002
        audio_url: str,
        title: str,
        **options: t.Any,
    ) -> ResultDict:
        """Create an audio result.

        Args:
            id: Unique identifier for this result.
            audio_url: A valid URL for the audio file.
            title: Title of the audio track.
            **options: Extra fields: performer, audio_duration, caption,
                parse_mode, reply_markup.

        Returns:
            The audio result dict.
        """
        return _with_options(
            {"type": "audio", "id": id, "audio_url": audio_url, "title": title},
            options,
        )

    @staticmethod
    def document(
        id: str,  # noqa: A002
        title: str,
        document_url: str,
        mime_type: str,
        **options: t.Any,
    ) -> ResultDict:
        """Create a document result.

        Args:
            id: Unique identifier for this result.
            title: Title for the result.
            document_url: A valid URL for the file.
            mime_type: Mime type of the file contents.
            **options: Extra fields: caption, parse_mode, description,
                thumbnail_url, reply_markup.

        Returns:
            The document result dict.
        """
        return _with_options(
            {
                "type": "document",
                "id": id,
                "title": title,
                "document_url": document_url,
                "mime_type": mime_type,
            },
            options,
        )

    @staticmethod
    def gif(
        id: str,  # noqa: A002
        gif_url: str,
        thumbnail_url: str,
        **options: t.Any,
    ) -> ResultDict:
        """Create a GIF animation result.

        Args:
            id: Unique identifier for this result.
            gif_url: A valid URL for the GIF file.
            thumbnail_url: URL of the static (JPEG or GIF) thumbnail.
            **options: Extra fields: title, caption, parse_mode, gif_width,
                gif_height, gif_duration, reply_markup.

        Returns:
            The GIF result dict.
        """
        return _with_options(
            {"type": "gif", "id": id, "gif_url": gif_url, "thumbnail_url": thumbnail_url},
            options,
        )

    @staticmethod
    def location(
        id: str,  # noqa: A002
        latitude: float,
        longitude: float,
        title: str,
        **options: t.Any,
    ) -> ResultDict:
        """Create a location result.

        Args:
            id: Unique identifier for this result.
            latitude: Location latitude in degrees.
            longitude: Location longitude in degrees.
            title: Location title.
            **options: Extra fields: live_period, horizontal_accuracy,
                heading, proximity_alert_radius, thumbnail_url, reply_markup.

        Returns:
            The location result dict.
        """
        return _with_options(
            {
                "type": "location",
                "id": id,
                "latitude": latitude,
                "longitude": longitude,
                "title": title,
            },
            options,
        )

    @staticmethod
    def venue(
        id: str,  # noqa: A002
        latitude: float,
        longitude: float,
        title: str,
        address: str,
        **options: t.Any,
    ) -> ResultDict:
        """Create a venue result.

        Args:
            id: Unique identifier for this result.
            latitude: Latitude of the venue in degrees.
            longitude: Longitude of the venue in degrees.
            title: Title of the venue.
            address: Address of the venue.
            **options: Extra fields: foursquare_id, foursquare_type,
                google_place_id, google_place_type, thumbnail_url,
                reply_markup.

        Returns:
            The venue result dict.
        """
        return _with_options(
            {
                "type": "venue",
                "id": id,
                "latitude": latitude,
                "longitude": longitude,
                "title": title,
                "address": address,
            },
            options,
        )

    @staticmethod
    def contact(
        id: str,  # noqa: A002
        phone_number: str,
        first_name: str,
        **options: t.Any,
    ) -> ResultDict:
        """Create a contact result.

        Args:
            id: Unique identifier for this result.
            phone_number: Contact's phone number.
            first_name: Contact's first name.
            **options: Extra fields: last_name, vcard, thumbnail_url,
                reply_markup.

        Returns:
            The contact result dict.
        """
        return _with_options(
            {"type": "contact", "id": id, "phone_number": phone_number, "first_name": first_name},
            options,
        )

    @staticmethod
    def game(
        id: str,  # noqa: A002
        game_short_name: str,
        **options: t.Any,
    ) -> ResultDict:
        """Create a game result.

        Args:
            id: Unique identifier for this result.
            game_short_name: Short name of the game.
            **options: Extra fields: reply_markup.

        Returns:
            The game result dict.
        """
        return _with_options(
            {"type": "game", "id": id, "game_short_name": game_short_name},
            options,
        )
