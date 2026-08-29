package keyboard_test

import (
	"encoding/json"
	"testing"

	"github.com/Nam088/telebot-go/pkg/components/keyboard"
)

func TestReplyKeyboardBuilder(t *testing.T) {
	kb := keyboard.NewReplyKeyboard(
		keyboard.WithResizeKeyboard(),
		keyboard.WithOneTimeKeyboard(),
		keyboard.WithInputFieldPlaceholder("Pick one..."),
	).
		AddButton("Option A").
		AddButton("Option B").
		AddRow().
		AddButton("Help").
		Build()

	if len(kb.Keyboard) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(kb.Keyboard))
	}
	if len(kb.Keyboard[0]) != 2 {
		t.Errorf("expected 2 buttons in row 1, got %d", len(kb.Keyboard[0]))
	}
	if kb.Keyboard[0][0].Text != "Option A" {
		t.Errorf("expected first button text %q, got %q", "Option A", kb.Keyboard[0][0].Text)
	}
	if kb.Keyboard[1][0].Text != "Help" {
		t.Errorf("expected second row button %q, got %q", "Help", kb.Keyboard[1][0].Text)
	}
	if !kb.ResizeKeyboard {
		t.Error("expected resize_keyboard to be true")
	}
	if !kb.OneTimeKeyboard {
		t.Error("expected one_time_keyboard to be true")
	}
	if kb.InputFieldPlaceholder != "Pick one..." {
		t.Errorf("expected placeholder %q, got %q", "Pick one...", kb.InputFieldPlaceholder)
	}
}

func TestReplyKeyboard_Defaults(t *testing.T) {
	kb := keyboard.NewReplyKeyboard().AddButton("Only").Build()

	if kb.ResizeKeyboard || kb.OneTimeKeyboard {
		t.Error("expected boolean options to default to false")
	}
	if kb.InputFieldPlaceholder != "" {
		t.Errorf("expected empty placeholder by default, got %q", kb.InputFieldPlaceholder)
	}
	if len(kb.Keyboard) != 1 || len(kb.Keyboard[0]) != 1 {
		t.Fatalf("expected a single implicit row with one button, got %v", kb.Keyboard)
	}
}

func TestReplyKeyboard_AddRowWithButtons(t *testing.T) {
	kb := keyboard.NewReplyKeyboard().
		AddRow(
			keyboard.KeyboardButton{Text: "Share Contact", RequestContact: true},
			keyboard.KeyboardButton{Text: "Share Location", RequestLocation: true},
		).
		Build()

	if len(kb.Keyboard) != 1 || len(kb.Keyboard[0]) != 2 {
		t.Fatalf("expected one row with two buttons, got %v", kb.Keyboard)
	}
	if !kb.Keyboard[0][0].RequestContact {
		t.Error("expected first button to request contact")
	}
	if !kb.Keyboard[0][1].RequestLocation {
		t.Error("expected second button to request location")
	}
}

func TestReplyKeyboard_EmptyRowsDropped(t *testing.T) {
	kb := keyboard.NewReplyKeyboard().
		AddRow().
		AddRow().
		AddButton("Keep").
		AddRow().
		Build()

	if len(kb.Keyboard) != 1 {
		t.Fatalf("expected empty rows to be dropped, got %d rows", len(kb.Keyboard))
	}
	if kb.Keyboard[0][0].Text != "Keep" {
		t.Errorf("expected remaining button %q, got %q", "Keep", kb.Keyboard[0][0].Text)
	}
}

func TestReplyKeyboard_JSON(t *testing.T) {
	kb := keyboard.NewReplyKeyboard(keyboard.WithResizeKeyboard()).
		AddButton("A").
		Build()

	data, err := json.Marshal(kb)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	var got map[string]any
	if err := json.Unmarshal(data, &got); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}

	if _, ok := got["keyboard"]; !ok {
		t.Error("expected snake_case key \"keyboard\" in JSON output")
	}
	if _, ok := got["resize_keyboard"]; !ok {
		t.Error("expected snake_case key \"resize_keyboard\" in JSON output")
	}
	// Unset options must be omitted.
	if _, ok := got["one_time_keyboard"]; ok {
		t.Error("expected one_time_keyboard to be omitted when false")
	}
	if _, ok := got["input_field_placeholder"]; ok {
		t.Error("expected input_field_placeholder to be omitted when empty")
	}
}
