package types

// Community represents a community (a group of chats).
//
// Telegram API: https://core.telegram.org/bots/api#community
type Community struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

// CommunityChatAdded describes a service message about a chat or a bot being
// added to a community.
//
// Telegram API: https://core.telegram.org/bots/api#communitychatadded
type CommunityChatAdded struct {
	Community *Community `json:"community"`
}

// CommunityChatJoined describes a service message about a chat being joined
// by a user from a community.
//
// Telegram API: https://core.telegram.org/bots/api#communitychatjoined
type CommunityChatJoined struct {
	Community *Community `json:"community"`
}

// CommunityChatRemoved describes a service message about a chat or a bot
// being removed from a community. Currently holds no information.
//
// Telegram API: https://core.telegram.org/bots/api#communitychatremoved
type CommunityChatRemoved struct{}

// ChatOwnerChanged describes a service message about an ownership change in
// the chat.
//
// Telegram API: https://core.telegram.org/bots/api#chatownerchanged
type ChatOwnerChanged struct {
	NewOwner *User `json:"new_owner"`
}

// ChatOwnerLeft describes a service message about the chat owner leaving the
// chat.
//
// Telegram API: https://core.telegram.org/bots/api#chatownerleft
type ChatOwnerLeft struct {
	NewOwner *User `json:"new_owner,omitempty"`
}

// ManagedBotCreated contains information about the bot that was created to
// be managed by the current bot.
//
// Telegram API: https://core.telegram.org/bots/api#managedbotcreated
type ManagedBotCreated struct {
	Bot *User `json:"bot"`
}

// DirectMessagesTopic describes a topic of a direct messages chat.
//
// Telegram API: https://core.telegram.org/bots/api#directmessagestopic
type DirectMessagesTopic struct {
	TopicID int64 `json:"topic_id"`
	User    *User `json:"user,omitempty"`
}

// DirectMessagePriceChanged describes a service message about a change in
// the price of direct messages sent to a channel chat.
//
// Telegram API: https://core.telegram.org/bots/api#directmessagepricechanged
type DirectMessagePriceChanged struct {
	AreDirectMessagesEnabled bool  `json:"are_direct_messages_enabled"`
	DirectMessageStarCount   int64 `json:"direct_message_star_count,omitempty"`
}

// PaidMessagePriceChanged describes a service message about a change in the
// price of paid messages within a chat.
//
// Telegram API: https://core.telegram.org/bots/api#paidmessagepricechanged
type PaidMessagePriceChanged struct {
	PaidMessageStarCount int64 `json:"paid_message_star_count"`
}

// PollOptionAdded describes a service message about an option added to a
// poll.
//
// Telegram API: https://core.telegram.org/bots/api#polloptionadded
type PollOptionAdded struct {
	PollMessage        *Message        `json:"poll_message,omitempty"`
	OptionPersistentID string          `json:"option_persistent_id"`
	OptionText         string          `json:"option_text"`
	OptionTextEntities []MessageEntity `json:"option_text_entities,omitempty"`
}

// PollOptionDeleted describes a service message about an option deleted from
// a poll.
//
// Telegram API: https://core.telegram.org/bots/api#polloptiondeleted
type PollOptionDeleted struct {
	PollMessage        *Message        `json:"poll_message,omitempty"`
	OptionPersistentID string          `json:"option_persistent_id"`
	OptionText         string          `json:"option_text"`
	OptionTextEntities []MessageEntity `json:"option_text_entities,omitempty"`
}
