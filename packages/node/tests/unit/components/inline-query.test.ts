import { describe, it, expect } from "vitest";
import { InlineQueryResultBuilder } from "../../../src/components/inline-query.js";

describe("InlineQueryResultBuilder Unit Tests", () => {
  it("builds article results with text message content", () => {
    const article = InlineQueryResultBuilder.article("art-1", "Google Search", {
      description: "Fast web search",
      url: "https://google.com",
    }).text("https://google.com", { parse_mode: "HTML" });

    expect(article.type).toBe("article");
    expect(article.id).toBe("art-1");
    expect((article as any).title).toBe("Google Search");
    expect((article as any).input_message_content).toEqual({
      message_text: "https://google.com",
      parse_mode: "HTML",
      disable_web_page_preview: undefined,
    });
  });

  it("builds photo, video, audio, and document results", () => {
    const photo = InlineQueryResultBuilder.photo("p1", "https://example.com/p.jpg", {
      caption: "Photo caption",
    });
    expect(photo.type).toBe("photo");
    expect((photo as any).photo_url).toBe("https://example.com/p.jpg");

    const video = InlineQueryResultBuilder.video(
      "v1",
      "https://example.com/v.mp4",
      "video/mp4",
      "https://example.com/thumb.jpg",
      "Video Title",
    );
    expect(video.type).toBe("video");
    expect((video as any).video_url).toBe("https://example.com/v.mp4");

    const audio = InlineQueryResultBuilder.audio("a1", "https://example.com/a.mp3", "Track 1");
    expect(audio.type).toBe("audio");
    expect((audio as any).title).toBe("Track 1");

    const doc = InlineQueryResultBuilder.document(
      "d1",
      "Doc 1",
      "https://example.com/file.pdf",
      "application/pdf",
    );
    expect(doc.type).toBe("document");
    expect((doc as any).document_url).toBe("https://example.com/file.pdf");
  });

  it("builds gif, location, venue, contact, and game results", () => {
    const gif = InlineQueryResultBuilder.gif(
      "g1",
      "https://example.com/g.gif",
      "https://example.com/g.jpg",
    );
    expect(gif.type).toBe("gif");

    const loc = InlineQueryResultBuilder.location("l1", 10.762622, 106.660172, "Ho Chi Minh City");
    expect(loc.type).toBe("location");
    expect((loc as any).latitude).toBe(10.762622);

    const venue = InlineQueryResultBuilder.venue(
      "vn1",
      10.762622,
      106.660172,
      "Bitexco",
      "District 1",
    );
    expect(venue.type).toBe("venue");
    expect((venue as any).address).toBe("District 1");

    const contact = InlineQueryResultBuilder.contact("c1", "+84901234567", "Alice");
    expect(contact.type).toBe("contact");
    expect((contact as any).first_name).toBe("Alice");

    const game = InlineQueryResultBuilder.game("gm1", "my_cool_game");
    expect(game.type).toBe("game");
    expect((game as any).game_short_name).toBe("my_cool_game");
  });
});
