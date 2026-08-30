package types

// BusinessBotRights represents the rights of a business bot.
//
// Every field is optional in the Bot API sense: Telegram omits the ones that
// are not granted, so all of them decode as plain booleans and are re-omitted
// on the way out when false.
//
// See https://core.telegram.org/bots/api#businessbotrights
type BusinessBotRights struct {
	// True, if the bot can send and edit messages in the private chats that had
	// incoming messages in the last 24 hours.
	CanReply bool `json:"can_reply,omitempty"`
	// True, if the bot can mark incoming private messages as read.
	CanReadMessages bool `json:"can_read_messages,omitempty"`
	// True, if the bot can delete messages sent by the bot.
	CanDeleteSentMessages bool `json:"can_delete_sent_messages,omitempty"`
	// True, if the bot can delete all private messages in managed chats.
	CanDeleteAllMessages bool `json:"can_delete_all_messages,omitempty"`
	// True, if the bot can edit the first and last name of the business account.
	CanEditName bool `json:"can_edit_name,omitempty"`
	// True, if the bot can edit the bio of the business account.
	CanEditBio bool `json:"can_edit_bio,omitempty"`
	// True, if the bot can edit the profile photo of the business account.
	CanEditProfilePhoto bool `json:"can_edit_profile_photo,omitempty"`
	// True, if the bot can edit the username of the business account.
	CanEditUsername bool `json:"can_edit_username,omitempty"`
	// True, if the bot can change the privacy settings pertaining to gifts for
	// the business account.
	CanChangeGiftSettings bool `json:"can_change_gift_settings,omitempty"`
	// True, if the bot can view gifts and the amount of Telegram Stars owned by
	// the business account.
	CanViewGiftsAndStars bool `json:"can_view_gifts_and_stars,omitempty"`
	// True, if the bot can convert regular gifts owned by the business account
	// to Telegram Stars.
	CanConvertGiftsToStars bool `json:"can_convert_gifts_to_stars,omitempty"`
	// True, if the bot can transfer and upgrade gifts owned by the business
	// account.
	CanTransferAndUpgradeGifts bool `json:"can_transfer_and_upgrade_gifts,omitempty"`
	// True, if the bot can transfer Telegram Stars received by the business
	// account to its own account, or use them to upgrade and transfer gifts.
	CanTransferStars bool `json:"can_transfer_stars,omitempty"`
	// True, if the bot can post, edit and delete stories on behalf of the
	// business account.
	CanManageStories bool `json:"can_manage_stories,omitempty"`
}

// BusinessConnection describes the connection of the bot with a business account.
//
// See https://core.telegram.org/bots/api#businessconnection
type BusinessConnection struct {
	// Unique identifier of the business connection.
	ID string `json:"id"`
	// Business account user that created the business connection.
	User User `json:"user"`
	// Identifier of a private chat with the user who created the business connection.
	UserChatID int64 `json:"user_chat_id"`
	// Date the connection was established in Unix time.
	Date int64 `json:"date"`
	// Rights of the business bot; nil when Telegram omits the field.
	Rights *BusinessBotRights `json:"rights,omitempty"`
	// True, if the connection is active.
	IsEnabled bool `json:"is_enabled"`
}

// Story represents a message with a story.
type Story struct {
	Chat Chat  `json:"chat"`
	ID   int64 `json:"id"`
}

// Game represents a game.
type Game struct {
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Photo       []PhotoSize `json:"photo"`
	Text        string      `json:"text,omitempty"`
}

// GameHighScore represents one row of the high scores table for a game.
type GameHighScore struct {
	Position int  `json:"position"`
	User     User `json:"user"`
	Score    int  `json:"score"`
}

// ChatBoostSource describes the origin of a chat boost.
//
// Node models this as a discriminated union of ChatBoostSourcePremium,
// ChatBoostSourceGiftCode and ChatBoostSourceGiveaway. Go decodes boosts
// straight off the wire, so the union is flattened into one struct: Source is
// the discriminator ("premium", "gift_code" or "giveaway") and every member of
// the union is present as an optional field.
type ChatBoostSource struct {
	Source            string `json:"source"`
	User              *User  `json:"user,omitempty"`
	GiveawayMessageID int64  `json:"giveaway_message_id,omitempty"`
	PrizeStarCount    int    `json:"prize_star_count,omitempty"`
	IsUnclaimed       bool   `json:"is_unclaimed,omitempty"`
}

// ChatBoost describes a single boost that was added to a chat.
type ChatBoost struct {
	BoostID        string          `json:"boost_id"`
	AddDate        int64           `json:"add_date"`
	ExpirationDate int64           `json:"expiration_date"`
	Source         ChatBoostSource `json:"source"`
}

// UserChatBoosts represents a list of boosts added to a chat by a user.
type UserChatBoosts struct {
	Boosts []ChatBoost `json:"boosts"`
}
