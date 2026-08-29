package utils_test

import (
	"strings"
	"testing"

	"github.com/Nam088/telebot-go/pkg/utils"
)

func TestEscapeMarkdownV2(t *testing.T) {
	// Every MarkdownV2-reserved character, escaped with a leading backslash.
	reserved := `_*[]()~` + "`" + `>#+-=|{}.!\/`
	var escapedReserved strings.Builder
	for _, r := range reserved {
		escapedReserved.WriteByte('\\')
		escapedReserved.WriteRune(r)
	}

	tests := []struct {
		name string
		in   string
		want string
	}{
		{"empty", "", ""},
		{"plain text", "hello world", "hello world"},
		{"price and brackets", "Price: $10.00! [Sale]", `Price: $10\.00\! \[Sale\]`},
		{"all reserved chars", reserved, escapedReserved.String()},
		{"unicode preserved", "Привет, мир! 🚀", `Привет, мир\! 🚀`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := utils.EscapeMarkdownV2(tt.in); got != tt.want {
				t.Errorf("EscapeMarkdownV2(%q) = %q, want %q", tt.in, got, tt.want)
			}
		})
	}
}

func TestEscapeHTML(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want string
	}{
		{"empty", "", ""},
		{"plain text", "hello world", "hello world"},
		{"script tag", "<script>alert('xss') & win</script>", "&lt;script&gt;alert(&#39;xss&#39;) &amp; win&lt;/script&gt;"},
		{"double quotes", `She said "hi"`, "She said &quot;hi&quot;"},
		{"unicode preserved", "Ärger & Spaß", "Ärger &amp; Spaß"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := utils.EscapeHTML(tt.in); got != tt.want {
				t.Errorf("EscapeHTML(%q) = %q, want %q", tt.in, got, tt.want)
			}
		})
	}
}

func TestFormattingHelpersHTML(t *testing.T) {
	tests := []struct {
		name string
		got  string
		want string
	}{
		{"bold", utils.Bold("a<b", utils.ModeHTML), "<b>a&lt;b</b>"},
		{"italic", utils.Italic("hi", utils.ModeHTML), "<i>hi</i>"},
		{"code inline", utils.Code("x=1", "", utils.ModeHTML), "<code>x=1</code>"},
		{"code language", utils.Code("let a = 1", "typescript", utils.ModeHTML),
			`<pre><code class="language-typescript">let a = 1</code></pre>`},
		{"code language escaped", utils.Code("body", "c++", utils.ModeHTML),
			`<pre><code class="language-c++">body</code></pre>`},
		{"link", utils.Link("Site", "https://example.com/?a&b", utils.ModeHTML),
			`<a href="https://example.com/?a&amp;b">Site</a>`},
		{"mention", utils.UserMention("Alice", 42, utils.ModeHTML),
			`<a href="tg://user?id=42">Alice</a>`},
		{"spoiler", utils.Spoiler("secret", utils.ModeHTML), "<tg-spoiler>secret</tg-spoiler>"},
		{"strike", utils.Strike("old", utils.ModeHTML), "<s>old</s>"},
		{"underline", utils.Underline("important", utils.ModeHTML), "<u>important</u>"},
		{"blockquote", utils.Blockquote("quote", utils.ModeHTML), "<blockquote>quote</blockquote>"},
		{"expandable blockquote", utils.ExpandableBlockquote("quote", utils.ModeHTML),
			"<blockquote expandable>quote</blockquote>"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.got != tt.want {
				t.Errorf("got %q, want %q", tt.got, tt.want)
			}
		})
	}
}

func TestFormattingHelpersMarkdownV2(t *testing.T) {
	tests := []struct {
		name string
		got  string
		want string
	}{
		{"bold", utils.Bold("a.b", utils.ModeMarkdownV2), `*a\.b*`},
		{"italic", utils.Italic("hi!", utils.ModeMarkdownV2), `_hi\!_`},
		// Inside code spans only backtick and backslash are escaped.
		{"code inline partial escape", utils.Code("a*b`c\\d", "", utils.ModeMarkdownV2),
			"`a*b\\`c\\\\d`"},
		{"code language", utils.Code("x := 1`", "go", utils.ModeMarkdownV2), "```go\nx := 1\\`\n```"},
		{"code language escaped", utils.Code("body", "c++", utils.ModeMarkdownV2), "```c\\+\\+\nbody\n```"},
		{"link", utils.Link("My Site", "https://example.com/a_b", utils.ModeMarkdownV2),
			`[My Site](https:\/\/example\.com\/a\_b)`},
		{"mention", utils.UserMention("Alice", 42, utils.ModeMarkdownV2),
			`[Alice](tg:\/\/user?id\=42)`},
		{"spoiler", utils.Spoiler("secret.", utils.ModeMarkdownV2), `||secret\.||`},
		{"strike", utils.Strike("old", utils.ModeMarkdownV2), `~old~`},
		{"underline", utils.Underline("important", utils.ModeMarkdownV2), `__important__`},
		{"blockquote", utils.Blockquote("quote", utils.ModeMarkdownV2), `>quote`},
		{"expandable blockquote", utils.ExpandableBlockquote("quote", utils.ModeMarkdownV2), `**>quote||`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.got != tt.want {
				t.Errorf("got %q, want %q", tt.got, tt.want)
			}
		})
	}
}

func TestUnknownModeFallsBackToMarkdownV2(t *testing.T) {
	if got, want := utils.Bold("hi", "invalid"), `*hi*`; got != want {
		t.Errorf("Bold with unknown mode = %q, want %q", got, want)
	}
	if got, want := utils.Spoiler("hi", ""), "||hi||"; got != want {
		t.Errorf("Spoiler with empty mode = %q, want %q", got, want)
	}
}
