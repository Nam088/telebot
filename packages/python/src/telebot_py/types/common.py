"""Shared small Telegram API types used across the core types."""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.types.base import TelegramObject
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class Location(TelegramObject):
    """A point on the map.

    Attributes:
        latitude: Latitude as defined by sender.
        longitude: Longitude as defined by sender.
        horizontal_accuracy: Radius of uncertainty in meters; 0-1500.
        live_period: Seconds relative to the message sending date during which
            the location can be updated.
        heading: Direction in which the user is moving, in degrees; 1-360.
        proximity_alert_radius: Maximum distance in meters for proximity
            alerts about approaching another chat member.

    Telegram API: https://core.telegram.org/bots/api#location
    """

    latitude: float
    longitude: float
    horizontal_accuracy: float | None = None
    live_period: int | None = None
    heading: int | None = None
    proximity_alert_radius: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Venue(TelegramObject):
    """A venue with a location and provider identifiers.

    Attributes:
        location: Venue location.
        title: Name of the venue.
        address: Address of the venue.
        foursquare_id: Foursquare identifier of the venue.
        foursquare_type: Foursquare type of the venue.
        google_place_id: Google Places identifier of the venue.
        google_place_type: Google Places type of the venue.

    Telegram API: https://core.telegram.org/bots/api#venue
    """

    location: Location
    title: str
    address: str
    foursquare_id: str | None = None
    foursquare_type: str | None = None
    google_place_id: str | None = None
    google_place_type: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Contact(TelegramObject):
    """A shared phone contact.

    Attributes:
        phone_number: Contact's phone number.
        first_name: Contact's first name.
        last_name: Contact's last name, when present.
        user_id: Contact's user identifier in Telegram, when present.
        vcard: Additional data about the contact in the form of a vCard.

    Telegram API: https://core.telegram.org/bots/api#contact
    """

    phone_number: str
    first_name: str
    last_name: str | None = None
    user_id: int | None = None
    vcard: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Dice(TelegramObject):
    """An animated emoji with a random value.

    Attributes:
        emoji: Emoji on which the dice throw animation is based.
        value: Value of the dice (e.g. 1-6 for dice/darts, 1-5 for
            basketball/football, 1-64 for the slot machine).

    Telegram API: https://core.telegram.org/bots/api#dice
    """

    emoji: str
    value: int


@dataclasses.dataclass(frozen=True, slots=True)
class MessageEntity(TelegramObject):
    """A special entity in a text message (bot command, mention, link, ...).

    Attributes:
        type: Type of the entity (e.g. ``bot_command``, ``mention``, ``url``).
        offset: Offset in UTF-16 code units to the start of the entity.
        length: Length of the entity in UTF-16 code units.
        url: For ``text_link`` only, URL that will be opened after tapping.
        user: For ``text_mention`` only, the mentioned user.
        language: For ``pre`` only, the programming language of the entity.
        custom_emoji_id: For ``custom_emoji`` only, unique identifier of the
            custom emoji.

    Telegram API: https://core.telegram.org/bots/api#messageentity
    """

    type: str
    offset: int
    length: int
    url: str | None = None
    user: User | None = None
    language: str | None = None
    custom_emoji_id: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class PollOption(TelegramObject):
    """One option of a poll.

    Attributes:
        text: Option text, 1-100 characters.
        voter_count: Number of users that voted for this option.
        persistent_id: Unique identifier of the option in the poll.
        text_entities: Special entities that appear in the option text.

    Telegram API: https://core.telegram.org/bots/api#polloption
    """

    text: str
    voter_count: int
    persistent_id: str | None = None
    text_entities: list[MessageEntity] | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class Poll(TelegramObject):
    """A native Telegram poll.

    Attributes:
        id: Unique poll identifier.
        question: Poll question, 1-300 characters.
        options: List of poll options.
        total_voter_count: Total number of users that voted in the poll.
        is_closed: Whether the poll is closed.
        is_anonymous: Whether the poll is anonymous.
        type: Poll type, currently "regular" or "quiz".
        allows_multiple_answers: Whether the poll allows multiple answers.
        correct_option_id: 0-based identifier of the correct answer option
            (quiz mode only).
        explanation: Text shown when a user chooses an incorrect answer or
            taps the lamp icon; 0-200 characters.
        explanation_entities: Special entities that appear in the explanation.
        open_period: Seconds the poll will be active after creation.
        close_date: Unix time when the poll will be automatically closed.

    Telegram API: https://core.telegram.org/bots/api#poll
    """

    id: str
    question: str
    options: list[PollOption]
    total_voter_count: int
    is_closed: bool
    is_anonymous: bool
    type: str
    allows_multiple_answers: bool
    correct_option_id: int | None = None
    explanation: str | None = None
    explanation_entities: list[MessageEntity] | None = None
    open_period: int | None = None
    close_date: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class MessageId(TelegramObject):
    """A unique identifier of a message, e.g. after a copy.

    Attributes:
        message_id: Unique message identifier.

    Telegram API: https://core.telegram.org/bots/api#messageid
    """

    message_id: int


@dataclasses.dataclass(frozen=True, slots=True)
class WebhookInfo(TelegramObject):
    """Current status of a webhook.

    Attributes:
        url: Webhook URL, empty if the webhook is not set.
        has_custom_certificate: Whether a custom certificate was provided.
        pending_update_count: Number of updates awaiting delivery.
        ip_address: Currently used webhook IP address.
        last_error_date: Unix time of the most recent failed delivery.
        last_error_message: Error message of the most recent failed delivery.
        last_synchronization_error_date: Unix time of the most recent
            automatic synchronization error.
        max_connections: Maximum allowed simultaneous connections, when set.
        allowed_updates: Update types the bot subscribed to, when restricted.

    Telegram API: https://core.telegram.org/bots/api#webhookinfo
    """

    url: str
    has_custom_certificate: bool
    pending_update_count: int
    ip_address: str | None = None
    last_error_date: int | None = None
    last_error_message: str | None = None
    last_synchronization_error_date: int | None = None
    max_connections: int | None = None
    allowed_updates: list[str] | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class InlineQuery(TelegramObject):
    """An incoming inline query.

    Attributes:
        id: Unique identifier for this query.
        from_user: Sender of the inline query.
        query: Text of the query (up to 256 characters).
        offset: Offset of the results to be returned.
        chat_type: Type of the chat from which the inline query was sent
            ('sender', 'private', 'group', 'supergroup', or 'channel').
        location: Sender location, only for bots that request user location.

    Telegram API: https://core.telegram.org/bots/api#inlinequery
    """

    id: str
    from_user: User
    query: str
    offset: str
    chat_type: str | None = None
    location: Location | None = None

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}


@dataclasses.dataclass(frozen=True, slots=True)
class ChosenInlineResult(TelegramObject):
    """The result of an inline query chosen by a user and sent to a partner.

    Attributes:
        result_id: Unique identifier for the result that was chosen.
        from_user: The user that chose the result.
        query: The query that was used to obtain the result.
        location: Sender location, only for bots that require user location.
        inline_message_id: Identifier of the sent inline message, available
            only if there is an inline keyboard attached to the message.

    Telegram API: https://core.telegram.org/bots/api#choseninlineresult
    """

    result_id: str
    from_user: User
    query: str
    location: Location | None = None
    inline_message_id: str | None = None

    _KEY_OVERRIDES: t.ClassVar[t.Mapping[str, str]] = {"from_user": "from"}


@dataclasses.dataclass(frozen=True, slots=True)
class LinkPreviewOptions(TelegramObject):
    """Controls link preview generation for a message.

    Every field is optional, so an empty instance means "use the defaults"
    rather than "no preview" — pass ``is_disabled=True`` to suppress the
    preview entirely.

    Attributes:
        url: URL used for the link preview. If empty, then the first URL found
            in the message text is used.
        is_disabled: Pass ``True`` to disable link preview generation for the
            message, regardless of the value in ``url``.
        prefer_small_media: Pass ``True`` if the link preview should show a
            smaller media content.
        prefer_large_media: Pass ``True`` if the link preview should show a
            media content larger than a small one.
        show_above_text: Pass ``True`` if the link preview should be shown
            above the message text.

    Telegram API: https://core.telegram.org/bots/api#linkpreviewoptions
    """

    url: str | None = None
    is_disabled: bool | None = None
    prefer_small_media: bool | None = None
    prefer_large_media: bool | None = None
    show_above_text: bool | None = None
