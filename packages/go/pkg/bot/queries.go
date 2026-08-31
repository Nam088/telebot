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
//   - opts: Join request Web App options carrying chat_join_request_query_id
//     and web_app_url.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SendChatJoinRequestWebApp(ctx, &types.SendChatJoinRequestWebAppOptions{
//		ChatJoinRequestQueryID: "q1",
//		WebAppURL:              "https://example.com/join",
//	})
//
// Telegram API: https://core.telegram.org/bots/api#sendchatjoinrequestwebapp
func (b *Bot) SendChatJoinRequestWebApp(ctx context.Context, opts *types.SendChatJoinRequestWebAppOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "sendChatJoinRequestWebApp", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// AnswerChatJoinRequestQuery sets the result of a chat join request query
// (Bot API 10.3+).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Answer options carrying chat_join_request_query_id and the result
//     object describing the outcome of the join request interaction.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.AnswerChatJoinRequestQuery(ctx, &types.AnswerChatJoinRequestQueryOptions{
//		ChatJoinRequestQueryID: "q1",
//		Result:                 map[string]any{"status": "allowed"},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#answerchatjoinrequestquery
func (b *Bot) AnswerChatJoinRequestQuery(ctx context.Context, opts *types.AnswerChatJoinRequestQueryOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "answerChatJoinRequestQuery", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
