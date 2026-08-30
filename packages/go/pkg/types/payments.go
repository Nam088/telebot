package types

// LabeledPrice represents a portion of the price for goods or services.
//
// Telegram API: https://core.telegram.org/bots/api#labeledprice
type LabeledPrice struct {
	Label  string `json:"label"`
	Amount int    `json:"amount"`
}

// Invoice contains basic information about an invoice.
//
// Telegram API: https://core.telegram.org/bots/api#invoice
type Invoice struct {
	Title          string `json:"title"`
	Description    string `json:"description"`
	StartParameter string `json:"start_parameter"`
	Currency       string `json:"currency"`
	TotalAmount    int    `json:"total_amount"`
}

// SuccessfulPayment contains basic information about a successful payment.
//
// Telegram API: https://core.telegram.org/bots/api#successfulpayment
type SuccessfulPayment struct {
	Currency                   string     `json:"currency"`
	TotalAmount                int        `json:"total_amount"`
	InvoicePayload             string     `json:"invoice_payload"`
	ShippingOptionID           string     `json:"shipping_option_id,omitempty"`
	TelegramPaymentChargeID    string     `json:"telegram_payment_charge_id"`
	ProviderPaymentChargeID    string     `json:"provider_payment_charge_id"`
	IsFirstRecurring           bool       `json:"is_first_recurring,omitempty"`
	IsRecurring                bool       `json:"is_recurring,omitempty"`
	OrderInfo                  *OrderInfo `json:"order_info,omitempty"`
	SubscriptionExpirationDate int64      `json:"subscription_expiration_date,omitempty"`
}

// StarTransactions represents the list of Telegram Stars transactions.
//
// Telegram API: https://core.telegram.org/bots/api#startransactions
type StarTransactions struct {
	Transactions []StarTransaction `json:"transactions"`
}

// StarTransaction represents a single Telegram Stars transaction.
//
// Telegram API: https://core.telegram.org/bots/api#startransaction
type StarTransaction struct {
	ID             string `json:"id"`
	Amount         int    `json:"amount"`
	Date           int64  `json:"date"`
	Source         any    `json:"source,omitempty"`
	Receiver       any    `json:"receiver,omitempty"`
	NanostarAmount int64  `json:"nanostar_amount,omitempty"`
}

// StarAmount represents an amount of Telegram Stars.
//
// Telegram API: https://core.telegram.org/bots/api#staramount
type StarAmount struct {
	Amount         int `json:"amount"`
	NanostarAmount int `json:"nanostar_amount,omitempty"`
}

// SendGiftOptions represents parameters for the sendGift method.
//
// user_id and chat_id are mutually exclusive; exactly one of them must be set,
// mirroring the docs' "Required if chat_id is not specified" wording.
//
// See https://core.telegram.org/bots/api#sendgift
type SendGiftOptions struct {
	// Unique identifier of the target user that will receive the gift.
	// Required if ChatID is not specified.
	UserID *int64 `json:"user_id,omitempty"`
	// Unique identifier for the chat or username of the channel (in the format
	// @channelusername) that will receive the gift. Required if UserID is not
	// specified. Accepts int64 or string.
	ChatID any `json:"chat_id,omitempty"`
	// Identifier of the gift; limited gifts can't be sent to channel chats.
	GiftID string `json:"gift_id"`
	// Pass true to pay for the gift upgrade from the bot's balance,
	// thereby making the upgrade free for the receiver.
	PayForUpgrade bool `json:"pay_for_upgrade,omitempty"`
	// Text that will be shown along with the gift; 0-128 characters.
	Text string `json:"text,omitempty"`
	// Mode for parsing entities in the text.
	TextParseMode string `json:"text_parse_mode,omitempty"`
	// A list of special entities that appear in the gift text.
	TextEntities []MessageEntity `json:"text_entities,omitempty"`
}
