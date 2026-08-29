package bot

import (
	"context"

	"github.com/Nam088/telebot-go/pkg/types"
)

// EditMessageCaption edits captions of messages previously sent by the bot or via the bot.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options identifying the target message (chat_id+message_id or inline_message_id)
//     and the new caption, parse mode, caption entities, and reply markup.
//
// Returns:
//   - *types.Message: The edited Message object on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	msg, err := bot.EditMessageCaption(ctx, &types.EditMessageCaptionOptions{
//		ChatID:    int64(123456),
//		MessageID: 789,
//		Caption:   "Updated caption",
//	})
func (b *Bot) EditMessageCaption(ctx context.Context, opts *types.EditMessageCaptionOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "editMessageCaption", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// EditMessageMedia edits animation, audio, document, photo, or video messages.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options identifying the target message (chat_id+message_id or inline_message_id)
//     and the replacement media plus optional reply markup.
//
// Returns:
//   - *types.Message: The edited Message object on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	msg, err := bot.EditMessageMedia(ctx, &types.EditMessageMediaOptions{
//		ChatID:    int64(123456),
//		MessageID: 789,
//		Media:     types.InputMediaPhoto{Type: "photo", Media: "https://example.com/new.jpg"},
//	})
func (b *Bot) EditMessageMedia(ctx context.Context, opts *types.EditMessageMediaOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "editMessageMedia", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// EditMessageLiveLocation edits live location messages.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options identifying the target message (chat_id+message_id or inline_message_id)
//     and the new latitude/longitude plus optional accuracy, heading, and proximity settings.
//
// Returns:
//   - *types.Message: The edited Message object on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	msg, err := bot.EditMessageLiveLocation(ctx, &types.EditMessageLiveLocationOptions{
//		ChatID:    int64(123456),
//		MessageID: 789,
//		Latitude:  37.7749,
//		Longitude: -122.4194,
//	})
func (b *Bot) EditMessageLiveLocation(ctx context.Context, opts *types.EditMessageLiveLocationOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "editMessageLiveLocation", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// StopMessageLiveLocation stops updating a live location message before the live period expires.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options identifying the target message (chat_id+message_id or inline_message_id)
//     and an optional reply markup.
//
// Returns:
//   - *types.Message: The edited Message object on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	msg, err := bot.StopMessageLiveLocation(ctx, &types.StopMessageLiveLocationOptions{
//		ChatID:    int64(123456),
//		MessageID: 789,
//	})
func (b *Bot) StopMessageLiveLocation(ctx context.Context, opts *types.StopMessageLiveLocationOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "stopMessageLiveLocation", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// StopPoll stops a poll which was sent by the bot.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options identifying the chat and the message containing the poll,
//     plus an optional reply markup.
//
// Returns:
//   - *types.Poll: The stopped Poll with the final vote counts on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	poll, err := bot.StopPoll(ctx, &types.StopPollOptions{
//		ChatID:    int64(123456),
//		MessageID: 789,
//	})
func (b *Bot) StopPoll(ctx context.Context, opts *types.StopPollOptions) (*types.Poll, error) {
	var poll types.Poll
	if err := b.Request(ctx, "stopPoll", opts, &poll); err != nil {
		return nil, err
	}
	return &poll, nil
}
