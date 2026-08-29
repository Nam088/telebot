package keyboard_test

import (
	"testing"

	"github.com/Nam088/telebot-go/pkg/components/keyboard"
)

func TestInlineKeyboardBuilder(t *testing.T) {
	kb := keyboard.NewInlineKeyboard().
		Data("Option A", "opt:a").
		Data("Option B", "opt:b").
		Row().
		URL("Website", "https://example.com").
		Build()

	if len(kb.InlineKeyboard) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(kb.InlineKeyboard))
	}

	if len(kb.InlineKeyboard[0]) != 2 {
		t.Errorf("expected 2 buttons in row 1, got %d", len(kb.InlineKeyboard[0]))
	}

	if kb.InlineKeyboard[0][0].CallbackData != "opt:a" {
		t.Errorf("expected opt:a, got %s", kb.InlineKeyboard[0][0].CallbackData)
	}

	if kb.InlineKeyboard[1][0].URL != "https://example.com" {
		t.Errorf("expected url https://example.com, got %s", kb.InlineKeyboard[1][0].URL)
	}
}
