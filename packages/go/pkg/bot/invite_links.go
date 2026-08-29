package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// CreateChatInviteLink creates an additional invite link for a chat.
// The bot must be an administrator in the chat for this to work.
func (b *Bot) CreateChatInviteLink(ctx context.Context, opts *types.CreateChatInviteLinkOptions) (*types.ChatInviteLink, error) {
	var link types.ChatInviteLink
	if err := b.Request(ctx, "createChatInviteLink", opts, &link); err != nil {
		return nil, err
	}
	return &link, nil
}

// EditChatInviteLink edits a non-primary invite link created by the bot.
// The bot must be an administrator in the chat for this to work.
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
func (b *Bot) RevokeChatInviteLink(ctx context.Context, opts *types.RevokeChatInviteLinkOptions) (*types.ChatInviteLink, error) {
	var link types.ChatInviteLink
	if err := b.Request(ctx, "revokeChatInviteLink", opts, &link); err != nil {
		return nil, err
	}
	return &link, nil
}
