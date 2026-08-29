package keyboard

import "github.com/Nam088/telebot-go/pkg/types"

// InlineKeyboard is a fluent builder for constructing Telegram InlineKeyboardMarkup.
type InlineKeyboard struct {
	rows [][]types.InlineKeyboardButton
}

// NewInlineKeyboard creates a new empty inline keyboard builder.
//
// Example:
//
//	kb := keyboard.NewInlineKeyboard().
//	    Data("Option 1", "opt:1").
//	    Data("Option 2", "opt:2").
//	    Row().
//	    URL("Docs", "https://example.com").
//	    Build()
func NewInlineKeyboard() *InlineKeyboard {
	return &InlineKeyboard{
		rows: make([][]types.InlineKeyboardButton, 0),
	}
}

// Row starts a new row of buttons. Subsequent button calls will be added to this row.
func (k *InlineKeyboard) Row(buttons ...types.InlineKeyboardButton) *InlineKeyboard {
	if len(buttons) > 0 {
		k.rows = append(k.rows, buttons)
	} else {
		k.rows = append(k.rows, []types.InlineKeyboardButton{})
	}
	return k
}

// Data adds a callback_data button to the current row.
//
// Parameters:
//   - text: Label text on the button.
//   - data: Data to be sent in a callback query to the bot when clicked (1-64 bytes).
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

// URL adds an external HTTP or Telegram deep link button to the current row.
//
// Parameters:
//   - text: Label text on the button.
//   - url: Target HTTP URL to be opened when the button is clicked.
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

// Build compiles the configured layout into a *types.InlineKeyboardMarkup suitable for SendMessageOptions.
func (k *InlineKeyboard) Build() *types.InlineKeyboardMarkup {
	return &types.InlineKeyboardMarkup{
		InlineKeyboard: k.rows,
	}
}
