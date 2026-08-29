package bot

import (
	"context"

	"github.com/Nam088/telebot-go/pkg/types"
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

// SetMyCommands changes the list of the bot's commands.
func (b *Bot) SetMyCommands(ctx context.Context, commands []types.BotCommand) (bool, error) {
	payload := map[string]any{
		"commands": commands,
	}
	var ok bool
	if err := b.Request(ctx, "setMyCommands", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetMyCommands gets the current list of the bot's commands.
func (b *Bot) GetMyCommands(ctx context.Context) ([]types.BotCommand, error) {
	var commands []types.BotCommand
	if err := b.Request(ctx, "getMyCommands", nil, &commands); err != nil {
		return nil, err
	}
	return commands, nil
}
