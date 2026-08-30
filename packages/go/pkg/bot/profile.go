package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// LogOut logs out from the cloud Bot API server.
//
// Returns true on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#logout
func (b *Bot) LogOut(ctx context.Context) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "logOut", nil, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// Close closes the bot instance before moving it from one local server to another.
//
// Returns true on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#close
func (b *Bot) Close(ctx context.Context) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "close", nil, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetMyName changes the bot's name.
//
// Returns true on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#setmyname
func (b *Bot) SetMyName(ctx context.Context, opts *types.SetMyNameOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setMyName", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetMyName gets the bot's name in the given language.
//
// Returns the bot name on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#getmyname
func (b *Bot) GetMyName(ctx context.Context, opts *types.GetMyNameOptions) (*types.BotName, error) {
	var name types.BotName
	if err := b.Request(ctx, "getMyName", opts, &name); err != nil {
		return nil, err
	}
	return &name, nil
}

// SetMyDescription changes the bot's description.
//
// Returns true on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#setmydescription
func (b *Bot) SetMyDescription(ctx context.Context, opts *types.SetMyDescriptionOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setMyDescription", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetMyDescription gets the bot's description in the given language.
//
// Returns the bot description on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#getmydescription
func (b *Bot) GetMyDescription(ctx context.Context, opts *types.GetMyDescriptionOptions) (*types.BotDescription, error) {
	var desc types.BotDescription
	if err := b.Request(ctx, "getMyDescription", opts, &desc); err != nil {
		return nil, err
	}
	return &desc, nil
}

// SetMyShortDescription changes the bot's short description.
//
// Returns true on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#setmyshortdescription
func (b *Bot) SetMyShortDescription(ctx context.Context, opts *types.SetMyShortDescriptionOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setMyShortDescription", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetMyShortDescription gets the bot's short description in the given language.
//
// Returns the short description on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#getmyshortdescription
func (b *Bot) GetMyShortDescription(ctx context.Context, opts *types.GetMyShortDescriptionOptions) (*types.BotShortDescription, error) {
	var desc types.BotShortDescription
	if err := b.Request(ctx, "getMyShortDescription", opts, &desc); err != nil {
		return nil, err
	}
	return &desc, nil
}

// SetMyCommands changes the list of the bot's commands, optionally scoped by chat type and language.
//
// Returns true on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#setmycommands
func (b *Bot) SetMyCommands(ctx context.Context, opts *types.SetMyCommandsOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setMyCommands", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetMyCommands gets the current list of the bot's commands, optionally scoped by chat type and language.
//
// Returns the list of bot commands on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#getmycommands
func (b *Bot) GetMyCommands(ctx context.Context, opts *types.GetMyCommandsOptions) ([]types.BotCommand, error) {
	var commands []types.BotCommand
	if err := b.Request(ctx, "getMyCommands", opts, &commands); err != nil {
		return nil, err
	}
	return commands, nil
}

// DeleteMyCommands deletes the list of the bot's commands, optionally scoped by chat type and language.
//
// Returns true on success, or an error if the API call fails.
//
// Telegram API: https://core.telegram.org/bots/api#deletemycommands
func (b *Bot) DeleteMyCommands(ctx context.Context, opts *types.DeleteMyCommandsOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "deleteMyCommands", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetMyProfilePhoto sets the default profile photo for the bot.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - photo: Profile photo to set, e.g. an InputProfilePhoto object encoded as
//     a map or any other JSON payload accepted by the Bot API.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SetMyProfilePhoto(ctx, map[string]any{"type": "photo", "id": "12345"})
//
// Telegram API: https://core.telegram.org/bots/api#setmyprofilephoto
func (b *Bot) SetMyProfilePhoto(ctx context.Context, photo any) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setMyProfilePhoto", map[string]any{"photo": photo}, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// RemoveMyProfilePhoto removes the default profile photo of the bot.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.RemoveMyProfilePhoto(ctx)
//
// Telegram API: https://core.telegram.org/bots/api#removemyprofilephoto
func (b *Bot) RemoveMyProfilePhoto(ctx context.Context) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "removeMyProfilePhoto", nil, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetUserProfileAudios retrieves the profile audio files of a user.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the target user.
//   - offset: Sequential number of the first audio to return; pass 0 to omit
//     the field, reproducing node's call with an undefined offset.
//   - limit: Maximum number of audios to return; pass 0 to omit the field for
//     the same reason.
//
// Returns:
//   - any: The raw result returned by Telegram — node types it as unknown, so
//     the audios object (`total_count` plus the `audios` list) and a bare bool
//     both decode.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	audios, err := b.GetUserProfileAudios(ctx, 123456, 0, 10)
//	fmt.Printf("profile audios: %v\n", audios)
//
// Telegram API: https://core.telegram.org/bots/api#getuserprofileaudios
func (b *Bot) GetUserProfileAudios(ctx context.Context, userID int64, offset int, limit int) (any, error) {
	payload := map[string]any{"user_id": userID}
	if offset > 0 {
		payload["offset"] = offset
	}
	if limit > 0 {
		payload["limit"] = limit
	}
	return b.requestUnknown(ctx, "getUserProfileAudios", payload)
}
