package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// SendPaidMedia sends paid media (photos/videos purchased with Telegram Stars).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - options: Paid media parameters serialized as-is, mirroring node's
//     Record<string, unknown> argument — `chat_id`, `star_count` and the
//     `media` array of InputPaidMedia objects, plus the optional payload,
//     caption, notification and reply fields. Pass nil for an empty object
//     payload.
//
// Returns:
//   - *types.Message: The sent Message on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, err := b.SendPaidMedia(ctx, map[string]any{
//		"chat_id":            int64(123456),
//		"star_count":         50,
//		"media":              []map[string]any{{"type": "photo", "id": "AGACQADTAAQCAAFY"}},
//		"paid_media_payload": "premium_content",
//	})
func (b *Bot) SendPaidMedia(ctx context.Context, options map[string]any) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendPaidMedia", payloadOrEmpty(options), &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendLivePhoto sends an animated Live Photo message.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options carrying chat_id, photo and video plus the optional
//     caption, spoiler and ephemeral parameters.
//
// Returns:
//   - *types.Message: The sent Message on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, err := b.SendLivePhoto(ctx, &types.SendLivePhotoOptions{
//		ChatID:  int64(123456),
//		Photo:   "AGACQADTAAQCAAFYAQACAgADAgAC8gU0AAQD",
//		Video:   "BAACAgADAgAC8gU0AxAAGoJtV52",
//		Caption: "Sunset",
//	})
func (b *Bot) SendLivePhoto(ctx context.Context, opts *types.SendLivePhotoOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendLivePhoto", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}
