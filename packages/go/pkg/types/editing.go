package types

// EditMessageTextOptions represents parameters for the editMessageText method.
type EditMessageTextOptions struct {
	BusinessConnectionID string                `json:"business_connection_id,omitempty"`
	ChatID               any                   `json:"chat_id,omitempty"`
	MessageID            int64                 `json:"message_id,omitempty"`
	InlineMessageID      string                `json:"inline_message_id,omitempty"`
	Text                 string                `json:"text"`
	ParseMode            string                `json:"parse_mode,omitempty"`
	Entities             []MessageEntity       `json:"entities,omitempty"`
	LinkPreviewOptions   *LinkPreviewOptions   `json:"link_preview_options,omitempty"`
	ReplyMarkup          *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// EditMessageCaptionOptions represents parameters for the editMessageCaption method.
type EditMessageCaptionOptions struct {
	BusinessConnectionID  string                `json:"business_connection_id,omitempty"`
	ChatID                any                   `json:"chat_id,omitempty"`
	MessageID             int64                 `json:"message_id,omitempty"`
	InlineMessageID       string                `json:"inline_message_id,omitempty"`
	Caption               string                `json:"caption,omitempty"`
	ParseMode             string                `json:"parse_mode,omitempty"`
	CaptionEntities       []MessageEntity       `json:"caption_entities,omitempty"`
	ShowCaptionAboveMedia bool                  `json:"show_caption_above_media,omitempty"`
	ReplyMarkup           *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// EditMessageMediaOptions represents parameters for the editMessageMedia method.
type EditMessageMediaOptions struct {
	BusinessConnectionID string                `json:"business_connection_id,omitempty"`
	ChatID               any                   `json:"chat_id,omitempty"`
	MessageID            int64                 `json:"message_id,omitempty"`
	InlineMessageID      string                `json:"inline_message_id,omitempty"`
	Media                InputMedia            `json:"media"`
	ReplyMarkup          *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// EditMessageLiveLocationOptions represents parameters for the editMessageLiveLocation method.
type EditMessageLiveLocationOptions struct {
	BusinessConnectionID string                `json:"business_connection_id,omitempty"`
	ChatID               any                   `json:"chat_id,omitempty"`
	MessageID            int64                 `json:"message_id,omitempty"`
	InlineMessageID      string                `json:"inline_message_id,omitempty"`
	Latitude             float64               `json:"latitude"`
	Longitude            float64               `json:"longitude"`
	HorizontalAccuracy   float64               `json:"horizontal_accuracy,omitempty"`
	Heading              int                   `json:"heading,omitempty"`
	ProximityAlertRadius int                   `json:"proximity_alert_radius,omitempty"`
	LivePeriod           int                   `json:"live_period,omitempty"`
	ReplyMarkup          *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// StopMessageLiveLocationOptions represents parameters for the stopMessageLiveLocation method.
type StopMessageLiveLocationOptions struct {
	BusinessConnectionID string                `json:"business_connection_id,omitempty"`
	ChatID               any                   `json:"chat_id,omitempty"`
	MessageID            int64                 `json:"message_id,omitempty"`
	InlineMessageID      string                `json:"inline_message_id,omitempty"`
	ReplyMarkup          *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// StopPollOptions represents parameters for the stopPoll method.
type StopPollOptions struct {
	BusinessConnectionID string                `json:"business_connection_id,omitempty"`
	ChatID               any                   `json:"chat_id"`
	MessageID            int64                 `json:"message_id"`
	ReplyMarkup          *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}
