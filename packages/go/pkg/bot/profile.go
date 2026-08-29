package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// LogOut logs out from the cloud Bot API server.
//
// Returns true on success, or an error if the API call fails.
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
func (b *Bot) DeleteMyCommands(ctx context.Context, opts *types.DeleteMyCommandsOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "deleteMyCommands", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
