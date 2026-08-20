import { describe, it, expect, vi } from "vitest";
import { filters } from "../../../src/ext/filters.js";
import { Update } from "../../../src/telegram/update.js";
import { CallbackContext } from "../../../src/ext/context.js";
import { Bot } from "../../../src/telegram/bot.js";
import { MessageHandler } from "../../../src/ext/handlers.js";

describe("Filters", () => {
  it("filters.TEXT matches messages with text and not command", async () => {
    const textUpdate = new Update({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 123, type: "private" },
        text: "Hello world",
      },
    });

    const commandUpdate = new Update({
      update_id: 2,
      message: {
        message_id: 2,
        date: 123456,
        chat: { id: 123, type: "private" },
        text: "/start",
        entities: [{ type: "bot_command", offset: 0, length: 6 }],
      },
    });

    const photoUpdate = new Update({
      update_id: 3,
      message: {
        message_id: 3,
        date: 123456,
        chat: { id: 123, type: "private" },
      },
    });

    expect(await filters.TEXT.checkUpdate(textUpdate)).toBe(true);
    expect(await filters.TEXT.checkUpdate(commandUpdate)).toBe(false);
    expect(await filters.TEXT.checkUpdate(photoUpdate)).toBe(false);
  });

  it("filters.COMMAND matches command messages", async () => {
    const commandUpdate = new Update({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 123, type: "private" },
        text: "/start",
        entities: [{ type: "bot_command", offset: 0, length: 6 }],
      },
    });

    const textUpdate = new Update({
      update_id: 2,
      message: {
        message_id: 2,
        date: 123456,
        chat: { id: 123, type: "private" },
        text: "Hello world",
      },
    });

    expect(await filters.COMMAND.checkUpdate(commandUpdate)).toBe(true);
    expect(await filters.COMMAND.checkUpdate(textUpdate)).toBe(false);
  });

  it("combinators .and(), .or(), .not() work as expected", async () => {
    const textUpdate = new Update({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123456,
        chat: { id: 123, type: "private" },
        text: "Hello world",
      },
    });

    const notCommand = filters.COMMAND.not();
    expect(await notCommand.checkUpdate(textUpdate)).toBe(true);

    const textAndNotCommand = filters.TEXT.and(filters.COMMAND.not());
    expect(await textAndNotCommand.checkUpdate(textUpdate)).toBe(true);

    const textOrCommand = filters.TEXT.or(filters.COMMAND);
    expect(await textOrCommand.checkUpdate(textUpdate)).toBe(true);
  });

  it("filters.ChatType matches correct chat types", async () => {
    const privateUpdate = new Update({
      update_id: 1,
      message: { message_id: 1, date: 123, chat: { id: 1, type: "private" }, text: "hi" },
    });
    const groupUpdate = new Update({
      update_id: 2,
      message: { message_id: 2, date: 123, chat: { id: 2, type: "group" }, text: "hi" },
    });
    const supergroupUpdate = new Update({
      update_id: 3,
      message: { message_id: 3, date: 123, chat: { id: 3, type: "supergroup" }, text: "hi" },
    });
    const channelUpdate = new Update({
      update_id: 4,
      channel_post: { message_id: 4, date: 123, chat: { id: 4, type: "channel" }, text: "hi" },
    });

    expect(await filters.ChatType.PRIVATE.checkUpdate(privateUpdate)).toBe(true);
    expect(await filters.ChatType.PRIVATE.checkUpdate(groupUpdate)).toBe(false);

    expect(await filters.ChatType.GROUP.checkUpdate(groupUpdate)).toBe(true);
    expect(await filters.ChatType.SUPERGROUP.checkUpdate(supergroupUpdate)).toBe(true);
    expect(await filters.ChatType.CHANNEL.checkUpdate(channelUpdate)).toBe(true);

    expect(await filters.ChatType.GROUPS.checkUpdate(groupUpdate)).toBe(true);
    expect(await filters.ChatType.GROUPS.checkUpdate(supergroupUpdate)).toBe(true);
    expect(await filters.ChatType.GROUPS.checkUpdate(privateUpdate)).toBe(false);
  });

  it("filters.StatusUpdate matches service/status messages", async () => {
    const newMembersUpdate = new Update({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123,
        chat: { id: 1, type: "group" },
        new_chat_members: [{ id: 10, is_bot: false, first_name: "John" }],
      },
    });

    const leftMemberUpdate = new Update({
      update_id: 2,
      message: {
        message_id: 2,
        date: 123,
        chat: { id: 1, type: "group" },
        left_chat_member: { id: 10, is_bot: false, first_name: "John" },
      },
    });

    const titleUpdate = new Update({
      update_id: 3,
      message: {
        message_id: 3,
        date: 123,
        chat: { id: 1, type: "group" },
        new_chat_title: "New Title",
      },
    });

    const photoUpdate = new Update({
      update_id: 4,
      message: {
        message_id: 4,
        date: 123,
        chat: { id: 1, type: "group" },
        new_chat_photo: [{ file_id: "f1", file_unique_id: "u1", width: 100, height: 100 }],
      },
    });

    const deletePhotoUpdate = new Update({
      update_id: 5,
      message: {
        message_id: 5,
        date: 123,
        chat: { id: 1, type: "group" },
        delete_chat_photo: true,
      },
    });

    const pinnedUpdate = new Update({
      update_id: 6,
      message: {
        message_id: 6,
        date: 123,
        chat: { id: 1, type: "group" },
        pinned_message: { message_id: 99, date: 123, chat: { id: 1, type: "group" } },
      },
    });

    expect(await filters.StatusUpdate.NEW_CHAT_MEMBERS.checkUpdate(newMembersUpdate)).toBe(true);
    expect(await filters.StatusUpdate.LEFT_CHAT_MEMBER.checkUpdate(leftMemberUpdate)).toBe(true);
    expect(await filters.StatusUpdate.NEW_CHAT_TITLE.checkUpdate(titleUpdate)).toBe(true);
    expect(await filters.StatusUpdate.NEW_CHAT_PHOTO.checkUpdate(photoUpdate)).toBe(true);
    expect(await filters.StatusUpdate.DELETE_CHAT_PHOTO.checkUpdate(deletePhotoUpdate)).toBe(true);
    expect(await filters.StatusUpdate.PINNED_MESSAGE.checkUpdate(pinnedUpdate)).toBe(true);
    expect(await filters.StatusUpdate.ALL.checkUpdate(pinnedUpdate)).toBe(true);
  });

  it("filters.Regex matches message text/caption and populates context.matches", async () => {
    const bot = new Bot("TEST_TOKEN");
    const regexFilter = filters.Regex(/^order:(\d+)$/);

    const update = new Update({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123,
        chat: { id: 1, type: "private" },
        text: "order:54321",
      },
    }, bot);

    expect(await regexFilter.checkUpdate(update)).toBe(true);

    const callback = vi.fn();
    const handler = new MessageHandler(regexFilter, callback);
    const context = new CallbackContext({ bot });
    await handler.handleUpdate(update, context);

    expect(context.matches).toBeDefined();
    expect(context.matches?.[0]?.[1]).toBe("54321");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("filters.Regex matches caption when text is absent", async () => {
    const regexFilter = filters.Regex(/#awesome/i);
    const update = new Update({
      update_id: 1,
      message: {
        message_id: 1,
        date: 123,
        chat: { id: 1, type: "private" },
        caption: "Check this #AWESOME photo",
        photo: [{ file_id: "p1", file_unique_id: "u1", width: 50, height: 50 }],
      },
    });

    expect(await regexFilter.checkUpdate(update)).toBe(true);
  });

  it("filters.Custom executes user-supplied predicate", async () => {
    const custom = filters.Custom((u) => u.message?.text?.includes("secret") ?? false);

    const matchUpdate = new Update({
      update_id: 1,
      message: { message_id: 1, date: 123, chat: { id: 1, type: "private" }, text: "a secret message" },
    });
    const noMatchUpdate = new Update({
      update_id: 2,
      message: { message_id: 2, date: 123, chat: { id: 1, type: "private" }, text: "regular message" },
    });

    expect(await custom.checkUpdate(matchUpdate)).toBe(true);
    expect(await custom.checkUpdate(noMatchUpdate)).toBe(false);
  });

  it("media filters match respective media attachments", async () => {
    const baseMsg = { message_id: 1, date: 123, chat: { id: 1, type: "private" as const } };

    expect(await filters.PHOTO.checkUpdate(new Update({ update_id: 1, message: { ...baseMsg, photo: [{ file_id: "1", file_unique_id: "1", width: 1, height: 1 }] } }))).toBe(true);
    expect(await filters.DOCUMENT.checkUpdate(new Update({ update_id: 2, message: { ...baseMsg, document: { file_id: "1", file_unique_id: "1" } } }))).toBe(true);
    expect(await filters.AUDIO.checkUpdate(new Update({ update_id: 3, message: { ...baseMsg, audio: { file_id: "1", file_unique_id: "1", duration: 10 } } }))).toBe(true);
    expect(await filters.VIDEO.checkUpdate(new Update({ update_id: 4, message: { ...baseMsg, video: { file_id: "1", file_unique_id: "1", width: 1, height: 1, duration: 1 } } }))).toBe(true);
    expect(await filters.VOICE.checkUpdate(new Update({ update_id: 5, message: { ...baseMsg, voice: { file_id: "1", file_unique_id: "1", duration: 1 } } }))).toBe(true);
    expect(await filters.VIDEO_NOTE.checkUpdate(new Update({ update_id: 6, message: { ...baseMsg, video_note: { file_id: "1", file_unique_id: "1", length: 1, duration: 1 } } }))).toBe(true);
    expect(await filters.ANIMATION.checkUpdate(new Update({ update_id: 7, message: { ...baseMsg, animation: { file_id: "1", file_unique_id: "1", width: 1, height: 1, duration: 1 } } }))).toBe(true);
    expect(await filters.CONTACT.checkUpdate(new Update({ update_id: 8, message: { ...baseMsg, contact: { phone_number: "123", first_name: "A" } } }))).toBe(true);
    expect(await filters.LOCATION.checkUpdate(new Update({ update_id: 9, message: { ...baseMsg, location: { latitude: 1, longitude: 2 } } }))).toBe(true);
    expect(await filters.VENUE.checkUpdate(new Update({ update_id: 10, message: { ...baseMsg, venue: { location: { latitude: 1, longitude: 2 }, title: "T", address: "A" } } }))).toBe(true);
    expect(await filters.POLL.checkUpdate(new Update({ update_id: 11, message: { ...baseMsg, poll: { id: "p1", question: "Q", options: [], total_voter_count: 0, is_closed: false, is_anonymous: true, type: "regular", allows_multiple_answers: false } } }))).toBe(true);
    expect(await filters.DICE.checkUpdate(new Update({ update_id: 12, message: { ...baseMsg, dice: { emoji: "🎲", value: 6 } } }))).toBe(true);
    expect(await filters.REPLY.checkUpdate(new Update({ update_id: 13, message: { ...baseMsg, reply_to_message: baseMsg } }))).toBe(true);
    expect(await filters.FORWARDED.checkUpdate(new Update({ update_id: 14, message: { ...baseMsg, forward_origin: { type: "user", date: 123 } } }))).toBe(true);
  });
});

