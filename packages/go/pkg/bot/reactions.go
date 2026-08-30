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

// DeleteMessageReaction removes the reaction of a user from a message.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options carrying chat_id and message_id, plus the optional
//     user_id (whose reaction to remove) and actor_chat_id (for business
//     connections).
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.DeleteMessageReaction(ctx, &types.DeleteMessageReactionOptions{
//		ChatID:    int64(123456),
//		MessageID: 789,
//	})
//
// Telegram API: https://core.telegram.org/bots/api#deletemessagereaction
func (b *Bot) DeleteMessageReaction(ctx context.Context, opts *types.DeleteMessageReactionOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "deleteMessageReaction", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeleteAllMessageReactions removes all reactions set on a message by a
// certain user or by the bot.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options carrying chat_id, plus the optional user_id and
//     actor_chat_id. Note this method takes no message_id.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.DeleteAllMessageReactions(ctx, &types.DeleteAllMessageReactionsOptions{
//		ChatID: int64(123456),
//	})
//
// Telegram API: https://core.telegram.org/bots/api#deleteallmessagereactions
func (b *Bot) DeleteAllMessageReactions(ctx context.Context, opts *types.DeleteAllMessageReactionsOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "deleteAllMessageReactions", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
