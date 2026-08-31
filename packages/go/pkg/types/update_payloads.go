package types

import (
	"encoding/json"
	"fmt"
)

// ReactionTypeList is a JSON array of ReactionType objects exactly as Telegram
// delivers it.
//
// Reaction types are a polymorphic array on the wire, and encoding/json cannot
// decode into a []ReactionType by itself, so the received-reaction fields use
// this named slice type: each element is decoded through its own "type"
// discriminator. Serializing a ReactionTypeList writes the concrete variants
// back out unchanged, so a decoded list can be echoed to setMessageReaction.
//
// Telegram API: https://core.telegram.org/bots/api#reactiontype
type ReactionTypeList []ReactionType

// UnmarshalJSON decodes a polymorphic array of reaction types.
//
// Parameters:
//   - data: The raw JSON array to decode.
//
// Returns:
//   - error: Non-nil when data is not a JSON array or when an element is not a
//     JSON object.
//
// Telegram API: https://core.telegram.org/bots/api#reactiontype
func (l *ReactionTypeList) UnmarshalJSON(data []byte) error {
	var elements []json.RawMessage
	if err := json.Unmarshal(data, &elements); err != nil {
		return fmt.Errorf("types: reaction type list: %w", err)
	}
	list := make(ReactionTypeList, 0, len(elements))
	for _, element := range elements {
		reaction, err := decodeReactionType(element)
		if err != nil {
			return err
		}
		list = append(list, reaction)
	}
	*l = list
	return nil
}

// ReactionTypeUnknown is the fallback variant for a reaction type whose
// discriminator this release does not model, so a newer Telegram response
// still decodes instead of failing the whole update.
//
// This is a framework extension: Telegram never accepts it as input, which is
// why it carries no Telegram API link.
type ReactionTypeUnknown struct {
	// Type is the discriminator value Telegram sent.
	Type string `json:"type"`
	// Raw keeps the JSON object Telegram sent verbatim for inspection. It is
	// deliberately not serialized back out.
	Raw json.RawMessage `json:"-"`
}

func (ReactionTypeUnknown) reactionType() {}

// decodeReactionType selects the concrete ReactionType variant for one raw
// reaction object by reading its "type" discriminator.
//
// Parameters:
//   - data: The raw JSON object describing a single reaction type.
//
// Returns:
//   - ReactionType: The decoded variant, or ReactionTypeUnknown for a
//     discriminator this release does not model.
//   - error: Non-nil when data is not a JSON object.
//
// Telegram API: https://core.telegram.org/bots/api#reactiontype
func decodeReactionType(data []byte) (ReactionType, error) {
	var discriminator struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &discriminator); err != nil {
		return nil, fmt.Errorf("types: reaction type: %w", err)
	}
	switch discriminator.Type {
	case "emoji":
		var emoji ReactionTypeEmoji
		if err := json.Unmarshal(data, &emoji); err != nil {
			return nil, err
		}
		return emoji, nil
	case "custom_emoji":
		var custom ReactionTypeCustomEmoji
		if err := json.Unmarshal(data, &custom); err != nil {
			return nil, err
		}
		return custom, nil
	case "paid":
		var paid ReactionTypePaid
		if err := json.Unmarshal(data, &paid); err != nil {
			return nil, err
		}
		return paid, nil
	default:
		return ReactionTypeUnknown{
			Type: discriminator.Type,
			Raw:  append(json.RawMessage(nil), data...),
		}, nil
	}
}

// ReactionCount represents a reaction type applied to a message together with
// the number of users that reacted with it.
//
// Telegram API: https://core.telegram.org/bots/api#reactioncount
type ReactionCount struct {
	// Type of the reaction.
	Type ReactionType `json:"type"`
	// Number of users that reacted with this emoji.
	TotalCount int `json:"total_count"`
}

// UnmarshalJSON decodes the polymorphic "type" field of a reaction count.
//
// Parameters:
//   - data: The raw JSON object to decode.
//
// Returns:
//   - error: Non-nil when the payload is not a valid reaction count.
//
// Telegram API: https://core.telegram.org/bots/api#reactioncount
func (r *ReactionCount) UnmarshalJSON(data []byte) error {
	var raw struct {
		Type       json.RawMessage `json:"type"`
		TotalCount int             `json:"total_count"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return fmt.Errorf("types: reaction count: %w", err)
	}
	if len(raw.Type) == 0 {
		return fmt.Errorf("types: reaction count: missing type field")
	}
	reaction, err := decodeReactionType(raw.Type)
	if err != nil {
		return err
	}
	r.Type = reaction
	r.TotalCount = raw.TotalCount
	return nil
}

// MessageReactionUpdated represents a change of the reaction on a message sent
// by a user, or by a chat on behalf of a user, as delivered in
// Update.MessageReaction.
//
// Telegram API: https://core.telegram.org/bots/api#messagereactionupdated
type MessageReactionUpdated struct {
	// Chat containing the message for which the reaction changed.
	Chat *Chat `json:"chat"`
	// Identifier of the message the reaction change is about.
	MessageID int64 `json:"message_id"`
	// Date the reaction changed in Unix time.
	Date int64 `json:"date"`
	// Previous list of reaction types applied to the message; empty when the
	// message had no reactions.
	OldReaction ReactionTypeList `json:"old_reaction"`
	// New list of reaction types applied to the message; empty when every
	// reaction was removed.
	NewReaction ReactionTypeList `json:"new_reaction"`
	// User that changed the reaction, if the change was made by a user; nil
	// when it was made by a chat on behalf of a user.
	User *User `json:"user,omitempty"`
	// Chat that changed the reaction, if the change was made on behalf of a
	// chat; nil for a reaction changed by a user.
	ActorChat *Chat `json:"actor_chat,omitempty"`
}

// MessageReactionCountUpdated represents the list of reactions and their counts
// on a message with restricted reactions, as delivered in
// Update.MessageReactionCount.
//
// Telegram API: https://core.telegram.org/bots/api#messagereactioncountupdated
type MessageReactionCountUpdated struct {
	// Chat containing the message for which reactions are changed.
	Chat *Chat `json:"chat"`
	// Identifier of the message the reaction counts are about.
	MessageID int64 `json:"message_id"`
	// Date the reaction list changed in Unix time.
	Date int64 `json:"date"`
	// List of reactions, with the number of users that chose each reaction;
	// never empty for a delivered update.
	Reactions []ReactionCount `json:"reactions"`
}

// ChatBoostUpdated represents a new chat boost or a change of an existing one,
// as delivered in Update.ChatBoost.
//
// Telegram API: https://core.telegram.org/bots/api#chatboostupdated
type ChatBoostUpdated struct {
	// Chat boosted.
	Chat *Chat `json:"chat"`
	// The boost that was added or updated.
	Boost *ChatBoost `json:"boost"`
}

// ChatBoostRemoved represents a removal of a boost from a chat, as delivered in
// Update.RemovedChatBoost.
//
// Telegram API: https://core.telegram.org/bots/api#chatboostremoved
type ChatBoostRemoved struct {
	// Chat from which the boost was removed.
	Chat *Chat `json:"chat"`
	// Unique identifier of the removed boost.
	BoostID string `json:"boost_id"`
	// Date the boost was removed in Unix time.
	RemoveDate int64 `json:"remove_date"`
	// Source of the removed boost.
	Source *ChatBoostSource `json:"source"`
}

// BusinessMessagesDeleted represents messages deleted from a private chat
// between a business account and its customer, as delivered in
// Update.DeletedBusinessMessages. The chat field points to the chat with the
// business account connected to the bot; the messages were sent on behalf of
// that account.
//
// Telegram API: https://core.telegram.org/bots/api#businessmessagesdeleted
type BusinessMessagesDeleted struct {
	// Unique identifier of the business connection the messages belong to.
	BusinessConnectionID string `json:"business_connection_id"`
	// Chat from which the messages were deleted.
	Chat *Chat `json:"chat"`
	// Identifiers of the deleted messages, in ascending order.
	MessageIDs []int64 `json:"message_ids"`
}

// ManagedBotUpdated represents the start or the stop of a chat between a user
// and a bot managed by the business account, as delivered in Update.ManagedBot.
//
// Telegram API: https://core.telegram.org/bots/api#managedbotupdated
type ManagedBotUpdated struct {
	// Business account user that started or stopped the chat.
	User *User `json:"user"`
	// Bot which the user started to chat with.
	Bot *User `json:"bot"`
}

// BotSubscriptionUpdated represents a change in the status of a Telegram
// Stars subscription paid by a user to the bot, as delivered in
// Update.Subscription.
//
// State carries the wire value Telegram sends for the new subscription status.
// It is kept as a plain string because the set of states is defined by the
// documentation prose rather than by a typed object in the API schema, so no
// constant list is claimed here.
//
// Telegram API: https://core.telegram.org/bots/api#botsubscriptionupdated
type BotSubscriptionUpdated struct {
	// User whose subscription changed.
	User *User `json:"user"`
	// Unique bot long string (up to 4096 characters) used for the subscription.
	InvoicePayload string `json:"invoice_payload"`
	// New state of the subscription as sent by Telegram.
	State string `json:"state"`
}

// MessageGenerationStopped represents the stopping of a bot message generation
// in a chat, as delivered in Update.StoppedMessageGeneration.
//
// Telegram API: https://core.telegram.org/bots/api#messagegenerationstopped
type MessageGenerationStopped struct {
	// Chat in which the generation was stopped.
	Chat *Chat `json:"chat"`
	// Unique identifier of the stopped generation draft.
	DraftID int64 `json:"draft_id"`
	// Unique message thread identifier for topic chats; nil when Telegram omits
	// the field.
	MessageThreadID *int64 `json:"message_thread_id,omitempty"`
}

// ChosenInlineResult represents a result of an inline query that a user chose
// in their message and sent to a chat, as delivered in
// Update.ChosenInlineResult.
//
// Telegram API: https://core.telegram.org/bots/api#choseninlineresult
type ChosenInlineResult struct {
	// Unique identifier of the chosen result.
	ResultID string `json:"result_id"`
	// Sender that chose the result.
	From *User `json:"from"`
	// Sender location, only for bots that request user location; nil otherwise.
	Location *Location `json:"location,omitempty"`
	// Query the chosen result belongs to.
	Query string `json:"query"`
	// Identifier of the sent inline message, if it is known to the bot; empty
	// when Telegram does not know the message.
	InlineMessageID string `json:"inline_message_id,omitempty"`
}
