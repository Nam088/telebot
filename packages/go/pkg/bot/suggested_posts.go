package bot

import (
	"context"
)

// ApproveSuggestedPost approves a suggested post in a channel.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target
//     channel.
//   - messageID: Identifier of the suggested post message to approve.
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
func (b *Bot) ApproveSuggestedPost(ctx context.Context, chatID any, messageID int64) (bool, error) {
	payload := map[string]any{
		"chat_id":    chatID,
		"message_id": messageID,
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
func (b *Bot) DeclineSuggestedPost(ctx context.Context, chatID any, messageID int64) (bool, error) {
	payload := map[string]any{
		"chat_id":    chatID,
		"message_id": messageID,
	}
	var ok bool
	if err := b.Request(ctx, "declineSuggestedPost", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
