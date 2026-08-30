package types

// BusinessConnection describes the connection of the bot with a business account.
type BusinessConnection struct {
	ID         string `json:"id"`
	User       User   `json:"user"`
	UserChatID int64  `json:"user_chat_id"`
	Date       int64  `json:"date"`
	CanReply   bool   `json:"can_reply"`
	IsEnabled  bool   `json:"is_enabled"`
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
