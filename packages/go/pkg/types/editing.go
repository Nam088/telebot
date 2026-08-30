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

// SendMessageDraftOptions represents parameters for the sendMessageDraft method
// (Bot API 10.1+).
//
// Port of SendMessageDraftOptions in
// packages/node/src/client/types/messages/send-options.ts. Telegram requires a
// non-zero DraftID that refers to a draft previously shown in the chat.
//
// See https://core.telegram.org/bots/api#sendmessagedraft
type SendMessageDraftOptions struct {
	// Unique identifier for the target private chat.
	ChatID any `json:"chat_id"`
	// Unique identifier of the message draft; must be non-zero.
	DraftID int64 `json:"draft_id"`
	// Unique identifier for the target message thread.
	MessageThreadID int64 `json:"message_thread_id,omitempty"`
	// Text of the message to be sent, 0-4096 characters. Node passes an empty
	// text to show a "Thinking..." placeholder; omitting Text in Go sends no
	// text field at all, which Telegram treats the same way.
	Text string `json:"text,omitempty"`
	// Mode for parsing entities in the message text.
	ParseMode string `json:"parse_mode,omitempty"`
	// A list of special entities that appear in the message text.
	Entities []MessageEntity `json:"entities,omitempty"`
	// True, to show the user a button to stop further drafts (Bot API 10.3+).
	CanStop bool `json:"can_stop,omitempty"`
	// True, to keep the draft in the chat when the stop button is pressed
	// (Bot API 10.3+).
	KeepOnStop bool `json:"keep_on_stop,omitempty"`
}
