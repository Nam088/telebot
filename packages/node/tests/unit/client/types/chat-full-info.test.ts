import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, vi } from "vitest";
import { ChatMethods } from "../../../../src/client/methods/index.js";
import type { Chat, ChatFullInfo, UserRating } from "../../../../src/client/types.js";

/**
 * Compile-time guard: every documented Bot API `ChatFullInfo` field must actually
 * exist on the interface. Passing a name `ChatFullInfo` doesn't declare is a type
 * error, so this test fails to build rather than silently checking nothing.
 */
function assertChatFullInfoKeys<T extends readonly (keyof ChatFullInfo)[]>(keys: T): T {
  return keys;
}

/** The 53 fields the Bot API 10.3 docs list for `ChatFullInfo`, in docs order. */
const CHAT_FULL_INFO_FIELDS = assertChatFullInfoKeys([
  "id",
  "type",
  "title",
  "username",
  "first_name",
  "last_name",
  "is_forum",
  "is_direct_messages",
  "accent_color_id",
  "max_reaction_count",
  "photo",
  "active_usernames",
  "birthdate",
  "business_intro",
  "business_location",
  "business_opening_hours",
  "personal_chat",
  "parent_chat",
  "available_reactions",
  "background_custom_emoji_id",
  "profile_accent_color_id",
  "profile_background_custom_emoji_id",
  "emoji_status_custom_emoji_id",
  "emoji_status_expiration_date",
  "bio",
  "has_private_forwards",
  "has_restricted_voice_and_video_messages",
  "join_to_send_messages",
  "join_by_request",
  "description",
  "invite_link",
  "pinned_message",
  "permissions",
  "accepted_gift_types",
  "can_send_paid_media",
  "slow_mode_delay",
  "unrestrict_boost_count",
  "message_auto_delete_time",
  "has_aggressive_anti_spam_enabled",
  "has_hidden_members",
  "has_protected_content",
  "has_visible_history",
  "sticker_set_name",
  "can_set_sticker_set",
  "custom_emoji_sticker_set_name",
  "linked_chat_id",
  "location",
  "rating",
  "first_profile_audio",
  "unique_gift_colors",
  "paid_message_star_count",
  "guard_bot",
  "community",
] as const);

/** Docs fields not marked "Optional", so they are always present on the wire. */
const REQUIRED_FIELDS = [
  "id",
  "type",
  "accent_color_id",
  "max_reaction_count",
  "accepted_gift_types",
] as const;

/** The 10 `ChatFullInfo` fields that the narrower `Chat` deliberately doesn't carry. */
const FULL_INFO_ONLY_FIELDS = [
  "max_reaction_count",
  "parent_chat",
  "accepted_gift_types",
  "can_send_paid_media",
  "rating",
  "first_profile_audio",
  "unique_gift_colors",
  "paid_message_star_count",
  "guard_bot",
  "community",
] as const;

/** Oracle candidates, best-first: the committed copy, then the generated cache. */
const ORACLE_CANDIDATES = [
  new URL("../../../../../../scripts/bot-api-oracle.json", import.meta.url),
  new URL("../../../../../../node_modules/.cache/telebot/bot-api-oracle.json", import.meta.url),
].map((url) => fileURLToPath(url));
const ORACLE_PATH = ORACLE_CANDIDATES.find((candidate) => existsSync(candidate));
const SOURCE_PATH = fileURLToPath(
  new URL("../../../../src/client/types/chats/chat-full-info.ts", import.meta.url),
);

/**
 * A realistic `getChat` result carrying all 53 documented fields. `satisfies
 * ChatFullInfo` makes TypeScript reject a missing required field, a wrong nested
 * shape, or a field name the interface doesn't declare.
 */
const FULL_CHAT_INFO = {
  id: -1001234567890,
  type: "supergroup",
  title: "Telebot Devs",
  username: "telebot_devs",
  first_name: "Alice",
  last_name: "Nguyen",
  is_forum: true,
  is_direct_messages: false,
  accent_color_id: 3,
  max_reaction_count: 7,
  photo: {
    small_file_id: "small-1",
    small_file_unique_id: "smallu-1",
    big_file_id: "big-1",
    big_file_unique_id: "bigu-1",
  },
  active_usernames: ["telebot_devs", "devs"],
  birthdate: { day: 12, month: 5, year: 1990 },
  business_intro: { title: "Studio", message: "We build bots" },
  business_location: {
    address: "1 Market St",
    location: { latitude: 1.5, longitude: 2.5 },
  },
  business_opening_hours: {
    time_zone_name: "Asia/Ho_Chi_Minh",
    opening_hours: [{ opening_minute: 540, closing_minute: 1020 }],
  },
  personal_chat: { id: 456, type: "private", first_name: "Alice" },
  parent_chat: { id: -100999888777, type: "channel", title: "Umbrella" },
  available_reactions: [
    { type: "emoji", emoji: "👍" },
    { type: "custom_emoji", custom_emoji_id: "ce-1" },
    { type: "paid" },
  ],
  background_custom_emoji_id: "bg-1",
  profile_accent_color_id: 2,
  profile_background_custom_emoji_id: "pb-1",
  emoji_status_custom_emoji_id: "es-1",
  emoji_status_expiration_date: 1750003600,
  bio: "Shipping telebot",
  has_private_forwards: true,
  has_restricted_voice_and_video_messages: true,
  join_to_send_messages: false,
  join_by_request: true,
  description: "Discussion for the telebot frameworks",
  invite_link: "https://t.me/telebot_devs/invite",
  pinned_message: {
    message_id: 9001,
    date: 1750000000,
    chat: { id: -1001234567890, type: "supergroup", title: "Telebot Devs" },
    text: "Read the FAQ",
  },
  permissions: { can_send_messages: true, can_send_polls: false },
  accepted_gift_types: {
    unlimited_gifts: true,
    limited_gifts: false,
    unique_gifts: true,
    premium_subscription: false,
    gifts_from_channels: true,
  },
  can_send_paid_media: true,
  slow_mode_delay: 30,
  unrestrict_boost_count: 4,
  message_auto_delete_time: 86400,
  has_aggressive_anti_spam_enabled: true,
  has_hidden_members: false,
  has_protected_content: true,
  has_visible_history: true,
  sticker_set_name: "TelebotSet",
  can_set_sticker_set: true,
  custom_emoji_sticker_set_name: "TelebotEmojiSet",
  linked_chat_id: -100555666777,
  location: {
    location: { latitude: 10.7, longitude: 106.6 },
    address: "Ho Chi Minh City",
  },
  rating: { level: 4, rating: 1200, current_level_rating: 1000, next_level_rating: 1500 },
  first_profile_audio: {
    file_id: "au-1",
    file_unique_id: "auu-1",
    duration: 210,
    title: "Demo",
  },
  unique_gift_colors: {
    model_custom_emoji_id: "m-1",
    symbol_custom_emoji_id: "sy-1",
    light_theme_main_color: 16711680,
    light_theme_other_colors: [65280, 255],
    dark_theme_main_color: 8388608,
    dark_theme_other_colors: [128],
  },
  paid_message_star_count: 50,
  guard_bot: { id: 99, is_bot: true, first_name: "Guard", username: "guard_bot" },
  community: { id: -1004242424242, name: "Telebot Community" },
} satisfies ChatFullInfo;

/** The 5 required fields only, proving every other field is optional. */
const MINIMAL_CHAT_INFO: ChatFullInfo = {
  id: 456,
  type: "private",
  accent_color_id: 5,
  max_reaction_count: 7,
  accepted_gift_types: {
    unlimited_gifts: false,
    limited_gifts: false,
    unique_gifts: false,
    premium_subscription: false,
    gifts_from_channels: false,
  },
};

class ConcreteChatClient extends ChatMethods {}

function clientReturning(result: unknown): ConcreteChatClient {
  const fakeFetch = vi.fn().mockResolvedValue({
    status: 200,
    json: async () => ({ ok: true, result }),
  });
  return new ConcreteChatClient("TEST_TOKEN", { fetch: fakeFetch });
}

const OPTIONAL_FIELDS = CHAT_FULL_INFO_FIELDS.filter(
  (field) => !(REQUIRED_FIELDS as readonly string[]).includes(field),
);

describe("ChatFullInfo Bot API 10.3 parity", () => {
  it("declares all 53 fields the docs define", () => {
    expect(CHAT_FULL_INFO_FIELDS).toHaveLength(53);
    expect(FULL_INFO_ONLY_FIELDS).toHaveLength(10);
    const declared = new Set<string>(CHAT_FULL_INFO_FIELDS);
    for (const field of FULL_INFO_ONLY_FIELDS) {
      expect(declared.has(field)).toBe(true);
    }
  });

  it("stays assignable to Chat, so existing getChat callers keep compiling", () => {
    const asChat: Chat = MINIMAL_CHAT_INFO;
    expect(asChat.id).toBe(456);
    expect(asChat.accent_color_id).toBe(5);
    // `accepted_gift_types` is only reachable on the widened type.
    expect(MINIMAL_CHAT_INFO.accepted_gift_types.unlimited_gifts).toBe(false);
  });

  it("decodes every documented field from a realistic getChat response", async () => {
    // Round-trip through JSON text so the assertion is about the decoded wire
    // payload, not about the literal above.
    const decoded = await clientReturning(JSON.parse(JSON.stringify(FULL_CHAT_INFO))).getChat(
      -1001234567890,
    );

    expect(Object.keys(decoded)).toHaveLength(53);
    for (const field of CHAT_FULL_INFO_FIELDS) {
      expect(decoded[field], field).toBeDefined();
    }

    expect(decoded.max_reaction_count).toBe(7);
    expect(decoded.parent_chat?.title).toBe("Umbrella");
    expect(decoded.accepted_gift_types.gifts_from_channels).toBe(true);
    expect(decoded.can_send_paid_media).toBe(true);
    expect(decoded.rating).toEqual({
      level: 4,
      rating: 1200,
      current_level_rating: 1000,
      next_level_rating: 1500,
    } satisfies UserRating);
    expect(decoded.first_profile_audio?.duration).toBe(210);
    expect(decoded.unique_gift_colors?.dark_theme_other_colors).toEqual([128]);
    expect(decoded.paid_message_star_count).toBe(50);
    expect(decoded.guard_bot?.username).toBe("guard_bot");
    expect(decoded.community?.name).toBe("Telebot Community");

    // Inherited Chat fields must survive the widening too.
    expect(decoded.is_forum).toBe(true);
    expect(decoded.bio).toBe("Shipping telebot");
    expect(decoded.permissions?.can_send_messages).toBe(true);
    expect(decoded.location?.address).toBe("Ho Chi Minh City");
    expect(decoded.available_reactions?.[0]?.type).toBe("emoji");
    expect(decoded.pinned_message?.text).toBe("Read the FAQ");
    expect(decoded.business_location?.address).toBe("1 Market St");
    expect(decoded.business_opening_hours?.opening_hours[0]?.closing_minute).toBe(1020);
    expect(decoded.personal_chat?.first_name).toBe("Alice");
    expect(decoded.photo?.big_file_id).toBe("big-1");
    expect(decoded.birthdate?.year).toBe(1990);
    expect((decoded as Chat).username).toBe("telebot_devs");
  });

  it("keeps required-vs-optional on the wire exactly as the docs state", () => {
    // Serializing a minimal object emits precisely the 5 required wire keys.
    expect(Object.keys(JSON.parse(JSON.stringify(MINIMAL_CHAT_INFO))).sort()).toEqual(
      [...REQUIRED_FIELDS].sort(),
    );
    expect(OPTIONAL_FIELDS).toHaveLength(48);
    for (const field of OPTIONAL_FIELDS) {
      expect(MINIMAL_CHAT_INFO[field], field).toBeUndefined();
    }
  });
});

describe("chat-full-info.ts doc links", () => {
  const source = readFileSync(SOURCE_PATH, "utf-8");
  const links = [
    ...source.matchAll(
      /@see \{@link https:\/\/core\.telegram\.org\/bots\/api#(\w+) Telegram Bot API: (\w+)\}/g,
    ),
  ];

  it("links every declared interface to its own lowercased docs anchor", () => {
    const interfaces = [...source.matchAll(/^export interface (\w+)/gm)].map((m) => m[1]);
    expect(interfaces).toEqual(["UserRating", "ChatFullInfo"]);
    expect(links).toHaveLength(interfaces.length);
    for (const match of links) {
      const slug = match[1];
      const name = match[2];
      expect(interfaces).toContain(name);
      expect(slug).toBe(name?.toLowerCase());
    }
  });

  // `scripts/bot-api-oracle.json` is committed, so this hard check runs on a
  // fresh clone; the `node_modules/.cache` copy is only a fallback. Either way it
  // reads a local file and never touches the network.
  const oracle = ORACLE_PATH
    ? (JSON.parse(readFileSync(ORACLE_PATH, "utf-8")) as {
        anchors: string[];
        types?: Record<string, { fields?: Record<string, { optional?: boolean }> }>;
      })
    : undefined;
  it.skipIf(!oracle)("anchors and field names come from the docs oracle, not memory", () => {
    if (!oracle) throw new Error("no docs oracle file found");
    const chatFullInfo = oracle.types?.ChatFullInfo;
    const userRating = oracle.types?.UserRating;
    if (!chatFullInfo?.fields || !userRating?.fields) {
      throw new Error("oracle has no ChatFullInfo/UserRating field table");
    }

    for (const match of links) {
      expect(oracle.anchors).toContain(match[1]);
    }

    expect(Object.keys(chatFullInfo.fields)).toEqual([...CHAT_FULL_INFO_FIELDS]);
    expect(Object.keys(userRating.fields)).toEqual([
      "level",
      "rating",
      "current_level_rating",
      "next_level_rating",
    ]);
    expect(
      Object.keys(chatFullInfo.fields).filter((f) => !chatFullInfo.fields?.[f]?.optional),
    ).toEqual([...REQUIRED_FIELDS]);
  });
});
