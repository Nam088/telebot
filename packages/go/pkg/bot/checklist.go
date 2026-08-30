package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// SendChecklist sends an interactive checklist message.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - options: Checklist configuration serialized as-is, mirroring node's
//     Record<string, unknown> argument — `chat_id` plus the `checklist` object
//     (its `items` array and `max_selected_count`), and the optional caption,
//     notification, reply and business-connection fields. Pass nil for an empty
//     object payload.
//
// Returns:
//   - *types.Message: The sent Message on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, err := b.SendChecklist(ctx, map[string]any{
//		"chat_id": int64(123456),
//		"checklist": map[string]any{
//			"items": []map[string]any{
//				{"id": "i1", "text": "Pack the bag"},
//				{"id": "i2", "text": "Check in"},
//			},
//			"max_selected_count": 1,
//		},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#sendchecklist
func (b *Bot) SendChecklist(ctx context.Context, options map[string]any) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendChecklist", payloadOrEmpty(options), &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// EditMessageChecklist edits an interactive checklist message.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - options: Checklist modification parameters serialized as-is, mirroring
//     node's Record<string, unknown> argument (`chat_id`/`message_id` or
//     `inline_message_id`, plus the new `checklist` object). Pass nil for an
//     empty object payload.
//
// Returns:
//   - *types.Message: The edited Message, non-nil when Telegram echoes one.
//   - bool: True when Telegram returned the bare boolean result instead of a
//     Message.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msg, ok, err := b.EditMessageChecklist(ctx, map[string]any{
//		"chat_id":    int64(123456),
//		"message_id": int64(7),
//		"checklist": map[string]any{
//			"items": []map[string]any{{"id": "i1", "text": "Pack the bag"}},
//		},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#editmessagechecklist
func (b *Bot) EditMessageChecklist(ctx context.Context, options map[string]any) (*types.Message, bool, error) {
	return b.requestMessageOrTrue(ctx, "editMessageChecklist", payloadOrEmpty(options))
}
