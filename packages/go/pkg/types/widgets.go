package types

// Widget represents an HTML widget in a message.
//
// Telegram API: https://core.telegram.org/bots/api#widget
type Widget struct {
	// Unique identifier of the shared widget, if shared.
	ID string `json:"id,omitempty"`
	// Width of the widget in pixels.
	Width int64 `json:"width,omitempty"`
	// Height of the widget in pixels.
	Height int64 `json:"height,omitempty"`
	// HTML content of the widget.
	HTML string `json:"html"`
	// Public data of the widget, if any.
	PublicData string `json:"public_data,omitempty"`
	// Chat-specific data of the widget, if any.
	ChatData string `json:"chat_data,omitempty"`
}

// WidgetQueryWallet describes a TON wallet in a widget query.
//
// Telegram API: https://core.telegram.org/bots/api#widgetquerywallet
type WidgetQueryWallet struct {
	// Address of the TON wallet.
	Address string `json:"address"`
	// Balance of the wallet in nanoton.
	Amount string `json:"amount"`
	// Public key of the wallet, if available.
	PublicKey string `json:"public_key,omitempty"`
	// Base64-encoded state init of the wallet, if available.
	StateInit string `json:"state_init,omitempty"`
}

// WidgetQueryTypeData represents a widget query containing data for the bot.
//
// Telegram API: https://core.telegram.org/bots/api#widgetquerytypedata
type WidgetQueryTypeData struct {
	// Type of the query, always "data".
	Type string `json:"type"`
	// TON wallet card of the user, if requested.
	WalletCard *TonWalletCard `json:"wallet_card,omitempty"`
}

// WidgetQueryTypeSignData represents a widget query containing data signed by a TON wallet.
//
// Telegram API: https://core.telegram.org/bots/api#widgetquerytypesigndata
type WidgetQueryTypeSignData struct {
	// Type of the query, always "sign_data".
	Type string `json:"type"`
	// TON wallet that signed the data.
	Wallet WidgetQueryWallet `json:"wallet"`
	// Signed data payload.
	SignData string `json:"sign_data"`
}

// WidgetQueryTypeSentTransaction represents a widget query notifying about a transaction sent from a TON wallet.
//
// Telegram API: https://core.telegram.org/bots/api#widgetquerytypesenttransaction
type WidgetQueryTypeSentTransaction struct {
	// Type of the query, always "sent_transaction".
	Type string `json:"type"`
	// TON wallet that sent the transaction.
	Wallet WidgetQueryWallet `json:"wallet"`
	// Hash of the external message sent to the blockchain.
	MsgHash string `json:"msg_hash"`
}

// WidgetQueryType describes the type of a query from a widget.
//
// Telegram API: https://core.telegram.org/bots/api#widgetquerytype
type WidgetQueryType struct {
	// Type of the query ("data", "sign_data", or "sent_transaction").
	Type string `json:"type"`
	// TON wallet card of the user (for type "data").
	WalletCard *TonWalletCard `json:"wallet_card,omitempty"`
	// TON wallet (for types "sign_data" and "sent_transaction").
	Wallet *WidgetQueryWallet `json:"wallet,omitempty"`
	// Signed data payload (for type "sign_data").
	SignData string `json:"sign_data,omitempty"`
	// Hash of the external message (for type "sent_transaction").
	MsgHash string `json:"msg_hash,omitempty"`
}

// WidgetQuery represents an incoming query from a widget in a message sent by or via the bot.
//
// Telegram API: https://core.telegram.org/bots/api#widgetquery
type WidgetQuery struct {
	// Unique identifier for this query.
	ID string `json:"id"`
	// Sender of the query.
	From User `json:"from"`
	// Chat where the widget message was sent, if available.
	Chat *Chat `json:"chat,omitempty"`
	// Identifier of the message with the widget, if available.
	MessageID int64 `json:"message_id,omitempty"`
	// Identifier of the inline message with the widget, if sent via the bot.
	InlineMessageID string `json:"inline_message_id,omitempty"`
	// Global identifier uniquely corresponding to the chat.
	ChatInstance string `json:"chat_instance"`
	// Type of the chat, if available.
	ChatType string `json:"chat_type,omitempty"`
	// Type of the widget query.
	Type WidgetQueryType `json:"type"`
	// Data payload sent by the widget.
	Data string `json:"data"`
	// Identifier of the shared widget, if applicable.
	WidgetID string `json:"widget_id,omitempty"`
}

// SharedWidgetQuery represents an incoming query from a forwarded message with a shared widget.
//
// Telegram API: https://core.telegram.org/bots/api#sharedwidgetquery
type SharedWidgetQuery struct {
	// Unique identifier for this query.
	ID string `json:"id"`
	// Sender of the query.
	From User `json:"from"`
	// Type of the widget query.
	Type WidgetQueryType `json:"type"`
	// Data payload sent by the widget.
	Data string `json:"data"`
	// Unique identifier of the shared widget.
	WidgetID string `json:"widget_id"`
}

// InputWidgetMessageContent represents the content of an HTML widget message to be sent as the result of an inline query.
//
// Telegram API: https://core.telegram.org/bots/api#inputwidgetmessagecontent
type InputWidgetMessageContent struct {
	// HTML content of the widget.
	HTML string `json:"html"`
	// Width of the widget in pixels.
	Width int64 `json:"width,omitempty"`
	// Height of the widget in pixels.
	Height int64 `json:"height,omitempty"`
	// Public data of the widget.
	PublicData string `json:"public_data,omitempty"`
	// Chat-specific data of the widget.
	ChatData string `json:"chat_data,omitempty"`
	// Caption of the widget message.
	Caption string `json:"caption,omitempty"`
	// Mode for parsing entities in the caption.
	ParseMode string `json:"parse_mode,omitempty"`
	// List of special entities that appear in the caption.
	CaptionEntities []MessageEntity `json:"caption_entities,omitempty"`
	// Pass True if the caption must be shown above the widget.
	ShowCaptionAboveMedia bool `json:"show_caption_above_media,omitempty"`
	// Pass True to allow the widget to send queries to the bot.
	AllowQueries bool `json:"allow_queries,omitempty"`
	// Pass True if the widget is shared.
	IsShared bool `json:"is_shared,omitempty"`
}

// InputSharedWidgetMessageContent represents the content of a shared widget message to be sent as the result of an inline query.
//
// Telegram API: https://core.telegram.org/bots/api#inputsharedwidgetmessagecontent
type InputSharedWidgetMessageContent struct {
	// Unique identifier of the shared widget.
	WidgetID string `json:"widget_id"`
	// Chat-specific data of the widget.
	ChatData string `json:"chat_data,omitempty"`
	// Caption of the widget message.
	Caption string `json:"caption,omitempty"`
	// Mode for parsing entities in the caption.
	ParseMode string `json:"parse_mode,omitempty"`
	// List of special entities that appear in the caption.
	CaptionEntities []MessageEntity `json:"caption_entities,omitempty"`
	// Pass True if the caption must be shown above the widget.
	ShowCaptionAboveMedia bool `json:"show_caption_above_media,omitempty"`
}

// SendWidgetOptions contains parameters for Bot.SendWidget.
//
// Telegram API: https://core.telegram.org/bots/api#sendwidget
type SendWidgetOptions struct {
	// Unique identifier for the target chat or username of the target channel.
	ChatID any `json:"chat_id"`
	// Unique identifier for the target message thread (topic) of a forum supergroup.
	MessageThreadID int64 `json:"message_thread_id,omitempty"`
	// HTML content of the widget.
	HTML string `json:"html"`
	// Width of the widget in pixels.
	Width int64 `json:"width,omitempty"`
	// Height of the widget in pixels.
	Height int64 `json:"height,omitempty"`
	// Public data of the widget.
	PublicData string `json:"public_data,omitempty"`
	// Chat-specific data of the widget.
	ChatData string `json:"chat_data,omitempty"`
	// Caption of the widget message.
	Caption string `json:"caption,omitempty"`
	// Mode for parsing entities in the caption.
	ParseMode string `json:"parse_mode,omitempty"`
	// List of special entities that appear in the caption.
	CaptionEntities []MessageEntity `json:"caption_entities,omitempty"`
	// Pass True if the caption must be shown above the widget.
	ShowCaptionAboveMedia bool `json:"show_caption_above_media,omitempty"`
	// Pass True to allow the widget to send queries to the bot.
	AllowQueries bool `json:"allow_queries,omitempty"`
	// Pass True if the widget is shared.
	IsShared bool `json:"is_shared,omitempty"`
	// Sends the message silently.
	DisableNotification bool `json:"disable_notification,omitempty"`
	// Protects the contents of the sent message from forwarding and saving.
	ProtectContent bool `json:"protect_content,omitempty"`
	// Pass True to allow up to 1000 messages per second.
	AllowPaidBroadcast bool `json:"allow_paid_broadcast,omitempty"`
	// Unique identifier of the message effect to be added to the message.
	MessageEffectID string `json:"message_effect_id,omitempty"`
	// Description of the message to reply to.
	ReplyParameters *ReplyParameters `json:"reply_parameters,omitempty"`
	// Additional interface options.
	ReplyMarkup any `json:"reply_markup,omitempty"`
}

// SendSharedWidgetOptions contains parameters for Bot.SendSharedWidget.
//
// Telegram API: https://core.telegram.org/bots/api#sendsharedwidget
type SendSharedWidgetOptions struct {
	// Unique identifier for the target chat or username of the target channel.
	ChatID any `json:"chat_id"`
	// Unique identifier for the target message thread (topic) of a forum supergroup.
	MessageThreadID int64 `json:"message_thread_id,omitempty"`
	// Unique identifier of the shared widget.
	WidgetID string `json:"widget_id"`
	// Chat-specific data of the widget.
	ChatData string `json:"chat_data,omitempty"`
	// Caption of the widget message.
	Caption string `json:"caption,omitempty"`
	// Mode for parsing entities in the caption.
	ParseMode string `json:"parse_mode,omitempty"`
	// List of special entities that appear in the caption.
	CaptionEntities []MessageEntity `json:"caption_entities,omitempty"`
	// Pass True if the caption must be shown above the widget.
	ShowCaptionAboveMedia bool `json:"show_caption_above_media,omitempty"`
	// Sends the message silently.
	DisableNotification bool `json:"disable_notification,omitempty"`
	// Protects the contents of the sent message from forwarding and saving.
	ProtectContent bool `json:"protect_content,omitempty"`
	// Pass True to allow up to 1000 messages per second.
	AllowPaidBroadcast bool `json:"allow_paid_broadcast,omitempty"`
	// Unique identifier of the message effect to be added to the message.
	MessageEffectID string `json:"message_effect_id,omitempty"`
	// Description of the message to reply to.
	ReplyParameters *ReplyParameters `json:"reply_parameters,omitempty"`
	// Additional interface options.
	ReplyMarkup any `json:"reply_markup,omitempty"`
}

// AnswerWidgetQueryOptions contains parameters for Bot.AnswerWidgetQuery.
//
// Telegram API: https://core.telegram.org/bots/api#answerwidgetquery
type AnswerWidgetQueryOptions struct {
	// Unique identifier for the query to be answered.
	WidgetQueryID string `json:"widget_query_id"`
	// Data to be returned to the widget.
	Data string `json:"data,omitempty"`
}

// EditMessageWidgetDataOptions contains parameters for Bot.EditMessageWidgetData.
//
// Telegram API: https://core.telegram.org/bots/api#editmessagewidgetdata
type EditMessageWidgetDataOptions struct {
	// Required if InlineMessageID is not specified. Unique identifier for the target chat.
	ChatID any `json:"chat_id,omitempty"`
	// Required if InlineMessageID is not specified. Identifier of the message to edit.
	MessageID int64 `json:"message_id,omitempty"`
	// Required if ChatID and MessageID are not specified. Identifier of the inline message.
	InlineMessageID string `json:"inline_message_id,omitempty"`
	// New public data of the widget.
	PublicData string `json:"public_data,omitempty"`
	// New chat-specific data of the widget.
	ChatData string `json:"chat_data,omitempty"`
}

// EditSharedWidgetDataOptions contains parameters for Bot.EditSharedWidgetData.
//
// Telegram API: https://core.telegram.org/bots/api#editsharedwidgetdata
type EditSharedWidgetDataOptions struct {
	// Unique identifier of the shared widget.
	WidgetID string `json:"widget_id"`
	// New public data of the widget, 0-1024 bytes.
	PublicData string `json:"public_data"`
	// Maximum amount of time in seconds that the result may be cached.
	CacheTime int64 `json:"cache_time,omitempty"`
}
