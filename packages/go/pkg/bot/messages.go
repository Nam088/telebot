package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// SendPhoto sends a photo to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id and photo, plus all documented
//     sendPhoto optionals (caption, parse_mode, reply_parameters, ...).
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	msg, err := bot.SendPhoto(ctx, &types.SendPhotoOptions{
//		ChatID:    int64(123456),
//		Photo:     "https://example.com/cat.jpg",
//		Caption:   "Cute cat!",
//		ParseMode: "HTML",
//	})
//
// Telegram API: https://core.telegram.org/bots/api#sendphoto
func (b *Bot) SendPhoto(ctx context.Context, opts *types.SendPhotoOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendPhoto", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendDocument sends a general file or document to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id and document, plus all documented
//     sendDocument optionals (thumbnail, caption, parse_mode, ...).
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	msg, err := bot.SendDocument(ctx, &types.SendDocumentOptions{
//		ChatID:   int64(123456),
//		Document: "https://example.com/report.pdf",
//		Caption:  "Quarterly report",
//	})
//
// Telegram API: https://core.telegram.org/bots/api#senddocument
func (b *Bot) SendDocument(ctx context.Context, opts *types.SendDocumentOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendDocument", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// EditMessageText edits text and game messages sent by the bot.
//
// Parameters:
//   - ctx: Context for cancellation.
//   - opts: Edit options including chat_id, message_id, new text, and optional inline keyboard.
//
// Returns:
//   - *types.Message: The edited Message object on success.
//   - error: Error if the message cannot be edited.
//
// Telegram API: https://core.telegram.org/bots/api#editmessagetext
func (b *Bot) EditMessageText(ctx context.Context, opts *types.EditMessageTextOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "editMessageText", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// EditMessageReplyMarkup edits only the reply markup of messages.
//
// Parameters:
//   - ctx: Context for cancellation.
//   - opts: Options specifying the target message and the new ReplyMarkup.
//
// Returns:
//   - *types.Message: The edited Message object on success.
//   - error: An error if the request fails.
//
// Telegram API: https://core.telegram.org/bots/api#editmessagereplymarkup
func (b *Bot) EditMessageReplyMarkup(ctx context.Context, opts *types.EditMessageReplyMarkupOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "editMessageReplyMarkup", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// ForwardMessage forwards a message of any kind to a target chat.
//
// Parameters:
//   - ctx: Cancellation context.
//   - chatID: Unique identifier for the destination chat.
//   - fromChatID: Unique identifier for the chat where the original message was sent.
//   - messageID: Message identifier in the chat specified in fromChatID.
//   - directMessagesTopicID: Optional identifier of the topic the message will be sent to in a direct messages chat; 0 omits it.
//   - messageEffectID: Optional unique identifier of the message effect to be added to the message; empty omits it.
//   - suggestedPostParameters: Optional suggested post parameters; nil omits them.
//
// Returns:
//   - *types.Message: The forwarded Message object on success.
//   - error: An error if forwarding failed.
//
// Telegram API: https://core.telegram.org/bots/api#forwardmessage
func (b *Bot) ForwardMessage(ctx context.Context, chatID, fromChatID any, messageID int64, directMessagesTopicID int64, messageEffectID string, suggestedPostParameters *types.SuggestedPostParameters) (*types.Message, error) {
	payload := map[string]any{
		"chat_id":      chatID,
		"from_chat_id": fromChatID,
		"message_id":   messageID,
	}
	if directMessagesTopicID > 0 {
		payload["direct_messages_topic_id"] = directMessagesTopicID
	}
	if messageEffectID != "" {
		payload["message_effect_id"] = messageEffectID
	}
	if suggestedPostParameters != nil {
		payload["suggested_post_parameters"] = suggestedPostParameters
	}
	var msg types.Message
	if err := b.Request(ctx, "forwardMessage", payload, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// CopyMessage copies a message of any kind without linking to the original message.
//
// Parameters:
//   - ctx: Cancellation context.
//   - opts: Copy options including chat_id, from_chat_id and message_id, plus
//     all documented copyMessage optionals (caption, parse_mode,
//     video_start_timestamp, ...).
//
// Returns:
//   - *types.MessageId: Unique message identifier of the newly sent message.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	mid, err := bot.CopyMessage(ctx, &types.CopyMessageOptions{
//		ChatID:     int64(123456),
//		FromChatID: int64(-100987654),
//		MessageID:  int64(42),
//	})
//
// Telegram API: https://core.telegram.org/bots/api#copymessage
func (b *Bot) CopyMessage(ctx context.Context, opts *types.CopyMessageOptions) (*types.MessageId, error) {
	var msgID types.MessageId
	if err := b.Request(ctx, "copyMessage", opts, &msgID); err != nil {
		return nil, err
	}
	return &msgID, nil
}

// SendChatAction broadcasts a chat action (typing, upload_photo, record_video, etc.).
//
// Parameters:
//   - ctx: Cancellation context.
//   - chatID: Target chat identifier.
//   - action: Type of action to broadcast (e.g. "typing", "upload_photo", "find_location").
//   - businessConnectionID: Optional unique identifier of the business connection on behalf of which the action will be sent; empty omits it.
//
// Returns:
//   - bool: True on success.
//   - error: An error if the action failed.
//
// Telegram API: https://core.telegram.org/bots/api#sendchataction
func (b *Bot) SendChatAction(ctx context.Context, chatID any, action string, businessConnectionID string) (bool, error) {
	payload := map[string]any{
		"chat_id": chatID,
		"action":  action,
	}
	if businessConnectionID != "" {
		payload["business_connection_id"] = businessConnectionID
	}
	var ok bool
	if err := b.Request(ctx, "sendChatAction", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetUserPersonalChatMessages retrieves messages from a personal chat.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Identifier of the target user whose personal chat messages are
//     retrieved (required).
//   - limit: The maximum number of messages to be returned, 1-100 (required).
//
// Returns:
//   - []types.Message: The retrieved messages, exactly as node types the
//     result (`Message[]`).
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	msgs, err := b.GetUserPersonalChatMessages(ctx, int64(123456), 10)
//	fmt.Printf("%d personal chat messages\n", len(msgs))
//
// Telegram API: https://core.telegram.org/bots/api#getuserpersonalchatmessages
func (b *Bot) GetUserPersonalChatMessages(ctx context.Context, userID int64, limit int) ([]types.Message, error) {
	payload := map[string]any{"user_id": userID, "limit": limit}
	var msgs []types.Message
	if err := b.Request(ctx, "getUserPersonalChatMessages", payload, &msgs); err != nil {
		return nil, err
	}
	return msgs, nil
}
