package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// SendPaidMedia sends paid media (photos/videos purchased with Telegram Stars).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Paid media options carrying chat_id, star_count and the media
//     array of InputPaidMedia objects, plus the optional payload, caption,
//     notification and reply fields.
//
// Returns:
//   - *types.Message: The sent Message on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, err := b.SendPaidMedia(ctx, &types.SendPaidMediaOptions{
//		ChatID:    int64(123456),
//		StarCount: 50,
//		Media: []any{
//			map[string]any{"type": "photo", "id": "AGACQADTAAQCAAFY"},
//		},
//		Payload: "premium_content",
//	})
//
// Telegram API: https://core.telegram.org/bots/api#sendpaidmedia
func (b *Bot) SendPaidMedia(ctx context.Context, opts *types.SendPaidMediaOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendPaidMedia", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendLivePhoto sends an animated Live Photo message.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options carrying chat_id, live_photo and photo plus the optional
//     caption, spoiler and ephemeral parameters.
//
// Returns:
//   - *types.Message: The sent Message on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, err := b.SendLivePhoto(ctx, &types.SendLivePhotoOptions{
//		ChatID:    int64(123456),
//		Photo:     "AGACQADTAAQCAAFYAQACAgADAgAC8gU0AAQD",
//		LivePhoto: "BAACAgADAgAC8gU0AxAAGoJtV52",
//		Caption:   "Sunset",
//	})
//
// Telegram API: https://core.telegram.org/bots/api#sendlivephoto
func (b *Bot) SendLivePhoto(ctx context.Context, opts *types.SendLivePhotoOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendLivePhoto", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}
