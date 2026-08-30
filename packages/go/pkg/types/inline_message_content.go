package types

// InputContactMessageContent represents the content of a contact message to be
// sent as the result of an inline query.
//
// Telegram API: https://core.telegram.org/bots/api#inputcontactmessagecontent
type InputContactMessageContent struct {
	// Contact's phone number.
	PhoneNumber string `json:"phone_number"`
	// Contact's first name.
	FirstName string `json:"first_name"`
	// Contact's last name.
	LastName string `json:"last_name,omitempty"`
	// Additional data about the contact in the form of a vCard, 0-2048 bytes.
	VCard string `json:"vcard,omitempty"`
}

// InputLocationMessageContent represents the content of a location message to be
// sent as the result of an inline query.
//
// Telegram API: https://core.telegram.org/bots/api#inputlocationmessagecontent
type InputLocationMessageContent struct {
	// Latitude of the location in degrees.
	Latitude float64 `json:"latitude"`
	// Longitude of the location in degrees.
	Longitude float64 `json:"longitude"`
	// The radius of uncertainty for the location, measured in meters; 0-1500.
	HorizontalAccuracy float64 `json:"horizontal_accuracy,omitempty"`
	// Period in seconds during which the location can be updated, must be between
	// 60 and 86400, or 0x7FFFFFFF for live locations that can be edited
	// indefinitely.
	LivePeriod int64 `json:"live_period,omitempty"`
	// For live locations, a direction in which the user is moving, in degrees.
	// Must be between 1 and 360 if specified.
	Heading int64 `json:"heading,omitempty"`
	// For live locations, a maximum distance for proximity alerts about approaching
	// another chat member, in meters. Must be between 1 and 100000 if specified.
	ProximityAlertRadius int64 `json:"proximity_alert_radius,omitempty"`
}

// InputVenueMessageContent represents the content of a venue message to be sent
// as the result of an inline query.
//
// Telegram API: https://core.telegram.org/bots/api#inputvenuemessagecontent
type InputVenueMessageContent struct {
	// Latitude of the venue in degrees.
	Latitude float64 `json:"latitude"`
	// Longitude of the venue in degrees.
	Longitude float64 `json:"longitude"`
	// Name of the venue.
	Title string `json:"title"`
	// Address of the venue.
	Address string `json:"address"`
	// Foursquare identifier of the venue, if known.
	FoursquareID string `json:"foursquare_id,omitempty"`
	// Foursquare type of the venue, if known. (For example,
	// "arts_entertainment/default", "arts_entertainment/aquarium" or
	// "food/icecream".)
	FoursquareType string `json:"foursquare_type,omitempty"`
	// Google Places identifier of the venue.
	GooglePlaceID string `json:"google_place_id,omitempty"`
	// Google Places type of the venue. (See supported types.)
	GooglePlaceType string `json:"google_place_type,omitempty"`
}

// InputInvoiceMessageContent represents the content of an invoice message to be
// sent as the result of an inline query.
//
// Telegram API: https://core.telegram.org/bots/api#inputinvoicemessagecontent
type InputInvoiceMessageContent struct {
	// Product name, 1-32 characters.
	Title string `json:"title"`
	// Product description, 1-255 characters.
	Description string `json:"description"`
	// Bot-defined invoice payload, 1-128 bytes. This will not be displayed to the
	// user, use it for your internal processes.
	Payload string `json:"payload"`
	// Payment provider token, obtained via @BotFather. Pass an empty string for
	// payments in Telegram Stars.
	ProviderToken string `json:"provider_token,omitempty"`
	// Three-letter ISO 4217 currency code, see more on currencies. Pass "XTR" for
	// payments in Telegram Stars.
	Currency string `json:"currency"`
	// Price breakdown, a JSON-serialized list of components (e.g. product price,
	// tax, discount, delivery cost, delivery tax, bonus, etc.). Must contain
	// exactly one item for payments in Telegram Stars.
	Prices []LabeledPrice `json:"prices"`
	// The maximum accepted amount for tips in the smallest units of the currency
	// (integer, not float/double). Defaults to 0. Not supported for payments in
	// Telegram Stars.
	MaxTipAmount int64 `json:"max_tip_amount,omitempty"`
	// A JSON-serialized array of suggested amounts of tip in the smallest units of
	// the currency (integer, not float/double). At most 4 suggested tip amounts can
	// be specified.
	SuggestedTipAmounts []int64 `json:"suggested_tip_amounts,omitempty"`
	// A JSON-serialized object for data about the invoice, which will be shared
	// with the payment provider.
	ProviderData string `json:"provider_data,omitempty"`
	// URL of the product photo for the invoice. Can be a photo of the goods or a
	// marketing image for a service.
	PhotoURL string `json:"photo_url,omitempty"`
	// Photo size in bytes.
	PhotoSize int64 `json:"photo_size,omitempty"`
	// Photo width.
	PhotoWidth int64 `json:"photo_width,omitempty"`
	// Photo height.
	PhotoHeight int64 `json:"photo_height,omitempty"`
	// Pass True if you require the user's full name to complete the order. Ignored
	// for payments in Telegram Stars.
	NeedName bool `json:"need_name,omitempty"`
	// Pass True if you require the user's phone number to complete the order.
	// Ignored for payments in Telegram Stars.
	NeedPhoneNumber bool `json:"need_phone_number,omitempty"`
	// Pass True if you require the user's email address to complete the order.
	// Ignored for payments in Telegram Stars.
	NeedEmail bool `json:"need_email,omitempty"`
	// Pass True if you require the user's shipping address to complete the order.
	// Ignored for payments in Telegram Stars.
	NeedShippingAddress bool `json:"need_shipping_address,omitempty"`
	// Pass True if the user's phone number should be sent to the provider. Ignored
	// for payments in Telegram Stars.
	SendPhoneNumberToProvider bool `json:"send_phone_number_to_provider,omitempty"`
	// Pass True if the user's email address should be sent to the provider.
	// Ignored for payments in Telegram Stars.
	SendEmailToProvider bool `json:"send_email_to_provider,omitempty"`
	// Pass True if the final price depends on the shipping method. Ignored for
	// payments in Telegram Stars.
	IsFlexible bool `json:"is_flexible,omitempty"`
}
