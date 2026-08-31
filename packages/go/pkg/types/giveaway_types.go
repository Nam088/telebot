package types

// Giveaway represents a message about a scheduled giveaway.
//
// Telegram API: https://core.telegram.org/bots/api#giveaway
type Giveaway struct {
	Chats                         []Chat   `json:"chats"`
	WinnersSelectionDate          int64    `json:"winners_selection_date"`
	WinnerCount                   int64    `json:"winner_count"`
	OnlyNewMembers                bool     `json:"only_new_members,omitempty"`
	HasPublicWinners              bool     `json:"has_public_winners,omitempty"`
	PrizeDescription              string   `json:"prize_description,omitempty"`
	CountryCodes                  []string `json:"country_codes,omitempty"`
	PrizeStarCount                int64    `json:"prize_star_count,omitempty"`
	PremiumSubscriptionMonthCount int64    `json:"premium_subscription_month_count,omitempty"`
}

// GiveawayCreated represents a service message about the creation of a
// scheduled giveaway.
//
// Telegram API: https://core.telegram.org/bots/api#giveawaycreated
type GiveawayCreated struct {
	PrizeStarCount int64 `json:"prize_star_count,omitempty"`
}

// GiveawayCompleted represents a service message about the completion of a
// giveaway without public winners.
//
// Telegram API: https://core.telegram.org/bots/api#giveawaycompleted
type GiveawayCompleted struct {
	WinnerCount         int64    `json:"winner_count"`
	UnclaimedPrizeCount int64    `json:"unclaimed_prize_count,omitempty"`
	GiveawayMessage     *Message `json:"giveaway_message,omitempty"`
	IsStarGiveaway      bool     `json:"is_star_giveaway,omitempty"`
}

// GiveawayWinners represents a message about the completion of a giveaway
// with public winners.
//
// Telegram API: https://core.telegram.org/bots/api#giveawaywinners
type GiveawayWinners struct {
	Chat                          *Chat  `json:"chat"`
	GiveawayMessageID             int64  `json:"giveaway_message_id"`
	WinnersSelectionDate          int64  `json:"winners_selection_date"`
	WinnerCount                   int64  `json:"winner_count"`
	Winners                       []User `json:"winners"`
	AdditionalChatCount           int64  `json:"additional_chat_count,omitempty"`
	PrizeStarCount                int64  `json:"prize_star_count,omitempty"`
	PremiumSubscriptionMonthCount int64  `json:"premium_subscription_month_count,omitempty"`
	UnclaimedPrizeCount           int64  `json:"unclaimed_prize_count,omitempty"`
	OnlyNewMembers                bool   `json:"only_new_members,omitempty"`
	WasRefunded                   bool   `json:"was_refunded,omitempty"`
	PrizeDescription              string `json:"prize_description,omitempty"`
}
