package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// ForwardMessages forwards multiple messages of any kind to a target chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Forward options including chat_id, from_chat_id, and message_ids.
//
// Returns:
//   - []types.MessageId: Identifiers of the forwarded messages on success.
//   - error: TelegramError if the API returns an error, or a network error.
//
// Telegram API: https://core.telegram.org/bots/api#forwardmessages
func (b *Bot) ForwardMessages(ctx context.Context, opts *types.ForwardMessagesOptions) ([]types.MessageId, error) {
	var ids []types.MessageId
	if err := b.Request(ctx, "forwardMessages", opts, &ids); err != nil {
		return nil, err
	}
	return ids, nil
}

// CopyMessages copies multiple messages of any kind without linking to the originals.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Copy options including chat_id, from_chat_id, and message_ids.
//
// Returns:
//   - []types.MessageId: Identifiers of the copied messages on success.
//   - error: TelegramError if the API returns an error, or a network error.
//
// Telegram API: https://core.telegram.org/bots/api#copymessages
func (b *Bot) CopyMessages(ctx context.Context, opts *types.CopyMessagesOptions) ([]types.MessageId, error) {
	var ids []types.MessageId
	if err := b.Request(ctx, "copyMessages", opts, &ids); err != nil {
		return nil, err
	}
	return ids, nil
}

// DeleteMessages deletes multiple messages from a chat at once.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Delete options including chat_id and message_ids.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error, or a network error.
//
// Telegram API: https://core.telegram.org/bots/api#deletemessages
func (b *Bot) DeleteMessages(ctx context.Context, opts *types.DeleteMessagesOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "deleteMessages", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
