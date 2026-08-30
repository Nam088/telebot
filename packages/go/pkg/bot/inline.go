package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// AnswerInlineQuery sends an answer to an inline query.
//
// Returns true on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#answerinlinequery
func (b *Bot) AnswerInlineQuery(ctx context.Context, opts *types.AnswerInlineQueryOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "answerInlineQuery", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// AnswerWebAppQuery sets the result of an interaction with a Web App.
//
// Returns a SentWebAppMessage on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#answerwebappquery
func (b *Bot) AnswerWebAppQuery(ctx context.Context, opts *types.AnswerWebAppQueryOptions) (*types.SentWebAppMessage, error) {
	var msg types.SentWebAppMessage
	if err := b.Request(ctx, "answerWebAppQuery", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SavePreparedInlineMessage stores a message that can be sent by the user of a Mini App.
//
// Returns a PreparedInlineMessage on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#savepreparedinlinemessage
func (b *Bot) SavePreparedInlineMessage(ctx context.Context, opts *types.SavePreparedInlineMessageOptions) (*types.PreparedInlineMessage, error) {
	var msg types.PreparedInlineMessage
	if err := b.Request(ctx, "savePreparedInlineMessage", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SavePreparedKeyboardButton saves a prepared keyboard button for a Mini App.
//
// Returns the PreparedKeyboardButton the docs declare as this method's result,
// which carries the identifier callers reuse to attach the button, or an error
// if the API call fails.
//
// Example:
//
//	button, err := b.SavePreparedKeyboardButton(ctx, &types.SavePreparedKeyboardButtonOptions{
//		UserID: int64(123456),
//		Button: map[string]any{"text": "Pay", "pay_for_access": true},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#savepreparedkeyboardbutton
func (b *Bot) SavePreparedKeyboardButton(ctx context.Context, opts *types.SavePreparedKeyboardButtonOptions) (*types.PreparedKeyboardButton, error) {
	var button types.PreparedKeyboardButton
	if err := b.Request(ctx, "savePreparedKeyboardButton", opts, &button); err != nil {
		return nil, err
	}
	return &button, nil
}
