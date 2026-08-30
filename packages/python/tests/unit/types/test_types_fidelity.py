"""Field-fidelity tests: Python types must match the documented field sets.

The inventory below was extracted field-by-field from the official Telegram
Bot API 10.3 documentation (https://core.telegram.org/bots/api), which is the
authoritative source. The TypeScript sources in ``packages/node`` were used as
a secondary cross-check, but the ported node reference has drifted for some
types (e.g. ``BusinessConnection.can_reply`` vs. the documented ``rights``);
where the docs and node disagree, the docs win.

Secondary cross-check sources:

- packages/node/src/client/types/common/models.ts (User, Chat, ChatPhoto,
  Birthdate, Location, RawUpdate/Update, MessageGenerationStopped)
- packages/node/src/client/types/messages/core.ts (Message, MessageEntity,
  Contact, Dice, PollOption, Poll, PollAnswer, Venue, MessageOrigin*,
  ExternalReplyInfo, TextQuote)
- packages/node/src/client/types/messages/media.ts (PhotoSize, Audio,
  Document, Video, Animation, Voice, VideoNote, LivePhoto)
- packages/node/src/client/types/messages/keyboards.ts (all keyboard types)
- packages/node/src/client/types/messages/reactions.ts
- packages/node/src/client/types/chats/member.ts + permissions.ts
- packages/node/src/client/types/business/models.ts (CallbackQuery,
  InlineQuery, ChosenInlineResult, Business*, ChatBoost*, Story)
- packages/node/src/client/types/payments/models.ts

Each spec entry is ``(field_name, required_by_the_docs)``. The Python attribute
name matches the wire field name, except ``from`` which is exposed as
``from_user`` (keyword-avoidance) and re-mapped on the wire.
"""

from __future__ import annotations

import dataclasses
import typing as t

import pytest

from telebot_py.types import (
    Animation,
    Audio,
    Birthdate,
    BusinessBotRights,
    BusinessConnection,
    BusinessIntro,
    BusinessLocation,
    BusinessMessagesDeleted,
    BusinessOpeningHours,
    BusinessOpeningHoursInterval,
    CallbackQuery,
    Chat,
    ChatBoost,
    ChatBoostAdded,
    ChatBoostRemoved,
    ChatBoostSourceGiftCode,
    ChatBoostSourceGiveaway,
    ChatBoostSourcePremium,
    ChatBoostUpdated,
    ChatInviteLink,
    ChatJoinRequest,
    ChatLocation,
    ChatMember,
    ChatMemberAdministrator,
    ChatMemberUpdated,
    ChatPermissions,
    ChatPhoto,
    ChosenInlineResult,
    Community,
    CommunityChatJoined,
    Contact,
    CopyTextButton,
    Dice,
    Document,
    ExternalReplyInfo,
    ForceReply,
    Gift,
    GiftBackground,
    Gifts,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    InlineQuery,
    KeyboardButton,
    KeyboardButtonPollType,
    KeyboardButtonRequestChat,
    KeyboardButtonRequestUsers,
    LivePhoto,
    Location,
    LoginUrl,
    Message,
    MessageEntity,
    MessageGenerationStopped,
    MessageOriginChannel,
    MessageOriginChat,
    MessageOriginHiddenUser,
    MessageOriginUser,
    MessageReactionCountUpdated,
    MessageReactionUpdated,
    OrderInfo,
    PhotoSize,
    Poll,
    PollAnswer,
    PollOption,
    PreCheckoutQuery,
    PurchasedPaidMedia,
    ReactionCount,
    ReactionTypeCustomEmoji,
    ReactionTypeEmoji,
    ReactionTypePaid,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    ShippingAddress,
    ShippingQuery,
    Story,
    SwitchInlineQueryChosenChat,
    TextQuote,
    UniqueGift,
    UniqueGiftBackdrop,
    UniqueGiftBackdropColors,
    UniqueGiftColors,
    UniqueGiftInfo,
    UniqueGiftModel,
    UniqueGiftSymbol,
    Update,
    User,
    Venue,
    Video,
    VideoNote,
    Voice,
    WebAppData,
    WebAppInfo,
)
from telebot_py.types.base import TelegramObject, TypeParseError

# ---------------------------------------------------------------------------
# Field inventory transcribed from the Bot API 10.3 documentation.
# ---------------------------------------------------------------------------

FIELD_SPECS: dict[type, tuple[tuple[str, bool], ...]] = {
    User: (
        ("id", True),
        ("is_bot", True),
        ("first_name", True),
        ("last_name", False),
        ("username", False),
        ("language_code", False),
        ("is_premium", False),
        ("added_to_attachment_menu", False),
        ("can_join_groups", False),
        ("can_read_all_group_messages", False),
        ("supports_inline_queries", False),
        ("can_connect_to_business", False),
        ("has_main_web_app", False),
    ),
    Birthdate: (("day", True), ("month", True), ("year", False)),
    ChatPhoto: (
        ("small_file_id", True),
        ("small_file_unique_id", True),
        ("big_file_id", True),
        ("big_file_unique_id", True),
    ),
    Chat: (
        ("id", True),
        ("type", True),
        ("title", False),
        ("username", False),
        ("first_name", False),
        ("last_name", False),
        ("is_forum", False),
        ("photo", False),
        ("active_usernames", False),
        ("birthdate", False),
        ("business_intro", False),
        ("business_location", False),
        ("business_opening_hours", False),
        ("personal_chat", False),
        ("available_reactions", False),
        ("accent_color_id", False),
        ("background_custom_emoji_id", False),
        ("profile_accent_color_id", False),
        ("profile_background_custom_emoji_id", False),
        ("emoji_status_custom_emoji_id", False),
        ("emoji_status_expiration_date", False),
        ("bio", False),
        ("has_private_forwards", False),
        ("has_restricted_voice_and_video_messages", False),
        ("join_to_send_messages", False),
        ("join_by_request", False),
        ("description", False),
        ("invite_link", False),
        ("pinned_message", False),
        ("permissions", False),
        ("slow_mode_delay", False),
        ("unrestrict_boost_count", False),
        ("message_auto_delete_time", False),
        ("has_aggressive_anti_spam_enabled", False),
        ("has_hidden_members", False),
        ("has_protected_content", False),
        ("has_visible_history", False),
        ("sticker_set_name", False),
        ("can_set_sticker_set", False),
        ("custom_emoji_sticker_set_name", False),
        ("linked_chat_id", False),
        ("location", False),
    ),
    Location: (
        ("latitude", True),
        ("longitude", True),
        ("horizontal_accuracy", False),
        ("live_period", False),
        ("heading", False),
        ("proximity_alert_radius", False),
    ),
    Venue: (
        ("location", True),
        ("title", True),
        ("address", True),
        ("foursquare_id", False),
        ("foursquare_type", False),
        ("google_place_id", False),
        ("google_place_type", False),
    ),
    Contact: (
        ("phone_number", True),
        ("first_name", True),
        ("last_name", False),
        ("user_id", False),
        ("vcard", False),
    ),
    Dice: (("emoji", True), ("value", True)),
    MessageEntity: (
        ("type", True),
        ("offset", True),
        ("length", True),
        ("url", False),
        ("user", False),
        ("language", False),
        ("custom_emoji_id", False),
    ),
    PollOption: (
        ("text", True),
        ("voter_count", True),
        ("persistent_id", False),
        ("text_entities", False),
    ),
    Poll: (
        ("id", True),
        ("question", True),
        ("options", True),
        ("total_voter_count", True),
        ("is_closed", True),
        ("is_anonymous", True),
        ("type", True),
        ("allows_multiple_answers", True),
        ("correct_option_id", False),
        ("explanation", False),
        ("explanation_entities", False),
        ("open_period", False),
        ("close_date", False),
    ),
    PollAnswer: (
        ("poll_id", True),
        ("option_ids", True),
        ("voter_chat", False),
        ("user", False),
    ),
    PhotoSize: (
        ("file_id", True),
        ("file_unique_id", True),
        ("width", True),
        ("height", True),
        ("file_size", False),
    ),
    Audio: (
        ("file_id", True),
        ("file_unique_id", True),
        ("duration", True),
        ("performer", False),
        ("title", False),
        ("file_name", False),
        ("mime_type", False),
        ("file_size", False),
        ("thumbnail", False),
    ),
    Document: (
        ("file_id", True),
        ("file_unique_id", True),
        ("thumbnail", False),
        ("file_name", False),
        ("mime_type", False),
        ("file_size", False),
    ),
    Video: (
        ("file_id", True),
        ("file_unique_id", True),
        ("width", True),
        ("height", True),
        ("duration", True),
        ("thumbnail", False),
        ("file_name", False),
        ("mime_type", False),
        ("file_size", False),
    ),
    Animation: (
        ("file_id", True),
        ("file_unique_id", True),
        ("width", True),
        ("height", True),
        ("duration", True),
        ("thumbnail", False),
        ("file_name", False),
        ("mime_type", False),
        ("file_size", False),
    ),
    Voice: (
        ("file_id", True),
        ("file_unique_id", True),
        ("duration", True),
        ("mime_type", False),
        ("file_size", False),
    ),
    VideoNote: (
        ("file_id", True),
        ("file_unique_id", True),
        ("length", True),
        ("duration", True),
        ("thumbnail", False),
        ("file_size", False),
    ),
    LivePhoto: (
        ("file_id", True),
        ("file_unique_id", True),
        ("width", True),
        ("height", True),
        ("photo", True),
        ("video", True),
    ),
    Story: (("chat", True), ("id", True)),
    ChatBoostAdded: (("boost_count", True),),
    WebAppInfo: (("url", True),),
    LoginUrl: (
        ("url", True),
        ("forward_text", False),
        ("bot_username", False),
        ("request_write_access", False),
    ),
    SwitchInlineQueryChosenChat: (
        ("query", False),
        ("allow_user_chats", False),
        ("allow_bot_chats", False),
        ("allow_group_chats", False),
        ("allow_channel_chats", False),
    ),
    CopyTextButton: (("text", True),),
    InlineKeyboardButton: (
        ("text", True),
        ("icon_custom_emoji_id", False),
        ("style", False),
        ("url", False),
        ("callback_data", False),
        ("web_app", False),
        ("login_url", False),
        ("switch_inline_query", False),
        ("switch_inline_query_current_chat", False),
        ("switch_inline_query_chosen_chat", False),
        ("copy_text", False),
        ("callback_game", False),
        ("pay", False),
        ("disabled", False),
    ),
    InlineKeyboardMarkup: (("inline_keyboard", True), ("force_reply", False)),
    KeyboardButtonPollType: (("type", False),),
    KeyboardButtonRequestUsers: (
        ("request_id", True),
        ("user_is_bot", False),
        ("user_is_premium", False),
        ("max_quantity", False),
        ("request_name", False),
        ("request_username", False),
        ("request_photo", False),
    ),
    KeyboardButtonRequestChat: (
        ("request_id", True),
        ("chat_is_channel", True),
        ("chat_is_forum", False),
        ("chat_has_username", False),
        ("chat_is_created", False),
        ("user_administrator_rights", False),
        ("bot_administrator_rights", False),
        ("bot_is_member", False),
        ("request_title", False),
        ("request_username", False),
        ("request_photo", False),
    ),
    KeyboardButton: (
        ("text", True),
        ("request_users", False),
        ("request_chat", False),
        ("request_contact", False),
        ("request_location", False),
        ("request_poll", False),
        ("web_app", False),
    ),
    ReplyKeyboardMarkup: (
        ("keyboard", True),
        ("is_persistent", False),
        ("resize_keyboard", False),
        ("one_time_keyboard", False),
        ("input_field_placeholder", False),
        ("selective", False),
        ("force_reply", False),
    ),
    ReplyKeyboardRemove: (("remove_keyboard", True), ("selective", False)),
    ForceReply: (
        ("force_reply", True),
        ("input_field_placeholder", False),
        ("selective", False),
    ),
    MessageOriginUser: (("type", True), ("date", True), ("sender_user", True)),
    MessageOriginHiddenUser: (("type", True), ("date", True), ("sender_user_name", True)),
    MessageOriginChat: (
        ("type", True),
        ("date", True),
        ("sender_chat", True),
        ("author_signature", False),
    ),
    MessageOriginChannel: (
        ("type", True),
        ("date", True),
        ("chat", True),
        ("message_id", True),
        ("author_signature", False),
    ),
    TextQuote: (
        ("text", True),
        ("position", True),
        ("entities", False),
        ("is_manual", False),
    ),
    ExternalReplyInfo: (
        ("origin", True),
        ("chat", False),
        ("message_id", False),
        ("link_preview_options", False),
        ("animation", False),
        ("audio", False),
        ("document", False),
        ("photo", False),
        ("sticker", False),
        ("story", False),
        ("video", False),
        ("video_note", False),
        ("voice", False),
        ("has_media_spoiler", False),
        ("contact", False),
        ("dice", False),
        ("game", False),
        ("giveaway", False),
        ("giveaway_winners", False),
        ("invoice", False),
        ("location", False),
        ("poll", False),
        ("venue", False),
    ),
    WebAppData: (("data", True), ("button_text", True)),
    ChatLocation: (("location", True), ("address", True)),
    ChatPermissions: (
        ("can_send_messages", False),
        ("can_send_audios", False),
        ("can_send_documents", False),
        ("can_send_photos", False),
        ("can_send_videos", False),
        ("can_send_video_notes", False),
        ("can_send_voice_notes", False),
        ("can_send_polls", False),
        ("can_send_other_messages", False),
        ("can_add_web_page_previews", False),
        ("can_change_info", False),
        ("can_invite_users", False),
        ("can_pin_messages", False),
        ("can_manage_topics", False),
    ),
    ChatInviteLink: (
        ("invite_link", True),
        ("creator", True),
        ("creates_join_request", True),
        ("is_primary", True),
        ("is_revoked", True),
        ("name", False),
        ("expire_date", False),
        ("member_limit", False),
        ("pending_join_request_count", False),
        ("subscription_period", False),
        ("subscription_price", False),
    ),
    ChatMember: (
        ("status", True),
        ("user", True),
        ("custom_title", False),
        ("is_anonymous", False),
        ("can_be_edited", False),
        ("can_manage_chat", False),
        ("can_delete_messages", False),
        ("can_manage_video_chats", False),
        ("can_restrict_members", False),
        ("can_promote_members", False),
        ("can_change_info", False),
        ("can_invite_users", False),
        ("can_post_stories", False),
        ("can_edit_stories", False),
        ("can_delete_stories", False),
        ("can_post_messages", False),
        ("can_edit_messages", False),
        ("can_pin_messages", False),
        ("can_manage_topics", False),
        ("can_send_welcome_messages", False),
        ("until_date", False),
    ),
    ChatMemberAdministrator: (
        ("status", True),
        ("user", True),
        ("can_be_edited", True),
        ("is_anonymous", True),
        ("can_manage_chat", True),
        ("can_delete_messages", True),
        ("can_manage_video_chats", True),
        ("can_restrict_members", True),
        ("can_promote_members", True),
        ("can_change_info", True),
        ("can_invite_users", True),
        ("can_post_stories", False),
        ("can_edit_stories", False),
        ("can_delete_stories", False),
        ("can_post_messages", False),
        ("can_edit_messages", False),
        ("can_pin_messages", False),
        ("can_manage_topics", False),
        ("can_manage_direct_messages", False),
        ("can_manage_tags", False),
        ("can_send_welcome_messages", False),
        ("custom_title", False),
    ),
    ChatMemberUpdated: (
        ("chat", True),
        ("from_user", True),
        ("date", True),
        ("old_chat_member", True),
        ("new_chat_member", True),
        ("invite_link", False),
        ("via_join_request", False),
        ("via_chat_folder_invite_link", False),
    ),
    ChatJoinRequest: (
        ("chat", True),
        ("from_user", True),
        ("user_chat_id", True),
        ("date", True),
        ("bio", False),
        ("invite_link", False),
    ),
    Community: (("id", True), ("name", True)),
    CommunityChatJoined: (("community", True),),
    BusinessIntro: (("title", False), ("message", False), ("sticker", False)),
    BusinessLocation: (("address", True), ("location", False)),
    BusinessOpeningHoursInterval: (("opening_minute", True), ("closing_minute", True)),
    BusinessOpeningHours: (("time_zone_name", True), ("opening_hours", True)),
    BusinessBotRights: (
        ("can_reply", False),
        ("can_read_messages", False),
        ("can_delete_sent_messages", False),
        ("can_delete_all_messages", False),
        ("can_edit_name", False),
        ("can_edit_bio", False),
        ("can_edit_profile_photo", False),
        ("can_edit_username", False),
        ("can_change_gift_settings", False),
        ("can_view_gifts_and_stars", False),
        ("can_convert_gifts_to_stars", False),
        ("can_transfer_and_upgrade_gifts", False),
        ("can_transfer_stars", False),
        ("can_manage_stories", False),
    ),
    BusinessConnection: (
        ("id", True),
        ("user", True),
        ("user_chat_id", True),
        ("date", True),
        ("rights", False),
        ("is_enabled", True),
    ),
    BusinessMessagesDeleted: (
        ("business_connection_id", True),
        ("chat", True),
        ("message_ids", True),
    ),
    ChatBoostSourcePremium: (("source", True), ("user", True)),
    ChatBoostSourceGiftCode: (("source", True), ("user", True)),
    ChatBoostSourceGiveaway: (
        ("source", True),
        ("giveaway_message_id", True),
        ("user", False),
        ("prize_star_count", False),
        ("is_unclaimed", False),
    ),
    ChatBoost: (
        ("boost_id", True),
        ("add_date", True),
        ("expiration_date", True),
        ("source", True),
    ),
    ChatBoostUpdated: (("chat", True), ("boost", True)),
    ChatBoostRemoved: (
        ("chat", True),
        ("boost_id", True),
        ("remove_date", True),
        ("source", True),
    ),
    ReactionTypeEmoji: (("type", True), ("emoji", True)),
    ReactionTypeCustomEmoji: (("type", True), ("custom_emoji_id", True)),
    ReactionTypePaid: (("type", True),),
    ReactionCount: (("type", True), ("total_count", True)),
    MessageReactionUpdated: (
        ("chat", True),
        ("message_id", True),
        ("date", True),
        ("old_reaction", True),
        ("new_reaction", True),
        ("user", False),
        ("actor_chat", False),
    ),
    MessageReactionCountUpdated: (
        ("chat", True),
        ("message_id", True),
        ("date", True),
        ("reactions", True),
    ),
    ShippingAddress: (
        ("country_code", True),
        ("city", True),
        ("street_line1", True),
        ("post_code", True),
        ("state", False),
        ("street_line2", False),
    ),
    OrderInfo: (
        ("name", False),
        ("phone_number", False),
        ("email", False),
        ("shipping_address", False),
    ),
    ShippingQuery: (
        ("id", True),
        ("from_user", True),
        ("invoice_payload", True),
        ("shipping_address", True),
    ),
    PreCheckoutQuery: (
        ("id", True),
        ("from_user", True),
        ("currency", True),
        ("total_amount", True),
        ("invoice_payload", True),
        ("shipping_option_id", False),
        ("order_info", False),
    ),
    PurchasedPaidMedia: (("from_user", True), ("paid_media_payload", True)),
    InlineQuery: (
        ("id", True),
        ("from_user", True),
        ("query", True),
        ("offset", True),
        ("chat_type", False),
        ("location", False),
    ),
    ChosenInlineResult: (
        ("result_id", True),
        ("from_user", True),
        ("query", True),
        ("location", False),
        ("inline_message_id", False),
    ),
    CallbackQuery: (
        ("id", True),
        ("from_user", True),
        ("chat_instance", True),
        ("message", False),
        ("inline_message_id", False),
        ("data", False),
        ("game_short_name", False),
    ),
    MessageGenerationStopped: (("chat", True), ("draft_id", True), ("message_thread_id", False)),
    Gift: (
        ("id", True),
        ("sticker", True),
        ("star_count", True),
        ("upgrade_star_count", False),
        ("is_premium", False),
        ("has_colors", False),
        ("total_count", False),
        ("remaining_count", False),
        ("personal_total_count", False),
        ("personal_remaining_count", False),
        ("background", False),
        ("unique_gift_variant_count", False),
        ("publisher_chat", False),
    ),
    GiftBackground: (
        ("center_color", True),
        ("edge_color", True),
        ("text_color", True),
    ),
    Gifts: (("gifts", True),),
    UniqueGiftBackdropColors: (
        ("center_color", True),
        ("edge_color", True),
        ("symbol_color", True),
        ("text_color", True),
    ),
    UniqueGiftBackdrop: (
        ("name", True),
        ("colors", True),
        ("rarity_per_mille", True),
    ),
    UniqueGiftModel: (
        ("name", True),
        ("sticker", True),
        ("rarity_per_mille", True),
        ("rarity", False),
    ),
    UniqueGiftSymbol: (
        ("name", True),
        ("sticker", True),
        ("rarity_per_mille", True),
    ),
    UniqueGiftColors: (
        ("model_custom_emoji_id", True),
        ("symbol_custom_emoji_id", True),
        ("light_theme_main_color", True),
        ("light_theme_other_colors", True),
        ("dark_theme_main_color", True),
        ("dark_theme_other_colors", True),
    ),
    UniqueGift: (
        ("gift_id", True),
        ("base_name", True),
        ("name", True),
        ("number", True),
        ("model", True),
        ("symbol", True),
        ("backdrop", True),
        ("is_premium", False),
        ("is_burned", False),
        ("is_from_blockchain", False),
        ("colors", False),
        ("publisher_chat", False),
    ),
    UniqueGiftInfo: (
        ("gift", True),
        ("origin", True),
        ("text", False),
        ("entities", False),
        ("is_private", False),
        ("last_resale_currency", False),
        ("last_resale_amount", False),
        ("owned_gift_id", False),
        ("transfer_star_count", False),
        ("next_transfer_date", False),
    ),
}

#: Node's ``RawUpdate`` payload fields (common/models.ts), in node order.
UPDATE_PAYLOAD_FIELDS: tuple[str, ...] = (
    "message",
    "edited_message",
    "channel_post",
    "edited_channel_post",
    "business_connection",
    "business_message",
    "edited_business_message",
    "deleted_business_messages",
    "message_reaction",
    "message_reaction_count",
    "inline_query",
    "chosen_inline_result",
    "callback_query",
    "shipping_query",
    "pre_checkout_query",
    "poll",
    "poll_answer",
    "my_chat_member",
    "chat_member",
    "chat_join_request",
    "chat_boost",
    "removed_chat_boost",
    "purchased_paid_media",
    "stopped_message_generation",
)

#: node's ``from`` field is spelled ``from_user`` in Python.
FROM_USER_CLASSES: tuple[type, ...] = (
    Message,
    CallbackQuery,
    InlineQuery,
    ChosenInlineResult,
    ShippingQuery,
    PreCheckoutQuery,
    PurchasedPaidMedia,
    ChatMemberUpdated,
    ChatJoinRequest,
)

#: node marks these as required literal-``true`` fields; Python gives them a
#: ``True`` default instead of no default.
LITERAL_TRUE_FIELDS: frozenset[tuple[type, str]] = frozenset(
    {(ReplyKeyboardRemove, "remove_keyboard"), (ForceReply, "force_reply")}
)

_spec_ids = [cls.__name__ for cls in FIELD_SPECS]


def _field_map(cls: type) -> dict[str, dataclasses.Field[t.Any]]:
    return {field.name: field for field in dataclasses.fields(cls)}  # type: ignore[arg-type]


class TestFieldInventory:
    @pytest.mark.parametrize("cls", list(FIELD_SPECS), ids=_spec_ids)
    def test_field_names_match_docs_exactly(self, cls: type) -> None:
        spec = FIELD_SPECS[cls]
        actual = [field.name for field in dataclasses.fields(cls)]  # type: ignore[arg-type]
        assert set(actual) == {name for name, _ in spec}, (
            f"{cls.__name__} fields drifted from the documented field set"
        )
        assert len(actual) == len(spec)

    @pytest.mark.parametrize("cls", list(FIELD_SPECS), ids=_spec_ids)
    def test_required_vs_optional_matches_docs(self, cls: type) -> None:
        fields = _field_map(cls)
        for name, required in FIELD_SPECS[cls]:
            field = fields[name]
            has_default = field.default is not dataclasses.MISSING
            if (cls, name) in LITERAL_TRUE_FIELDS:
                assert field.default is True, f"{cls.__name__}.{name} must default to True"
                continue
            if required:
                assert not has_default, (
                    f"{cls.__name__}.{name} must be required like in the Bot API docs"
                )
            else:
                assert has_default and field.default is None, (
                    f"{cls.__name__}.{name} must default to None like the docs' optional fields"
                )

    @pytest.mark.parametrize("cls", list(FROM_USER_CLASSES), ids=lambda c: c.__name__)
    def test_from_wire_mapping(self, cls: type) -> None:
        overrides = cls._KEY_OVERRIDES  # type: ignore[attr-defined]
        assert overrides.get("from_user") == "from"
        assert "from" not in _field_map(cls)


class TestNestedTyping:
    """Spot-check that fields carry the node-mandated nested types."""

    def test_message_nested_types(self) -> None:
        hints = t.get_type_hints(Message)
        assert hints["message_id"] is int
        assert hints["chat"] is Chat
        assert hints["from_user"] == (User | None)
        assert hints["entities"] == (list[MessageEntity] | None)
        assert hints["caption_entities"] == (list[MessageEntity] | None)
        assert hints["photo"] == (list[PhotoSize] | None)
        assert hints["new_chat_members"] == (list[User] | None)
        assert hints["new_chat_photo"] == (list[PhotoSize] | None)
        assert hints["reply_to_message"] == (Message | None)
        assert hints["pinned_message"] == (Message | None)
        assert hints["external_reply"] == (ExternalReplyInfo | None)
        assert hints["quote"] == (TextQuote | None)
        assert hints["reply_to_story"] == (Story | None)
        assert hints["forward_origin"] == (
            MessageOriginUser
            | MessageOriginHiddenUser
            | MessageOriginChat
            | MessageOriginChannel
            | None
        )
        assert hints["animation"] == (Animation | None)
        assert hints["audio"] == (Audio | None)
        assert hints["document"] == (Document | None)
        assert hints["video"] == (Video | None)
        assert hints["video_note"] == (VideoNote | None)
        assert hints["voice"] == (Voice | None)
        assert hints["live_photo"] == (LivePhoto | None)
        assert hints["contact"] == (Contact | None)
        assert hints["dice"] == (Dice | None)
        assert hints["poll"] == (Poll | None)
        assert hints["venue"] == (Venue | None)
        assert hints["location"] == (Location | None)
        assert hints["reply_markup"] == (InlineKeyboardMarkup | None)
        assert hints["boost_added"] == (ChatBoostAdded | None)
        assert hints["web_app_data"] == (WebAppData | None)
        assert hints["community_chat_joined"] == (CommunityChatJoined | None)
        assert hints["receiver_user"] == (User | None)
        # Deferred node types (Sticker, Game, payments, rich) stay loose.
        for loose in (
            "sticker",
            "game",
            "invoice",
            "successful_payment",
            "refunded_payment",
            "passport_data",
            "rich_message",
            "link_preview_options",
        ):
            assert hints[loose] == (object | None)

    def test_chat_nested_types(self) -> None:
        hints = t.get_type_hints(Chat)
        assert hints["id"] == (int | str)
        assert hints["photo"] == (ChatPhoto | None)
        assert hints["birthdate"] == (Birthdate | None)
        assert hints["business_intro"] == (BusinessIntro | None)
        assert hints["business_location"] == (BusinessLocation | None)
        assert hints["business_opening_hours"] == (BusinessOpeningHours | None)
        assert hints["personal_chat"] == (Chat | None)
        assert hints["pinned_message"] == (Message | None)
        assert hints["permissions"] == (ChatPermissions | None)
        assert hints["location"] == (ChatLocation | None)

    def test_markup_grid_types(self) -> None:
        assert (
            t.get_type_hints(InlineKeyboardMarkup)["inline_keyboard"]
            == (list[list[InlineKeyboardButton]])
        )
        assert t.get_type_hints(ReplyKeyboardMarkup)["keyboard"] == (list[list[KeyboardButton]])

    def test_reaction_and_boost_unions(self) -> None:
        reaction_union = ReactionTypeEmoji | ReactionTypeCustomEmoji | ReactionTypePaid
        hints = t.get_type_hints(MessageReactionUpdated)
        assert hints["old_reaction"] == list[reaction_union]
        assert hints["new_reaction"] == list[reaction_union]
        assert t.get_type_hints(ReactionCount)["type"] == reaction_union
        boost_union = ChatBoostSourcePremium | ChatBoostSourceGiftCode | ChatBoostSourceGiveaway
        assert t.get_type_hints(ChatBoost)["source"] == boost_union
        assert t.get_type_hints(ChatBoostRemoved)["source"] == boost_union

    def test_update_payload_typing(self) -> None:
        hints = t.get_type_hints(Update)
        assert hints["update_id"] is int
        for name in (
            "message",
            "edited_message",
            "channel_post",
            "edited_channel_post",
            "business_message",
            "edited_business_message",
        ):
            assert hints[name] == (Message | None)
        assert hints["business_connection"] == (BusinessConnection | None)
        assert hints["deleted_business_messages"] == (BusinessMessagesDeleted | None)
        assert hints["message_reaction"] == (MessageReactionUpdated | None)
        assert hints["message_reaction_count"] == (MessageReactionCountUpdated | None)
        assert hints["inline_query"] == (InlineQuery | None)
        assert hints["chosen_inline_result"] == (ChosenInlineResult | None)
        assert hints["callback_query"] == (CallbackQuery | None)
        assert hints["shipping_query"] == (ShippingQuery | None)
        assert hints["pre_checkout_query"] == (PreCheckoutQuery | None)
        assert hints["poll"] == (Poll | None)
        assert hints["poll_answer"] == (PollAnswer | None)
        assert hints["my_chat_member"] == (ChatMemberUpdated | None)
        assert hints["chat_member"] == (ChatMemberUpdated | None)
        assert hints["chat_join_request"] == (ChatJoinRequest | None)
        assert hints["chat_boost"] == (ChatBoostUpdated | None)
        assert hints["removed_chat_boost"] == (ChatBoostRemoved | None)
        assert hints["purchased_paid_media"] == (PurchasedPaidMedia | None)
        assert hints["stopped_message_generation"] == (MessageGenerationStopped | None)


# ---------------------------------------------------------------------------
# Fully-populated realistic payloads for round-trip checks.
# ---------------------------------------------------------------------------

RAW_STICKER: dict[str, t.Any] = {
    "file_id": "st1",
    "file_unique_id": "stu1",
    "type": "regular",
    "width": 100,
    "height": 100,
    "is_animated": False,
    "is_video": False,
}

#: Every field the Bot API 10.3 docs list for BusinessBotRights.
RAW_BUSINESS_BOT_RIGHTS: dict[str, t.Any] = {
    "can_reply": True,
    "can_read_messages": True,
    "can_delete_sent_messages": True,
    "can_delete_all_messages": False,
    "can_edit_name": True,
    "can_edit_bio": True,
    "can_edit_profile_photo": False,
    "can_edit_username": True,
    "can_change_gift_settings": False,
    "can_view_gifts_and_stars": True,
    "can_convert_gifts_to_stars": True,
    "can_transfer_and_upgrade_gifts": False,
    "can_transfer_stars": True,
    "can_manage_stories": False,
}

RAW_USER: dict[str, t.Any] = {
    "id": 7,
    "is_bot": False,
    "first_name": "Ada",
    "last_name": "Lovelace",
    "username": "ada",
    "language_code": "en",
    "is_premium": True,
    "added_to_attachment_menu": False,
    "can_join_groups": True,
    "can_read_all_group_messages": False,
    "supports_inline_queries": True,
    "can_connect_to_business": False,
    "has_main_web_app": True,
}

RAW_CHAT: dict[str, t.Any] = {
    "id": -1001234567890,
    "type": "supergroup",
    "title": "Dev Chat",
    "username": "devchat",
    "first_name": None,
    "last_name": None,
    "is_forum": True,
    "photo": {
        "small_file_id": "ps",
        "small_file_unique_id": "psu",
        "big_file_id": "pb",
        "big_file_unique_id": "pbu",
    },
    "active_usernames": ["devchat", "dev_chat_old"],
    "birthdate": {"day": 1, "month": 2, "year": 2003},
    "business_intro": {"title": "Hi", "message": "Welcome", "sticker": {"file_id": "stk"}},
    "business_location": {"address": "1 Main St", "location": {"latitude": 1.0, "longitude": 2.0}},
    "business_opening_hours": {
        "time_zone_name": "UTC",
        "opening_hours": [{"opening_minute": 0, "closing_minute": 480}],
    },
    "personal_chat": {"id": 55, "type": "private", "first_name": "Ada"},
    "available_reactions": [{"type": "emoji", "emoji": "\U0001f44d"}],
    "accent_color_id": 3,
    "background_custom_emoji_id": "bg-emoji",
    "profile_accent_color_id": 4,
    "profile_background_custom_emoji_id": "prof-emoji",
    "emoji_status_custom_emoji_id": "status-emoji",
    "emoji_status_expiration_date": 1_800_000_000,
    "bio": "Engineer",
    "has_private_forwards": True,
    "has_restricted_voice_and_video_messages": False,
    "join_to_send_messages": True,
    "join_by_request": False,
    "description": "A dev chat",
    "invite_link": "https://t.me/+abc",
    "pinned_message": {
        "message_id": 10,
        "date": 1_700_000_000,
        "chat": {"id": -1001234567890, "type": "supergroup", "title": "Dev Chat"},
        "text": "rules",
    },
    "permissions": {"can_send_messages": True, "can_send_polls": False},
    "slow_mode_delay": 30,
    "unrestrict_boost_count": 5,
    "message_auto_delete_time": 3600,
    "has_aggressive_anti_spam_enabled": True,
    "has_hidden_members": False,
    "has_protected_content": True,
    "has_visible_history": True,
    "sticker_set_name": "DevStickers",
    "can_set_sticker_set": True,
    "custom_emoji_sticker_set_name": "DevEmoji",
    "linked_chat_id": -1009999,
    "location": {"location": {"latitude": 10.5, "longitude": 20.5}, "address": "HQ"},
}

RAW_MESSAGE: dict[str, t.Any] = {
    "message_id": 42,
    "message_thread_id": 3,
    "from": RAW_USER,
    "sender_chat": {"id": -100555, "type": "channel", "title": "Chan"},
    "sender_boost_count": 2,
    "sender_business_bot": {"id": 99, "is_bot": True, "first_name": "BizBot"},
    "date": 1_700_000_000,
    "business_connection_id": "biz-conn-1",
    "chat": RAW_CHAT,
    "forward_origin": {
        "type": "channel",
        "date": 1_699_999_000,
        "chat": {"id": -100777, "type": "channel", "title": "Origin"},
        "message_id": 77,
        "author_signature": "sig",
    },
    "is_topic_message": True,
    "is_automatic_forward": False,
    "reply_to_message": {
        "message_id": 41,
        "date": 1_699_999_500,
        "chat": {"id": -1001234567890, "type": "supergroup", "title": "Dev Chat"},
        "text": "original",
    },
    "external_reply": {
        "origin": {
            "type": "user",
            "date": 1_699_999_000,
            "sender_user": {"id": 8, "is_bot": False, "first_name": "Bob"},
        },
        "chat": {"id": -100777, "type": "channel", "title": "Origin"},
        "message_id": 12,
        "text": None,
        "photo": [{"file_id": "p1", "file_unique_id": "u1", "width": 90, "height": 90}],
    },
    "quote": {
        "text": "quoted",
        "entities": [{"type": "bold", "offset": 0, "length": 6}],
        "position": 0,
        "is_manual": True,
    },
    "reply_to_story": {"chat": {"id": -100777, "type": "channel", "title": "Origin"}, "id": 9},
    "via_bot": {"id": 100, "is_bot": True, "first_name": "InlineBot", "username": "inlinebot"},
    "edit_date": 1_700_000_500,
    "has_protected_content": True,
    "is_from_offline": False,
    "media_group_id": "mg-1",
    "author_signature": "author",
    "text": "/start hello",
    "entities": [
        {"type": "bot_command", "offset": 0, "length": 6},
        {
            "type": "text_mention",
            "offset": 7,
            "length": 5,
            "user": {"id": 8, "is_bot": False, "first_name": "Bob"},
        },
        {"type": "pre", "offset": 0, "length": 1, "language": "python"},
        {"type": "custom_emoji", "offset": 0, "length": 1, "custom_emoji_id": "emoji-1"},
        {"type": "text_link", "offset": 0, "length": 4, "url": "https://example.com"},
    ],
    "link_preview_options": {"is_disabled": True},
    "animation": {
        "file_id": "anim",
        "file_unique_id": "animu",
        "width": 320,
        "height": 240,
        "duration": 5,
        "thumbnail": {"file_id": "t", "file_unique_id": "tu", "width": 90, "height": 90},
        "file_name": "a.gif",
        "mime_type": "image/gif",
        "file_size": 1000,
    },
    "audio": {
        "file_id": "aud",
        "file_unique_id": "audu",
        "duration": 190,
        "performer": "Band",
        "title": "Song",
        "file_name": "song.mp3",
        "mime_type": "audio/mpeg",
        "file_size": 3200,
        "thumbnail": {"file_id": "cover", "file_unique_id": "coveru", "width": 100, "height": 100},
    },
    "document": {
        "file_id": "doc",
        "file_unique_id": "docu",
        "thumbnail": {"file_id": "dt", "file_unique_id": "dtu", "width": 90, "height": 90},
        "file_name": "file.pdf",
        "mime_type": "application/pdf",
        "file_size": 2048,
    },
    "photo": [
        {"file_id": "p1", "file_unique_id": "p1u", "width": 90, "height": 90, "file_size": 900},
        {"file_id": "p2", "file_unique_id": "p2u", "width": 800, "height": 600, "file_size": 90000},
    ],
    "sticker": {
        "file_id": "stk",
        "file_unique_id": "stku",
        "type": "regular",
        "width": 512,
        "height": 512,
        "is_animated": False,
        "is_video": False,
    },
    "story": {"chat": {"id": -100777, "type": "channel", "title": "Origin"}, "id": 4},
    "video": {
        "file_id": "vid",
        "file_unique_id": "vidu",
        "width": 1280,
        "height": 720,
        "duration": 60,
        "thumbnail": {"file_id": "vt", "file_unique_id": "vtu", "width": 90, "height": 90},
        "file_name": "v.mp4",
        "mime_type": "video/mp4",
        "file_size": 500000,
    },
    "video_note": {
        "file_id": "vnote",
        "file_unique_id": "vnoteu",
        "length": 240,
        "duration": 10,
        "thumbnail": {"file_id": "vnt", "file_unique_id": "vntu", "width": 90, "height": 90},
        "file_size": 12345,
    },
    "voice": {
        "file_id": "voi",
        "file_unique_id": "voiu",
        "duration": 7,
        "mime_type": "audio/ogg",
        "file_size": 800,
    },
    "caption": "a *caption*",
    "caption_entities": [{"type": "bold", "offset": 2, "length": 8}],
    "show_caption_above_media": True,
    "has_media_spoiler": False,
    "contact": {
        "phone_number": "+8499999999",
        "first_name": "Lin",
        "last_name": "Nguyen",
        "user_id": 55,
        "vcard": "BEGIN:VCARD",
    },
    "dice": {"emoji": "\U0001f3b2", "value": 6},
    "game": {
        "title": "Game",
        "description": "Fun",
        "photo": [{"file_id": "gp", "file_unique_id": "gpu", "width": 64, "height": 64}],
    },
    "poll": {
        "id": "poll-1",
        "question": "Lunch?",
        "options": [
            {
                "persistent_id": "opt-a",
                "text": "Pho",
                "voter_count": 3,
                "text_entities": [{"type": "bold", "offset": 0, "length": 3}],
            },
            {"persistent_id": "opt-b", "text": "Banh mi", "voter_count": 1},
        ],
        "total_voter_count": 4,
        "is_closed": False,
        "is_anonymous": True,
        "type": "quiz",
        "allows_multiple_answers": False,
        "correct_option_id": 0,
        "explanation": "Pho wins",
        "explanation_entities": [{"type": "italic", "offset": 0, "length": 3}],
        "open_period": 600,
        "close_date": 1_700_003_600,
    },
    "venue": {
        "location": {
            "latitude": 21.0,
            "longitude": 105.8,
            "horizontal_accuracy": 5.0,
            "live_period": 60,
            "heading": 90,
            "proximity_alert_radius": 100,
        },
        "title": "Cafe",
        "address": "12 Lane",
        "foursquare_id": "fsq",
        "foursquare_type": "food",
        "google_place_id": "gpi",
        "google_place_type": "cafe",
    },
    "location": {"latitude": 21.0, "longitude": 105.8},
    "new_chat_members": [{"id": 9, "is_bot": False, "first_name": "New"}],
    "left_chat_member": {"id": 10, "is_bot": False, "first_name": "Gone"},
    "new_chat_title": "New Title",
    "new_chat_photo": [{"file_id": "ncp", "file_unique_id": "ncpu", "width": 160, "height": 160}],
    "delete_chat_photo": False,
    "group_chat_created": True,
    "supergroup_chat_created": False,
    "channel_chat_created": False,
    "message_auto_delete_timer_changed": {"message_auto_delete_time": 3600},
    "migrate_to_chat_id": -100123,
    "migrate_from_chat_id": -456,
    "pinned_message": {
        "message_id": 40,
        "date": 1_699_999_000,
        "chat": {"id": -1001234567890, "type": "supergroup", "title": "Dev Chat"},
        "text": "pinned",
    },
    "invoice": {
        "title": "Item",
        "description": "Desc",
        "start_parameter": "start",
        "currency": "USD",
        "total_amount": 100,
    },
    "successful_payment": {
        "currency": "USD",
        "total_amount": 100,
        "invoice_payload": "pl",
        "telegram_payment_charge_id": "tg",
        "provider_payment_charge_id": "pr",
    },
    "refunded_payment": {
        "currency": "USD",
        "total_amount": 100,
        "invoice_payload": "pl",
        "telegram_payment_charge_id": "tg",
    },
    "users_shared": {"request_id": 1, "users": [{"id": 5}]},
    "chat_shared": {"request_id": 2, "chat_id": -1001},
    "connected_website": "https://example.com",
    "write_access_allowed": {"from_request": True},
    "passport_data": {"data": [], "credentials": {"data": "d", "hash": "h", "secret": "s"}},
    "proximity_alert_triggered": {"traveler": {"id": 1}, "watcher": {"id": 2}, "distance": 5},
    "boost_added": {"boost_count": 3},
    "chat_background_set": {"type": "fill", "fill": {"color": 1}},
    "forum_topic_created": {"name": "Topic", "icon_color": 1},
    "forum_topic_edited": {"name": "Topic2"},
    "forum_topic_closed": {},
    "forum_topic_reopened": {},
    "general_forum_topic_hidden": {},
    "general_forum_topic_unhidden": {},
    "giveaway_created": {"prize_star_count": 100},
    "giveaway": {"chats": [{"id": -1001}], "winners_selection_date": 1},
    "giveaway_winners": {"chat": {"id": -1001}, "winners": [{"id": 1}]},
    "giveaway_completed": {"winner_count": 1},
    "video_chat_scheduled": {"start_date": 1},
    "video_chat_started": {},
    "video_chat_ended": {"duration": 60},
    "video_chat_participants_invited": {"users": [{"id": 1}]},
    "web_app_data": {"data": '{"k":1}', "button_text": "Open"},
    "reply_markup": {
        "inline_keyboard": [
            [
                {
                    "text": "Click",
                    "icon_custom_emoji_id": "icon-1",
                    "style": "primary",
                    "url": "https://example.com",
                    "callback_data": "cb",
                    "web_app": {"url": "https://webapp.example.com"},
                    "login_url": {
                        "url": "https://login.example.com",
                        "forward_text": "Go",
                        "bot_username": "authbot",
                        "request_write_access": True,
                    },
                    "switch_inline_query": "siq",
                    "switch_inline_query_current_chat": "siqcc",
                    "switch_inline_query_chosen_chat": {
                        "query": "q",
                        "allow_user_chats": True,
                        "allow_bot_chats": False,
                        "allow_group_chats": True,
                        "allow_channel_chats": False,
                    },
                    "copy_text": {"text": "copy me"},
                    "callback_game": {},
                    "pay": False,
                    "disabled": {},
                }
            ]
        ],
        "force_reply": True,
    },
    "community_chat_joined": {"community": {"id": 77, "name": "Community"}},
    "receiver_user": {"id": 66, "is_bot": False, "first_name": "Recv"},
    "ephemeral_message_id": 900,
    "rich_message": {"blocks": []},
    "live_photo": {
        "file_id": "lp",
        "file_unique_id": "lpu",
        "width": 1080,
        "height": 1920,
        "photo": [{"file_id": "lpp", "file_unique_id": "lppu", "width": 540, "height": 960}],
        "video": {
            "file_id": "lpv",
            "file_unique_id": "lpvu",
            "width": 1080,
            "height": 1920,
            "duration": 3,
        },
    },
}

# RAW_CHAT contains JSON nulls for first_name/last_name only to prove null
# hydration; strip them for the round-trip baseline since to_dict omits None.
RAW_CHAT_POPULATED: dict[str, t.Any] = {k: v for k, v in RAW_CHAT.items() if v is not None}
RAW_MESSAGE_POPULATED: dict[str, t.Any] = {
    **RAW_MESSAGE,
    "chat": RAW_CHAT_POPULATED,
    "external_reply": {
        k: v
        for k, v in t.cast("dict[str, t.Any]", RAW_MESSAGE["external_reply"]).items()
        if v is not None
    },
}


class TestRoundTrips:
    def test_user_full(self) -> None:
        assert User.from_dict(RAW_USER).to_dict() == RAW_USER

    def test_chat_full(self) -> None:
        chat = Chat.from_dict(RAW_CHAT_POPULATED)
        assert isinstance(chat.photo, ChatPhoto)
        assert isinstance(chat.pinned_message, Message)
        assert isinstance(chat.personal_chat, Chat)
        assert isinstance(chat.permissions, ChatPermissions)
        assert isinstance(chat.location, ChatLocation)
        assert isinstance(chat.birthdate, Birthdate)
        assert isinstance(chat.business_opening_hours, BusinessOpeningHours)
        assert chat.to_dict() == RAW_CHAT_POPULATED

    def test_message_full(self) -> None:
        message = Message.from_dict(RAW_MESSAGE_POPULATED)
        assert isinstance(message.forward_origin, MessageOriginChannel)
        assert isinstance(message.external_reply, ExternalReplyInfo)
        assert isinstance(message.external_reply.origin, MessageOriginUser)
        assert isinstance(message.quote, TextQuote)
        assert isinstance(message.reply_to_story, Story)
        assert isinstance(message.reply_markup, InlineKeyboardMarkup)
        button = message.reply_markup.inline_keyboard[0][0]
        assert isinstance(button, InlineKeyboardButton)
        assert isinstance(button.login_url, LoginUrl)
        assert isinstance(button.switch_inline_query_chosen_chat, SwitchInlineQueryChosenChat)
        assert isinstance(button.copy_text, CopyTextButton)
        assert isinstance(message.poll, Poll)
        assert isinstance(message.poll.options[0], PollOption)
        assert isinstance(message.venue, Venue)
        assert isinstance(message.live_photo, LivePhoto)
        assert isinstance(message.boost_added, ChatBoostAdded)
        assert isinstance(message.web_app_data, WebAppData)
        assert isinstance(message.community_chat_joined, CommunityChatJoined)
        assert isinstance(message.sticker, dict)  # deferred node type stays raw
        assert message.to_dict() == RAW_MESSAGE_POPULATED

    def test_message_requires_chat(self) -> None:
        with pytest.raises(TypeParseError):
            Message.from_dict({"message_id": 1, "date": 0})

    @pytest.mark.parametrize(
        ("origin_raw", "origin_cls"),
        [
            ({"type": "user", "date": 1, "sender_user": RAW_USER}, MessageOriginUser),
            (
                {"type": "hidden_user", "date": 1, "sender_user_name": "ghost"},
                MessageOriginHiddenUser,
            ),
            (
                {
                    "type": "chat",
                    "date": 1,
                    "sender_chat": {"id": -1, "type": "group"},
                    "author_signature": "s",
                },
                MessageOriginChat,
            ),
            (
                {
                    "type": "channel",
                    "date": 1,
                    "chat": {"id": -1, "type": "channel"},
                    "message_id": 2,
                },
                MessageOriginChannel,
            ),
        ],
        ids=["user", "hidden_user", "chat", "channel"],
    )
    def test_forward_origin_variants(self, origin_raw: dict[str, t.Any], origin_cls: type) -> None:
        message = Message.from_dict(
            {
                "message_id": 1,
                "date": 0,
                "chat": {"id": 1, "type": "private"},
                "forward_origin": origin_raw,
            }
        )
        assert isinstance(message.forward_origin, origin_cls)
        assert message.to_dict()["forward_origin"] == origin_raw

    def test_unknown_forward_origin_passes_through_raw(self) -> None:
        raw = {"type": "future_origin", "date": 1}
        message = Message.from_dict(
            {
                "message_id": 1,
                "date": 0,
                "chat": {"id": 1, "type": "private"},
                "forward_origin": raw,
            }
        )
        assert message.forward_origin == raw
        assert message.to_dict()["forward_origin"] == raw

    def test_media_types_full(self) -> None:
        for cls, raw in [
            (PhotoSize, RAW_MESSAGE_POPULATED["photo"][0]),
            (Animation, RAW_MESSAGE_POPULATED["animation"]),
            (Audio, RAW_MESSAGE_POPULATED["audio"]),
            (Document, RAW_MESSAGE_POPULATED["document"]),
            (Video, RAW_MESSAGE_POPULATED["video"]),
            (VideoNote, RAW_MESSAGE_POPULATED["video_note"]),
            (Voice, RAW_MESSAGE_POPULATED["voice"]),
            (LivePhoto, RAW_MESSAGE_POPULATED["live_photo"]),
        ]:
            assert cls.from_dict(raw).to_dict() == raw, cls.__name__

    def test_keyboards_full(self) -> None:
        assert (
            InlineKeyboardMarkup.from_dict(RAW_MESSAGE_POPULATED["reply_markup"]).to_dict()
            == RAW_MESSAGE_POPULATED["reply_markup"]
        )
        reply_markup = {
            "keyboard": [
                [
                    {"text": "Share contact", "request_contact": True},
                    {"text": "Loc", "request_location": True},
                    {"text": "Poll", "request_poll": {"type": "quiz"}},
                    {"text": "App", "web_app": {"url": "https://wa.example.com"}},
                    {
                        "text": "Users",
                        "request_users": {
                            "request_id": 1,
                            "user_is_bot": False,
                            "user_is_premium": True,
                            "max_quantity": 2,
                            "request_name": True,
                            "request_username": True,
                            "request_photo": False,
                        },
                    },
                    {
                        "text": "Chat",
                        "request_chat": {
                            "request_id": 2,
                            "chat_is_channel": False,
                            "chat_is_forum": True,
                            "chat_has_username": True,
                            "chat_is_created": False,
                            "user_administrator_rights": {},
                            "bot_administrator_rights": {},
                            "bot_is_member": True,
                            "request_title": True,
                            "request_username": True,
                            "request_photo": True,
                        },
                    },
                ]
            ],
            "is_persistent": True,
            "resize_keyboard": True,
            "one_time_keyboard": False,
            "input_field_placeholder": "type...",
            "selective": True,
            "force_reply": True,
        }
        parsed = ReplyKeyboardMarkup.from_dict(reply_markup)
        assert isinstance(parsed.keyboard[0][4].request_users, KeyboardButtonRequestUsers)
        assert isinstance(parsed.keyboard[0][5].request_chat, KeyboardButtonRequestChat)
        assert parsed.to_dict() == reply_markup
        assert ReplyKeyboardRemove.from_dict(
            {"remove_keyboard": True, "selective": True}
        ).to_dict() == {"remove_keyboard": True, "selective": True}
        assert ReplyKeyboardRemove().remove_keyboard is True
        assert ForceReply.from_dict(
            {"force_reply": True, "input_field_placeholder": "ph", "selective": False}
        ).to_dict() == {"force_reply": True, "input_field_placeholder": "ph", "selective": False}

    def test_chat_member_variants(self) -> None:
        member_raw = {
            "status": "administrator",
            "user": RAW_USER,
            "custom_title": "Mod",
            "is_anonymous": False,
            "can_be_edited": True,
            "can_manage_chat": True,
            "can_delete_messages": True,
            "can_manage_video_chats": True,
            "can_restrict_members": True,
            "can_promote_members": False,
            "can_change_info": True,
            "can_invite_users": True,
            "can_post_stories": True,
            "can_edit_stories": True,
            "can_delete_stories": True,
            "can_post_messages": False,
            "can_edit_messages": False,
            "can_pin_messages": True,
            "can_manage_topics": True,
            "can_send_welcome_messages": True,
            "until_date": 1_800_000_000,
        }
        member = ChatMember.from_dict(member_raw)
        assert isinstance(member.user, User)
        assert member.to_dict() == member_raw
        admin_raw = {
            "status": "administrator",
            "user": RAW_USER,
            "can_be_edited": True,
            "is_anonymous": False,
            "can_manage_chat": True,
            "can_delete_messages": True,
            "can_manage_video_chats": True,
            "can_restrict_members": True,
            "can_promote_members": True,
            "can_change_info": True,
            "can_invite_users": True,
            "can_post_stories": True,
            "can_edit_stories": False,
            "can_delete_stories": False,
            "can_post_messages": True,
            "can_edit_messages": False,
            "can_pin_messages": True,
            "can_manage_topics": False,
            "can_manage_direct_messages": True,
            "can_manage_tags": False,
            "can_send_welcome_messages": True,
            "custom_title": "Admin",
        }
        admin = ChatMemberAdministrator.from_dict(admin_raw)
        assert admin.to_dict() == admin_raw

    def test_chat_member_updated_full(self) -> None:
        raw = {
            "chat": {"id": -100, "type": "supergroup", "title": "Dev"},
            "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "date": 1_700_000_000,
            "old_chat_member": {
                "status": "left",
                "user": {"id": 8, "is_bot": False, "first_name": "Bob"},
            },
            "new_chat_member": {
                "status": "member",
                "user": {"id": 8, "is_bot": False, "first_name": "Bob"},
            },
            "invite_link": {
                "invite_link": "https://t.me/+abc",
                "creator": {"id": 7, "is_bot": False, "first_name": "Ada"},
                "creates_join_request": True,
                "is_primary": False,
                "is_revoked": False,
                "name": "join",
                "expire_date": 1_800_000_000,
                "member_limit": 10,
                "pending_join_request_count": 2,
                "subscription_period": 2592000,
                "subscription_price": 25,
            },
            "via_join_request": True,
            "via_chat_folder_invite_link": False,
        }
        updated = ChatMemberUpdated.from_dict(raw)
        assert isinstance(updated.invite_link, ChatInviteLink)
        assert updated.from_user.id == 7
        assert updated.to_dict() == raw

    def test_chat_join_request_full(self) -> None:
        raw = {
            "chat": {"id": -100, "type": "supergroup", "title": "Dev"},
            "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "user_chat_id": 7,
            "date": 1_700_000_000,
            "bio": "let me in",
            "invite_link": {
                "invite_link": "https://t.me/+abc",
                "creator": {"id": 1, "is_bot": False, "first_name": "Owner"},
                "creates_join_request": True,
                "is_primary": True,
                "is_revoked": False,
            },
        }
        request = ChatJoinRequest.from_dict(raw)
        assert request.from_user.id == 7
        assert isinstance(request.invite_link, ChatInviteLink)
        assert request.to_dict() == raw

    def test_poll_answer_full(self) -> None:
        raw = {
            "poll_id": "poll-1",
            "voter_chat": {"id": -100, "type": "group", "title": "Voters"},
            "user": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "option_ids": [0, 2],
        }
        assert PollAnswer.from_dict(raw).to_dict() == raw

    def test_reaction_updates(self) -> None:
        reaction_raw = {
            "chat": {"id": -100, "type": "supergroup"},
            "message_id": 5,
            "user": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "actor_chat": {"id": -200, "type": "channel"},
            "date": 1_700_000_000,
            "old_reaction": [{"type": "emoji", "emoji": "\U0001f44d"}],
            "new_reaction": [{"type": "custom_emoji", "custom_emoji_id": "ce-1"}, {"type": "paid"}],
        }
        updated = MessageReactionUpdated.from_dict(reaction_raw)
        assert isinstance(updated.old_reaction[0], ReactionTypeEmoji)
        assert isinstance(updated.new_reaction[0], ReactionTypeCustomEmoji)
        assert isinstance(updated.new_reaction[1], ReactionTypePaid)
        assert updated.to_dict() == reaction_raw
        count_raw = {
            "chat": {"id": -100, "type": "supergroup"},
            "message_id": 5,
            "date": 1_700_000_000,
            "reactions": [
                {"type": {"type": "emoji", "emoji": "\U0001f525"}, "total_count": 3},
            ],
        }
        counted = MessageReactionCountUpdated.from_dict(count_raw)
        assert isinstance(counted.reactions[0], ReactionCount)
        assert isinstance(counted.reactions[0].type, ReactionTypeEmoji)
        assert counted.to_dict() == count_raw

    def test_business_types(self) -> None:
        connection_raw = {
            "id": "biz-1",
            "user": RAW_USER,
            "user_chat_id": 7,
            "date": 1_700_000_000,
            "rights": dict(RAW_BUSINESS_BOT_RIGHTS),
            "is_enabled": True,
        }
        connection = BusinessConnection.from_dict(connection_raw)
        assert connection.to_dict() == connection_raw
        assert isinstance(connection.rights, BusinessBotRights)
        assert connection.rights is not None and connection.rights.can_reply is True
        deleted_raw = {
            "business_connection_id": "biz-1",
            "chat": {"id": 7, "type": "private"},
            "message_ids": [1, 2, 3],
        }
        assert BusinessMessagesDeleted.from_dict(deleted_raw).to_dict() == deleted_raw

    def test_boost_types(self) -> None:
        updated_raw = {
            "chat": {"id": -100, "type": "supergroup"},
            "boost": {
                "boost_id": "b-1",
                "add_date": 1_700_000_000,
                "expiration_date": 1_800_000_000,
                "source": {
                    "source": "giveaway",
                    "giveaway_message_id": 12,
                    "user": RAW_USER,
                    "prize_star_count": 5,
                    "is_unclaimed": False,
                },
            },
        }
        updated = ChatBoostUpdated.from_dict(updated_raw)
        assert isinstance(updated.boost.source, ChatBoostSourceGiveaway)
        assert updated.to_dict() == updated_raw
        removed_raw = {
            "chat": {"id": -100, "type": "supergroup"},
            "boost_id": "b-1",
            "remove_date": 1_800_000_000,
            "source": {"source": "premium", "user": RAW_USER},
        }
        removed = ChatBoostRemoved.from_dict(removed_raw)
        assert isinstance(removed.source, ChatBoostSourcePremium)
        assert removed.to_dict() == removed_raw
        gift_raw = {"source": "gift_code", "user": RAW_USER}
        assert isinstance(ChatBoostSourceGiftCode.from_dict(gift_raw).user, User)

    def test_payment_types(self) -> None:
        shipping_raw = {
            "id": "sq-1",
            "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "invoice_payload": "order-1",
            "shipping_address": {
                "country_code": "VN",
                "state": "HN",
                "city": "Hanoi",
                "street_line1": "1 Lane",
                "street_line2": "Apt 2",
                "post_code": "10000",
            },
        }
        shipping = ShippingQuery.from_dict(shipping_raw)
        assert isinstance(shipping.shipping_address, ShippingAddress)
        assert shipping.from_user.id == 7
        assert shipping.to_dict() == shipping_raw
        pre_checkout_raw = {
            "id": "pc-1",
            "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "currency": "USD",
            "total_amount": 100,
            "invoice_payload": "order-1",
            "shipping_option_id": "dhl",
            "order_info": {
                "name": "Ada",
                "phone_number": "+8499",
                "email": "ada@example.com",
                "shipping_address": {
                    "country_code": "VN",
                    "city": "Hanoi",
                    "street_line1": "1 Lane",
                    "post_code": "10000",
                },
            },
        }
        pre_checkout = PreCheckoutQuery.from_dict(pre_checkout_raw)
        assert pre_checkout.order_info is not None
        assert isinstance(pre_checkout.order_info.shipping_address, ShippingAddress)
        assert pre_checkout.to_dict() == pre_checkout_raw
        paid_raw = {
            "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "paid_media_payload": "payload",
        }
        assert PurchasedPaidMedia.from_dict(paid_raw).to_dict() == paid_raw

    def test_inline_types(self) -> None:
        inline_raw = {
            "id": "iq-1",
            "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "query": "search",
            "offset": "",
            "chat_type": "sender",
            "location": {"latitude": 21.0, "longitude": 105.8},
        }
        inline = InlineQuery.from_dict(inline_raw)
        assert isinstance(inline.location, Location)
        assert inline.to_dict() == inline_raw
        chosen_raw = {
            "result_id": "r-1",
            "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "location": {"latitude": 21.0, "longitude": 105.8},
            "inline_message_id": "im-1",
            "query": "search",
        }
        assert ChosenInlineResult.from_dict(chosen_raw).to_dict() == chosen_raw

    def test_callback_query_full(self) -> None:
        raw = {
            "id": "cb-1",
            "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "message": {
                "message_id": 5,
                "date": 1_700_000_000,
                "chat": {"id": 100, "type": "private"},
            },
            "inline_message_id": "im-1",
            "chat_instance": "ci",
            "data": "press",
            "game_short_name": "game1",
        }
        assert CallbackQuery.from_dict(raw).to_dict() == raw

    def test_standalone_message_extras(self) -> None:
        story_raw = {"chat": {"id": -100, "type": "channel"}, "id": 4}
        assert Story.from_dict(story_raw).to_dict() == story_raw
        assert ChatBoostAdded.from_dict({"boost_count": 2}).to_dict() == {"boost_count": 2}
        assert WebAppData.from_dict({"data": "{}", "button_text": "Open"}).to_dict() == {
            "data": "{}",
            "button_text": "Open",
        }
        quote_raw = {
            "text": "q",
            "entities": [{"type": "bold", "offset": 0, "length": 1}],
            "position": 3,
            "is_manual": False,
        }
        assert TextQuote.from_dict(quote_raw).to_dict() == quote_raw
        for cls, raw in [
            (
                Location,
                {
                    "latitude": 1.0,
                    "longitude": 2.0,
                    "horizontal_accuracy": 0.5,
                    "live_period": 60,
                    "heading": 90,
                    "proximity_alert_radius": 10,
                },
            ),
            (Contact, RAW_MESSAGE_POPULATED["contact"]),
            (Dice, RAW_MESSAGE_POPULATED["dice"]),
            (MessageEntity, {"type": "mention", "offset": 0, "length": 4}),
            (Community, {"id": 1, "name": "C"}),
            (CommunityChatJoined, {"community": {"id": 1, "name": "C"}}),
            (ChatLocation, {"location": {"latitude": 1.0, "longitude": 2.0}, "address": "A"}),
            (BusinessIntro, {"title": "T", "message": "M", "sticker": {"file_id": "s"}}),
            (BusinessLocation, {"address": "A", "location": {"latitude": 1.0, "longitude": 2.0}}),
            (
                BusinessOpeningHours,
                {
                    "time_zone_name": "UTC",
                    "opening_hours": [{"opening_minute": 0, "closing_minute": 100}],
                },
            ),
        ]:
            assert cls.from_dict(raw).to_dict() == raw, cls.__name__
        assert ChatPermissions().to_dict() == {}
        assert KeyboardButtonPollType().to_dict() == {}


UPDATE_PAYLOAD_SAMPLES: dict[str, tuple[dict[str, t.Any], type]] = {
    "message": (RAW_MESSAGE_POPULATED, Message),
    "edited_message": (
        {
            "message_id": 1,
            "date": 1,
            "chat": {"id": 1, "type": "private"},
            "edit_date": 2,
            "text": "edited",
        },
        Message,
    ),
    "channel_post": (
        {"message_id": 2, "date": 1, "chat": {"id": -100, "type": "channel"}, "text": "post"},
        Message,
    ),
    "edited_channel_post": (
        {
            "message_id": 2,
            "date": 1,
            "chat": {"id": -100, "type": "channel"},
            "edit_date": 3,
            "text": "post v2",
        },
        Message,
    ),
    "business_connection": (
        {
            "id": "b",
            "user": RAW_USER,
            "user_chat_id": 7,
            "date": 1,
            "rights": dict(RAW_BUSINESS_BOT_RIGHTS),
            "is_enabled": True,
        },
        BusinessConnection,
    ),
    "business_message": (
        {
            "message_id": 3,
            "date": 1,
            "business_connection_id": "b",
            "chat": {"id": 7, "type": "private"},
            "text": "biz",
        },
        Message,
    ),
    "edited_business_message": (
        {
            "message_id": 3,
            "date": 1,
            "business_connection_id": "b",
            "chat": {"id": 7, "type": "private"},
            "edit_date": 2,
            "text": "biz v2",
        },
        Message,
    ),
    "deleted_business_messages": (
        {
            "business_connection_id": "b",
            "chat": {"id": 7, "type": "private"},
            "message_ids": [1, 2],
        },
        BusinessMessagesDeleted,
    ),
    "message_reaction": (
        {
            "chat": {"id": -100, "type": "supergroup"},
            "message_id": 1,
            "date": 1,
            "old_reaction": [],
            "new_reaction": [{"type": "emoji", "emoji": "\U0001f44d"}],
        },
        MessageReactionUpdated,
    ),
    "message_reaction_count": (
        {
            "chat": {"id": -100, "type": "supergroup"},
            "message_id": 1,
            "date": 1,
            "reactions": [{"type": {"type": "paid"}, "total_count": 2}],
        },
        MessageReactionCountUpdated,
    ),
    "inline_query": (
        {"id": "iq", "from": RAW_USER, "query": "q", "offset": ""},
        InlineQuery,
    ),
    "chosen_inline_result": (
        {"result_id": "r", "from": RAW_USER, "query": "q"},
        ChosenInlineResult,
    ),
    "callback_query": (
        {"id": "cb", "from": RAW_USER, "chat_instance": "ci", "data": "d"},
        CallbackQuery,
    ),
    "shipping_query": (
        {
            "id": "sq",
            "from": RAW_USER,
            "invoice_payload": "p",
            "shipping_address": {
                "country_code": "VN",
                "city": "Hanoi",
                "street_line1": "1",
                "post_code": "10000",
            },
        },
        ShippingQuery,
    ),
    "pre_checkout_query": (
        {
            "id": "pc",
            "from": RAW_USER,
            "currency": "USD",
            "total_amount": 1,
            "invoice_payload": "p",
        },
        PreCheckoutQuery,
    ),
    "poll": (
        {
            "id": "p",
            "question": "q",
            "options": [{"text": "a", "voter_count": 0}],
            "total_voter_count": 0,
            "is_closed": False,
            "is_anonymous": True,
            "type": "regular",
            "allows_multiple_answers": False,
        },
        Poll,
    ),
    "poll_answer": ({"poll_id": "p", "option_ids": [0]}, PollAnswer),
    "my_chat_member": (
        {
            "chat": {"id": -100, "type": "supergroup"},
            "from": RAW_USER,
            "date": 1,
            "old_chat_member": {"status": "member", "user": RAW_USER},
            "new_chat_member": {"status": "left", "user": RAW_USER},
        },
        ChatMemberUpdated,
    ),
    "chat_member": (
        {
            "chat": {"id": -100, "type": "supergroup"},
            "from": RAW_USER,
            "date": 1,
            "old_chat_member": {"status": "restricted", "user": RAW_USER, "until_date": 9},
            "new_chat_member": {"status": "member", "user": RAW_USER},
        },
        ChatMemberUpdated,
    ),
    "chat_join_request": (
        {
            "chat": {"id": -100, "type": "supergroup"},
            "from": RAW_USER,
            "user_chat_id": 7,
            "date": 1,
        },
        ChatJoinRequest,
    ),
    "chat_boost": (
        {
            "chat": {"id": -100, "type": "supergroup"},
            "boost": {
                "boost_id": "b",
                "add_date": 1,
                "expiration_date": 2,
                "source": {"source": "premium", "user": RAW_USER},
            },
        },
        ChatBoostUpdated,
    ),
    "removed_chat_boost": (
        {
            "chat": {"id": -100, "type": "supergroup"},
            "boost_id": "b",
            "remove_date": 2,
            "source": {"source": "gift_code", "user": RAW_USER},
        },
        ChatBoostRemoved,
    ),
    "purchased_paid_media": ({"from": RAW_USER, "paid_media_payload": "p"}, PurchasedPaidMedia),
    "stopped_message_generation": (
        {"chat": {"id": -100, "type": "supergroup"}, "message_thread_id": 4, "draft_id": 9},
        MessageGenerationStopped,
    ),
}


class TestUpdateFidelity:
    def test_update_payload_field_set_matches_node(self) -> None:
        fields = {field.name for field in dataclasses.fields(Update)}
        assert fields == {"update_id", *UPDATE_PAYLOAD_FIELDS}

    @pytest.mark.parametrize("name", UPDATE_PAYLOAD_FIELDS)
    def test_every_payload_round_trips(self, name: str) -> None:
        assert name in UPDATE_PAYLOAD_SAMPLES, f"missing sample for payload {name}"
        sample, expected_cls = UPDATE_PAYLOAD_SAMPLES[name]
        data = {"update_id": 1, name: sample}
        update = Update.from_dict(data)
        payload = getattr(update, name)
        assert isinstance(payload, expected_cls)
        assert update.to_dict() == data

    def test_exactly_one_payload_rule_with_full_field_list(self) -> None:
        with pytest.raises(ValueError, match="exactly one"):
            Update(update_id=1)
        message = Message(message_id=1, date=0, chat=Chat(id=1, type="private"))
        poll = Poll(
            id="p",
            question="q",
            options=[PollOption(text="a", voter_count=0)],
            total_voter_count=0,
            is_closed=False,
            is_anonymous=True,
            type="regular",
            allows_multiple_answers=False,
        )
        with pytest.raises(ValueError, match="exactly one"):
            Update(update_id=1, message=message, poll=poll)
        assert Update(update_id=1, poll=poll).poll is poll
        assert Update(update_id=1, message=message).message is message

    def test_effective_accessors_still_work(self) -> None:
        update = Update.from_dict(
            {
                "update_id": 1,
                "message": {
                    "message_id": 1,
                    "date": 0,
                    "chat": {"id": 100, "type": "private"},
                    "from": {"id": 7, "is_bot": False, "first_name": "Ada"},
                    "text": "hi",
                },
            }
        )
        assert update.effective_message is update.message
        assert update.effective_chat is update.message.chat


class TestBotApi103DocsShape:
    """Pin the shapes written straight out of the Bot API 10.3 changelog.

    These duplicate part of :data:`FIELD_SPECS` on purpose: the inventory can
    be re-synced from the node reference, but these lists are transcriptions of
    https://core.telegram.org/bots/api and must not move with it.
    """

    BUSINESS_BOT_RIGHTS_FIELDS: t.ClassVar[tuple[str, ...]] = (
        "can_reply",
        "can_read_messages",
        "can_delete_sent_messages",
        "can_delete_all_messages",
        "can_edit_name",
        "can_edit_bio",
        "can_edit_profile_photo",
        "can_edit_username",
        "can_change_gift_settings",
        "can_view_gifts_and_stars",
        "can_convert_gifts_to_stars",
        "can_transfer_and_upgrade_gifts",
        "can_transfer_stars",
        "can_manage_stories",
    )

    def test_business_bot_rights_matches_documented_field_list(self) -> None:
        names = tuple(field.name for field in dataclasses.fields(BusinessBotRights))
        assert names == self.BUSINESS_BOT_RIGHTS_FIELDS
        assert issubclass(BusinessBotRights, TelegramObject)

    def test_business_bot_rights_is_exported_from_types_package(self) -> None:
        from telebot_py import types as types_module

        assert types_module.BusinessBotRights is BusinessBotRights
        assert "BusinessBotRights" in types_module.__all__

    def test_partial_rights_payload_keeps_unset_rights_none(self) -> None:
        rights = BusinessBotRights.from_dict({"can_reply": True, "can_edit_bio": True})
        assert rights.can_reply is True
        assert rights.can_edit_bio is True
        assert rights.can_manage_stories is None
        assert rights.to_dict() == {"can_reply": True, "can_edit_bio": True}

    def test_live_v10_3_connection_without_can_reply_parses(self) -> None:
        # What api.telegram.org actually sends since Bot API 10.3: `rights`
        # replaced the old required top-level `can_reply` boolean.
        live_payload = {
            "id": "4b0b4d55-1",
            "user": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "user_chat_id": 42,
            "date": 1_700_000_000,
            "rights": {"can_reply": True, "can_read_messages": True},
            "is_enabled": True,
        }
        connection = BusinessConnection.from_dict(live_payload)
        assert connection.rights is not None
        assert connection.rights.can_reply is True
        assert connection.rights.can_read_messages is True
        assert connection.rights.can_edit_name is None
        assert not hasattr(connection, "can_reply")

    def test_connection_rights_are_optional(self) -> None:
        payload = {
            "id": "b",
            "user": {"id": 7, "is_bot": False, "first_name": "Ada"},
            "user_chat_id": 42,
            "date": 1,
            "is_enabled": True,
        }
        assert BusinessConnection.from_dict(payload).rights is None

    def test_gift_v10_3_optionals_match_documented_field_list(self) -> None:
        names = tuple(field.name for field in dataclasses.fields(Gift))
        assert names == (
            "id",
            "sticker",
            "star_count",
            "upgrade_star_count",
            "is_premium",
            "has_colors",
            "total_count",
            "remaining_count",
            "personal_total_count",
            "personal_remaining_count",
            "background",
            "unique_gift_variant_count",
            "publisher_chat",
        )

    def test_gift_fully_populated_v10_3_payload(self) -> None:
        raw = {
            "id": "gift1",
            "sticker": RAW_STICKER,
            "star_count": 50,
            "upgrade_star_count": 25,
            "is_premium": True,
            "has_colors": True,
            "total_count": 10,
            "remaining_count": 4,
            "personal_total_count": 2,
            "personal_remaining_count": 1,
            "background": {"center_color": 1, "edge_color": 2, "text_color": 3},
            "unique_gift_variant_count": 7,
            "publisher_chat": {"id": -100, "type": "channel", "title": "P"},
        }
        gift = Gift.from_dict(raw)
        assert gift.is_premium is True
        assert gift.has_colors is True
        assert gift.personal_total_count == 2
        assert gift.personal_remaining_count == 1
        assert gift.unique_gift_variant_count == 7
        assert isinstance(gift.background, GiftBackground)
        assert gift.background is not None and gift.background.text_color == 3
        assert isinstance(gift.publisher_chat, Chat)
        assert gift.to_dict() == raw

    def test_gift_background_is_exported_from_types_package(self) -> None:
        from telebot_py import types as types_module

        assert types_module.GiftBackground is GiftBackground
        assert "GiftBackground" in types_module.__all__
