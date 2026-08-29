/**
 * Telegram text formatting and MarkdownV2 / HTML escaping utilities.
 *
 * @packageDocumentation
 */

const MARKDOWN_V2_RESERVED_CHARS = /[_*[\]()~`>#+\-=|{}.!\\/]/g;

/**
 * Escapes special characters for Telegram's MarkdownV2 parse mode.
 *
 * @param text - Raw unescaped string.
 * @returns Safely escaped string for MarkdownV2 formatting.
 *
 * @example
 * ```ts
 * const safeText = escapeMarkdownV2("Price: $10.00! [Sale]");
 * // Returns: "Price: $10\\.00\\! \\[Sale\\]"
 * ```
 */
export function escapeMarkdownV2(text: string): string {
  return text.replace(MARKDOWN_V2_RESERVED_CHARS, "\\$&");
}

/**
 * Escapes HTML entities (`&`, `<`, `>`, `"`, `'`) for Telegram's HTML parse mode.
 *
 * @param text - Raw unescaped string.
 * @returns Safely escaped string for HTML formatting.
 *
 * @example
 * ```ts
 * const safeHtml = escapeHtml("<script>alert('xss') & win</script>");
 * // Returns: "&lt;script&gt;alert(&#39;xss&#39;) &amp; win&lt;/script&gt;"
 * ```
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });
}

/**
 * Wraps text with bold styling in either HTML or MarkdownV2 format.
 *
 * @param text - Content to format (will be automatically escaped).
 * @param mode - Target parse mode (`"HTML"` or `"MarkdownV2"`). Default: `"HTML"`.
 * @returns Formatted bold text string.
 */
export function bold(text: string, mode: "HTML" | "MarkdownV2" = "HTML"): string {
  if (mode === "HTML") {
    return `<b>${escapeHtml(text)}</b>`;
  }
  return `*${escapeMarkdownV2(text)}*`;
}

/**
 * Wraps text with italic styling in either HTML or MarkdownV2 format.
 *
 * @param text - Content to format (will be automatically escaped).
 * @param mode - Target parse mode (`"HTML"` or `"MarkdownV2"`). Default: `"HTML"`.
 * @returns Formatted italic text string.
 */
export function italic(text: string, mode: "HTML" | "MarkdownV2" = "HTML"): string {
  if (mode === "HTML") {
    return `<i>${escapeHtml(text)}</i>`;
  }
  return `_${escapeMarkdownV2(text)}_`;
}

/**
 * Wraps text in an inline code or multi-line preformatted code block.
 *
 * @param text - Code text (will be escaped).
 * @param language - Optional syntax highlighting language (e.g. `"typescript"`).
 * @param mode - Target parse mode (`"HTML"` or `"MarkdownV2"`). Default: `"HTML"`.
 * @returns Formatted code block string.
 */
export function code(
  text: string,
  language?: string,
  mode: "HTML" | "MarkdownV2" = "HTML",
): string {
  if (language) {
    if (mode === "HTML") {
      return `<pre><code class="language-${escapeHtml(language)}">${escapeHtml(text)}</code></pre>`;
    }
    return `\`\`\`${escapeMarkdownV2(language)}\n${text.replace(/[`\\]/g, "\\$&")}\n\`\`\``;
  }

  if (mode === "HTML") {
    return `<code>${escapeHtml(text)}</code>`;
  }
  return `\`${text.replace(/[`\\]/g, "\\$&")}\``;
}

/**
 * Formats a clickable URL hyperlink.
 *
 * @param text - Label text to display.
 * @param url - HTTPS or tg:// target URL.
 * @param mode - Target parse mode (`"HTML"` or `"MarkdownV2"`). Default: `"HTML"`.
 * @returns Formatted hyperlink string.
 */
export function link(text: string, url: string, mode: "HTML" | "MarkdownV2" = "HTML"): string {
  if (mode === "HTML") {
    return `<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`;
  }
  return `[${escapeMarkdownV2(text)}](${escapeMarkdownV2(url)})`;
}

/**
 * Formats an inline mention to a Telegram user by their ID.
 *
 * @param name - Display name of the user.
 * @param userId - Unique Telegram user ID.
 * @param mode - Target parse mode (`"HTML"` or `"MarkdownV2"`). Default: `"HTML"`.
 * @returns Formatted mention string.
 */
export function userMention(
  name: string,
  userId: number,
  mode: "HTML" | "MarkdownV2" = "HTML",
): string {
  return link(name, `tg://user?id=${userId}`, mode);
}

/**
 * Wraps text with spoiler concealment formatting.
 *
 * @param text - Content to conceal behind spoiler.
 * @param mode - Target parse mode (`"HTML"` or `"MarkdownV2"`). Default: `"HTML"`.
 * @returns Formatted spoiler string.
 */
export function spoiler(text: string, mode: "HTML" | "MarkdownV2" = "HTML"): string {
  if (mode === "HTML") {
    return `<tg-spoiler>${escapeHtml(text)}</tg-spoiler>`;
  }
  return `||${escapeMarkdownV2(text)}||`;
}

/**
 * Wraps text with strikethrough styling.
 *
 * @param text - Content to format.
 * @param mode - Target parse mode (`"HTML"` or `"MarkdownV2"`). Default: `"HTML"`.
 * @returns Formatted strikethrough string.
 */
export function strikethrough(text: string, mode: "HTML" | "MarkdownV2" = "HTML"): string {
  if (mode === "HTML") {
    return `<s>${escapeHtml(text)}</s>`;
  }
  return `~${escapeMarkdownV2(text)}~`;
}

/**
 * Wraps text with underline styling.
 *
 * @param text - Content to format.
 * @param mode - Target parse mode (`"HTML"` or `"MarkdownV2"`). Default: `"HTML"`.
 * @returns Formatted underline string.
 */
export function underline(text: string, mode: "HTML" | "MarkdownV2" = "HTML"): string {
  if (mode === "HTML") {
    return `<u>${escapeHtml(text)}</u>`;
  }
  return `__${escapeMarkdownV2(text)}__`;
}

/**
 * Formats a blockquote quotation.
 *
 * @param text - Quoted content.
 * @param mode - Target parse mode (`"HTML"` or `"MarkdownV2"`). Default: `"HTML"`.
 * @returns Formatted blockquote string.
 */
export function blockquote(text: string, mode: "HTML" | "MarkdownV2" = "HTML"): string {
  if (mode === "HTML") {
    return `<blockquote>${escapeHtml(text)}</blockquote>`;
  }
  return `>${escapeMarkdownV2(text)}`;
}

/**
 * Formats an expandable collapsible blockquote quotation.
 *
 * @param text - Quoted content.
 * @param mode - Target parse mode (`"HTML"` or `"MarkdownV2"`). Default: `"HTML"`.
 * @returns Formatted expandable blockquote string.
 */
export function expandableBlockquote(text: string, mode: "HTML" | "MarkdownV2" = "HTML"): string {
  if (mode === "HTML") {
    return `<blockquote expandable>${escapeHtml(text)}</blockquote>`;
  }
  return `**>${escapeMarkdownV2(text)}||`;
}
