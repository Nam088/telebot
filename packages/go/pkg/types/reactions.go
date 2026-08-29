package types

// SetMessageReactionOptions represents parameters for the setMessageReaction method.
type SetMessageReactionOptions struct {
	ChatID    any            `json:"chat_id"`
	MessageID int64          `json:"message_id"`
	Reaction  []ReactionType `json:"reaction,omitempty"`
	IsBig     bool           `json:"is_big,omitempty"`
}
