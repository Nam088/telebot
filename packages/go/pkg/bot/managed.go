package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// GetManagedBotAccessSettings returns the access settings of a bot managed by
// the calling bot (Bot API 10.3+).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the target managed bot.
//
// Returns:
//   - *types.BotAccessSettings: The managed bot's access settings on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	settings, err := b.GetManagedBotAccessSettings(ctx, int64(123456))
//
// Telegram API: https://core.telegram.org/bots/api#getmanagedbotaccesssettings
func (b *Bot) GetManagedBotAccessSettings(ctx context.Context, userID int64) (*types.BotAccessSettings, error) {
	payload := map[string]any{"user_id": userID}
	var settings types.BotAccessSettings
	if err := b.Request(ctx, "getManagedBotAccessSettings", payload, &settings); err != nil {
		return nil, err
	}
	return &settings, nil
}

// SetManagedBotAccessSettings restricts or lifts the access of a managed bot to
// private chats with users (Bot API 10.3+).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options carrying user_id and the required is_access_restricted
//     flag, plus the optional added_user_ids list.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SetManagedBotAccessSettings(ctx, &types.SetManagedBotAccessSettingsOptions{
//		UserID:             int64(123456),
//		IsAccessRestricted: true,
//		AddedUserIDs:       []int64{7, 8},
//	})
//
// Telegram API: https://core.telegram.org/bots/api#setmanagedbotaccesssettings
func (b *Bot) SetManagedBotAccessSettings(ctx context.Context, opts *types.SetManagedBotAccessSettingsOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setManagedBotAccessSettings", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetManagedBotToken returns a token that can be used to access the API of a
// bot managed by the calling bot (Bot API 10.3+).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the target managed bot.
//
// Returns:
//   - *types.BotToken: The managed bot token on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	tok, err := b.GetManagedBotToken(ctx, int64(123456))
//
// Telegram API: https://core.telegram.org/bots/api#getmanagedbottoken
func (b *Bot) GetManagedBotToken(ctx context.Context, userID int64) (*types.BotToken, error) {
	payload := map[string]any{"user_id": userID}
	var token types.BotToken
	if err := b.Request(ctx, "getManagedBotToken", payload, &token); err != nil {
		return nil, err
	}
	return &token, nil
}

// ReplaceManagedBotToken regenerates and returns a token that can be used to
// access the API of a bot managed by the calling bot (Bot API 10.3+).
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the target managed bot.
//
// Returns:
//   - *types.BotToken: The newly generated managed bot token on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	tok, err := b.ReplaceManagedBotToken(ctx, int64(123456))
//
// Telegram API: https://core.telegram.org/bots/api#replacemanagedbottoken
func (b *Bot) ReplaceManagedBotToken(ctx context.Context, userID int64) (*types.BotToken, error) {
	payload := map[string]any{"user_id": userID}
	var token types.BotToken
	if err := b.Request(ctx, "replaceManagedBotToken", payload, &token); err != nil {
		return nil, err
	}
	return &token, nil
}
