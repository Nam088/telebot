package types

// GiftBackground describes the background of a gift.
//
// See https://core.telegram.org/bots/api#giftbackground
type GiftBackground struct {
	// Center color of the background in RGB format.
	CenterColor int `json:"center_color"`
	// Edge color of the background in RGB format.
	EdgeColor int `json:"edge_color"`
	// Text color of the background in RGB format.
	TextColor int `json:"text_color"`
}

// Gift represents a gift that can be sent by the bot.
//
// See https://core.telegram.org/bots/api#gift
type Gift struct {
	// Unique identifier of the gift.
	ID string `json:"id"`
	// The sticker that represents the gift.
	Sticker Sticker `json:"sticker"`
	// The number of Telegram Stars that must be paid to send the sticker.
	StarCount int `json:"star_count"`
	// Number of Telegram Stars that must be paid to upgrade the gift to a unique one.
	UpgradeStarCount int `json:"upgrade_star_count,omitempty"`
	// True, if the gift can only be purchased by Telegram Premium subscribers.
	IsPremium bool `json:"is_premium,omitempty"`
	// True, if the gift can be used (after being upgraded) to customize a user's appearance.
	HasColors bool `json:"has_colors,omitempty"`
	// The total number of the gifts of this type that can be sent by all users; for limited gifts only.
	TotalCount int `json:"total_count,omitempty"`
	// The number of remaining gifts of this type that can be sent by all users; for limited gifts only.
	RemainingCount int `json:"remaining_count,omitempty"`
	// The total number of gifts of this type that can be sent by the bot; for limited gifts only.
	PersonalTotalCount int `json:"personal_total_count,omitempty"`
	// The number of remaining gifts of this type that can be sent by the bot; for limited gifts only.
	PersonalRemainingCount int `json:"personal_remaining_count,omitempty"`
	// Background of the gift.
	Background *GiftBackground `json:"background,omitempty"`
	// The total number of different unique gifts that can be obtained by upgrading the gift.
	UniqueGiftVariantCount int `json:"unique_gift_variant_count,omitempty"`
	// Information about the chat that published the gift.
	PublisherChat *Chat `json:"publisher_chat,omitempty"`
}

// Gifts represents a list of gifts.
//
// See https://core.telegram.org/bots/api#gifts
type Gifts struct {
	// The list of gifts.
	Gifts []Gift `json:"gifts"`
}

// UniqueGiftBackdropColors describes the colors of a unique gift backdrop.
//
// See https://core.telegram.org/bots/api#uniquegiftbackdropcolors
type UniqueGiftBackdropColors struct {
	// The color in the center of the backdrop in RGB format.
	CenterColor int `json:"center_color"`
	// The color on the edges of the backdrop in RGB format.
	EdgeColor int `json:"edge_color"`
	// The color to be applied to the symbol in RGB format.
	SymbolColor int `json:"symbol_color"`
	// The color for the text on the backdrop in RGB format.
	TextColor int `json:"text_color"`
}

// UniqueGiftBackdrop describes the backdrop of a unique gift.
//
// See https://core.telegram.org/bots/api#uniquegiftbackdrop
type UniqueGiftBackdrop struct {
	// Name of the backdrop.
	Name string `json:"name"`
	// Colors of the backdrop.
	Colors UniqueGiftBackdropColors `json:"colors"`
	// The number of unique gifts that receive this backdrop for every 1000 gifts upgraded.
	RarityPerMille int `json:"rarity_per_mille"`
}

// UniqueGiftModel describes the model of a unique gift.
//
// See https://core.telegram.org/bots/api#uniquegiftmodel
type UniqueGiftModel struct {
	// Name of the model.
	Name string `json:"name"`
	// The sticker that represents the unique gift.
	Sticker Sticker `json:"sticker"`
	// The number of unique gifts that receive this model for every 1000 gift upgrades.
	RarityPerMille int `json:"rarity_per_mille"`
	// Rarity of the model if it is a crafted model; one of "uncommon", "rare",
	// "epic" or "legendary".
	Rarity string `json:"rarity,omitempty"`
}

// UniqueGiftSymbol describes the symbol of a unique gift.
//
// See https://core.telegram.org/bots/api#uniquegiftsymbol
type UniqueGiftSymbol struct {
	// Name of the symbol.
	Name string `json:"name"`
	// The sticker that represents the unique gift.
	Sticker Sticker `json:"sticker"`
	// The number of unique gifts that receive this model for every 1000 gifts upgraded.
	RarityPerMille int `json:"rarity_per_mille"`
}

// UniqueGiftColors describes the color scheme of a unique gift.
//
// See https://core.telegram.org/bots/api#uniquegiftcolors
type UniqueGiftColors struct {
	// Custom emoji identifier of the unique gift's model.
	ModelCustomEmojiID string `json:"model_custom_emoji_id"`
	// Custom emoji identifier of the unique gift's symbol.
	SymbolCustomEmojiID string `json:"symbol_custom_emoji_id"`
	// Main color used in light themes; RGB format.
	LightThemeMainColor int `json:"light_theme_main_color"`
	// List of 1-3 additional colors used in light themes; RGB format.
	LightThemeOtherColors []int `json:"light_theme_other_colors"`
	// Main color used in dark themes; RGB format.
	DarkThemeMainColor int `json:"dark_theme_main_color"`
	// List of 1-3 additional colors used in dark themes; RGB format.
	DarkThemeOtherColors []int `json:"dark_theme_other_colors"`
}

// UniqueGift describes a unique collectible gift with a potentially upgradable model.
//
// See https://core.telegram.org/bots/api#uniquegift
type UniqueGift struct {
	// Identifier of the regular gift from which this gift was upgraded.
	GiftID string `json:"gift_id"`
	// Human-readable name of the regular gift.
	BaseName string `json:"base_name"`
	// Unique name of the gift.
	Name string `json:"name"`
	// Unique number of the upgraded gift.
	Number int `json:"number"`
	// Model of the gift.
	Model UniqueGiftModel `json:"model"`
	// Symbol of the gift.
	Symbol UniqueGiftSymbol `json:"symbol"`
	// Backdrop of the gift.
	Backdrop UniqueGiftBackdrop `json:"backdrop"`
	// True, if the original regular gift was exclusively purchaseable by Telegram Premium subscribers.
	IsPremium bool `json:"is_premium,omitempty"`
	// True, if the gift was used to craft another gift and isn't available anymore.
	IsBurned bool `json:"is_burned,omitempty"`
	// True, if the gift is assigned from the TON blockchain.
	IsFromBlockchain bool `json:"is_from_blockchain,omitempty"`
	// The color scheme for the user's name, replies, etc.
	Colors *UniqueGiftColors `json:"colors,omitempty"`
	// Information about the chat that published the gift.
	PublisherChat *Chat `json:"publisher_chat,omitempty"`
}

// UniqueGiftInfo describes information about a unique gift.
//
// See https://core.telegram.org/bots/api#uniquegiftinfo
type UniqueGiftInfo struct {
	// Information about the gift.
	Gift UniqueGift `json:"gift"`
	// Origin of the gift; one of "upgrade", "transfer", "resale",
	// "gifted_upgrade" or "offer".
	Origin string `json:"origin"`
	// Text of the message that was added to the gift.
	Text string `json:"text,omitempty"`
	// Special entities that appear in the text.
	Entities []MessageEntity `json:"entities,omitempty"`
	// True, if the sender and gift text are shown only to the gift receiver.
	IsPrivate bool `json:"is_private,omitempty"`
	// Currency in which the payment for the gift was done; "XTR" or "TON".
	LastResaleCurrency string `json:"last_resale_currency,omitempty"`
	// Price paid for the gift in either Telegram Stars or nanograms.
	LastResaleAmount int `json:"last_resale_amount,omitempty"`
	// Unique identifier of the received gift for the bot.
	OwnedGiftID string `json:"owned_gift_id,omitempty"`
	// Number of Telegram Stars that must be paid to transfer the gift.
	TransferStarCount int `json:"transfer_star_count,omitempty"`
	// Point in time (Unix timestamp) when the gift can be transferred.
	NextTransferDate int64 `json:"next_transfer_date,omitempty"`
}

// GiftPremiumSubscriptionOptions represents parameters for the giftPremiumSubscription method.
//
// Telegram API: https://core.telegram.org/bots/api#giftpremiumsubscription
type GiftPremiumSubscriptionOptions struct {
	// Unique identifier of the target user.
	UserID int64 `json:"user_id"`
	// Number of months the subscription will be gifted; must be one of 3, 6, 12.
	MonthCount int `json:"month_count"`
	// Number of Telegram Stars to be charged; must be 1000, 1500 or 2500 for 3, 6, 12 months respectively.
	StarCount int `json:"star_count"`
	// Text shown to the recipient alongside the payment receipt; 0-255 characters after entities parsing.
	Text string `json:"text,omitempty"`
	// Mode for parsing entities in the text.
	TextParseMode string `json:"text_parse_mode,omitempty"`
	// A JSON-serialized list of special entities that appear in the text.
	TextEntities []MessageEntity `json:"text_entities,omitempty"`
}
