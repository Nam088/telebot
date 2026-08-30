package types

// ForwardMessagesOptions represents parameters for the forwardMessages method.
type ForwardMessagesOptions struct {
	ChatID                any     `json:"chat_id"`
	FromChatID            any     `json:"from_chat_id"`
	MessageIDs            []int64 `json:"message_ids"`
	MessageThreadID       int64   `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID int64   `json:"direct_messages_topic_id,omitempty"`
	DisableNotification   bool    `json:"disable_notification,omitempty"`
	ProtectContent        bool    `json:"protect_content,omitempty"`
}

// CopyMessageOptions represents parameters for the copyMessage method.
type CopyMessageOptions struct {
	ChatID                  any                      `json:"chat_id"`
	MessageThreadID         int64                    `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID   int64                    `json:"direct_messages_topic_id,omitempty"`
	FromChatID              any                      `json:"from_chat_id"`
	MessageID               int64                    `json:"message_id"`
	VideoStartTimestamp     int64                    `json:"video_start_timestamp,omitempty"`
	Caption                 string                   `json:"caption,omitempty"`
	ParseMode               string                   `json:"parse_mode,omitempty"`
	CaptionEntities         []MessageEntity          `json:"caption_entities,omitempty"`
	ShowCaptionAboveMedia   bool                     `json:"show_caption_above_media,omitempty"`
	DisableNotification     bool                     `json:"disable_notification,omitempty"`
	ProtectContent          bool                     `json:"protect_content,omitempty"`
	AllowPaidBroadcast      bool                     `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID         string                   `json:"message_effect_id,omitempty"`
	SuggestedPostParameters *SuggestedPostParameters `json:"suggested_post_parameters,omitempty"`
	ReplyParameters         *ReplyParameters         `json:"reply_parameters,omitempty"`
	ReplyMarkup             *InlineKeyboardMarkup    `json:"reply_markup,omitempty"`
}

// CopyMessagesOptions represents parameters for the copyMessages method.
type CopyMessagesOptions struct {
	ChatID                any     `json:"chat_id"`
	FromChatID            any     `json:"from_chat_id"`
	MessageIDs            []int64 `json:"message_ids"`
	MessageThreadID       int64   `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID int64   `json:"direct_messages_topic_id,omitempty"`
	DisableNotification   bool    `json:"disable_notification,omitempty"`
	ProtectContent        bool    `json:"protect_content,omitempty"`
	RemoveCaption         bool    `json:"remove_caption,omitempty"`
}

// DeleteMessagesOptions represents parameters for the deleteMessages method.
type DeleteMessagesOptions struct {
	ChatID     any     `json:"chat_id"`
	MessageIDs []int64 `json:"message_ids"`
}
