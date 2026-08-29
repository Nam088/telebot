package bot

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/Nam088/telebot-go/pkg/types"
)

// SetChatTitle changes the title of a chat.
// Titles can't be changed for private chats.
// The bot must be an administrator in the chat for this to work.
func (b *Bot) SetChatTitle(ctx context.Context, opts *types.SetChatTitleOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setChatTitle", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetChatDescription changes the description of a group, a supergroup or a channel.
// The bot must be an administrator in the chat for this to work.
func (b *Bot) SetChatDescription(ctx context.Context, opts *types.SetChatDescriptionOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setChatDescription", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetChatPhoto sets a new profile photo for the chat.
// Photos can't be changed for private chats.
// The bot must be an administrator in the chat for this to work.
func (b *Bot) SetChatPhoto(ctx context.Context, opts *types.SetChatPhotoOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setChatPhoto", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeleteChatPhoto deletes a chat photo.
// Photos can't be changed for private chats.
// The bot must be an administrator in the chat for this to work.
func (b *Bot) DeleteChatPhoto(ctx context.Context, opts *types.DeleteChatPhotoOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "deleteChatPhoto", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// PinChatMessage adds a message to the list of pinned messages in a chat.
// If the chat is not a private chat, the bot must be an administrator.
func (b *Bot) PinChatMessage(ctx context.Context, opts *types.PinChatMessageOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "pinChatMessage", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// UnpinChatMessage removes a message from the list of pinned messages in a chat.
// If the chat is not a private chat, the bot must be an administrator.
func (b *Bot) UnpinChatMessage(ctx context.Context, opts *types.UnpinChatMessageOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "unpinChatMessage", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// UnpinAllChatMessages clears the list of pinned messages in a chat.
// If the chat is not a private chat, the bot must be an administrator.
func (b *Bot) UnpinAllChatMessages(ctx context.Context, opts *types.UnpinAllChatMessagesOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "unpinAllChatMessages", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetChatPermissions sets default chat permissions for all members.
// The bot must be an administrator in the group or a supergroup.
func (b *Bot) SetChatPermissions(ctx context.Context, opts *types.SetChatPermissionsOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setChatPermissions", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// ExportChatInviteLink generates a new primary invite link for a chat.
// Any previously generated primary link is revoked.
// The bot must be an administrator in the chat for this to work.
func (b *Bot) ExportChatInviteLink(ctx context.Context, opts *types.ExportChatInviteLinkOptions) (string, error) {
	var link string
	if err := b.Request(ctx, "exportChatInviteLink", opts, &link); err != nil {
		return "", err
	}
	return link, nil
}

// SetChatMenuButton changes the bot's menu button in a private chat, or the default menu button.
func (b *Bot) SetChatMenuButton(ctx context.Context, opts *types.SetChatMenuButtonOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setChatMenuButton", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetChatMenuButton gets the current value of the bot's menu button in a private chat, or the default menu button.
func (b *Bot) GetChatMenuButton(ctx context.Context, opts *types.GetChatMenuButtonOptions) (types.MenuButton, error) {
	var raw json.RawMessage
	if err := b.Request(ctx, "getChatMenuButton", opts, &raw); err != nil {
		return nil, err
	}

	return unmarshalMenuButton(raw)
}

// unmarshalMenuButton converts the raw JSON returned by getChatMenuButton into
// one of the concrete MenuButton implementations based on the "type" field.
func unmarshalMenuButton(raw json.RawMessage) (types.MenuButton, error) {
	var envelope struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(raw, &envelope); err != nil {
		return nil, fmt.Errorf("failed to decode menu button type: %w", err)
	}

	switch envelope.Type {
	case "commands":
		var btn types.MenuButtonCommands
		if err := json.Unmarshal(raw, &btn); err != nil {
			return nil, fmt.Errorf("failed to decode commands menu button: %w", err)
		}
		return btn, nil
	case "web_app":
		var btn types.MenuButtonWebApp
		if err := json.Unmarshal(raw, &btn); err != nil {
			return nil, fmt.Errorf("failed to decode web_app menu button: %w", err)
		}
		return btn, nil
	case "default":
		var btn types.MenuButtonDefault
		if err := json.Unmarshal(raw, &btn); err != nil {
			return nil, fmt.Errorf("failed to decode default menu button: %w", err)
		}
		return btn, nil
	default:
		return nil, fmt.Errorf("unsupported menu button type: %s", envelope.Type)
	}
}

// SetMyDefaultAdministratorRights changes the default administrator rights of the bot.
func (b *Bot) SetMyDefaultAdministratorRights(ctx context.Context, opts *types.SetMyDefaultAdministratorRightsOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setMyDefaultAdministratorRights", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetMyDefaultAdministratorRights gets the current default administrator rights of the bot.
func (b *Bot) GetMyDefaultAdministratorRights(ctx context.Context, opts *types.GetMyDefaultAdministratorRightsOptions) (*types.ChatAdministratorRights, error) {
	var rights types.ChatAdministratorRights
	if err := b.Request(ctx, "getMyDefaultAdministratorRights", opts, &rights); err != nil {
		return nil, err
	}
	return &rights, nil
}
