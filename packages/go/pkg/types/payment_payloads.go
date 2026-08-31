package types

// ShippingAddress this order must be shipped to, as sent by a user in a
// ShippingQuery.
//
// Telegram API: https://core.telegram.org/bots/api#shippingaddress
type ShippingAddress struct {
	// Two-letter ISO 3166-1 alpha-2 country code.
	CountryCode string `json:"country_code"`
	// State, if applicable.
	State string `json:"state"`
	// City.
	City string `json:"city"`
	// First line for the address.
	StreetLine1 string `json:"street_line1"`
	// Second line for the address.
	StreetLine2 string `json:"street_line2"`
	// Address post code.
	PostCode string `json:"post_code"`
}

// OrderInfo represents information about an order a user submitted while
// checking out, optionally sent with a PreCheckoutQuery.
//
// Telegram API: https://core.telegram.org/bots/api#orderinfo
type OrderInfo struct {
	// User name; only present when requested in the invoice.
	Name string `json:"name,omitempty"`
	// User's phone number; only present when requested in the invoice.
	PhoneNumber string `json:"phone_number,omitempty"`
	// User's email; only present when requested in the invoice.
	Email string `json:"email,omitempty"`
	// User's shipping address; only present when requested in the invoice.
	ShippingAddress *ShippingAddress `json:"shipping_address,omitempty"`
}

// ShippingQuery represents an incoming shipping query, sent when a user submits
// the shipping information for an invoice with need_shipping_address=True and
// is_flexible=True. Answer it with Bot.AnswerShippingQuery.
//
// Telegram API: https://core.telegram.org/bots/api#shippingquery
type ShippingQuery struct {
	// Unique identifier for this query.
	ID string `json:"id"`
	// Sender of the query.
	From *User `json:"from"`
	// Object with user-supplied shipping address.
	ShippingAddress *ShippingAddress `json:"shipping_address"`
	// Bot-supplied invoice payload the shipping information belongs to.
	InvoicePayload string `json:"invoice_payload"`
}

// PreCheckoutQuery contains low-level information about an incoming
// pre-checkout query, sent before a user pays an invoice. Answer it with
// Bot.AnswerPreCheckoutQuery within 10 seconds or the payment fails.
//
// Telegram API: https://core.telegram.org/bots/api#precheckoutquery
type PreCheckoutQuery struct {
	// Unique identifier for this query.
	ID string `json:"id"`
	// Sender of the query.
	From *User `json:"from"`
	// Three-letter ISO 4217 currency code, or "XTR" for payments in Telegram Stars.
	Currency string `json:"currency"`
	// Total price in the smallest units of the currency.
	TotalAmount int `json:"total_amount"`
	// Bot-supplied invoice payload.
	InvoicePayload string `json:"invoice_payload"`
	// Identifier of the user-chosen shipping option; nil for invoices that do
	// not offer shipping.
	ShippingOptionID string `json:"shipping_option_id,omitempty"`
	// Optional data about the order sent by the user.
	OrderInfo *OrderInfo `json:"order_info,omitempty"`
}

// PaidMediaPurchased represents the purchase of paid media by a user, as
// delivered in Update.PurchasedPaidMedia.
//
// Telegram API: https://core.telegram.org/bots/api#paidmediapurchased
type PaidMediaPurchased struct {
	// User that purchased the paid media.
	From *User `json:"from"`
	// Bot-supplied payload passed in the paid media the user purchased.
	PaidMediaPayload string `json:"paid_media_payload"`
}
