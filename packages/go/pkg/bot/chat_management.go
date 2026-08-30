package bot

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/Nam088/telebot/packages/go/pkg/types"
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

// SetChatStickerSet sets a new group sticker set for a supergroup.
// The bot must be an administrator in the chat for this to work and must have
// the can_manage_chat administrator right. Use the field "active_sticker_set_name"
// returned by getChat to check the name of the current group sticker set.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat.
//   - stickerSetName: Name of the sticker set to be set as the group sticker set.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SetChatStickerSet(ctx, int64(-1001234567890), "TelebotTestSet")
func (b *Bot) SetChatStickerSet(ctx context.Context, chatID any, stickerSetName string) (bool, error) {
	payload := map[string]any{
		"chat_id":          chatID,
		"sticker_set_name": stickerSetName,
	}
	var ok bool
	if err := b.Request(ctx, "setChatStickerSet", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeleteChatStickerSet deletes a group sticker set from a supergroup.
// The bot must be an administrator in the chat for this to work and must have
// the can_manage_chat administrator right.
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
//	ok, err := b.DeleteChatStickerSet(ctx, int64(-1001234567890))
func (b *Bot) DeleteChatStickerSet(ctx context.Context, chatID any) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "deleteChatStickerSet", map[string]any{"chat_id": chatID}, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// verifyRequest performs a verifyUser or verifyChat request on behalf of the
// organization that owns the bot, sending the optional custom description only
// when the caller supplied a non-empty one.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - method: Bot API method name to call.
//   - idKey: Wire key identifying the target, "user_id" or "chat_id".
//   - id: Identifier of the target user or chat.
//   - customDescription: Custom description for the verification status, 0-70
//     characters; omitted when empty.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) verifyRequest(ctx context.Context, method, idKey string, id any, customDescription string) (bool, error) {
	payload := map[string]any{idKey: id}
	if customDescription != "" {
		payload["custom_description"] = customDescription
	}
	var ok bool
	if err := b.Request(ctx, method, payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// VerifyUser verifies a user on behalf of the organization which owns the bot.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the target user.
//   - customDescription: Custom description for the verification status, 0-70
//     characters; pass an empty string to omit it.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.VerifyUser(ctx, 123456, "Official Staff")
func (b *Bot) VerifyUser(ctx context.Context, userID int64, customDescription string) (bool, error) {
	return b.verifyRequest(ctx, "verifyUser", "user_id", userID, customDescription)
}

// VerifyChat verifies a chat on behalf of the organization which owns the bot.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target
//     channel (in the format @channelusername).
//   - customDescription: Custom description for the verification status, 0-70
//     characters; pass an empty string to omit it.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.VerifyChat(ctx, "@channel", "Verified Community")
func (b *Bot) VerifyChat(ctx context.Context, chatID any, customDescription string) (bool, error) {
	return b.verifyRequest(ctx, "verifyChat", "chat_id", chatID, customDescription)
}

// RemoveUserVerification removes verification from a user that was previously
// verified on behalf of the organization which owns the bot. Does not affect
// independently obtained verification.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the target user.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.RemoveUserVerification(ctx, 123456)
func (b *Bot) RemoveUserVerification(ctx context.Context, userID int64) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "removeUserVerification", map[string]any{"user_id": userID}, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// RemoveChatVerification removes verification from a chat that was previously
// verified on behalf of the organization which owns the bot. Does not affect
// independently obtained verification.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target
//     channel (in the format @channelusername).
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.RemoveChatVerification(ctx, "@channel")
func (b *Bot) RemoveChatVerification(ctx context.Context, chatID any) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "removeChatVerification", map[string]any{"chat_id": chatID}, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetUserChatBoosts retrieves the list of boosts added to a chat by a user.
// Requires administrator rights in the chat.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the chat or username of the channel (in the
//     format @channelusername).
//   - userID: Unique identifier of the target user.
//
// Returns:
//   - *types.UserChatBoosts: The list of boosts on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	boosts, err := b.GetUserChatBoosts(ctx, int64(-1001234567890), 123456)
//	fmt.Println(len(boosts.Boosts))
func (b *Bot) GetUserChatBoosts(ctx context.Context, chatID any, userID int64) (*types.UserChatBoosts, error) {
	payload := map[string]any{
		"chat_id": chatID,
		"user_id": userID,
	}
	var boosts types.UserChatBoosts
	if err := b.Request(ctx, "getUserChatBoosts", payload, &boosts); err != nil {
		return nil, err
	}
	return &boosts, nil
}
