package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// CreateForumTopic creates a topic in a forum supergroup chat.
func (b *Bot) CreateForumTopic(ctx context.Context, chatID any, name string, iconColor int, iconCustomEmojiID string) (*types.ForumTopic, error) {
	payload := map[string]any{
		"chat_id": chatID,
		"name":    name,
	}
	if iconColor > 0 {
		payload["icon_color"] = iconColor
	}
	if iconCustomEmojiID != "" {
		payload["icon_custom_emoji_id"] = iconCustomEmojiID
	}
	var topic types.ForumTopic
	if err := b.Request(ctx, "createForumTopic", payload, &topic); err != nil {
		return nil, err
	}
	return &topic, nil
}

// CloseForumTopic closes an open topic in a forum supergroup chat.
func (b *Bot) CloseForumTopic(ctx context.Context, chatID any, messageThreadID int64) (bool, error) {
	payload := map[string]any{
		"chat_id":           chatID,
		"message_thread_id": messageThreadID,
	}
	var ok bool
	if err := b.Request(ctx, "closeForumTopic", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// EditForumTopic edits the name and icon of a topic in a forum supergroup chat.
// The bot must be an administrator in the chat for this to work and must have
// the can_manage_topics administrator right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options including chat_id, message_thread_id and the optional name
//     and icon_custom_emoji_id.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.EditForumTopic(ctx, &types.EditForumTopicOptions{
//	    ChatID: int64(-1001234567890), MessageThreadID: 42, Name: "Announcements",
//	})
func (b *Bot) EditForumTopic(ctx context.Context, opts *types.EditForumTopicOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "editForumTopic", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// ReopenForumTopic reopens a closed topic in a forum supergroup chat.
// The bot must be an administrator in the chat for this to work and must have
// the can_manage_topics administrator right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat.
//   - messageThreadID: Unique identifier for the target message thread of the forum topic.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.ReopenForumTopic(ctx, int64(-1001234567890), 42)
func (b *Bot) ReopenForumTopic(ctx context.Context, chatID any, messageThreadID int64) (bool, error) {
	payload := map[string]any{
		"chat_id":           chatID,
		"message_thread_id": messageThreadID,
	}
	var ok bool
	if err := b.Request(ctx, "reopenForumTopic", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeleteForumTopic deletes a forum topic along with all its messages in a
// forum supergroup chat. The bot must be an administrator in the chat for this
// to work and must have the can_manage_topics administrator right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat.
//   - messageThreadID: Unique identifier for the target message thread of the forum topic.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.DeleteForumTopic(ctx, int64(-1001234567890), 42)
func (b *Bot) DeleteForumTopic(ctx context.Context, chatID any, messageThreadID int64) (bool, error) {
	payload := map[string]any{
		"chat_id":           chatID,
		"message_thread_id": messageThreadID,
	}
	var ok bool
	if err := b.Request(ctx, "deleteForumTopic", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// UnpinAllForumTopicMessages clears the list of pinned messages in a forum
// topic. The bot must be an administrator in the chat for this to work and
// must have the can_manage_topics administrator right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat.
//   - messageThreadID: Unique identifier for the target message thread of the forum topic.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.UnpinAllForumTopicMessages(ctx, int64(-1001234567890), 42)
func (b *Bot) UnpinAllForumTopicMessages(ctx context.Context, chatID any, messageThreadID int64) (bool, error) {
	payload := map[string]any{
		"chat_id":           chatID,
		"message_thread_id": messageThreadID,
	}
	var ok bool
	if err := b.Request(ctx, "unpinAllForumTopicMessages", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// EditGeneralForumTopic edits the name of the 'General' topic in a forum
// supergroup chat. The bot must be an administrator in the chat for this to
// work and must have the can_manage_topics administrator right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat.
//   - name: New name of the topic, 1-128 characters.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.EditGeneralForumTopic(ctx, int64(-1001234567890), "General Chat")
func (b *Bot) EditGeneralForumTopic(ctx context.Context, chatID any, name string) (bool, error) {
	payload := map[string]any{
		"chat_id": chatID,
		"name":    name,
	}
	var ok bool
	if err := b.Request(ctx, "editGeneralForumTopic", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// generalTopicRequest performs a chat_id-only General forum topic request.
// It backs CloseGeneralForumTopic, ReopenGeneralForumTopic,
// HideGeneralForumTopic, UnhideGeneralForumTopic and
// UnpinAllGeneralForumTopicMessages, which share an identical wire shape.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - method: Bot API method name to call.
//   - chatID: Unique identifier for the target chat.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) generalTopicRequest(ctx context.Context, method string, chatID any) (bool, error) {
	var ok bool
	if err := b.Request(ctx, method, map[string]any{"chat_id": chatID}, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// CloseGeneralForumTopic closes an open 'General' topic in a forum supergroup
// chat. The bot must be an administrator in the chat for this to work and must
// have the can_manage_topics administrator right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.CloseGeneralForumTopic(ctx, int64(-1001234567890))
func (b *Bot) CloseGeneralForumTopic(ctx context.Context, chatID any) (bool, error) {
	return b.generalTopicRequest(ctx, "closeGeneralForumTopic", chatID)
}

// ReopenGeneralForumTopic reopens a closed 'General' topic in a forum
// supergroup chat. The bot must be an administrator in the chat for this to
// work and must have the can_manage_topics administrator right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.ReopenGeneralForumTopic(ctx, int64(-1001234567890))
func (b *Bot) ReopenGeneralForumTopic(ctx context.Context, chatID any) (bool, error) {
	return b.generalTopicRequest(ctx, "reopenGeneralForumTopic", chatID)
}

// HideGeneralForumTopic hides the 'General' topic in a forum supergroup chat.
// The bot must be an administrator in the chat for this to work and must have
// the can_manage_topics administrator right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.HideGeneralForumTopic(ctx, int64(-1001234567890))
func (b *Bot) HideGeneralForumTopic(ctx context.Context, chatID any) (bool, error) {
	return b.generalTopicRequest(ctx, "hideGeneralForumTopic", chatID)
}

// UnhideGeneralForumTopic unhides the 'General' topic in a forum supergroup
// chat. The bot must be an administrator in the chat for this to work and must
// have the can_manage_topics administrator right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.UnhideGeneralForumTopic(ctx, int64(-1001234567890))
func (b *Bot) UnhideGeneralForumTopic(ctx context.Context, chatID any) (bool, error) {
	return b.generalTopicRequest(ctx, "unhideGeneralForumTopic", chatID)
}

// UnpinAllGeneralForumTopicMessages clears the list of pinned messages in the
// 'General' topic of a forum supergroup chat. The bot must be an administrator
// in the chat for this to work and must have the can_manage_topics
// administrator right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.UnpinAllGeneralForumTopicMessages(ctx, int64(-1001234567890))
func (b *Bot) UnpinAllGeneralForumTopicMessages(ctx context.Context, chatID any) (bool, error) {
	return b.generalTopicRequest(ctx, "unpinAllGeneralForumTopicMessages", chatID)
}
