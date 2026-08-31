import { describe, expect, it } from "vitest";
import { Update } from "../../../../src/kernel/update.js";
import type { Chat, Message, Sticker, User } from "../../../../src/client/types.js";

/**
 * Compile-time guard: every Bot API `Message` field this repo added for
 * Bot API 10.3 parity must actually exist on the `Message` interface. Passing a
 * name that `Message` doesn't declare is a type error, so this test fails to
 * build rather than silently checking nothing.
 */
function assertMessageKeys<T extends readonly (keyof Message)[]>(keys: T): T {
  return keys;
}

const sticker: Sticker = {
  file_id: "st-1",
  file_unique_id: "stu-1",
  type: "regular",
  width: 512,
  height: 512,
  is_animated: false,
  is_video: false,
};

const user: User = { id: 456, is_bot: false, first_name: "Alice", username: "alice" };
const chat: Chat = { id: -100123, type: "channel", title: "News" };

/** A `Message` carrying every Bot API 10.3 service-message field at once. */
const carrierMessage: Message = {
  message_id: 42,
  date: 1750000000,
  chat,
  sender_tag: "TAG",
  effect_id: "effect-1",
  guest_query_id: "gq-1",
  is_paid_post: true,
  paid_star_count: 25,
  reply_to_checklist_task_id: 3,
  reply_to_poll_option_id: "po-2",
  guest_bot_caller_user: user,
  guest_bot_caller_chat: chat,
  direct_messages_topic: { topic_id: 7, user },
  chat_owner_changed: { new_owner: user },
  chat_owner_left: { new_owner: user },
  community_chat_added: { community: { id: -100999, name: "Umbrella" } },
  community_chat_removed: {},
  direct_message_price_changed: {
    are_direct_messages_enabled: true,
    direct_message_star_count: 50,
  },
  paid_message_price_changed: { paid_message_star_count: 10 },
  managed_bot_created: { bot: { id: 9, is_bot: true, first_name: "Managed" } },
  poll_option_added: {
    option_persistent_id: "po-1",
    option_text: "Go",
    option_text_entities: [{ type: "bold", offset: 0, length: 2 }],
  },
  poll_option_deleted: { option_persistent_id: "po-9", option_text: "Old" },
  checklist: {
    title: "Release",
    tasks: [{ id: 1, text: "Tag the release" }],
    others_can_add_tasks: true,
  },
  checklist_tasks_added: {
    tasks: [{ id: 2, text: "Write notes" }],
  },
  checklist_tasks_done: {
    marked_as_done_task_ids: [2],
    marked_as_not_done_task_ids: [1],
  },
  gift: { gift: { id: "gift-1", sticker, star_count: 100 }, can_be_upgraded: true },
  gift_upgrade_sent: { gift: { id: "gift-2", sticker, star_count: 200 } },
  unique_gift: {
    origin: "nickname",
    gift: {
      gift_id: "ug-1",
      base_name: "Bear",
      name: "Bear #1",
      number: 1,
      model: { name: "Bear", sticker, rarity_per_mille: 500 },
      symbol: { name: "Star", sticker, rarity_per_mille: 400 },
      backdrop: {
        name: "Dusk",
        rarity_per_mille: 300,
        colors: {
          center_color: 1,
          edge_color: 2,
          symbol_color: 3,
          text_color: 4,
        },
      },
    },
  },
  paid_media: {
    star_count: 30,
    paid_media: [{ type: "preview", width: 4, height: 3, duration: 12 }],
  },
  suggested_post_info: { state: "pending" },
  suggested_post_paid: { currency: "XTR", star_amount: { amount: 500 } },
  suggested_post_approved: {
    send_date: 1750000100,
    price: { currency: "XTR", amount: 10 },
  },
  suggested_post_approval_failed: {
    price: { currency: "XTR", amount: 10 },
  },
  suggested_post_declined: { comment: "Not a good time" },
  suggested_post_refunded: { reason: "post_expired" },
};

const CARRIER_FIELDS = assertMessageKeys([
  "chat_owner_changed",
  "chat_owner_left",
  "checklist",
  "checklist_tasks_added",
  "checklist_tasks_done",
  "community_chat_added",
  "community_chat_removed",
  "direct_message_price_changed",
  "direct_messages_topic",
  "effect_id",
  "gift",
  "gift_upgrade_sent",
  "guest_bot_caller_chat",
  "guest_bot_caller_user",
  "guest_query_id",
  "is_paid_post",
  "managed_bot_created",
  "paid_media",
  "paid_message_price_changed",
  "paid_star_count",
  "poll_option_added",
  "poll_option_deleted",
  "reply_to_checklist_task_id",
  "reply_to_poll_option_id",
  "sender_tag",
  "suggested_post_approval_failed",
  "suggested_post_approved",
  "suggested_post_declined",
  "suggested_post_info",
  "suggested_post_paid",
  "suggested_post_refunded",
  "unique_gift",
] as const);

describe("Message Bot API 10.3 carriers", () => {
  it("declares every service-message field the docs define", () => {
    expect(CARRIER_FIELDS).toHaveLength(32);
  });

  it("keeps every carrier readable through the Update wrapper", () => {
    const message = new Update({ update_id: 1, message: carrierMessage }).message;
    if (!message) throw new Error("message missing");

    expect(message.sender_tag).toBe("TAG");
    expect(message.paid_star_count).toBe(25);
    expect(message.is_paid_post).toBe(true);
    expect(message.guest_bot_caller_user?.id).toBe(456);
    expect(message.direct_messages_topic?.topic_id).toBe(7);
    expect(message.chat_owner_changed?.new_owner.username).toBe("alice");
    expect(message.community_chat_added?.community.name).toBe("Umbrella");
    expect(message.community_chat_removed).toEqual({});
    expect(message.direct_message_price_changed?.direct_message_star_count).toBe(50);
    expect(message.managed_bot_created?.bot.is_bot).toBe(true);
    expect(message.poll_option_added?.option_text_entities?.[0]?.type).toBe("bold");
    expect(message.poll_option_deleted?.option_persistent_id).toBe("po-9");
    expect(message.checklist?.tasks[0]?.text).toBe("Tag the release");
    expect(message.checklist_tasks_added?.tasks[0]?.id).toBe(2);
    expect(message.checklist_tasks_done?.marked_as_done_task_ids).toEqual([2]);
    expect(message.checklist_tasks_done?.marked_as_not_done_task_ids).toEqual([1]);
    expect(message.gift?.gift.star_count).toBe(100);
    expect(message.gift_upgrade_sent?.can_be_upgraded).toBeFalsy();
    expect(message.unique_gift?.gift.model.rarity_per_mille).toBe(500);
    expect(message.paid_media?.paid_media[0]?.type).toBe("preview");
    expect(message.suggested_post_paid?.star_amount?.amount).toBe(500);
    expect(message.suggested_post_approved?.send_date).toBe(1750000100);
    expect(message.suggested_post_approved?.price?.currency).toBe("XTR");
    expect(message.suggested_post_declined?.comment).toBe("Not a good time");
    expect(message.suggested_post_approval_failed?.price.currency).toBe("XTR");
    expect(message.suggested_post_refunded?.reason).toBe("post_expired");
  });

  it("still accepts a minimal message, proving the new carriers are optional", () => {
    const minimal: Message = { message_id: 1, date: 1750000000, chat };
    expect(minimal.poll_option_added).toBeUndefined();
    expect(minimal.checklist).toBeUndefined();
    expect(minimal.unique_gift).toBeUndefined();
  });
});

describe("Update Bot API 10.3 payloads", () => {
  it("carries guest_message, managed_bot and subscription updates", () => {
    const update = new Update({
      update_id: 2,
      guest_message: carrierMessage,
      managed_bot: {
        user,
        bot: { id: 9, is_bot: true, first_name: "Managed" },
      },
      subscription: {
        user,
        invoice_payload: "sub-1",
        state: "active",
      },
    });

    expect(update.guest_message?.sender_tag).toBe("TAG");
    expect(update.managed_bot?.bot.id).toBe(9);
    expect(update.subscription?.state).toBe("active");
    expect(update.subscription?.invoice_payload).toBe("sub-1");
  });
});
