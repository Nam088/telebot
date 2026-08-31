package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// CreateChatInviteLink creates an additional invite link for a chat.
// The bot must be an administrator in the chat for this to work.
//
// Telegram API: https://core.telegram.org/bots/api#createchatinvitelink
func (b *Bot) CreateChatInviteLink(ctx context.Context, opts *types.CreateChatInviteLinkOptions) (*types.ChatInviteLink, error) {
	var link types.ChatInviteLink
	if err := b.Request(ctx, "createChatInviteLink", opts, &link); err != nil {
		return nil, err
	}
	return &link, nil
}

// EditChatInviteLink edits a non-primary invite link created by the bot.
// The bot must be an administrator in the chat for this to work.
//
// Telegram API: https://core.telegram.org/bots/api#editchatinvitelink
func (b *Bot) EditChatInviteLink(ctx context.Context, opts *types.EditChatInviteLinkOptions) (*types.ChatInviteLink, error) {
	var link types.ChatInviteLink
	if err := b.Request(ctx, "editChatInviteLink", opts, &link); err != nil {
		return nil, err
	}
	return &link, nil
}

// RevokeChatInviteLink revokes an invite link created by the bot.
// If the primary link is revoked, a new link is automatically generated.
// The bot must be an administrator in the chat for this to work.
//
// Telegram API: https://core.telegram.org/bots/api#revokechatinvitelink
func (b *Bot) RevokeChatInviteLink(ctx context.Context, opts *types.RevokeChatInviteLinkOptions) (*types.ChatInviteLink, error) {
	var link types.ChatInviteLink
	if err := b.Request(ctx, "revokeChatInviteLink", opts, &link); err != nil {
		return nil, err
	}
	return &link, nil
}

// CreateChatSubscriptionInviteLink creates a subscription invite link for a
// channel chat. The bot must have the can_invite_users administrator right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options including chat_id, subscription_period, subscription_price
//     and the optional name.
//
// Returns:
//   - *types.ChatInviteLink: The created invite link on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	link, err := b.CreateChatSubscriptionInviteLink(ctx, &types.CreateChatSubscriptionInviteLinkOptions{
//	    ChatID: "@channel", SubscriptionPeriod: 2592000, SubscriptionPrice: 50,
//	})
//
// Telegram API: https://core.telegram.org/bots/api#createchatsubscriptioninvitelink
func (b *Bot) CreateChatSubscriptionInviteLink(ctx context.Context, opts *types.CreateChatSubscriptionInviteLinkOptions) (*types.ChatInviteLink, error) {
	var link types.ChatInviteLink
	if err := b.Request(ctx, "createChatSubscriptionInviteLink", opts, &link); err != nil {
		return nil, err
	}
	return &link, nil
}

// EditChatSubscriptionInviteLink edits a subscription invite link created by
// the bot. The bot must have the can_invite_users administrator right. The
// subscription period and price are immutable and cannot be changed.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options including chat_id, invite_link and the optional name.
//
// Returns:
//   - *types.ChatInviteLink: The edited invite link on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	link, err := b.EditChatSubscriptionInviteLink(ctx, &types.EditChatSubscriptionInviteLinkOptions{
//	    ChatID: "@channel", InviteLink: "https://t.me/joinchat/sub1", Name: "Renamed",
//	})
//
// Telegram API: https://core.telegram.org/bots/api#editchatsubscriptioninvitelink
func (b *Bot) EditChatSubscriptionInviteLink(ctx context.Context, opts *types.EditChatSubscriptionInviteLinkOptions) (*types.ChatInviteLink, error) {
	var link types.ChatInviteLink
	if err := b.Request(ctx, "editChatSubscriptionInviteLink", opts, &link); err != nil {
		return nil, err
	}
	return &link, nil
}
