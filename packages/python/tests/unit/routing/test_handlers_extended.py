"""Unit tests for the extended handler set parity with packages/node (T050)."""

from __future__ import annotations

import re
from typing import Any

from telebot_py.routing import (
    BusinessConnectionHandler,
    BusinessMessagesHandler,
    ChatBoostHandler,
    ChatJoinRequestHandler,
    ChatMemberHandler,
    ChosenInlineResultHandler,
    InlineQueryHandler,
    MessageReactionCountHandler,
    MessageReactionHandler,
    PollAnswerHandler,
    PreCheckoutQueryHandler,
    PurchasedPaidMediaHandler,
    ShippingQueryHandler,
    TypeHandler,
)
from telebot_py.types import (
    BusinessConnection,
    BusinessMessagesDeleted,
    Chat,
    ChatBoost,
    ChatBoostRemoved,
    ChatBoostSourcePremium,
    ChatBoostUpdated,
    ChatJoinRequest,
    ChatMember,
    ChatMemberUpdated,
    ChosenInlineResult,
    InlineQuery,
    Message,
    MessageReactionCountUpdated,
    MessageReactionUpdated,
    PollAnswer,
    PreCheckoutQuery,
    PurchasedPaidMedia,
    ReactionCount,
    ReactionTypeCustomEmoji,
    ReactionTypeEmoji,
    ReactionTypePaid,
    ShippingAddress,
    ShippingQuery,
    Update,
    User,
)


class StubContext:
    """Minimal context stub standing in for the kernel's CallbackContext."""

    def __init__(self) -> None:
        self.matches: list[Any] | None = None


def _user() -> User:
    return User(id=42, is_bot=False, first_name="Alice")


def _chat() -> Chat:
    return Chat(id=100, type="supergroup")


def _member(status: str = "member") -> ChatMember:
    return ChatMember(status=status, user=_user())


def _member_updated() -> ChatMemberUpdated:
    return ChatMemberUpdated(
        chat=_chat(),
        from_user=_user(),
        date=1_700_000_000,
        old_chat_member=_member("left"),
        new_chat_member=_member("member"),
    )


def message_update() -> Update:
    """Build an Update carrying a plain text message (used as a non-match)."""
    return Update(
        update_id=1,
        message=Message(
            message_id=1,
            date=1_700_000_000,
            chat=Chat(id=100, type="private"),
            from_user=_user(),
            text="hello",
        ),
    )


def chat_member_update() -> Update:
    return Update(update_id=1, chat_member=_member_updated())


def my_chat_member_update() -> Update:
    return Update(update_id=1, my_chat_member=_member_updated())


def poll_answer_update() -> Update:
    return Update(
        update_id=1,
        poll_answer=PollAnswer(poll_id="poll-1", option_ids=[0, 2], user=_user()),
    )


def chat_join_request_update() -> Update:
    return Update(
        update_id=1,
        chat_join_request=ChatJoinRequest(
            chat=_chat(),
            from_user=_user(),
            user_chat_id=42,
            date=1_700_000_000,
            bio="please let me in",
        ),
    )


def _boost_source() -> ChatBoostSourcePremium:
    return ChatBoostSourcePremium(source="premium", user=_user())


def chat_boost_update() -> Update:
    return Update(
        update_id=1,
        chat_boost=ChatBoostUpdated(
            chat=_chat(),
            boost=ChatBoost(
                boost_id="boost-1",
                add_date=1_700_000_000,
                expiration_date=1_700_600_000,
                source=_boost_source(),
            ),
        ),
    )


def removed_chat_boost_update() -> Update:
    return Update(
        update_id=1,
        removed_chat_boost=ChatBoostRemoved(
            chat=_chat(),
            boost_id="boost-1",
            remove_date=1_700_000_000,
            source=_boost_source(),
        ),
    )


def pre_checkout_query_update() -> Update:
    return Update(
        update_id=1,
        pre_checkout_query=PreCheckoutQuery(
            id="pcq-1",
            from_user=_user(),
            currency="EUR",
            total_amount=199,
            invoice_payload="order-1",
        ),
    )


def shipping_query_update() -> Update:
    return Update(
        update_id=1,
        shipping_query=ShippingQuery(
            id="sq-1",
            from_user=_user(),
            invoice_payload="order-1",
            shipping_address=ShippingAddress(
                country_code="DE",
                city="Berlin",
                street_line1="Unter den Linden 1",
                post_code="10117",
            ),
        ),
    )


def purchased_paid_media_update() -> Update:
    return Update(
        update_id=1,
        purchased_paid_media=PurchasedPaidMedia(
            from_user=_user(),
            paid_media_payload="media-payload",
        ),
    )


def _emoji(value: str) -> ReactionTypeEmoji:
    return ReactionTypeEmoji(type="emoji", emoji=value)


def message_reaction_update(
    new_reaction: list[Any],
    old_reaction: list[Any] | None = None,
) -> Update:
    return Update(
        update_id=1,
        message_reaction=MessageReactionUpdated(
            chat=_chat(),
            message_id=7,
            date=1_700_000_000,
            old_reaction=old_reaction if old_reaction is not None else [],
            new_reaction=new_reaction,
            user=_user(),
        ),
    )


def message_reaction_count_update() -> Update:
    return Update(
        update_id=1,
        message_reaction_count=MessageReactionCountUpdated(
            chat=_chat(),
            message_id=7,
            date=1_700_000_000,
            reactions=[ReactionCount(type=_emoji("👍"), total_count=3)],
        ),
    )


def inline_query_update(query: str) -> Update:
    return Update(
        update_id=1,
        inline_query=InlineQuery(id="iq-1", from_user=_user(), query=query, offset=""),
    )


def chosen_inline_result_update(result_id: str, query: str) -> Update:
    return Update(
        update_id=1,
        chosen_inline_result=ChosenInlineResult(
            result_id=result_id,
            from_user=_user(),
            query=query,
        ),
    )


def business_connection_update() -> Update:
    return Update(
        update_id=1,
        business_connection=BusinessConnection(
            id="bc-1",
            user=_user(),
            user_chat_id=42,
            date=1_700_000_000,
            can_reply=True,
            is_enabled=True,
        ),
    )


def _business_message(text: str) -> Message:
    return Message(
        message_id=5,
        date=1_700_000_000,
        chat=Chat(id=900, type="private"),
        from_user=_user(),
        text=text,
    )


def business_message_update() -> Update:
    return Update(update_id=1, business_message=_business_message("hi"))


def edited_business_message_update() -> Update:
    return Update(update_id=1, edited_business_message=_business_message("hi (edited)"))


def deleted_business_messages_update() -> Update:
    return Update(
        update_id=1,
        deleted_business_messages=BusinessMessagesDeleted(
            business_connection_id="bc-1",
            chat=Chat(id=900, type="private"),
            message_ids=[5, 6],
        ),
    )


async def ok_callback(update: Update, context: Any) -> None:
    return None


class TestChatMemberHandler:
    def test_constants_match_node(self) -> None:
        assert ChatMemberHandler.CHAT_MEMBER == 1
        assert ChatMemberHandler.MY_CHAT_MEMBER == 2
        assert ChatMemberHandler.ANY == 3

    def test_default_is_any(self) -> None:
        handler = ChatMemberHandler(ok_callback)
        assert handler.chat_member_types == ChatMemberHandler.ANY

    def test_any_matches_chat_member(self) -> None:
        assert ChatMemberHandler(ok_callback).check_update(chat_member_update()) is True

    def test_any_matches_my_chat_member(self) -> None:
        assert ChatMemberHandler(ok_callback).check_update(my_chat_member_update()) is True

    def test_chat_member_variant_matches_only_chat_member(self) -> None:
        handler = ChatMemberHandler(ok_callback, ChatMemberHandler.CHAT_MEMBER)
        assert handler.check_update(chat_member_update()) is True
        assert handler.check_update(my_chat_member_update()) is False

    def test_my_chat_member_variant_matches_only_my_chat_member(self) -> None:
        handler = ChatMemberHandler(ok_callback, ChatMemberHandler.MY_CHAT_MEMBER)
        assert handler.check_update(my_chat_member_update()) is True
        assert handler.check_update(chat_member_update()) is False

    def test_message_update_rejected(self) -> None:
        assert ChatMemberHandler(ok_callback).check_update(message_update()) is False

    def test_non_update_object_rejected(self) -> None:
        assert ChatMemberHandler(ok_callback).check_update(object()) is False

    async def test_handle_update_invokes_callback(self) -> None:
        seen: list[Update] = []

        async def record(update: Update, context: Any) -> None:
            seen.append(update)

        handler = ChatMemberHandler(record)
        update = chat_member_update()
        await handler.handle_update(update, StubContext(), handler.check_update(update))
        assert seen == [update]


class TestPollAnswerHandler:
    def test_matches_poll_answer(self) -> None:
        assert PollAnswerHandler(ok_callback).check_update(poll_answer_update()) is True

    def test_message_update_rejected(self) -> None:
        assert PollAnswerHandler(ok_callback).check_update(message_update()) is False

    def test_non_update_object_rejected(self) -> None:
        assert PollAnswerHandler(ok_callback).check_update(object()) is False


class TestChatJoinRequestHandler:
    def test_matches_chat_join_request(self) -> None:
        handler = ChatJoinRequestHandler(ok_callback)
        assert handler.check_update(chat_join_request_update()) is True

    def test_message_update_rejected(self) -> None:
        assert ChatJoinRequestHandler(ok_callback).check_update(message_update()) is False

    def test_non_update_object_rejected(self) -> None:
        assert ChatJoinRequestHandler(ok_callback).check_update(object()) is False


class TestChatBoostHandler:
    def test_constants_match_node(self) -> None:
        assert ChatBoostHandler.ADDED == 1
        assert ChatBoostHandler.REMOVED == 2
        assert ChatBoostHandler.ANY == 3

    def test_default_is_any(self) -> None:
        assert ChatBoostHandler(ok_callback).boost_types == ChatBoostHandler.ANY

    def test_added_matches_only_chat_boost(self) -> None:
        handler = ChatBoostHandler(ok_callback, ChatBoostHandler.ADDED)
        assert handler.check_update(chat_boost_update()) is True
        assert handler.check_update(removed_chat_boost_update()) is False

    def test_removed_matches_only_removed_chat_boost(self) -> None:
        handler = ChatBoostHandler(ok_callback, ChatBoostHandler.REMOVED)
        assert handler.check_update(removed_chat_boost_update()) is True
        assert handler.check_update(chat_boost_update()) is False

    def test_any_matches_both(self) -> None:
        handler = ChatBoostHandler(ok_callback)
        assert handler.check_update(chat_boost_update()) is True
        assert handler.check_update(removed_chat_boost_update()) is True

    def test_message_update_rejected(self) -> None:
        assert ChatBoostHandler(ok_callback).check_update(message_update()) is False

    def test_non_update_object_rejected(self) -> None:
        assert ChatBoostHandler(ok_callback).check_update(object()) is False


class TestPaymentHandlers:
    def test_pre_checkout_query_matches(self) -> None:
        handler = PreCheckoutQueryHandler(ok_callback)
        assert handler.check_update(pre_checkout_query_update()) is True

    def test_pre_checkout_query_rejects_other_updates(self) -> None:
        assert PreCheckoutQueryHandler(ok_callback).check_update(shipping_query_update()) is False
        assert PreCheckoutQueryHandler(ok_callback).check_update(object()) is False

    def test_shipping_query_matches(self) -> None:
        handler = ShippingQueryHandler(ok_callback)
        assert handler.check_update(shipping_query_update()) is True

    def test_shipping_query_rejects_other_updates(self) -> None:
        assert ShippingQueryHandler(ok_callback).check_update(pre_checkout_query_update()) is False
        assert ShippingQueryHandler(ok_callback).check_update(object()) is False

    def test_purchased_paid_media_matches(self) -> None:
        handler = PurchasedPaidMediaHandler(ok_callback)
        assert handler.check_update(purchased_paid_media_update()) is True

    def test_purchased_paid_media_rejects_other_updates(self) -> None:
        handler = PurchasedPaidMediaHandler(ok_callback)
        assert handler.check_update(message_update()) is False
        assert handler.check_update(object()) is False


class TestMessageReactionHandler:
    def test_no_filter_matches_any_reaction_update(self) -> None:
        handler = MessageReactionHandler(ok_callback)
        assert handler.check_update(message_reaction_update([_emoji("👍")])) is True

    def test_no_filter_rejects_reaction_count_update(self) -> None:
        handler = MessageReactionHandler(ok_callback)
        assert handler.check_update(message_reaction_count_update()) is False

    def test_string_filter_matches_new_reaction_emoji(self) -> None:
        handler = MessageReactionHandler(ok_callback, "👍")
        update = message_reaction_update([_emoji("👍")], old_reaction=[_emoji("❤️")])
        assert handler.check_update(update) is True

    def test_string_filter_ignores_old_reaction_only(self) -> None:
        handler = MessageReactionHandler(ok_callback, "❤️")
        update = message_reaction_update([_emoji("👍")], old_reaction=[_emoji("❤️")])
        assert handler.check_update(update) is False

    def test_string_list_filter(self) -> None:
        handler = MessageReactionHandler(ok_callback, ["👍", "🔥"])
        assert handler.check_update(message_reaction_update([_emoji("🔥")])) is True
        assert handler.check_update(message_reaction_update([_emoji("😢")])) is False

    def test_reaction_type_emoji_filter(self) -> None:
        handler = MessageReactionHandler(ok_callback, _emoji("👍"))
        assert handler.check_update(message_reaction_update([_emoji("👍")])) is True
        assert handler.check_update(message_reaction_update([_emoji("😢")])) is False

    def test_reaction_type_custom_emoji_filter(self) -> None:
        custom = ReactionTypeCustomEmoji(type="custom_emoji", custom_emoji_id="ce-1")
        handler = MessageReactionHandler(ok_callback, custom)
        assert handler.check_update(message_reaction_update([custom])) is True
        assert handler.check_update(message_reaction_update([_emoji("👍")])) is False

    def test_reaction_type_paid_filter(self) -> None:
        paid = ReactionTypePaid(type="paid")
        handler = MessageReactionHandler(ok_callback, paid)
        assert handler.check_update(message_reaction_update([paid])) is True
        assert handler.check_update(message_reaction_update([_emoji("👍")])) is False

    def test_callable_predicate_filter(self) -> None:
        handler = MessageReactionHandler(
            ok_callback,
            lambda update: (
                update.message_reaction is not None and update.message_reaction.message_id == 7
            ),
        )
        assert handler.check_update(message_reaction_update([_emoji("👍")])) is True

    def test_message_update_rejected(self) -> None:
        assert MessageReactionHandler(ok_callback).check_update(message_update()) is False

    def test_non_update_object_rejected(self) -> None:
        assert MessageReactionHandler(ok_callback).check_update(object()) is False


class TestMessageReactionCountHandler:
    def test_matches_reaction_count_update(self) -> None:
        handler = MessageReactionCountHandler(ok_callback)
        assert handler.check_update(message_reaction_count_update()) is True

    def test_reaction_update_rejected(self) -> None:
        handler = MessageReactionCountHandler(ok_callback)
        assert handler.check_update(message_reaction_update([_emoji("👍")])) is False

    def test_non_update_object_rejected(self) -> None:
        assert MessageReactionCountHandler(ok_callback).check_update(object()) is False


class TestInlineQueryHandler:
    def test_no_pattern_matches_any_inline_query(self) -> None:
        assert InlineQueryHandler(None, ok_callback).check_update(inline_query_update("cats"))

    def test_string_pattern_requires_exact_equality(self) -> None:
        handler = InlineQueryHandler("cats", ok_callback)
        assert handler.check_update(inline_query_update("cats")) is True
        assert handler.check_update(inline_query_update("cats and dogs")) is False
        assert handler.check_update(inline_query_update("cat")) is False

    def test_regex_pattern_uses_search_semantics(self) -> None:
        handler = InlineQueryHandler(re.compile(r"^search:(.+)$"), ok_callback)
        assert handler.check_update(inline_query_update("search:python")) is True
        assert handler.check_update(inline_query_update("no prefix")) is False

    def test_callable_pattern_receives_query_text(self) -> None:
        handler = InlineQueryHandler(lambda query: query.startswith("x_"), ok_callback)
        assert handler.check_update(inline_query_update("x_1")) is True
        assert handler.check_update(inline_query_update("y_1")) is False

    def test_message_update_rejected(self) -> None:
        assert InlineQueryHandler(None, ok_callback).check_update(message_update()) is False

    def test_non_update_object_rejected(self) -> None:
        assert InlineQueryHandler(None, ok_callback).check_update(object()) is False

    def test_collect_additional_context_sets_matches_for_regex(self) -> None:
        handler = InlineQueryHandler(re.compile(r"^search:(.+)$"), ok_callback)
        update = inline_query_update("search:python")
        context = StubContext()
        handler.collect_additional_context(context, update, handler.check_update(update))
        assert context.matches
        assert context.matches[0].group(1) == "python"

    def test_collect_additional_context_skips_string_pattern(self) -> None:
        handler = InlineQueryHandler("cats", ok_callback)
        update = inline_query_update("cats")
        context = StubContext()
        handler.collect_additional_context(context, update, handler.check_update(update))
        assert context.matches is None

    async def test_handle_update_populates_matches_then_calls_callback(self) -> None:
        seen: list[Any] = []

        async def record(update: Update, context: Any) -> None:
            seen.append(context.matches)

        handler = InlineQueryHandler(re.compile(r"^search:(.+)$"), record)
        update = inline_query_update("search:bots")
        await handler.handle_update(update, StubContext(), handler.check_update(update))
        assert seen[0][0].group(1) == "bots"


class TestChosenInlineResultHandler:
    def test_no_pattern_matches_any_chosen_result(self) -> None:
        handler = ChosenInlineResultHandler(None, ok_callback)
        assert handler.check_update(chosen_inline_result_update("r1", "cats")) is True

    def test_string_pattern_matches_result_id_or_query(self) -> None:
        by_result_id = ChosenInlineResultHandler("r1", ok_callback)
        by_query = ChosenInlineResultHandler("cats", ok_callback)
        update = chosen_inline_result_update("r1", "cats")
        assert by_result_id.check_update(update) is True
        assert by_query.check_update(update) is True
        assert ChosenInlineResultHandler("nope", ok_callback).check_update(update) is False

    def test_regex_pattern_targets_query_then_result_id(self) -> None:
        handler = ChosenInlineResultHandler(re.compile(r"^res-\d+$"), ok_callback)
        assert handler.check_update(chosen_inline_result_update("res-9", "")) is True
        assert handler.check_update(chosen_inline_result_update("r1", "res-9")) is True
        assert handler.check_update(chosen_inline_result_update("r1", "cats")) is False

    def test_callable_pattern_receives_target(self) -> None:
        handler = ChosenInlineResultHandler(lambda target: target == "cats", ok_callback)
        assert handler.check_update(chosen_inline_result_update("r1", "cats")) is True
        assert handler.check_update(chosen_inline_result_update("r1", "dogs")) is False

    def test_message_update_rejected(self) -> None:
        handler = ChosenInlineResultHandler(None, ok_callback)
        assert handler.check_update(message_update()) is False

    def test_non_update_object_rejected(self) -> None:
        assert ChosenInlineResultHandler(None, ok_callback).check_update(object()) is False

    def test_collect_additional_context_sets_matches_for_regex(self) -> None:
        handler = ChosenInlineResultHandler(re.compile(r"^res-(\d+)$"), ok_callback)
        update = chosen_inline_result_update("res-9", "")
        context = StubContext()
        handler.collect_additional_context(context, update, handler.check_update(update))
        assert context.matches
        assert context.matches[0].group(1) == "9"


class TestBusinessHandlers:
    def test_business_connection_matches(self) -> None:
        handler = BusinessConnectionHandler(ok_callback)
        assert handler.check_update(business_connection_update()) is True

    def test_business_connection_rejects_other_updates(self) -> None:
        handler = BusinessConnectionHandler(ok_callback)
        assert handler.check_update(business_message_update()) is False
        assert handler.check_update(object()) is False

    def test_business_messages_matches_new_message(self) -> None:
        handler = BusinessMessagesHandler(ok_callback)
        assert handler.check_update(business_message_update()) is True

    def test_business_messages_matches_edited_message(self) -> None:
        handler = BusinessMessagesHandler(ok_callback)
        assert handler.check_update(edited_business_message_update()) is True

    def test_business_messages_matches_deleted_messages(self) -> None:
        handler = BusinessMessagesHandler(ok_callback)
        assert handler.check_update(deleted_business_messages_update()) is True

    def test_business_messages_rejects_plain_message(self) -> None:
        assert BusinessMessagesHandler(ok_callback).check_update(message_update()) is False

    def test_business_messages_rejects_non_update(self) -> None:
        assert BusinessMessagesHandler(ok_callback).check_update(object()) is False


class TestTypeHandler:
    def test_predicate_match(self) -> None:
        handler = TypeHandler(lambda update: update.poll_answer is not None, ok_callback)
        assert handler.check_update(poll_answer_update()) is True

    def test_predicate_reject(self) -> None:
        handler = TypeHandler(lambda update: update.poll_answer is not None, ok_callback)
        assert handler.check_update(message_update()) is False

    def test_non_update_object_rejected(self) -> None:
        handler = TypeHandler(lambda update: True, ok_callback)
        assert handler.check_update(object()) is False

    async def test_handle_update_invokes_callback(self) -> None:
        seen: list[Update] = []

        async def record(update: Update, context: Any) -> None:
            seen.append(update)

        handler = TypeHandler(lambda update: True, record)
        update = message_update()
        await handler.handle_update(update, StubContext(), handler.check_update(update))
        assert seen == [update]
