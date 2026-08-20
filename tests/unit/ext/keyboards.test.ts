import { describe, it, expect } from "vitest";
import {
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
  ReplyKeyboardRemove,
  ForceReply,
  InlineKeyboard,
  ReplyKeyboard,
  InputMediaPhoto,
  InputMediaVideo,
  InputMediaAnimation,
  InputMediaAudio,
  InputMediaDocument,
} from "../../../src/ext/keyboards.js";

describe("Keyboards", () => {
  it("InlineKeyboardMarkup creates valid structure", () => {
    const markup: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          { text: "Option 1", callback_data: "opt_1" },
          { text: "Option 2", callback_data: "opt_2" },
        ],
        [
          { text: "URL", url: "https://example.com" },
        ],
      ],
    };

    expect(markup.inline_keyboard).toHaveLength(2);
    expect(markup.inline_keyboard[0]?.[0]?.text).toBe("Option 1");
    expect(markup.inline_keyboard[0]?.[0]?.callback_data).toBe("opt_1");
  });

  it("InlineKeyboard fluent builder constructs InlineKeyboardMarkup", () => {
    const keyboard = new InlineKeyboard()
      .text("Btn 1", "data_1")
      .url("Website", "https://example.com")
      .webApp("App", "https://webapp.example.com")
      .row()
      .switchInlineQuery("Search", "query")
      .switchInlineQueryCurrentChat("Search Chat", "chat query")
      .copyText("Copy", "some text")
      .row()
      .text("Btn 2", "data_2");

    const markup = keyboard.build();
    expect(markup.inline_keyboard).toEqual([
      [
        { text: "Btn 1", callback_data: "data_1" },
        { text: "Website", url: "https://example.com" },
        { text: "App", web_app: { url: "https://webapp.example.com" } },
      ],
      [
        { text: "Search", switch_inline_query: "query" },
        { text: "Search Chat", switch_inline_query_current_chat: "chat query" },
        { text: "Copy", copy_text: { text: "some text" } },
      ],
      [
        { text: "Btn 2", callback_data: "data_2" },
      ],
    ]);
  });


  it("ReplyKeyboardMarkup creates valid structure", () => {
    const markup: ReplyKeyboardMarkup = {
      keyboard: [
        [{ text: "Send Location", request_location: true }],
        [{ text: "Send Contact", request_contact: true }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
      input_field_placeholder: "Choose option...",
    };

    expect(markup.keyboard).toHaveLength(2);
    expect(markup.resize_keyboard).toBe(true);
    expect(markup.one_time_keyboard).toBe(true);
    expect(markup.input_field_placeholder).toBe("Choose option...");
  });

  it("ReplyKeyboard fluent builder constructs ReplyKeyboardMarkup", () => {
    const keyboard = new ReplyKeyboard({ resize_keyboard: true, one_time_keyboard: true })
      .text("Option A")
      .requestLocation("Share Location")
      .row()
      .requestContact("Share Contact")
      .requestPoll("Create Poll", "quiz");

    const markup = keyboard.build();
    expect(markup.resize_keyboard).toBe(true);
    expect(markup.one_time_keyboard).toBe(true);
    expect(markup.keyboard).toEqual([
      [
        { text: "Option A" },
        { text: "Share Location", request_location: true },
      ],
      [
        { text: "Share Contact", request_contact: true },
        { text: "Create Poll", request_poll: { type: "quiz" } },
      ],
    ]);
  });


  it("ReplyKeyboardRemove creates remove_keyboard structure", () => {
    const markup: ReplyKeyboardRemove = {
      remove_keyboard: true,
      selective: false,
    };
    expect(markup.remove_keyboard).toBe(true);
  });

  it("ForceReply creates force_reply structure", () => {
    const markup: ForceReply = {
      force_reply: true,
      input_field_placeholder: "Type your answer...",
      selective: true,
    };
    expect(markup.force_reply).toBe(true);
    expect(markup.input_field_placeholder).toBe("Type your answer...");
  });

  it("InputMedia objects have correct type discriminator and properties", () => {
    const photo: InputMediaPhoto = {
      type: "photo",
      media: "attach://photo1",
      caption: "Photo caption",
      parse_mode: "HTML",
    };
    const video: InputMediaVideo = {
      type: "video",
      media: "attach://video1",
      width: 1920,
      height: 1080,
      duration: 60,
      supports_streaming: true,
    };
    const animation: InputMediaAnimation = {
      type: "animation",
      media: "attach://anim1",
    };
    const audio: InputMediaAudio = {
      type: "audio",
      media: "attach://audio1",
      performer: "Artist",
      title: "Song",
    };
    const document: InputMediaDocument = {
      type: "document",
      media: "attach://doc1",
      caption: "Doc caption",
    };

    expect(photo.type).toBe("photo");
    expect(video.type).toBe("video");
    expect(animation.type).toBe("animation");
    expect(audio.type).toBe("audio");
    expect(document.type).toBe("document");
  });
});
