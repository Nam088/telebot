package types

// InlineQueryResult represents one result of an inline query.
//
// Telegram API: https://core.telegram.org/bots/api#inlinequeryresult
type InlineQueryResult map[string]any

// SentWebAppMessage contains information about an inline message sent by a Web App.
//
// Telegram API: https://core.telegram.org/bots/api#sentwebappmessage
type SentWebAppMessage struct {
	InlineMessageID string `json:"inline_message_id,omitempty"`
}

// SentGuestMessage describes an inline message sent by a guest bot.
//
// Telegram API: https://core.telegram.org/bots/api#sentguestmessage
type SentGuestMessage struct {
	// Identifier of the sent inline message.
	InlineMessageID string `json:"inline_message_id"`
}

// PreparedInlineMessage represents a prepared inline message.
//
// Telegram API: https://core.telegram.org/bots/api#preparedinlinemessage
type PreparedInlineMessage struct {
	ID             string `json:"id"`
	ExpirationDate int64  `json:"expiration_date"`
}

// PreparedKeyboardButton describes a keyboard button to be used by a user of a
// Mini App.
//
// Telegram API: https://core.telegram.org/bots/api#preparedkeyboardbutton
type PreparedKeyboardButton struct {
	// Unique identifier of the keyboard button.
	ID string `json:"id"`
}

// AnswerInlineQueryOptions represents parameters for the answerInlineQuery method.
type AnswerInlineQueryOptions struct {
	InlineQueryID string              `json:"inline_query_id"`
	Results       []InlineQueryResult `json:"results"`
	CacheTime     int                 `json:"cache_time,omitempty"`
	IsPersonal    bool                `json:"is_personal,omitempty"`
	NextOffset    string              `json:"next_offset,omitempty"`
	Button        any                 `json:"button,omitempty"`
}

// AnswerWebAppQueryOptions represents parameters for the answerWebAppQuery method.
type AnswerWebAppQueryOptions struct {
	WebAppQueryID string            `json:"web_app_query_id"`
	Result        InlineQueryResult `json:"result"`
}

// SavePreparedInlineMessageOptions represents parameters for the savePreparedInlineMessage method.
type SavePreparedInlineMessageOptions struct {
	UserID            int64             `json:"user_id"`
	Result            InlineQueryResult `json:"result"`
	AllowUserChats    bool              `json:"allow_user_chats,omitempty"`
	AllowBotChats     bool              `json:"allow_bot_chats,omitempty"`
	AllowGroupChats   bool              `json:"allow_group_chats,omitempty"`
	AllowChannelChats bool              `json:"allow_channel_chats,omitempty"`
}

// SavePreparedKeyboardButtonOptions represents parameters for the savePreparedKeyboardButton method.
//
// Telegram API: https://core.telegram.org/bots/api#savepreparedkeyboardbutton
type SavePreparedKeyboardButtonOptions struct {
	// Unique identifier of the target user that will be able to use the button.
	UserID int64 `json:"user_id"`
	// A KeyboardButton object describing the button to save.
	Button any `json:"button"`
}
