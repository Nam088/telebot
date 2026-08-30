package types

// BotAccessSettings describes the access settings of a managed bot.
//
// Telegram API: https://core.telegram.org/bots/api#botaccesssettings
type BotAccessSettings struct {
	// True, if the bot's access to private chats with users is restricted to a
	// subset of users.
	IsAccessRestricted bool `json:"is_access_restricted"`
	// Identifiers of users that are allowed to communicate with the bot when
	// its access is restricted; empty when access isn't restricted.
	AddedUserIDs []int64 `json:"added_user_ids,omitempty"`
}

// SetManagedBotAccessSettingsOptions represents parameters for the setManagedBotAccessSettings method.
//
// Telegram API: https://core.telegram.org/bots/api#setmanagedbotaccesssettings
type SetManagedBotAccessSettingsOptions struct {
	// Unique identifier of the target bot.
	UserID int64 `json:"user_id"`
	// Pass True if the bot's access to private chats with users must be
	// restricted to a subset of users.
	IsAccessRestricted bool `json:"is_access_restricted"`
	// Identifiers of users that are allowed to communicate with the managed
	// bot; only applicable if is_access_restricted is True.
	AddedUserIDs []int64 `json:"added_user_ids,omitempty"`
}

// BotToken carries a token that allows accessing the managed bot's API.
//
// Bot API 10.3 returns this object from getManagedBotToken and
// replaceManagedBotToken; it has no standalone documentation anchor, so it
// carries no Telegram API link line.
type BotToken struct {
	// The bot token.
	Token string `json:"token"`
}
