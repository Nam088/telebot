package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// GetChatMember gets information about one member of a chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target supergroup (int64 or string).
//   - userID: Unique identifier of the target user.
//
// Returns:
//   - *types.ChatMember: The ChatMember object on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	member, err := bot.GetChatMember(ctx, int64(-1001234567890), 42)
//	fmt.Println(member.Status)
//
// Telegram API: https://core.telegram.org/bots/api#getchatmember
func (b *Bot) GetChatMember(ctx context.Context, chatID any, userID int64) (*types.ChatMember, error) {
	payload := map[string]any{
		"chat_id": chatID,
		"user_id": userID,
	}
	var member types.ChatMember
	if err := b.Request(ctx, "getChatMember", payload, &member); err != nil {
		return nil, err
	}
	return &member, nil
}

// PromoteChatMember promotes or demotes a user in a supergroup or a channel.
//
// To demote a user, pass the applicable rights as false in the options.
// The bot must be an administrator in the chat for this to work.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options including chat_id, user_id, and the administrator rights flags.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.PromoteChatMember(ctx, &types.PromoteChatMemberOptions{
//		ChatID:            int64(-1001234567890),
//		UserID:            42,
//		CanDeleteMessages: true,
//		CanInviteUsers:    true,
//	})
//
// Telegram API: https://core.telegram.org/bots/api#promotechatmember
func (b *Bot) PromoteChatMember(ctx context.Context, opts *types.PromoteChatMemberOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "promoteChatMember", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// RestrictChatMember restricts a user in a supergroup.
//
// The bot must be an administrator in the supergroup for this to work
// and must have the appropriate administrator rights.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Options including chat_id, user_id, the new user permissions,
//     and an optional until_date when the restrictions are lifted.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.RestrictChatMember(ctx, &types.RestrictChatMemberOptions{
//		ChatID:      int64(-1001234567890),
//		UserID:      42,
//		Permissions: types.ChatPermissions{CanSendMessages: false},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#restrictchatmember
func (b *Bot) RestrictChatMember(ctx context.Context, opts *types.RestrictChatMemberOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "restrictChatMember", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetChatAdministratorCustomTitle sets a custom title for an administrator in a supergroup
// promoted by the bot.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target supergroup (int64 or string).
//   - userID: Unique identifier of the target user.
//   - customTitle: New custom title for the administrator; 0-16 characters, no emoji.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.SetChatAdministratorCustomTitle(ctx, int64(-1001234567890), 42, "Moderator")
//
// Telegram API: https://core.telegram.org/bots/api#setchatadministratorcustomtitle
func (b *Bot) SetChatAdministratorCustomTitle(ctx context.Context, chatID any, userID int64, customTitle string) (bool, error) {
	payload := map[string]any{
		"chat_id":      chatID,
		"user_id":      userID,
		"custom_title": customTitle,
	}
	var ok bool
	if err := b.Request(ctx, "setChatAdministratorCustomTitle", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// BanChatSenderChat bans a channel chat in a supergroup or a channel.
//
// Until the chat is unbanned, the owner of the banned chat will not be able
// to send messages on behalf of any of their channels.
// The bot must be an administrator in the supergroup or channel for this to work.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target channel (int64 or string).
//   - senderChatID: Unique identifier of the target sender chat.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.BanChatSenderChat(ctx, int64(-1001234567890), -1009876543210)
//
// Telegram API: https://core.telegram.org/bots/api#banchatsenderchat
func (b *Bot) BanChatSenderChat(ctx context.Context, chatID any, senderChatID int64) (bool, error) {
	payload := map[string]any{
		"chat_id":        chatID,
		"sender_chat_id": senderChatID,
	}
	var ok bool
	if err := b.Request(ctx, "banChatSenderChat", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// UnbanChatSenderChat unbans a previously banned channel chat in a supergroup or channel.
//
// The bot must be an administrator in the supergroup or channel for this to work.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target channel (int64 or string).
//   - senderChatID: Unique identifier of the target sender chat.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.UnbanChatSenderChat(ctx, int64(-1001234567890), -1009876543210)
//
// Telegram API: https://core.telegram.org/bots/api#unbanchatsenderchat
func (b *Bot) UnbanChatSenderChat(ctx context.Context, chatID any, senderChatID int64) (bool, error) {
	payload := map[string]any{
		"chat_id":        chatID,
		"sender_chat_id": senderChatID,
	}
	var ok bool
	if err := b.Request(ctx, "unbanChatSenderChat", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// ApproveChatJoinRequest approves a chat join request.
//
// The bot must be an administrator in the chat for this to work
// and must have the can_invite_users administrator right.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target channel (int64 or string).
//   - userID: Unique identifier of the target user.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.ApproveChatJoinRequest(ctx, "@my_channel", 42)
//
// Telegram API: https://core.telegram.org/bots/api#approvechatjoinrequest
func (b *Bot) ApproveChatJoinRequest(ctx context.Context, chatID any, userID int64) (bool, error) {
	payload := map[string]any{
		"chat_id": chatID,
		"user_id": userID,
	}
	var ok bool
	if err := b.Request(ctx, "approveChatJoinRequest", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeclineChatJoinRequest declines a chat join request.
//
// The bot must be an administrator in the chat for this to work
// and must have the can_invite_users administrator right.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target channel (int64 or string).
//   - userID: Unique identifier of the target user.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error code, or network error.
//
// Example:
//
//	ok, err := bot.DeclineChatJoinRequest(ctx, "@my_channel", 42)
//
// Telegram API: https://core.telegram.org/bots/api#declinechatjoinrequest
func (b *Bot) DeclineChatJoinRequest(ctx context.Context, chatID any, userID int64) (bool, error) {
	payload := map[string]any{
		"chat_id": chatID,
		"user_id": userID,
	}
	var ok bool
	if err := b.Request(ctx, "declineChatJoinRequest", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetChatMemberTag sets a new custom tag for an administrator or a member
// promoted by the bot in a supergroup chat. The bot must be an administrator in
// the chat for this to work and must have the can_manage_tags administrator
// right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target
//     channel (int64 or string).
//   - userID: Unique identifier of the target user.
//   - tag: New tag, 0-40 characters; pass an empty string to leave the tag unset.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SetChatMemberTag(ctx, int64(-1001234567890), 42, "Top contributor")
//
// Telegram API: https://core.telegram.org/bots/api#setchatmembertag
func (b *Bot) SetChatMemberTag(ctx context.Context, chatID any, userID int64, tag string) (bool, error) {
	payload := map[string]any{
		"chat_id": chatID,
		"user_id": userID,
	}
	if tag != "" {
		payload["tag"] = tag
	}
	var ok bool
	if err := b.Request(ctx, "setChatMemberTag", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
