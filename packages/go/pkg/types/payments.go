package types

// LabeledPrice represents a portion of the price for goods or services.
type LabeledPrice struct {
	Label  string `json:"label"`
	Amount int    `json:"amount"`
}

// Invoice contains basic information about an invoice.
type Invoice struct {
	Title          string `json:"title"`
	Description    string `json:"description"`
	StartParameter string `json:"start_parameter"`
	Currency       string `json:"currency"`
	TotalAmount    int    `json:"total_amount"`
}

// SuccessfulPayment contains basic information about a successful payment.
type SuccessfulPayment struct {
	Currency                string `json:"currency"`
	TotalAmount             int    `json:"total_amount"`
	InvoicePayload          string `json:"invoice_payload"`
	ShippingOptionID        string `json:"shipping_option_id,omitempty"`
	TelegramPaymentChargeID string `json:"telegram_payment_charge_id"`
	ProviderPaymentChargeID string `json:"provider_payment_charge_id"`
}

// StarTransactions represents the list of Telegram Stars transactions.
type StarTransactions struct {
	Transactions []StarTransaction `json:"transactions"`
}

// StarTransaction represents a single Telegram Stars transaction.
type StarTransaction struct {
	ID       string `json:"id"`
	Amount   int    `json:"amount"`
	Date     int64  `json:"date"`
	Source   any    `json:"source,omitempty"`
	Receiver any    `json:"receiver,omitempty"`
}

// StarAmount represents an amount of Telegram Stars.
type StarAmount struct {
	Amount         int `json:"amount"`
	NanostarAmount int `json:"nanostar_amount,omitempty"`
}

// SendGiftOptions represents parameters for the sendGift method.
//
// Port of SendGiftOptions in packages/node/src/client/types/payments/options.ts.
//
// See https://core.telegram.org/bots/api#sendgift
type SendGiftOptions struct {
	// Unique identifier of the target user that will receive the gift.
	UserID int64 `json:"user_id"`
	// Identifier of the gift.
	GiftID string `json:"gift_id"`
	// Pass true to pay for the gift upgrade from the bot's balance,
	// thereby making the upgrade free for the receiver.
	PayForUpgrade bool `json:"pay_for_upgrade,omitempty"`
	// Text that will be shown along with the gift; 0-255 characters.
	Text string `json:"text,omitempty"`
	// Mode for parsing entities in the text.
	TextParseMode string `json:"text_parse_mode,omitempty"`
	// A list of special entities that appear in the gift text.
	TextEntities []MessageEntity `json:"text_entities,omitempty"`
}
