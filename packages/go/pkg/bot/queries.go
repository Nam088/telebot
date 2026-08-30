package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// AnswerGuestQuery answers a guest query in a mini app.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - guestQueryID: Unique identifier of the guest query.
//   - result: Result payload to return to the querying user.
//
// Returns:
//   - *types.SentWebAppMessage: The message description, carrying
//     inline_message_id when Telegram returned one.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	sent, err := b.AnswerGuestQuery(ctx, "gq1", map[string]any{
//		"inline_message_id": "abc123",
//	})
//
// Telegram API: https://core.telegram.org/bots/api#answerguestquery
func (b *Bot) AnswerGuestQuery(ctx context.Context, guestQueryID string, result any) (*types.SentWebAppMessage, error) {
	payload := map[string]any{
		"guest_query_id": guestQueryID,
		"result":         result,
	}
	var sent types.SentWebAppMessage
	if err := b.Request(ctx, "answerGuestQuery", payload, &sent); err != nil {
		return nil, err
	}
	return &sent, nil
}

// SendChatJoinRequestWebApp sends a Web App for a chat join request
// (Bot API 10.1+).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - options: Join request Web App parameters serialized as-is, mirroring
//     node's Record<string, unknown> argument (e.g. "chat_id", "user_id",
//     "web_app"). Pass nil for an empty object payload.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SendChatJoinRequestWebApp(ctx, map[string]any{
//		"chat_id": int64(-1001234567890),
//		"user_id": 123456,
//		"web_app": map[string]any{"url": "https://example.com/join"},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#sendchatjoinrequestwebapp
func (b *Bot) SendChatJoinRequestWebApp(ctx context.Context, options map[string]any) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "sendChatJoinRequestWebApp", payloadOrEmpty(options), &ok); err != nil {
		return false, err
	}
	return ok, nil
}
