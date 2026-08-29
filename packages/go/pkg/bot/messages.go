package bot

import (
	"context"

	"github.com/Nam088/telebot-go/pkg/types"
)

// SendPhoto sends a photo.
func (b *Bot) SendPhoto(ctx context.Context, chatID any, photo any, caption string, replyMarkup *types.InlineKeyboardMarkup) (*types.Message, error) {
	payload := map[string]any{
		"chat_id": chatID,
		"photo":   photo,
	}
	if caption != "" {
		payload["caption"] = caption
	}
	if replyMarkup != nil {
		payload["reply_markup"] = replyMarkup
	}
	var msg types.Message
	if err := b.Request(ctx, "sendPhoto", payload, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendDocument sends a general file/document.
func (b *Bot) SendDocument(ctx context.Context, chatID any, document any, caption string) (*types.Message, error) {
	payload := map[string]any{
		"chat_id":  chatID,
		"document": document,
	}
	if caption != "" {
		payload["caption"] = caption
	}
	var msg types.Message
	if err := b.Request(ctx, "sendDocument", payload, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// EditMessageText edits text and game messages.
func (b *Bot) EditMessageText(ctx context.Context, opts *types.EditMessageTextOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "editMessageText", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// EditMessageReplyMarkup edits only the reply markup of messages.
func (b *Bot) EditMessageReplyMarkup(ctx context.Context, opts *types.EditMessageReplyMarkupOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "editMessageReplyMarkup", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// ForwardMessage forwards messages of any kind.
func (b *Bot) ForwardMessage(ctx context.Context, chatID, fromChatID any, messageID int64) (*types.Message, error) {
	payload := map[string]any{
		"chat_id":      chatID,
		"from_chat_id": fromChatID,
		"message_id":   messageID,
	}
	var msg types.Message
	if err := b.Request(ctx, "forwardMessage", payload, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// CopyMessage copies messages of any kind.
func (b *Bot) CopyMessage(ctx context.Context, chatID, fromChatID any, messageID int64) (*types.MessageId, error) {
	payload := map[string]any{
		"chat_id":      chatID,
		"from_chat_id": fromChatID,
		"message_id":   messageID,
	}
	var msgID types.MessageId
	if err := b.Request(ctx, "copyMessage", payload, &msgID); err != nil {
		return nil, err
	}
	return &msgID, nil
}

// SendChatAction tells the user that something is happening on the bot's side.
func (b *Bot) SendChatAction(ctx context.Context, chatID any, action string) (bool, error) {
	payload := map[string]any{
		"chat_id": chatID,
		"action":  action,
	}
	var ok bool
	if err := b.Request(ctx, "sendChatAction", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
