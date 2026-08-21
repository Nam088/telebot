import { describe, it, expect } from "vitest";
import {
  escapeMarkdownV2,
  escapeHtml,
  bold,
  italic,
  code,
  link,
  userMention,
  spoiler,
  strikethrough,
  underline,
  blockquote,
  expandableBlockquote,
} from "../../../src/utils/formatting.js";

describe("Formatting & Escaping Utilities", () => {
  it("escapeMarkdownV2 escapes all Telegram MarkdownV2 special characters", () => {
    const raw = "Hello *world*! [Link](url) _test_ ~strike~ `code` >quote #tag + - = | { } . !";
    const escaped = escapeMarkdownV2(raw);
    expect(escaped).toContain("\\*");
    expect(escaped).toContain("\\[");
    expect(escaped).toContain("\\_");
    expect(escaped).toContain("\\!");
    expect(escaped).toContain("\\.");
  });

  it("escapeHtml escapes HTML dangerous entities", () => {
    const raw = '<script>alert("test & win")</script>';
    const escaped = escapeHtml(raw);
    expect(escaped).toBe("&lt;script&gt;alert(&quot;test &amp; win&quot;)&lt;/script&gt;");
  });

  it("formats bold text in HTML and MarkdownV2", () => {
    expect(bold("Alert!")).toBe("<b>Alert!</b>");
    expect(bold("Alert!", "MarkdownV2")).toBe("*Alert\\!*");
  });

  it("formats italic text in HTML and MarkdownV2", () => {
    expect(italic("Notice")).toBe("<i>Notice</i>");
    expect(italic("Notice", "MarkdownV2")).toBe("_Notice_");
  });

  it("formats inline and multi-line code blocks", () => {
    expect(code("const x = 1;")).toBe("<code>const x = 1;</code>");
    expect(code("const x = 1;", "typescript")).toBe(
      '<pre><code class="language-typescript">const x = 1;</code></pre>',
    );
    expect(code("const x = 1;", "typescript", "MarkdownV2")).toContain("```typescript\n");
  });

  it("formats links and user mentions", () => {
    expect(link("Docs", "https://t.me")).toBe('<a href="https://t.me">Docs</a>');
    expect(userMention("Alice", 123456)).toBe('<a href="tg://user?id=123456">Alice</a>');
  });

  it("formats spoilers, strikethrough, underline, and blockquotes", () => {
    expect(spoiler("Secret")).toBe("<tg-spoiler>Secret</tg-spoiler>");
    expect(strikethrough("Old")).toBe("<s>Old</s>");
    expect(underline("Underlined")).toBe("<u>Underlined</u>");
    expect(blockquote("Quote text")).toBe("<blockquote>Quote text</blockquote>");
    expect(expandableBlockquote("Long text")).toBe("<blockquote expandable>Long text</blockquote>");
  });
});
