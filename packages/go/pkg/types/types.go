package types

// Message represents a Telegram message.
type Message struct {
	MessageID             int64                 `json:"message_id"`
	MessageThreadID       int64                 `json:"message_thread_id,omitempty"`
	From                  *User                 `json:"from,omitempty"`
	SenderChat            *Chat                 `json:"sender_chat,omitempty"`
	Date                  int64                 `json:"date"`
	Chat                  *Chat                 `json:"chat"`
	ForwardOrigin         *MessageOrigin        `json:"forward_origin,omitempty"`
	Text                  string                `json:"text,omitempty"`
	Entities              []MessageEntity       `json:"entities,omitempty"`
	Caption               string                `json:"caption,omitempty"`
	CaptionEntities       []MessageEntity       `json:"caption_entities,omitempty"`
	Game                  *Game                 `json:"game,omitempty"`
	Photo                 []PhotoSize           `json:"photo,omitempty"`
	Audio                 *Audio                `json:"audio,omitempty"`
	Document              *Document             `json:"document,omitempty"`
	Video                 *Video                `json:"video,omitempty"`
	Animation             *Animation            `json:"animation,omitempty"`
	Voice                 *Voice                `json:"voice,omitempty"`
	VideoNote             *VideoNote            `json:"video_note,omitempty"`
	Contact               *Contact              `json:"contact,omitempty"`
	Location              *Location             `json:"location,omitempty"`
	Venue                 *Venue                `json:"venue,omitempty"`
	Poll                  *Poll                 `json:"poll,omitempty"`
	Dice                  *Dice                 `json:"dice,omitempty"`
	Sticker               *Sticker              `json:"sticker,omitempty"`
	Invoice               *Invoice              `json:"invoice,omitempty"`
	SuccessfulPayment     *SuccessfulPayment    `json:"successful_payment,omitempty"`
	NewChatMembers        []User                `json:"new_chat_members,omitempty"`
	LeftChatMember        *User                 `json:"left_chat_member,omitempty"`
	NewChatTitle          string                `json:"new_chat_title,omitempty"`
	NewChatPhoto          []PhotoSize           `json:"new_chat_photo,omitempty"`
	DeleteChatPhoto       bool                  `json:"delete_chat_photo,omitempty"`
	GroupChatCreated      bool                  `json:"group_chat_created,omitempty"`
	SupergroupChatCreated bool                  `json:"supergroup_chat_created,omitempty"`
	ChannelChatCreated    bool                  `json:"channel_chat_created,omitempty"`
	MigrateToChatID       int64                 `json:"migrate_to_chat_id,omitempty"`
	MigrateFromChatID     int64                 `json:"migrate_from_chat_id,omitempty"`
	PinnedMessage         *Message              `json:"pinned_message,omitempty"`
	ReplyToMessage        *Message              `json:"reply_to_message,omitempty"`
	ReplyMarkup           *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// MessageOrigin describes the origin of a forwarded message.
//
// It is a flattened representation of Telegram's MessageOrigin union: the
// Type field discriminates the variant ("user", "hidden_user", "chat" or
// "channel") and only the fields relevant to that variant are populated.
type MessageOrigin struct {
	Type            string `json:"type"`
	Date            int64  `json:"date"`
	SenderUser      *User  `json:"sender_user,omitempty"`
	SenderUserName  string `json:"sender_user_name,omitempty"`
	SenderChat      *Chat  `json:"sender_chat,omitempty"`
	AuthorSignature string `json:"author_signature,omitempty"`
	Chat            *Chat  `json:"chat,omitempty"`
	MessageID       int64  `json:"message_id,omitempty"`
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

// InlineQuery represents an incoming inline query.
type InlineQuery struct {
	ID       string    `json:"id"`
	From     *User     `json:"from"`
	Query    string    `json:"query"`
	Offset   string    `json:"offset"`
	ChatType string    `json:"chat_type,omitempty"`
	Location *Location `json:"location,omitempty"`
}

// Update represents an incoming update from Telegram.
type Update struct {
	UpdateID           int64               `json:"update_id"`
	Message            *Message            `json:"message,omitempty"`
	EditedMessage      *Message            `json:"edited_message,omitempty"`
	ChannelPost        *Message            `json:"channel_post,omitempty"`
	EditedChannelPost  *Message            `json:"edited_channel_post,omitempty"`
	InlineQuery        *InlineQuery        `json:"inline_query,omitempty"`
	CallbackQuery      *CallbackQuery      `json:"callback_query,omitempty"`
	Poll               *Poll               `json:"poll,omitempty"`
	PollAnswer         *PollAnswer         `json:"poll_answer,omitempty"`
	MyChatMember       *ChatMemberUpdated  `json:"my_chat_member,omitempty"`
	ChatMember         *ChatMemberUpdated  `json:"chat_member,omitempty"`
	ChatJoinRequest    *ChatJoinRequest    `json:"chat_join_request,omitempty"`
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
	if u.InlineQuery != nil && u.InlineQuery.From != nil {
		return u.InlineQuery.From
	}
	if u.PollAnswer != nil && u.PollAnswer.User != nil {
		return u.PollAnswer.User
	}
	if u.MyChatMember != nil && u.MyChatMember.From != nil {
		return u.MyChatMember.From
	}
	if u.ChatMember != nil && u.ChatMember.From != nil {
		return u.ChatMember.From
	}
	if u.ChatJoinRequest != nil && u.ChatJoinRequest.From != nil {
		return u.ChatJoinRequest.From
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
	if u.MyChatMember != nil && u.MyChatMember.Chat != nil {
		return u.MyChatMember.Chat
	}
	if u.ChatMember != nil && u.ChatMember.Chat != nil {
		return u.ChatMember.Chat
	}
	if u.ChatJoinRequest != nil && u.ChatJoinRequest.Chat != nil {
		return u.ChatJoinRequest.Chat
	}
	if u.PollAnswer != nil && u.PollAnswer.VoterChat != nil {
		return u.PollAnswer.VoterChat
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
	Text                         string      `json:"text"`
	URL                          string      `json:"url,omitempty"`
	CallbackData                 string      `json:"callback_data,omitempty"`
	WebApp                       *WebAppInfo `json:"web_app,omitempty"`
	SwitchInlineQuery            string      `json:"switch_inline_query,omitempty"`
	SwitchInlineQueryCurrentChat string      `json:"switch_inline_query_current_chat,omitempty"`
	Pay                          bool        `json:"pay,omitempty"`
}

// InlineKeyboardMarkup represents an inline keyboard attached to a message.
type InlineKeyboardMarkup struct {
	InlineKeyboard [][]InlineKeyboardButton `json:"inline_keyboard"`
}

// SendMessageOptions represents parameters for the sendMessage method.
type SendMessageOptions struct {
	BusinessConnectionID string              `json:"business_connection_id,omitempty"`
	ChatID               any                 `json:"chat_id"`
	Text                 string              `json:"text"`
	MessageThreadID      int64               `json:"message_thread_id,omitempty"`
	ParseMode            string              `json:"parse_mode,omitempty"`
	Entities             []MessageEntity     `json:"entities,omitempty"`
	LinkPreviewOptions   *LinkPreviewOptions `json:"link_preview_options,omitempty"`
	DisableNotification  bool                `json:"disable_notification,omitempty"`
	ProtectContent       bool                `json:"protect_content,omitempty"`
	ReplyParameters      *ReplyParameters    `json:"reply_parameters,omitempty"`
	// ReplyMarkup accepts *InlineKeyboardMarkup, *keyboard.ReplyKeyboardMarkup,
	// or any other Telegram reply_markup value.
	ReplyMarkup any `json:"reply_markup,omitempty"`
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

// Ptr returns a pointer to v, which is how callers set the pointer-typed
// optional fields of request options structs, e.g.
// types.SendGiftOptions{UserID: types.Ptr(int64(123456))}.
//
// Parameters:
//   - v: The value to take the address of.
//
// Returns:
//   - *T: A pointer to a copy of v.
func Ptr[T any](v T) *T {
	return &v
}
