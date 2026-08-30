"""Poll and link payload objects.

The docs ``Poll``, ``PollOption``, ``PollMedia``, ``Link`` and
``InputPollOption`` types live here rather than in
:mod:`telebot_py.types.common` because ``PollOption.added_by_chat``
references :class:`~telebot_py.types.chat.Chat`, which itself imports from
``common``.
"""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.chat import Chat
from telebot_py.types.common import Location, MessageEntity, Venue
from telebot_py.types.input_media import InputMediaLike
from telebot_py.types.media import (
    Animation,
    Audio,
    Document,
    LivePhoto,
    PhotoSize,
    Video,
)
from telebot_py.types.stickers import Sticker
from telebot_py.types.user import User


@dataclasses.dataclass(frozen=True, slots=True)
class Link(TelegramObject):
    """A link to be embedded in a poll or a rich message.

    Attributes:
        url: URL of the link.

    Telegram API: https://core.telegram.org/bots/api#link
    """

    url: str


@dataclasses.dataclass(frozen=True, slots=True)
class PollMedia(TelegramObject):
    """Media attached to a poll, a poll option, or a quiz explanation.

    Attributes:
        animation: Media is an animation, information about the animation.
        audio: Media is an audio file, information about the file.
        document: Media is a general file, information about the file.
        link: The HTTP link attached to the poll option.
        live_photo: Media is a live photo, information about it.
        location: Media is a shared location, information about it.
        photo: Media is a photo, available sizes of the photo.
        sticker: Media is a sticker, information about it; for poll options
            only.
        venue: Media is a venue, information about the venue.
        video: Media is a video, information about the video.

    Telegram API: https://core.telegram.org/bots/api#pollmedia
    """

    animation: Animation | None = None
    audio: Audio | None = None
    document: Document | None = None
    link: Link | None = None
    live_photo: LivePhoto | None = None
    location: Location | None = None
    photo: list[PhotoSize] | None = None
    sticker: Sticker | None = None
    venue: Venue | None = None
    video: Video | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class PollOption(TelegramObject):
    """One option of a poll.

    Attributes:
        persistent_id: Unique identifier of the option in the poll, persistent
            across option addition and deletion.
        text: Option text, 1-100 characters.
        voter_count: Number of users that voted for this option; may be 0 if
            unknown.
        text_entities: Special entities that appear in the option text.
        media: Media added to the poll option.
        added_by_user: User who added the option; omitted if the option wasn't
            added by a user after the poll was created.
        added_by_chat: Chat that added the option; omitted if the option wasn't
            added by a chat after the poll was created.
        addition_date: Unix time when the option was added; omitted if the
            option existed when the poll was created.

    Telegram API: https://core.telegram.org/bots/api#polloption
    """

    persistent_id: str
    text: str
    voter_count: int
    text_entities: list[MessageEntity] | None = None
    media: PollMedia | None = None
    added_by_user: User | None = None
    added_by_chat: Chat | None = None
    addition_date: int | None = None


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
        allows_revoting: Whether the poll allows changing the chosen answer
            options.
        members_only: Whether voting is limited to users who have been members
            of the chat where the poll was originally sent.
        question_entities: Special entities that appear in the question.
        country_codes: Two-letter ISO 3166-1 alpha-2 country codes the users
            must be from to vote in the poll.
        correct_option_ids: 0-based identifiers of the correct answer options;
            for quiz-mode polls only.
        explanation: Text shown when a user chooses an incorrect answer or taps
            the lamp icon; 0-200 characters.
        explanation_entities: Special entities that appear in the explanation.
        explanation_media: Media added to the quiz explanation.
        open_period: Seconds the poll will be active after creation.
        close_date: Unix time when the poll will be automatically closed.
        description: Description of the poll; for polls inside a ``Message``
            only.
        description_entities: Special entities that appear in ``description``.
        media: Media added to the poll description; for polls inside a
            ``Message`` only.
        correct_option_id: Deprecated single-value form of
            ``correct_option_ids``, kept for payloads produced by older Bot API
            revisions.

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
    allows_revoting: bool
    members_only: bool
    question_entities: list[MessageEntity] | None = None
    country_codes: list[str] | None = None
    correct_option_ids: list[int] | None = None
    explanation: str | None = None
    explanation_entities: list[MessageEntity] | None = None
    explanation_media: PollMedia | None = None
    open_period: int | None = None
    close_date: int | None = None
    description: str | None = None
    description_entities: list[MessageEntity] | None = None
    media: PollMedia | None = None
    correct_option_id: int | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class InputPollOption(TelegramObject):
    """An option of a poll to send via ``sendPoll``.

    Attributes:
        text: Option text, 1-100 characters.
        text_parse_mode: Mode for parsing entities in the option text.
        text_entities: Special entities that appear in the option text; up to
            50 entities.
        media: Media to show when the option is chosen. The docs model
            ``InputPollOptionMedia`` as an abstract union, so any input media
            variant (typed object or raw mapping) is accepted here.

    Telegram API: https://core.telegram.org/bots/api#inputpolloption
    """

    text: str
    text_parse_mode: str | None = None
    text_entities: list[MessageEntity] | None = None
    media: InputMediaLike | None = None
