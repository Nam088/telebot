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

// PreparedInlineMessage represents a prepared inline message.
//
// Telegram API: https://core.telegram.org/bots/api#preparedinlinemessage
type PreparedInlineMessage struct {
	ID             string `json:"id"`
	ExpirationDate int64  `json:"expiration_date"`
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
