package keyboard

import "github.com/Nam088/telebot-go/pkg/types"

// InlineKeyboard is a fluent builder for types.InlineKeyboardMarkup.
type InlineKeyboard struct {
	rows [][]types.InlineKeyboardButton
}

// NewInlineKeyboard creates a new empty inline keyboard builder.
func NewInlineKeyboard() *InlineKeyboard {
	return &InlineKeyboard{
		rows: make([][]types.InlineKeyboardButton, 0),
	}
}

// Row starts a new row of buttons.
func (k *InlineKeyboard) Row(buttons ...types.InlineKeyboardButton) *InlineKeyboard {
	if len(buttons) > 0 {
		k.rows = append(k.rows, buttons)
	} else {
		k.rows = append(k.rows, []types.InlineKeyboardButton{})
	}
	return k
}

// Data adds a callback_data button to the current row (or creates one if empty).
func (k *InlineKeyboard) Data(text, data string) *InlineKeyboard {
	btn := types.InlineKeyboardButton{
		Text:         text,
		CallbackData: data,
	}
	if len(k.rows) == 0 {
		k.rows = append(k.rows, []types.InlineKeyboardButton{btn})
	} else {
		lastIdx := len(k.rows) - 1
		k.rows[lastIdx] = append(k.rows[lastIdx], btn)
	}
	return k
}

// URL adds a URL button to the current row.
func (k *InlineKeyboard) URL(text, url string) *InlineKeyboard {
	btn := types.InlineKeyboardButton{
		Text: text,
		URL:  url,
	}
	if len(k.rows) == 0 {
		k.rows = append(k.rows, []types.InlineKeyboardButton{btn})
	} else {
		lastIdx := len(k.rows) - 1
		k.rows[lastIdx] = append(k.rows[lastIdx], btn)
	}
	return k
}

// Build compiles the builder into a *types.InlineKeyboardMarkup.
func (k *InlineKeyboard) Build() *types.InlineKeyboardMarkup {
	return &types.InlineKeyboardMarkup{
		InlineKeyboard: k.rows,
	}
}
