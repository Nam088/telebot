package types

// ForumTopic represents a forum topic in a supergroup.
//
// Telegram API: https://core.telegram.org/bots/api#forumtopic
type ForumTopic struct {
	MessageThreadID   int64  `json:"message_thread_id"`
	Name              string `json:"name"`
	IconColor         int    `json:"icon_color"`
	IconCustomEmojiID string `json:"icon_custom_emoji_id,omitempty"`
	IsNameImplicit    bool   `json:"is_name_implicit,omitempty"`
}

// BotCommand represents a bot command.
//
// Telegram API: https://core.telegram.org/bots/api#botcommand
type BotCommand struct {
	Command     string `json:"command"`
	Description string `json:"description"`
	IsEphemeral bool   `json:"is_ephemeral,omitempty"`
}

// BotName represents the bot's name.
//
// Telegram API: https://core.telegram.org/bots/api#botname
type BotName struct {
	Name string `json:"name"`
}

// BotDescription represents the bot's description.
//
// Telegram API: https://core.telegram.org/bots/api#botdescription
type BotDescription struct {
	Description string `json:"description"`
}

// EditForumTopicOptions represents parameters for the editForumTopic method.
type EditForumTopicOptions struct {
	ChatID            any    `json:"chat_id"`
	MessageThreadID   int64  `json:"message_thread_id"`
	Name              string `json:"name,omitempty"`
	IconCustomEmojiID string `json:"icon_custom_emoji_id,omitempty"`
}
