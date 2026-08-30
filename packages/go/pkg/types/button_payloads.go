package types

// LoginUrl represents a parameter of the inline keyboard button used to
// automatically authorize a user. It serves as a great replacement for the
// Telegram Login Widget when the user is coming from Telegram. All the user
// needs to do is tap/click a button and confirm that they want to log in
//
// Telegram API: https://core.telegram.org/bots/api#loginurl
type LoginUrl struct {
	URL                string `json:"url"`
	ForwardText        string `json:"forward_text,omitempty"`
	BotUsername        string `json:"bot_username,omitempty"`
	RequestWriteAccess bool   `json:"request_write_access,omitempty"`
}

// CopyTextButton represents an inline keyboard button that copies specified
// text to the clipboard.
//
// Telegram API: https://core.telegram.org/bots/api#copytextbutton
type CopyTextButton struct {
	Text string `json:"text"`
}

// SwitchInlineQueryChosenChat represents an inline button that switches the
// current user to inline mode in a chosen chat, with an optional default
// inline query.
//
// Telegram API: https://core.telegram.org/bots/api#switchinlinequerychosenchat
type SwitchInlineQueryChosenChat struct {
	Query             string `json:"query,omitempty"`
	AllowUserChats    bool   `json:"allow_user_chats,omitempty"`
	AllowBotChats     bool   `json:"allow_bot_chats,omitempty"`
	AllowGroupChats   bool   `json:"allow_group_chats,omitempty"`
	AllowChannelChats bool   `json:"allow_channel_chats,omitempty"`
}

// DisabledButton represents a disabled button which does nothing. Currently
// holds no information.
//
// Telegram API: https://core.telegram.org/bots/api#disabledbutton
type DisabledButton struct{}

// KeyboardButtonRequestUsers defines the criteria used to request suitable
// users. Information about the selected users is shared with the bot when the
// corresponding button is pressed.
//
// Telegram API: https://core.telegram.org/bots/api#keyboardbuttonrequestusers
type KeyboardButtonRequestUsers struct {
	RequestID       int64 `json:"request_id"`
	UserIsBot       bool  `json:"user_is_bot,omitempty"`
	UserIsPremium   bool  `json:"user_is_premium,omitempty"`
	MaxQuantity     int64 `json:"max_quantity,omitempty"`
	RequestName     bool  `json:"request_name,omitempty"`
	RequestUsername bool  `json:"request_username,omitempty"`
	RequestPhoto    bool  `json:"request_photo,omitempty"`
}

// KeyboardButtonRequestChat defines the criteria used to request a suitable
// chat. Information about the selected chat is shared with the bot when the
// corresponding button is pressed, and the bot is granted the requested rights
// in the chat if appropriate.
//
// Telegram API: https://core.telegram.org/bots/api#keyboardbuttonrequestchat
type KeyboardButtonRequestChat struct {
	RequestID               int64                    `json:"request_id"`
	ChatIsChannel           bool                     `json:"chat_is_channel"`
	ChatIsForum             bool                     `json:"chat_is_forum,omitempty"`
	ChatHasUsername         bool                     `json:"chat_has_username,omitempty"`
	ChatIsCreated           bool                     `json:"chat_is_created,omitempty"`
	UserAdministratorRights *ChatAdministratorRights `json:"user_administrator_rights,omitempty"`
	BotAdministratorRights  *ChatAdministratorRights `json:"bot_administrator_rights,omitempty"`
	BotIsMember             bool                     `json:"bot_is_member,omitempty"`
	RequestTitle            bool                     `json:"request_title,omitempty"`
	RequestUsername         bool                     `json:"request_username,omitempty"`
	RequestPhoto            bool                     `json:"request_photo,omitempty"`
}

// KeyboardButtonRequestManagedBot defines the parameters for the creation of a
// managed bot. Information about the created bot is shared with the bot using
// the "managed_bot" update and a Message with the "managed_bot_created" field.
//
// Telegram API: https://core.telegram.org/bots/api#keyboardbuttonrequestmanagedbot
type KeyboardButtonRequestManagedBot struct {
	RequestID         int64  `json:"request_id"`
	SuggestedName     string `json:"suggested_name,omitempty"`
	SuggestedUsername string `json:"suggested_username,omitempty"`
}

// KeyboardButtonPollType represents the type of a poll which is allowed to be
// created and sent when the corresponding button is pressed.
//
// Telegram API: https://core.telegram.org/bots/api#keyboardbuttonpolltype
type KeyboardButtonPollType struct {
	Type string `json:"type,omitempty"`
}
