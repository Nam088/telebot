package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// SetMessageReaction changes the chosen reactions on a message.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options including chat_id, message_id, and the reaction types to set.
//     If Reaction is empty, the reaction is removed from the message.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.SetMessageReaction(ctx, &types.SetMessageReactionOptions{
//		ChatID:    int64(123456),
//		MessageID: 789,
//		Reaction: []types.ReactionType{
//			types.ReactionTypeEmoji{Type: "emoji", Emoji: "👍"},
//		},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#setmessagereaction
func (b *Bot) SetMessageReaction(ctx context.Context, opts *types.SetMessageReactionOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setMessageReaction", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeleteMessageReaction removes the bot's reaction from a message.
//
// It is implemented by calling setMessageReaction with an empty reaction list,
// which clears the reaction previously set by the bot.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target channel (int64 or string).
//   - messageID: Identifier of the target message.
//   - isBig: Pass true to remove the reaction with a big animation.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.DeleteMessageReaction(ctx, int64(123456), 789, false)
//
// Telegram API: https://core.telegram.org/bots/api#setmessagereaction
func (b *Bot) DeleteMessageReaction(ctx context.Context, chatID any, messageID int64, isBig bool) (bool, error) {
	payload := map[string]any{
		"chat_id":    chatID,
		"message_id": messageID,
		"reaction":   []types.ReactionType{},
	}
	if isBig {
		payload["is_big"] = true
	}
	var ok bool
	if err := b.Request(ctx, "setMessageReaction", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeleteAllMessageReactions clears all reactions on a message.
//
// It is implemented by calling setMessageReaction with an empty reaction list.
// Currently, as of January 1, 2025, only one reaction can be set on a message,
// so this is equivalent to removing the single reaction.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target channel (int64 or string).
//   - messageID: Identifier of the target message.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.DeleteAllMessageReactions(ctx, int64(123456), 789)
//
// Telegram API: https://core.telegram.org/bots/api#setmessagereaction
func (b *Bot) DeleteAllMessageReactions(ctx context.Context, chatID any, messageID int64) (bool, error) {
	payload := map[string]any{
		"chat_id":    chatID,
		"message_id": messageID,
		"reaction":   []types.ReactionType{},
	}
	var ok bool
	if err := b.Request(ctx, "setMessageReaction", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
