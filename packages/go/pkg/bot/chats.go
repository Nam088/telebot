package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// GetChat gets up to date information about the chat.
//
// Telegram API: https://core.telegram.org/bots/api#getchat
func (b *Bot) GetChat(ctx context.Context, chatID any) (*types.Chat, error) {
	payload := map[string]any{"chat_id": chatID}
	var chat types.Chat
	if err := b.Request(ctx, "getChat", payload, &chat); err != nil {
		return nil, err
	}
	return &chat, nil
}

// GetChatAdministrators gets a list of administrators in a chat.
//
// Telegram API: https://core.telegram.org/bots/api#getchatadministrators
func (b *Bot) GetChatAdministrators(ctx context.Context, chatID any) ([]types.ChatMember, error) {
	payload := map[string]any{"chat_id": chatID}
	var admins []types.ChatMember
	if err := b.Request(ctx, "getChatAdministrators", payload, &admins); err != nil {
		return nil, err
	}
	return admins, nil
}

// GetChatMemberCount gets the number of members in a chat.
//
// Telegram API: https://core.telegram.org/bots/api#getchatmembercount
func (b *Bot) GetChatMemberCount(ctx context.Context, chatID any) (int, error) {
	payload := map[string]any{"chat_id": chatID}
	var count int
	if err := b.Request(ctx, "getChatMemberCount", payload, &count); err != nil {
		return 0, err
	}
	return count, nil
}

// LeaveChat leaves a group, supergroup or channel.
//
// Telegram API: https://core.telegram.org/bots/api#leavechat
func (b *Bot) LeaveChat(ctx context.Context, chatID any) (bool, error) {
	payload := map[string]any{"chat_id": chatID}
	var ok bool
	if err := b.Request(ctx, "leaveChat", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// BanChatMember bans a user in a group, supergroup or channel.
//
// Telegram API: https://core.telegram.org/bots/api#banchatmember
func (b *Bot) BanChatMember(ctx context.Context, chatID any, userID int64, untilDate int64, revokeMessages bool) (bool, error) {
	payload := struct {
		ChatID         any   `json:"chat_id"`
		UserID         int64 `json:"user_id"`
		UntilDate      int64 `json:"until_date,omitempty"`
		RevokeMessages bool  `json:"revoke_messages,omitempty"`
	}{ChatID: chatID, UserID: userID, UntilDate: untilDate, RevokeMessages: revokeMessages}
	var ok bool
	if err := b.Request(ctx, "banChatMember", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// UnbanChatMember unbans a previously banned user in a supergroup or channel.
//
// Telegram API: https://core.telegram.org/bots/api#unbanchatmember
func (b *Bot) UnbanChatMember(ctx context.Context, chatID any, userID int64, onlyIfBanned bool) (bool, error) {
	payload := struct {
		ChatID       any   `json:"chat_id"`
		UserID       int64 `json:"user_id"`
		OnlyIfBanned bool  `json:"only_if_banned,omitempty"`
	}{ChatID: chatID, UserID: userID, OnlyIfBanned: onlyIfBanned}
	var ok bool
	if err := b.Request(ctx, "unbanChatMember", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
