package types

// SendGameOptions represents parameters for the sendGame method.
type SendGameOptions struct {
	BusinessConnectionID string                `json:"business_connection_id,omitempty"`
	ChatID               any                   `json:"chat_id"`
	GameShortName        string                `json:"game_short_name"`
	MessageThreadID      int64                 `json:"message_thread_id,omitempty"`
	DisableNotification  bool                  `json:"disable_notification,omitempty"`
	ProtectContent       bool                  `json:"protect_content,omitempty"`
	ReplyMarkup          *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// SetGameScoreOptions represents parameters for the setGameScore method.
type SetGameScoreOptions struct {
	UserID             int64  `json:"user_id"`
	Score              int    `json:"score"`
	Force              bool   `json:"force,omitempty"`
	DisableEditMessage bool   `json:"disable_edit_message,omitempty"`
	ChatID             any    `json:"chat_id,omitempty"`
	MessageID          int64  `json:"message_id,omitempty"`
	InlineMessageID    string `json:"inline_message_id,omitempty"`
}

// GetGameHighScoresOptions represents parameters for the getGameHighScores method.
type GetGameHighScoresOptions struct {
	UserID          int64  `json:"user_id"`
	ChatID          any    `json:"chat_id,omitempty"`
	MessageID       int64  `json:"message_id,omitempty"`
	InlineMessageID string `json:"inline_message_id,omitempty"`
}

// CallbackGame is a placeholder for the game that an inline keyboard button
// launches. Use BotFather to set up the game.
//
// Telegram API: https://core.telegram.org/bots/api#callbackgame
type CallbackGame struct{}
