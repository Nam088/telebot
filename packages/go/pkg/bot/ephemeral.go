package bot

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// EditEphemeralMessageText edits text or rich content of an ephemeral message
// (Bot API 10.2+).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options identifying the ephemeral message plus the new text or rich content.
//
// Returns:
//   - *types.Message: The edited Message, non-nil when Telegram echoes one.
//   - bool: True when Telegram returned the bare boolean result instead of a Message.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, ok, err := b.EditEphemeralMessageText(ctx, &types.EditEphemeralMessageTextOptions{
//		ChatID:             int64(-1001234567890),
//		ReceiverUserID:     123456,
//		EphemeralMessageID: 7,
//		Text:               "Corrected text",
//	})
func (b *Bot) EditEphemeralMessageText(ctx context.Context, opts *types.EditEphemeralMessageTextOptions) (*types.Message, bool, error) {
	return b.requestMessageOrTrue(ctx, "editEphemeralMessageText", opts)
}

// EditEphemeralMessageMedia edits the media of an ephemeral message (Bot API 10.3+).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options identifying the ephemeral message plus the new media object.
//
// Returns:
//   - *types.Message: The edited Message, non-nil when Telegram echoes one.
//   - bool: True when Telegram returned the bare boolean result instead of a Message.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, ok, err := b.EditEphemeralMessageMedia(ctx, &types.EditEphemeralMessageMediaOptions{
//		ChatID:             int64(-1001234567890),
//		ReceiverUserID:     123456,
//		EphemeralMessageID: 7,
//		Media:              &types.InputMediaPhoto{Type: "photo", Media: "AGACAD..."},
//	})
func (b *Bot) EditEphemeralMessageMedia(ctx context.Context, opts *types.EditEphemeralMessageMediaOptions) (*types.Message, bool, error) {
	return b.requestMessageOrTrue(ctx, "editEphemeralMessageMedia", opts)
}

// EditEphemeralMessageCaption edits the caption of an ephemeral message
// (Bot API 10.3+).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options identifying the ephemeral message plus the new caption.
//
// Returns:
//   - *types.Message: The edited Message, non-nil when Telegram echoes one.
//   - bool: True when Telegram returned the bare boolean result instead of a Message.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, ok, err := b.EditEphemeralMessageCaption(ctx, &types.EditEphemeralMessageCaptionOptions{
//		ChatID:             int64(-1001234567890),
//		ReceiverUserID:     123456,
//		EphemeralMessageID: 7,
//		Caption:            "New caption",
//	})
func (b *Bot) EditEphemeralMessageCaption(ctx context.Context, opts *types.EditEphemeralMessageCaptionOptions) (*types.Message, bool, error) {
	return b.requestMessageOrTrue(ctx, "editEphemeralMessageCaption", opts)
}

// EditEphemeralMessageReplyMarkup edits the inline keyboard attached to an
// ephemeral message (Bot API 10.3+).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options identifying the ephemeral message plus the new reply markup.
//
// Returns:
//   - *types.Message: The edited Message, non-nil when Telegram echoes one.
//   - bool: True when Telegram returned the bare boolean result instead of a Message.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, ok, err := b.EditEphemeralMessageReplyMarkup(ctx, &types.EditEphemeralMessageReplyMarkupOptions{
//		ChatID:             int64(-1001234567890),
//		ReceiverUserID:     123456,
//		EphemeralMessageID: 7,
//	})
func (b *Bot) EditEphemeralMessageReplyMarkup(ctx context.Context, opts *types.EditEphemeralMessageReplyMarkupOptions) (*types.Message, bool, error) {
	return b.requestMessageOrTrue(ctx, "editEphemeralMessageReplyMarkup", opts)
}

// DeleteEphemeralMessage deletes an ephemeral message (Bot API 10.2+).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options carrying chat_id, receiver_user_id and ephemeral_message_id.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.DeleteEphemeralMessage(ctx, &types.DeleteEphemeralMessageOptions{
//		ChatID:             int64(-1001234567890),
//		ReceiverUserID:     123456,
//		EphemeralMessageID: 7,
//	})
func (b *Bot) DeleteEphemeralMessage(ctx context.Context, opts *types.DeleteEphemeralMessageOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "deleteEphemeralMessage", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// requestMessageOrTrue sends a Bot API method whose result is the union
// "Message | True" (node types it as `Message | boolean`) and splits the two
// possible wire shapes into separate Go values.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - method: Bot API method name.
//   - payload: Request payload; may be nil.
//
// Returns:
//   - *types.Message: The edited Message, non-nil only when Telegram echoes one.
//   - bool: True when Telegram returned the bare boolean result.
//   - error: TelegramError or a decoding error.
func (b *Bot) requestMessageOrTrue(ctx context.Context, method string, payload any) (*types.Message, bool, error) {
	var raw json.RawMessage
	if err := b.Request(ctx, method, payload, &raw); err != nil {
		return nil, false, err
	}
	trimmed := bytes.TrimLeft(raw, " \t\r\n")
	if len(trimmed) > 0 && (trimmed[0] == 't' || trimmed[0] == 'f') {
		var ok bool
		if err := json.Unmarshal(raw, &ok); err != nil {
			return nil, false, fmt.Errorf("failed to unmarshal %s boolean result: %w", method, err)
		}
		return nil, ok, nil
	}
	var msg types.Message
	if err := json.Unmarshal(raw, &msg); err != nil {
		return nil, false, fmt.Errorf("failed to unmarshal %s message result: %w", method, err)
	}
	return &msg, false, nil
}
