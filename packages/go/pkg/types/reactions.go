package types

// SetMessageReactionOptions represents parameters for the setMessageReaction method.
//
// Telegram API: https://core.telegram.org/bots/api#setmessagereaction
type SetMessageReactionOptions struct {
	ChatID    any            `json:"chat_id"`
	MessageID int64          `json:"message_id"`
	Reaction  []ReactionType `json:"reaction,omitempty"`
	IsBig     bool           `json:"is_big,omitempty"`
}

// DeleteMessageReactionOptions represents parameters for the
// deleteMessageReaction method.
//
// Telegram API: https://core.telegram.org/bots/api#deletemessagereaction
type DeleteMessageReactionOptions struct {
	ChatID      any   `json:"chat_id"`
	MessageID   int64 `json:"message_id"`
	UserID      int64 `json:"user_id,omitempty"`
	ActorChatID int64 `json:"actor_chat_id,omitempty"`
}

// DeleteAllMessageReactionsOptions represents parameters for the
// deleteAllMessageReactions method. Unlike deleteMessageReaction it takes no
// message_id.
//
// Telegram API: https://core.telegram.org/bots/api#deleteallmessagereactions
type DeleteAllMessageReactionsOptions struct {
	ChatID      any   `json:"chat_id"`
	UserID      int64 `json:"user_id,omitempty"`
	ActorChatID int64 `json:"actor_chat_id,omitempty"`
}
