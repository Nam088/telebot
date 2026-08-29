package bot

import (
	"context"

	"github.com/Nam088/telebot-go/pkg/types"
)

// GetChat gets up to date information about the chat.
func (b *Bot) GetChat(ctx context.Context, chatID any) (*types.Chat, error) {
	payload := map[string]any{"chat_id": chatID}
	var chat types.Chat
	if err := b.Request(ctx, "getChat", payload, &chat); err != nil {
		return nil, err
	}
	return &chat, nil
}

// GetChatAdministrators gets a list of administrators in a chat.
func (b *Bot) GetChatAdministrators(ctx context.Context, chatID any) ([]types.ChatMember, error) {
	payload := map[string]any{"chat_id": chatID}
	var admins []types.ChatMember
	if err := b.Request(ctx, "getChatAdministrators", payload, &admins); err != nil {
		return nil, err
	}
	return admins, nil
}

// GetChatMemberCount gets the number of members in a chat.
func (b *Bot) GetChatMemberCount(ctx context.Context, chatID any) (int, error) {
	payload := map[string]any{"chat_id": chatID}
	var count int
	if err := b.Request(ctx, "getChatMemberCount", payload, &count); err != nil {
		return 0, err
	}
	return count, nil
}

// LeaveChat leaves a group, supergroup or channel.
func (b *Bot) LeaveChat(ctx context.Context, chatID any) (bool, error) {
	payload := map[string]any{"chat_id": chatID}
	var ok bool
	if err := b.Request(ctx, "leaveChat", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// BanChatMember bans a user in a group, supergroup or channel.
func (b *Bot) BanChatMember(ctx context.Context, chatID any, userID int64, untilDate int64, revokeMessages bool) (bool, error) {
	payload := map[string]any{
		"chat_id":         chatID,
		"user_id":         userID,
		"revoke_messages": revokeMessages,
	}
	if untilDate > 0 {
		payload["until_date"] = untilDate
	}
	var ok bool
	if err := b.Request(ctx, "banChatMember", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// UnbanChatMember unbans a previously banned user in a supergroup or channel.
func (b *Bot) UnbanChatMember(ctx context.Context, chatID any, userID int64, onlyIfBanned bool) (bool, error) {
	payload := map[string]any{
		"chat_id":        chatID,
		"user_id":        userID,
		"only_if_banned": onlyIfBanned,
	}
	var ok bool
	if err := b.Request(ctx, "unbanChatMember", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
