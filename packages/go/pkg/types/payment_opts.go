package types

// ShippingOption represents one shipping option.
//
// Telegram API: https://core.telegram.org/bots/api#shippingoption
type ShippingOption struct {
	ID     string         `json:"id"`
	Title  string         `json:"title"`
	Prices []LabeledPrice `json:"prices"`
}

// SendInvoiceOptions represents parameters for the sendInvoice method.
type SendInvoiceOptions struct {
	ChatID                    any                   `json:"chat_id"`
	Title                     string                `json:"title"`
	Description               string                `json:"description"`
	Payload                   string                `json:"payload"`
	Currency                  string                `json:"currency"`
	Prices                    []LabeledPrice        `json:"prices"`
	ProviderToken             string                `json:"provider_token,omitempty"`
	MaxTipAmount              int                   `json:"max_tip_amount,omitempty"`
	SuggestedTipAmounts       []int                 `json:"suggested_tip_amounts,omitempty"`
	StartParameter            string                `json:"start_parameter,omitempty"`
	ProviderData              string                `json:"provider_data,omitempty"`
	PhotoURL                  string                `json:"photo_url,omitempty"`
	PhotoSize                 int                   `json:"photo_size,omitempty"`
	PhotoWidth                int                   `json:"photo_width,omitempty"`
	PhotoHeight               int                   `json:"photo_height,omitempty"`
	NeedName                  bool                  `json:"need_name,omitempty"`
	NeedPhoneNumber           bool                  `json:"need_phone_number,omitempty"`
	NeedEmail                 bool                  `json:"need_email,omitempty"`
	NeedShippingAddress       bool                  `json:"need_shipping_address,omitempty"`
	SendPhoneNumberToProvider bool                  `json:"send_phone_number_to_provider,omitempty"`
	SendEmailToProvider       bool                  `json:"send_email_to_provider,omitempty"`
	IsFlexible                bool                  `json:"is_flexible,omitempty"`
	DisableNotification       bool                  `json:"disable_notification,omitempty"`
	ProtectContent            bool                  `json:"protect_content,omitempty"`
	ReplyParameters           *ReplyParameters      `json:"reply_parameters,omitempty"`
	ReplyMarkup               *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
	MessageThreadID           int64                 `json:"message_thread_id,omitempty"`
}

// CreateInvoiceLinkOptions represents parameters for the createInvoiceLink method.
type CreateInvoiceLinkOptions struct {
	Title                     string         `json:"title"`
	Description               string         `json:"description"`
	Payload                   string         `json:"payload"`
	Currency                  string         `json:"currency"`
	Prices                    []LabeledPrice `json:"prices"`
	ProviderToken             string         `json:"provider_token,omitempty"`
	MaxTipAmount              int            `json:"max_tip_amount,omitempty"`
	SuggestedTipAmounts       []int          `json:"suggested_tip_amounts,omitempty"`
	StartParameter            string         `json:"start_parameter,omitempty"`
	ProviderData              string         `json:"provider_data,omitempty"`
	PhotoURL                  string         `json:"photo_url,omitempty"`
	PhotoSize                 int            `json:"photo_size,omitempty"`
	PhotoWidth                int            `json:"photo_width,omitempty"`
	PhotoHeight               int            `json:"photo_height,omitempty"`
	NeedName                  bool           `json:"need_name,omitempty"`
	NeedPhoneNumber           bool           `json:"need_phone_number,omitempty"`
	NeedEmail                 bool           `json:"need_email,omitempty"`
	NeedShippingAddress       bool           `json:"need_shipping_address,omitempty"`
	SendPhoneNumberToProvider bool           `json:"send_phone_number_to_provider,omitempty"`
	SendEmailToProvider       bool           `json:"send_email_to_provider,omitempty"`
	IsFlexible                bool           `json:"is_flexible,omitempty"`
}

// AnswerShippingQueryOptions represents parameters for the answerShippingQuery method.
type AnswerShippingQueryOptions struct {
	ShippingQueryID string           `json:"shipping_query_id"`
	OK              bool             `json:"ok"`
	ShippingOptions []ShippingOption `json:"shipping_options,omitempty"`
	ErrorMessage    string           `json:"error_message,omitempty"`
}

// AnswerPreCheckoutQueryOptions represents parameters for the answerPreCheckoutQuery method.
type AnswerPreCheckoutQueryOptions struct {
	PreCheckoutQueryID string `json:"pre_checkout_query_id"`
	OK                 bool   `json:"ok"`
	ErrorMessage       string `json:"error_message,omitempty"`
}

// GetStarTransactionsOptions represents parameters for the getStarTransactions method.
type GetStarTransactionsOptions struct {
	Offset int `json:"offset,omitempty"`
	Limit  int `json:"limit,omitempty"`
}

// RefundStarPaymentOptions represents parameters for the refundStarPayment method.
type RefundStarPaymentOptions struct {
	UserID                  int64  `json:"user_id"`
	TelegramPaymentChargeID string `json:"telegram_payment_charge_id"`
}

// EditUserStarSubscriptionOptions represents parameters for the editUserStarSubscription method.
type EditUserStarSubscriptionOptions struct {
	UserID                  int64  `json:"user_id"`
	TelegramPaymentChargeID string `json:"telegram_payment_charge_id"`
	IsCanceled              bool   `json:"is_canceled"`
}
