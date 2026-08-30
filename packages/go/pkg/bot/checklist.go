package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// SendChecklist sends an interactive checklist message.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Checklist options carrying business_connection_id, chat_id and the
//     checklist object, plus the optional notification, effect, reply and
//     markup fields.
//
// Returns:
//   - *types.Message: The sent Message on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, err := b.SendChecklist(ctx, &types.SendChecklistOptions{
//		BusinessConnectionID: "423778511293324225",
//		ChatID:               int64(123456),
//		Checklist: &types.InputChecklist{
//			Title: "Departure",
//			Tasks: []types.InputChecklistTask{
//				{ID: 1, Text: "Pack the bag"},
//				{ID: 2, Text: "Check in"},
//			},
//		},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#sendchecklist
func (b *Bot) SendChecklist(ctx context.Context, opts *types.SendChecklistOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendChecklist", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// EditMessageChecklist edits an interactive checklist message.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Checklist modification options carrying business_connection_id,
//     chat_id, message_id and the new checklist object, plus the optional
//     reply markup.
//
// Returns:
//   - *types.Message: The edited Message, non-nil when Telegram echoes one.
//   - bool: True when Telegram returned the bare boolean result instead of a
//     Message.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, ok, err := b.EditMessageChecklist(ctx, &types.EditMessageChecklistOptions{
//		BusinessConnectionID: "423778511293324225",
//		ChatID:               int64(123456),
//		MessageID:            int64(7),
//		Checklist: map[string]any{
//			"items": []any{map[string]any{"id": "i1", "text": "Pack the bag"}},
//		},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#editmessagechecklist
func (b *Bot) EditMessageChecklist(ctx context.Context, opts *types.EditMessageChecklistOptions) (*types.Message, bool, error) {
	return b.requestMessageOrTrue(ctx, "editMessageChecklist", opts)
}
