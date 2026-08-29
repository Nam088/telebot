package types

// Message represents a Telegram message.
type Message struct {
	MessageID       int64                 `json:"message_id"`
	MessageThreadID int64                 `json:"message_thread_id,omitempty"`
	From            *User                 `json:"from,omitempty"`
	SenderChat      *Chat                 `json:"sender_chat,omitempty"`
	Date            int64                 `json:"date"`
	Chat            *Chat                 `json:"chat"`
	Text            string                `json:"text,omitempty"`
	Caption         string                `json:"caption,omitempty"`
	Photo           []PhotoSize           `json:"photo,omitempty"`
	Audio           *Audio                `json:"audio,omitempty"`
	Document        *Document             `json:"document,omitempty"`
	Video           *Video                `json:"video,omitempty"`
	Animation       *Animation            `json:"animation,omitempty"`
	Voice           *Voice                `json:"voice,omitempty"`
	VideoNote       *VideoNote            `json:"video_note,omitempty"`
	Contact         *Contact              `json:"contact,omitempty"`
	Location        *Location             `json:"location,omitempty"`
	Venue           *Venue                `json:"venue,omitempty"`
	Poll            *Poll                 `json:"poll,omitempty"`
	Dice            *Dice                 `json:"dice,omitempty"`
	Sticker         *Sticker              `json:"sticker,omitempty"`
	Invoice         *Invoice              `json:"invoice,omitempty"`
	SuccessfulPayment *SuccessfulPayment  `json:"successful_payment,omitempty"`
	ReplyToMessage  *Message              `json:"reply_to_message,omitempty"`
	ReplyMarkup     *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
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
	UpdateID          int64               `json:"update_id"`
	Message           *Message            `json:"message,omitempty"`
	EditedMessage     *Message            `json:"edited_message,omitempty"`
	ChannelPost       *Message            `json:"channel_post,omitempty"`
	EditedChannelPost *Message            `json:"edited_channel_post,omitempty"`
	CallbackQuery     *CallbackQuery      `json:"callback_query,omitempty"`
	BusinessConnection *BusinessConnection `json:"business_connection,omitempty"`
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
