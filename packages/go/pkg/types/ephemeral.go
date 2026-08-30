package types

// EditEphemeralMessageTextOptions represents parameters for the
// editEphemeralMessageText method.
//
// Port of EditEphemeralMessageTextOptions in
// packages/node/src/client/types/messages/edit-options.ts.
//
// See https://core.telegram.org/bots/api#editephemeralmessagetext
type EditEphemeralMessageTextOptions struct {
	// Unique identifier for the target chat or username of the target supergroup.
	ChatID any `json:"chat_id"`
	// Identifier of the user who received the message.
	ReceiverUserID int64 `json:"receiver_user_id"`
	// Identifier of the ephemeral message to edit.
	EphemeralMessageID int64 `json:"ephemeral_message_id"`
	// New text of the message, 1-4096 characters after entity parsing;
	// required if RichMessage isn't set.
	Text string `json:"text,omitempty"`
	// Mode for parsing entities in the message text.
	ParseMode string `json:"parse_mode,omitempty"`
	// A list of special entities that appear in the message text.
	Entities []MessageEntity `json:"entities,omitempty"`
	// New rich content of the message; required if Text isn't set.
	//
	// Typed as any until the InputRichMessage model lands (Bot API 10.3+).
	RichMessage any `json:"rich_message,omitempty"`
	// Link preview generation options for the message.
	LinkPreviewOptions *LinkPreviewOptions `json:"link_preview_options,omitempty"`
	// An object for an inline keyboard.
	ReplyMarkup *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// EditEphemeralMessageMediaOptions represents parameters for the
// editEphemeralMessageMedia method.
//
// See https://core.telegram.org/bots/api#editephemeralmessagemedia
type EditEphemeralMessageMediaOptions struct {
	// Unique identifier for the target chat or username of the target supergroup.
	ChatID any `json:"chat_id"`
	// Identifier of the user who received the message.
	ReceiverUserID int64 `json:"receiver_user_id"`
	// Identifier of the ephemeral message to edit.
	EphemeralMessageID int64 `json:"ephemeral_message_id"`
	// A JSON-serialized object for the new media content of the message.
	Media InputMedia `json:"media"`
	// An object for an inline keyboard.
	ReplyMarkup *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// EditEphemeralMessageCaptionOptions represents parameters for the
// editEphemeralMessageCaption method.
//
// See https://core.telegram.org/bots/api#editephemeralmessagecaption
type EditEphemeralMessageCaptionOptions struct {
	// Unique identifier for the target chat or username of the target supergroup.
	ChatID any `json:"chat_id"`
	// Identifier of the user who received the message.
	ReceiverUserID int64 `json:"receiver_user_id"`
	// Identifier of the ephemeral message to edit.
	EphemeralMessageID int64 `json:"ephemeral_message_id"`
	// New caption of the message, 0-1024 characters after entities parsing.
	Caption string `json:"caption,omitempty"`
	// Mode for parsing entities in the message caption.
	ParseMode string `json:"parse_mode,omitempty"`
	// A list of special entities that appear in the caption.
	CaptionEntities []MessageEntity `json:"caption_entities,omitempty"`
	// Pass true if the caption must be shown above the message media.
	ShowCaptionAboveMedia bool `json:"show_caption_above_media,omitempty"`
	// An object for an inline keyboard.
	ReplyMarkup *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// EditEphemeralMessageReplyMarkupOptions represents parameters for the
// editEphemeralMessageReplyMarkup method.
//
// See https://core.telegram.org/bots/api#editephemeralmessagereplymarkup
type EditEphemeralMessageReplyMarkupOptions struct {
	// Unique identifier for the target chat or username of the target supergroup.
	ChatID any `json:"chat_id"`
	// Identifier of the user who received the message.
	ReceiverUserID int64 `json:"receiver_user_id"`
	// Identifier of the ephemeral message to edit.
	EphemeralMessageID int64 `json:"ephemeral_message_id"`
	// An object for an inline keyboard.
	ReplyMarkup *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// DeleteEphemeralMessageOptions represents parameters for the
// deleteEphemeralMessage method.
//
// See https://core.telegram.org/bots/api#deleteephemeralmessage
type DeleteEphemeralMessageOptions struct {
	// Unique identifier for the target chat or username of the target supergroup.
	ChatID any `json:"chat_id"`
	// Identifier of the user who received the message.
	ReceiverUserID int64 `json:"receiver_user_id"`
	// Identifier of the ephemeral message to delete.
	EphemeralMessageID int64 `json:"ephemeral_message_id"`
}
