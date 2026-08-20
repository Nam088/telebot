import { describe, it, expect } from "vitest";
import {
  ParseMode,
  ChatType,
  ChatAction,
  ChatMemberStatus,
  MessageEntityType,
  PollType,
  DiceEmoji,
  UpdateType,
} from "../../../src/telegram/constants.js";

describe("Telegram Constants", () => {
  it("ParseMode contains expected values", () => {
    expect(ParseMode.HTML).toBe("HTML");
    expect(ParseMode.MARKDOWN_V2).toBe("MarkdownV2");
    expect(ParseMode.MARKDOWN).toBe("Markdown");
  });

  it("ChatType contains expected values", () => {
    expect(ChatType.PRIVATE).toBe("private");
    expect(ChatType.GROUP).toBe("group");
    expect(ChatType.SUPERGROUP).toBe("supergroup");
    expect(ChatType.CHANNEL).toBe("channel");
  });

  it("ChatAction contains expected values", () => {
    expect(ChatAction.TYPING).toBe("typing");
    expect(ChatAction.UPLOAD_PHOTO).toBe("upload_photo");
    expect(ChatAction.RECORD_VIDEO).toBe("record_video");
  });

  it("ChatMemberStatus contains expected values", () => {
    expect(ChatMemberStatus.CREATOR).toBe("creator");
    expect(ChatMemberStatus.ADMINISTRATOR).toBe("administrator");
    expect(ChatMemberStatus.MEMBER).toBe("member");
    expect(ChatMemberStatus.RESTRICTED).toBe("restricted");
    expect(ChatMemberStatus.LEFT).toBe("left");
    expect(ChatMemberStatus.KICKED).toBe("kicked");
  });

  it("MessageEntityType contains expected values", () => {
    expect(MessageEntityType.BOT_COMMAND).toBe("bot_command");
    expect(MessageEntityType.URL).toBe("url");
    expect(MessageEntityType.MENTION).toBe("mention");
  });

  it("PollType contains expected values", () => {
    expect(PollType.REGULAR).toBe("regular");
    expect(PollType.QUIZ).toBe("quiz");
  });

  it("DiceEmoji contains expected values", () => {
    expect(DiceEmoji.DICE).toBe("🎲");
    expect(DiceEmoji.DART).toBe("🎯");
    expect(DiceEmoji.BASKETBALL).toBe("🏀");
    expect(DiceEmoji.FOOTBALL).toBe("⚽");
    expect(DiceEmoji.SLOT_MACHINE).toBe("🎰");
    expect(DiceEmoji.BOWLING).toBe("🎳");
  });

  it("UpdateType contains expected values", () => {
    expect(UpdateType.MESSAGE).toBe("message");
    expect(UpdateType.CALLBACK_QUERY).toBe("callback_query");
    expect(UpdateType.INLINE_QUERY).toBe("inline_query");
  });
});
