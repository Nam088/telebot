package types

// ForwardMessagesOptions represents parameters for the forwardMessages method.
type ForwardMessagesOptions struct {
	BusinessConnectionID string  `json:"business_connection_id,omitempty"`
	ChatID               any     `json:"chat_id"`
	FromChatID           any     `json:"from_chat_id"`
	MessageIDs           []int64 `json:"message_ids"`
	MessageThreadID      int64   `json:"message_thread_id,omitempty"`
	DisableNotification  bool    `json:"disable_notification,omitempty"`
	ProtectContent       bool    `json:"protect_content,omitempty"`
}

// CopyMessagesOptions represents parameters for the copyMessages method.
type CopyMessagesOptions struct {
	BusinessConnectionID string  `json:"business_connection_id,omitempty"`
	ChatID               any     `json:"chat_id"`
	FromChatID           any     `json:"from_chat_id"`
	MessageIDs           []int64 `json:"message_ids"`
	MessageThreadID      int64   `json:"message_thread_id,omitempty"`
	DisableNotification  bool    `json:"disable_notification,omitempty"`
	ProtectContent       bool    `json:"protect_content,omitempty"`
	RemoveCaption        bool    `json:"remove_caption,omitempty"`
}

// DeleteMessagesOptions represents parameters for the deleteMessages method.
type DeleteMessagesOptions struct {
	BusinessConnectionID string  `json:"business_connection_id,omitempty"`
	ChatID               any     `json:"chat_id"`
	MessageIDs           []int64 `json:"message_ids"`
}
