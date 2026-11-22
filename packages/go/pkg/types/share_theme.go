package types

// EmojiTypeEmoji describes a standard Unicode emoji.
//
// Telegram API: https://core.telegram.org/bots/api#emojitypeemoji
type EmojiTypeEmoji struct {
	// Type of the emoji, always "emoji".
	Type string `json:"type"`
	// The Unicode emoji string.
	Emoji string `json:"emoji"`
}

// EmojiTypeCustomEmoji describes a custom emoji.
//
// Telegram API: https://core.telegram.org/bots/api#emojitypecustomemoji
type EmojiTypeCustomEmoji struct {
	// Type of the emoji, always "custom_emoji".
	Type string `json:"type"`
	// Unique identifier of the custom emoji.
	CustomEmojiID string `json:"custom_emoji_id"`
}

// EmojiType describes an emoji used in a chat share theme (EmojiTypeEmoji or EmojiTypeCustomEmoji).
//
// Telegram API: https://core.telegram.org/bots/api#emojitype
type EmojiType struct {
	// Type of the emoji ("emoji" or "custom_emoji").
	Type string `json:"type"`
	// The Unicode emoji string (for type "emoji").
	Emoji string `json:"emoji,omitempty"`
	// Unique identifier of the custom emoji (for type "custom_emoji").
	CustomEmojiID string `json:"custom_emoji_id,omitempty"`
}

// ChatShareThemeEmoji describes a chat share theme based on emojis.
//
// Telegram API: https://core.telegram.org/bots/api#chatsharethemeemoji
type ChatShareThemeEmoji struct {
	// Type of the theme, always "emoji".
	Type string `json:"type"`
	// List of emojis in the theme.
	Emojis []EmojiType `json:"emojis"`
	// Identifier of the background backdrop, if any.
	BackgroundBackdropID int64 `json:"background_backdrop_id,omitempty"`
}

// ChatShareThemeUniqueGift describes a chat share theme based on a unique gift.
//
// Telegram API: https://core.telegram.org/bots/api#chatsharethemeuniquegift
type ChatShareThemeUniqueGift struct {
	// Type of the theme, always "unique_gift".
	Type string `json:"type"`
	// The unique gift defining the theme.
	Gift UniqueGift `json:"gift"`
}

// ChatShareTheme describes the theme of the screen for sharing a link to a user or a chat.
//
// Telegram API: https://core.telegram.org/bots/api#chatsharetheme
type ChatShareTheme struct {
	// Type of the theme ("emoji" or "unique_gift").
	Type string `json:"type"`
	// List of emojis in the theme (for type "emoji").
	Emojis []EmojiType `json:"emojis,omitempty"`
	// Identifier of the background backdrop (for type "emoji").
	BackgroundBackdropID int64 `json:"background_backdrop_id,omitempty"`
	// The unique gift defining the theme (for type "unique_gift").
	Gift *UniqueGift `json:"gift,omitempty"`
}

// ChatShareThemeBackdrop describes a backdrop for a chat share theme.
//
// Telegram API: https://core.telegram.org/bots/api#chatsharethemebackdrop
type ChatShareThemeBackdrop struct {
	// Unique identifier of the backdrop.
	ID int64 `json:"id"`
	// Name of the backdrop.
	Name string `json:"name"`
	// Colors of the backdrop.
	Colors UniqueGiftBackdropColors `json:"colors"`
}

// ChatShareThemeBackdrops contains a list of chat share theme backdrops.
//
// Telegram API: https://core.telegram.org/bots/api#chatsharethemebackdrops
type ChatShareThemeBackdrops struct {
	// List of available chat share theme backdrops.
	Backdrops []ChatShareThemeBackdrop `json:"backdrops"`
}

// VerifyDescriptionOptions provides optional formatting parameters for VerifyUser and VerifyChat.
type VerifyDescriptionOptions struct {
	// Mode for parsing entities in the custom description.
	CustomDescriptionParseMode string `json:"custom_description_parse_mode,omitempty"`
	// List of special entities that appear in the custom description.
	CustomDescriptionEntities []MessageEntity `json:"custom_description_entities,omitempty"`
}
