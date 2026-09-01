package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// ApproveSuggestedPost approves a suggested post in a channel.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target
//     channel.
//   - messageID: Identifier of the suggested post message to approve.
//   - opts: Optional ApproveSuggestedPostOptions.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.ApproveSuggestedPost(ctx, "@channel", 42)
//
// Telegram API: https://core.telegram.org/bots/api#approvesuggestedpost
func (b *Bot) ApproveSuggestedPost(ctx context.Context, chatID any, messageID int64, opts ...*types.ApproveSuggestedPostOptions) (bool, error) {
	var payload any = map[string]any{
		"chat_id":    chatID,
		"message_id": messageID,
	}
	if len(opts) > 0 && opts[0] != nil {
		opts[0].ChatID = chatID
		opts[0].MessageID = messageID
		payload = opts[0]
	}
	var ok bool
	if err := b.Request(ctx, "approveSuggestedPost", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeclineSuggestedPost declines a suggested post in a channel.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target
//     channel.
//   - messageID: Identifier of the suggested post message to decline.
//   - opts: Optional DeclineSuggestedPostOptions.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.DeclineSuggestedPost(ctx, "@channel", 42)
//
// Telegram API: https://core.telegram.org/bots/api#declinesuggestedpost
func (b *Bot) DeclineSuggestedPost(ctx context.Context, chatID any, messageID int64, opts ...*types.DeclineSuggestedPostOptions) (bool, error) {
	var payload any = map[string]any{
		"chat_id":    chatID,
		"message_id": messageID,
	}
	if len(opts) > 0 && opts[0] != nil {
		opts[0].ChatID = chatID
		opts[0].MessageID = messageID
		payload = opts[0]
	}
	var ok bool
	if err := b.Request(ctx, "declineSuggestedPost", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
