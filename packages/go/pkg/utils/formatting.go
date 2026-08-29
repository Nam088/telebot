// Package utils provides shared helpers for Telegram text formatting
// (MarkdownV2 / HTML escaping and entity builders), input validation
// (bot tokens and Mini App initData), and rate limiting (token bucket).
package utils

import (
	"strconv"
	"strings"
)

// Mode identifies a Telegram parse mode for formatted text.
type Mode string

// Supported parse modes.
const (
	// ModeHTML selects Telegram's HTML parse mode.
	ModeHTML Mode = "HTML"
	// ModeMarkdownV2 selects Telegram's MarkdownV2 parse mode.
	ModeMarkdownV2 Mode = "MarkdownV2"
)

// mdv2ReservedChars lists every character that must be escaped outside
// pre-formatted code spans in Telegram's MarkdownV2 parse mode.
const mdv2ReservedChars = `_*[]()~` + "`" + `>#+-=|{}.!\/`

// EscapeMarkdownV2 escapes all special characters so that text is rendered
// literally under Telegram's MarkdownV2 parse mode.
func EscapeMarkdownV2(text string) string {
	var b strings.Builder
	b.Grow(len(text))
	for i := 0; i < len(text); i++ {
		c := text[i]
		if strings.IndexByte(mdv2ReservedChars, c) >= 0 {
			b.WriteByte('\\')
		}
		b.WriteByte(c)
	}
	return b.String()
}

// EscapeHTML escapes the HTML entities &, <, >, " and ' so that text is
// rendered literally under Telegram's HTML parse mode.
func EscapeHTML(text string) string {
	var b strings.Builder
	b.Grow(len(text))
	for _, r := range text {
		switch r {
		case '&':
			b.WriteString("&amp;")
		case '<':
			b.WriteString("&lt;")
		case '>':
			b.WriteString("&gt;")
		case '"':
			b.WriteString("&quot;")
		case '\'':
			b.WriteString("&#39;")
		default:
			b.WriteRune(r)
		}
	}
	return b.String()
}

// escapeCodeMarkdownV2 escapes only the characters that terminate code
// spans in MarkdownV2 (backtick and backslash); inside code spans the other
// reserved characters must stay literal.
func escapeCodeMarkdownV2(text string) string {
	var b strings.Builder
	b.Grow(len(text))
	for i := 0; i < len(text); i++ {
		c := text[i]
		if c == '`' || c == '\\' {
			b.WriteByte('\\')
		}
		b.WriteByte(c)
	}
	return b.String()
}

// Bold wraps text with bold styling. The content is escaped automatically.
// Any mode other than ModeHTML is treated as MarkdownV2.
func Bold(text string, mode Mode) string {
	if mode == ModeHTML {
		return "<b>" + EscapeHTML(text) + "</b>"
	}
	return "*" + EscapeMarkdownV2(text) + "*"
}

// Italic wraps text with italic styling. The content is escaped automatically.
// Any mode other than ModeHTML is treated as MarkdownV2.
func Italic(text string, mode Mode) string {
	if mode == ModeHTML {
		return "<i>" + EscapeHTML(text) + "</i>"
	}
	return "_" + EscapeMarkdownV2(text) + "_"
}

// Code wraps text as inline code, or as a fenced code block when language is
// non-empty (enabling syntax highlighting for that language). The content is
// escaped automatically. Any mode other than ModeHTML is treated as MarkdownV2.
func Code(text, language string, mode Mode) string {
	if language != "" {
		if mode == ModeHTML {
			return `<pre><code class="language-` + EscapeHTML(language) + `">` + EscapeHTML(text) + "</code></pre>"
		}
		return "```" + EscapeMarkdownV2(language) + "\n" + escapeCodeMarkdownV2(text) + "\n```"
	}
	if mode == ModeHTML {
		return "<code>" + EscapeHTML(text) + "</code>"
	}
	return "`" + escapeCodeMarkdownV2(text) + "`"
}

// Link formats a clickable hyperlink. The label and URL are escaped
// automatically. Any mode other than ModeHTML is treated as MarkdownV2.
func Link(text, url string, mode Mode) string {
	if mode == ModeHTML {
		return `<a href="` + EscapeHTML(url) + `">` + EscapeHTML(text) + "</a>"
	}
	return "[" + EscapeMarkdownV2(text) + "](" + EscapeMarkdownV2(url) + ")"
}

// UserMention formats an inline mention of a Telegram user by their ID using
// a tg://user deep link. Any mode other than ModeHTML is treated as MarkdownV2.
func UserMention(name string, userID int64, mode Mode) string {
	return Link(name, "tg://user?id="+strconv.FormatInt(userID, 10), mode)
}

// Spoiler wraps text with spoiler concealment formatting. The content is
// escaped automatically. Any mode other than ModeHTML is treated as MarkdownV2.
func Spoiler(text string, mode Mode) string {
	if mode == ModeHTML {
		return "<tg-spoiler>" + EscapeHTML(text) + "</tg-spoiler>"
	}
	return "||" + EscapeMarkdownV2(text) + "||"
}

// Strike wraps text with strikethrough styling. The content is escaped
// automatically. Any mode other than ModeHTML is treated as MarkdownV2.
func Strike(text string, mode Mode) string {
	if mode == ModeHTML {
		return "<s>" + EscapeHTML(text) + "</s>"
	}
	return "~" + EscapeMarkdownV2(text) + "~"
}

// Underline wraps text with underline styling. The content is escaped
// automatically. Any mode other than ModeHTML is treated as MarkdownV2.
func Underline(text string, mode Mode) string {
	if mode == ModeHTML {
		return "<u>" + EscapeHTML(text) + "</u>"
	}
	return "__" + EscapeMarkdownV2(text) + "__"
}

// Blockquote formats text as a quotation. The content is escaped
// automatically. Any mode other than ModeHTML is treated as MarkdownV2.
func Blockquote(text string, mode Mode) string {
	if mode == ModeHTML {
		return "<blockquote>" + EscapeHTML(text) + "</blockquote>"
	}
	return ">" + EscapeMarkdownV2(text)
}

// ExpandableBlockquote formats text as a collapsed, expandable quotation.
// The content is escaped automatically. Any mode other than ModeHTML is
// treated as MarkdownV2.
func ExpandableBlockquote(text string, mode Mode) string {
	if mode == ModeHTML {
		return "<blockquote expandable>" + EscapeHTML(text) + "</blockquote>"
	}
	return "**>" + EscapeMarkdownV2(text) + "||"
}
