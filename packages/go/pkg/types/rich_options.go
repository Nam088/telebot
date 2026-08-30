package types

// SendRichMessageOptions represents parameters for the sendRichMessage method.
//
// The field set and order follow the official parameter list; node's
// SendRichMessageOptions only declares seven of the thirteen parameters.
//
// Parameters:
//   - ChatID: Target chat, required.
//   - RichMessage: The InputRichMessage to send, required.
//   - All other fields: optional and omitted from the payload when unset.
//
// Telegram API: https://core.telegram.org/bots/api#sendrichmessage
type SendRichMessageOptions struct {
	// Unique identifier of the business connection on behalf of which the
	// message will be sent. Bot can send rich messages on behalf of a business
	// account only if the corresponding user can send rich messages.
	BusinessConnectionID string `json:"business_connection_id,omitempty"`
	// Unique identifier for the target chat or username of the target bot,
	// supergroup or channel in the format @username.
	ChatID any `json:"chat_id"`
	// Unique identifier for the target message thread (topic) of a forum; for
	// forum supergroups and private chats of bots with forum topic mode enabled only.
	MessageThreadID int64 `json:"message_thread_id,omitempty"`
	// Identifier of the direct messages topic to which the message will be sent;
	// required if the message is sent to a direct messages chat.
	DirectMessagesTopicID int64 `json:"direct_messages_topic_id,omitempty"`
	// Parameters of the ephemeral message to send.
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
	// The message to be sent.
	RichMessage InputRichMessage `json:"rich_message"`
	// Sends the message silently. Users will receive a notification with no sound.
	DisableNotification bool `json:"disable_notification,omitempty"`
	// Protects the contents of the sent message from forwarding and saving.
	ProtectContent bool `json:"protect_content,omitempty"`
	// Pass True to allow up to 1000 messages per second, ignoring broadcasting
	// limits for a fee of 0.1 Telegram Stars per message.
	AllowPaidBroadcast bool `json:"allow_paid_broadcast,omitempty"`
	// Unique identifier of the message effect to be added to the message; for
	// private chats only.
	MessageEffectID string `json:"message_effect_id,omitempty"`
	// Parameters of the suggested post to send; for direct messages chats only.
	// Telegram types this field as SuggestedPostParameters, which is not part of
	// the rich-message models in this package, so Go passes the object through.
	SuggestedPostParameters any `json:"suggested_post_parameters,omitempty"`
	// Description of the message to reply to.
	ReplyParameters *ReplyParameters `json:"reply_parameters,omitempty"`
	// Additional interface options: an *InlineKeyboardMarkup,
	// *keyboard.ReplyKeyboardMarkup, or any other Telegram reply_markup value.
	ReplyMarkup any `json:"reply_markup,omitempty"`
}

// SendRichMessageDraftOptions represents parameters for the
// sendRichMessageDraft method, which streams a partial rich message while the
// final one is still being generated (Bot API 10.1+).
//
// Parameters:
//   - ChatID: Target private chat, required.
//   - DraftID: Non-zero draft identifier, required.
//   - RichMessage: The partial message to stream, required.
//   - All other fields: optional and omitted from the payload when unset.
//
// Telegram API: https://core.telegram.org/bots/api#sendrichmessagedraft
type SendRichMessageDraftOptions struct {
	// Unique identifier for the target private chat.
	ChatID any `json:"chat_id"`
	// Unique identifier for the target message thread.
	MessageThreadID int64 `json:"message_thread_id,omitempty"`
	// Unique identifier of the message draft; must be non-zero. Changes to drafts
	// with the same identifier are animated.
	DraftID int64 `json:"draft_id"`
	// The partial message to be streamed. Direct upload of new files and
	// explicit upload of files by a URL isn't supported.
	RichMessage InputRichMessage `json:"rich_message"`
	// Pass True to show the user a button to stop further drafts.
	CanStop bool `json:"can_stop,omitempty"`
	// Pass True to keep the draft in the chat when the stop button is pressed.
	KeepOnStop bool `json:"keep_on_stop,omitempty"`
}
