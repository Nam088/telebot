package types

// SuggestedPostPrice describes the price of a suggested post.
//
// Telegram API: https://core.telegram.org/bots/api#suggestedpostprice
type SuggestedPostPrice struct {
	Currency string `json:"currency"`
	Amount   int64  `json:"amount"`
}

// SuggestedPostInfo contains information about a suggested post.
//
// Telegram API: https://core.telegram.org/bots/api#suggestedpostinfo
type SuggestedPostInfo struct {
	State    string              `json:"state"`
	Price    *SuggestedPostPrice `json:"price,omitempty"`
	SendDate int64               `json:"send_date,omitempty"`
}

// SuggestedPostApproved describes a service message about the approval of a
// suggested post.
//
// Telegram API: https://core.telegram.org/bots/api#suggestedpostapproved
type SuggestedPostApproved struct {
	SuggestedPostMessage *Message            `json:"suggested_post_message,omitempty"`
	Price                *SuggestedPostPrice `json:"price,omitempty"`
	SendDate             int64               `json:"send_date"`
}

// SuggestedPostApprovalFailed describes a service message about the failed
// approval of a suggested post. Currently, only caused by insufficient user
// funds at the time of approval.
//
// Telegram API: https://core.telegram.org/bots/api#suggestedpostapprovalfailed
type SuggestedPostApprovalFailed struct {
	SuggestedPostMessage *Message            `json:"suggested_post_message,omitempty"`
	Price                *SuggestedPostPrice `json:"price"`
}

// SuggestedPostDeclined describes a service message about the rejection of a
// suggested post.
//
// Telegram API: https://core.telegram.org/bots/api#suggestedpostdeclined
type SuggestedPostDeclined struct {
	SuggestedPostMessage *Message `json:"suggested_post_message,omitempty"`
	Comment              string   `json:"comment,omitempty"`
}

// SuggestedPostPaid describes a service message about a successful payment
// for a suggested post.
//
// Telegram API: https://core.telegram.org/bots/api#suggestedpostpaid
type SuggestedPostPaid struct {
	SuggestedPostMessage *Message    `json:"suggested_post_message,omitempty"`
	Currency             string      `json:"currency"`
	Amount               int64       `json:"amount,omitempty"`
	StarAmount           *StarAmount `json:"star_amount,omitempty"`
}

// SuggestedPostRefunded describes a service message about a payment refund
// for a suggested post.
//
// Telegram API: https://core.telegram.org/bots/api#suggestedpostrefunded
type SuggestedPostRefunded struct {
	SuggestedPostMessage *Message `json:"suggested_post_message,omitempty"`
	Reason               string   `json:"reason"`
}
