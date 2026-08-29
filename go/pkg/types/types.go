package types

import "fmt"

// Response represents a standard Telegram Bot API response envelope.
type Response[T any] struct {
	Ok          bool        `json:"ok"`
	Result      T           `json:"result,omitempty"`
	ErrorCode   int         `json:"error_code,omitempty"`
	Description string      `json:"description,omitempty"`
	Parameters  *Parameters `json:"parameters,omitempty"`
}

// Parameters contains information about why a request failed.
type Parameters struct {
	MigrateToChatID int64 `json:"migrate_to_chat_id,omitempty"`
	RetryAfter      int   `json:"retry_after,omitempty"`
}

// TelegramError represents an API error returned by Telegram.
type TelegramError struct {
	ErrorCode   int         `json:"error_code"`
	Description string      `json:"description"`
	Parameters  *Parameters `json:"parameters,omitempty"`
}

func (e *TelegramError) Error() string {
	return fmt.Sprintf("telegram api error: [%d] %s", e.ErrorCode, e.Description)
}

// User represents a Telegram user or bot.
type User struct {
	ID                      int64  `json:"id"`
	IsBot                   bool   `json:"is_bot"`
	FirstName               string `json:"first_name"`
	LastName                string `json:"last_name,omitempty"`
	Username                string `json:"username,omitempty"`
	LanguageCode            string `json:"language_code,omitempty"`
	IsPremium               bool   `json:"is_premium,omitempty"`
	AddedToAttachmentMenu   bool   `json:"added_to_attachment_menu,omitempty"`
	CanJoinGroups           bool   `json:"can_join_groups,omitempty"`
	CanReadAllGroupMessages bool   `json:"can_read_all_group_messages,omitempty"`
	SupportsInlineQueries   bool   `json:"supports_inline_queries,omitempty"`
	CanConnectToBusiness    bool   `json:"can_connect_to_business,omitempty"`
	HasMainWebApp           bool   `json:"has_main_web_app,omitempty"`
}

// Chat represents a Telegram chat (private, group, supergroup, channel).
type Chat struct {
	ID        int64  `json:"id"`
	Type      string `json:"type"`
	Title     string `json:"title,omitempty"`
	Username  string `json:"username,omitempty"`
	FirstName string `json:"first_name,omitempty"`
	LastName  string `json:"last_name,omitempty"`
	IsForum   bool   `json:"is_forum,omitempty"`
}

// Message represents a Telegram message.
type Message struct {
	MessageID      int64                  `json:"message_id"`
	MessageThreadID int64                 `json:"message_thread_id,omitempty"`
	From           *User                  `json:"from,omitempty"`
	SenderChat     *Chat                  `json:"sender_chat,omitempty"`
	Date           int64                  `json:"date"`
	Chat           *Chat                  `json:"chat"`
	Text           string                 `json:"text,omitempty"`
	Caption        string                 `json:"caption,omitempty"`
	ReplyToMessage *Message               `json:"reply_to_message,omitempty"`
	ReplyMarkup    *InlineKeyboardMarkup  `json:"reply_markup,omitempty"`
}

// CallbackQuery represents an incoming callback query from an inline button.
type CallbackQuery struct {
	ID              string   `json:"id"`
	From            *User    `json:"from"`
	Message         *Message `json:"message,omitempty"`
	InlineMessageID string   `json:"inline_message_id,omitempty"`
	ChatInstance    string   `json:"chat_instance"`
	Data            string   `json:"data,omitempty"`
	GameShortName   string   `json:"game_short_name,omitempty"`
}

// Update represents an incoming update from Telegram.
type Update struct {
	UpdateID          int64          `json:"update_id"`
	Message           *Message       `json:"message,omitempty"`
	EditedMessage     *Message       `json:"edited_message,omitempty"`
	ChannelPost       *Message       `json:"channel_post,omitempty"`
	EditedChannelPost *Message       `json:"edited_channel_post,omitempty"`
	CallbackQuery     *CallbackQuery `json:"callback_query,omitempty"`
}

// EffectiveUser extracts the sender User from an Update regardless of update type.
func (u *Update) EffectiveUser() *User {
	if u.Message != nil && u.Message.From != nil {
		return u.Message.From
	}
	if u.CallbackQuery != nil && u.CallbackQuery.From != nil {
		return u.CallbackQuery.From
	}
	if u.EditedMessage != nil && u.EditedMessage.From != nil {
		return u.EditedMessage.From
	}
	return nil
}

// EffectiveChat extracts the target Chat from an Update.
func (u *Update) EffectiveChat() *Chat {
	if u.Message != nil && u.Message.Chat != nil {
		return u.Message.Chat
	}
	if u.CallbackQuery != nil && u.CallbackQuery.Message != nil {
		return u.CallbackQuery.Message.Chat
	}
	if u.EditedMessage != nil && u.EditedMessage.Chat != nil {
		return u.EditedMessage.Chat
	}
	if u.ChannelPost != nil && u.ChannelPost.Chat != nil {
		return u.ChannelPost.Chat
	}
	return nil
}

// EffectiveMessage extracts the relevant Message from an Update.
func (u *Update) EffectiveMessage() *Message {
	if u.Message != nil {
		return u.Message
	}
	if u.CallbackQuery != nil && u.CallbackQuery.Message != nil {
		return u.CallbackQuery.Message
	}
	if u.EditedMessage != nil {
		return u.EditedMessage
	}
	if u.ChannelPost != nil {
		return u.ChannelPost
	}
	return nil
}

// InlineKeyboardButton represents a button on an inline keyboard.
type InlineKeyboardButton struct {
	Text         string `json:"text"`
	URL          string `json:"url,omitempty"`
	CallbackData string `json:"callback_data,omitempty"`
}

// InlineKeyboardMarkup represents an inline keyboard attached to a message.
type InlineKeyboardMarkup struct {
	InlineKeyboard [][]InlineKeyboardButton `json:"inline_keyboard"`
}

// SendMessageOptions represents parameters for the sendMessage method.
type SendMessageOptions struct {
	ChatID          any                   `json:"chat_id"`
	Text            string                `json:"text"`
	ParseMode       string                `json:"parse_mode,omitempty"`
	ReplyMarkup     *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
	MessageThreadID int64                 `json:"message_thread_id,omitempty"`
}

// GetUpdatesOptions represents parameters for the getUpdates method.
type GetUpdatesOptions struct {
	Offset         int64    `json:"offset,omitempty"`
	Limit          int      `json:"limit,omitempty"`
	Timeout        int      `json:"timeout,omitempty"`
	AllowedUpdates []string `json:"allowed_updates,omitempty"`
}

// AnswerCallbackQueryOptions represents parameters for answerCallbackQuery.
type AnswerCallbackQueryOptions struct {
	CallbackQueryID string `json:"callback_query_id"`
	Text            string `json:"text,omitempty"`
	ShowAlert       bool   `json:"show_alert,omitempty"`
	URL             string `json:"url,omitempty"`
	CacheTime       int    `json:"cache_time,omitempty"`
}
