package types

// SendChecklistOptions represents parameters for the sendChecklist method.
//
// Telegram API: https://core.telegram.org/bots/api#sendchecklist
type SendChecklistOptions struct {
	// Unique identifier of the business connection on behalf of which the
	// message will be sent.
	BusinessConnectionID string `json:"business_connection_id"`
	// Unique identifier for the target chat or username of the target channel.
	ChatID any `json:"chat_id"`
	// The checklist to send.
	Checklist *InputChecklist `json:"checklist"`
	// Sends the message silently.
	DisableNotification bool `json:"disable_notification,omitempty"`
	// Protects the contents of the sent message from forwarding and saving.
	ProtectContent bool `json:"protect_content,omitempty"`
	// Unique identifier of the message effect to be added to the message.
	MessageEffectID string `json:"message_effect_id,omitempty"`
	// Description of the message to reply to.
	ReplyParameters *ReplyParameters `json:"reply_parameters,omitempty"`
	// Additional interface options; a JSON-serialized object for an inline
	// keyboard, a reply keyboard, etc.
	ReplyMarkup any `json:"reply_markup,omitempty"`
}

// EditMessageChecklistOptions represents parameters for the editMessageChecklist method.
//
// Telegram API: https://core.telegram.org/bots/api#editmessagechecklist
type EditMessageChecklistOptions struct {
	// Unique identifier of the business connection on behalf of which the
	// message will be edited.
	BusinessConnectionID string `json:"business_connection_id"`
	// Unique identifier for the target chat or username of the target channel.
	ChatID any `json:"chat_id"`
	// Identifier of the target message.
	MessageID int64 `json:"message_id"`
	// The new checklist.
	Checklist *InputChecklist `json:"checklist"`
	// A JSON-serialized object for a new inline keyboard.
	ReplyMarkup any `json:"reply_markup,omitempty"`
}
