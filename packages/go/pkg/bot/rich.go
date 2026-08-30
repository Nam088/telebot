package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// SendRichMessage sends a rich formatted message to a Telegram chat
// (Bot API 10.1+).
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options carrying the target chat plus the InputRichMessage to send;
//     ChatID and RichMessage are the two required fields.
//
// Returns:
//   - *types.Message: The sent Message on success.
//   - error: *types.TelegramError if Telegram returns ok:false, or a transport error.
//
// Example:
//
//	msg, err := b.SendRichMessage(ctx, &types.SendRichMessageOptions{
//		ChatID: int64(123456),
//		RichMessage: types.InputRichMessage{
//			Blocks: []types.InputRichBlock{
//				&types.InputRichBlockParagraph{
//					Type: "paragraph",
//					Text: []types.RichText{
//						"Hello, ",
//						types.RichTextBold{Type: "bold", Text: "world"},
//					},
//				},
//			},
//		},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#sendrichmessage
func (b *Bot) SendRichMessage(ctx context.Context, opts *types.SendRichMessageOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendRichMessage", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendRichMessageDraft streams a partial rich message to a user while the
// message is still being generated (Bot API 10.1+).
//
// The streamed draft is a temporary 30-second preview: once the output is
// finalized the bot must call SendRichMessage with the complete message to
// persist it in the user's chat. Returns True on success, which is why Go
// mirrors the existing SendMessageDraft signature rather than decoding a
// Message.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options carrying chat_id, a non-zero draft_id and the partial
//     InputRichMessage to stream.
//
// Returns:
//   - bool: True on success.
//   - error: *types.TelegramError if Telegram returns ok:false, or a transport error.
//
// Example:
//
//	ok, err := b.SendRichMessageDraft(ctx, &types.SendRichMessageDraftOptions{
//		ChatID:    int64(123456),
//		DraftID:   7,
//		RichMessage: types.InputRichMessage{
//			Blocks: []types.InputRichBlock{
//				&types.InputRichBlockThinking{Type: "thinking", Text: "🤔"},
//			},
//		},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#sendrichmessagedraft
func (b *Bot) SendRichMessageDraft(ctx context.Context, opts *types.SendRichMessageDraftOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "sendRichMessageDraft", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
