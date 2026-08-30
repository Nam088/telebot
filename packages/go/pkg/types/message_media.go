package types

// LivePhoto represents a live photo.
//
// Telegram API: https://core.telegram.org/bots/api#livephoto
type LivePhoto struct {
	Photo        []PhotoSize `json:"photo,omitempty"`
	FileID       string      `json:"file_id"`
	FileUniqueID string      `json:"file_unique_id"`
	Width        int64       `json:"width"`
	Height       int64       `json:"height"`
	Duration     int64       `json:"duration"`
	MimeType     string      `json:"mime_type,omitempty"`
	FileSize     int64       `json:"file_size,omitempty"`
}

// Link represents an HTTP link.
//
// Telegram API: https://core.telegram.org/bots/api#link
type Link struct {
	URL string `json:"url"`
}

// VideoQuality represents a video file of a specific quality.
//
// Telegram API: https://core.telegram.org/bots/api#videoquality
type VideoQuality struct {
	FileID       string `json:"file_id"`
	FileUniqueID string `json:"file_unique_id"`
	Width        int64  `json:"width"`
	Height       int64  `json:"height"`
	Codec        string `json:"codec"`
	FileSize     int64  `json:"file_size,omitempty"`
}

// At most one of the optional fields can be present in any given object.
//
// Telegram API: https://core.telegram.org/bots/api#pollmedia
type PollMedia struct {
	Animation *Animation  `json:"animation,omitempty"`
	Audio     *Audio      `json:"audio,omitempty"`
	Document  *Document   `json:"document,omitempty"`
	Link      *Link       `json:"link,omitempty"`
	LivePhoto *LivePhoto  `json:"live_photo,omitempty"`
	Location  *Location   `json:"location,omitempty"`
	Photo     []PhotoSize `json:"photo,omitempty"`
	Sticker   *Sticker    `json:"sticker,omitempty"`
	Venue     *Venue      `json:"venue,omitempty"`
	Video     *Video      `json:"video,omitempty"`
}

// TextQuote contains information about the quoted part of a message that is
// replied to by the given message.
//
// Telegram API: https://core.telegram.org/bots/api#textquote
type TextQuote struct {
	Text     string          `json:"text"`
	Entities []MessageEntity `json:"entities,omitempty"`
	Position int64           `json:"position"`
	IsManual bool            `json:"is_manual,omitempty"`
}

// ExternalReplyInfo contains information about a message that is being
// replied to, which may come from another chat or forum topic.
//
// Telegram API: https://core.telegram.org/bots/api#externalreplyinfo
type ExternalReplyInfo struct {
	Origin             *MessageOrigin      `json:"origin"`
	Chat               *Chat               `json:"chat,omitempty"`
	MessageID          int64               `json:"message_id,omitempty"`
	LinkPreviewOptions *LinkPreviewOptions `json:"link_preview_options,omitempty"`
	Animation          *Animation          `json:"animation,omitempty"`
	Audio              *Audio              `json:"audio,omitempty"`
	Document           *Document           `json:"document,omitempty"`
	LivePhoto          *LivePhoto          `json:"live_photo,omitempty"`
	PaidMedia          *PaidMediaInfo      `json:"paid_media,omitempty"`
	Photo              []PhotoSize         `json:"photo,omitempty"`
	Sticker            *Sticker            `json:"sticker,omitempty"`
	Story              *Story              `json:"story,omitempty"`
	Video              *Video              `json:"video,omitempty"`
	VideoNote          *VideoNote          `json:"video_note,omitempty"`
	Voice              *Voice              `json:"voice,omitempty"`
	HasMediaSpoiler    bool                `json:"has_media_spoiler,omitempty"`
	Checklist          *Checklist          `json:"checklist,omitempty"`
	Contact            *Contact            `json:"contact,omitempty"`
	Dice               *Dice               `json:"dice,omitempty"`
	Game               *Game               `json:"game,omitempty"`
	Giveaway           *Giveaway           `json:"giveaway,omitempty"`
	GiveawayWinners    *GiveawayWinners    `json:"giveaway_winners,omitempty"`
	Invoice            *Invoice            `json:"invoice,omitempty"`
	Location           *Location           `json:"location,omitempty"`
	Poll               *Poll               `json:"poll,omitempty"`
	Venue              *Venue              `json:"venue,omitempty"`
}

// RefundedPayment contains basic information about a refunded payment.
//
// Telegram API: https://core.telegram.org/bots/api#refundedpayment
type RefundedPayment struct {
	Currency                string `json:"currency"`
	TotalAmount             int64  `json:"total_amount"`
	InvoicePayload          string `json:"invoice_payload"`
	TelegramPaymentChargeID string `json:"telegram_payment_charge_id"`
	ProviderPaymentChargeID string `json:"provider_payment_charge_id,omitempty"`
}

// PaidMediaInfo describes the paid media added to a message.
//
// Telegram API: https://core.telegram.org/bots/api#paidmediainfo
type PaidMediaInfo struct {
	StarCount int64       `json:"star_count"`
	PaidMedia []PaidMedia `json:"paid_media"`
}

// PaidMedia describes the paid media attached to a message.
//
// It is a flattened representation of Telegram's PaidMedia union: Type
// discriminates the variant ("photo", "preview", "video" or "live_photo") and
// only the fields relevant to that variant are populated.
//
// Telegram API: https://core.telegram.org/bots/api#paidmedia
type PaidMedia struct {
	Type      string      `json:"type"`
	Photo     []PhotoSize `json:"photo,omitempty"`
	Video     *Video      `json:"video,omitempty"`
	LivePhoto *LivePhoto  `json:"live_photo,omitempty"`
	Width     int64       `json:"width,omitempty"`
	Height    int64       `json:"height,omitempty"`
	Duration  int64       `json:"duration,omitempty"`
}
