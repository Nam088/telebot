package routing

import (
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// MessageReaction registers a handler for message_reaction updates, sent when a
// user (or a chat on behalf of a user) adds or removes a reaction on a message.
// The previous and new reaction lists are available via Update.MessageReaction,
// and Context.User resolves to the reacting user when Telegram reports one.
//
// Parameters:
//   - handler: Called once for each message_reaction update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.MessageReaction(func(c *routing.Context) error {
//	    reaction := c.Update().MessageReaction
//	    for _, applied := range reaction.NewReaction {
//	        if emoji, ok := applied.(types.ReactionTypeEmoji); ok {
//	            _ = emoji.Emoji
//	        }
//	    }
//	    return nil
//	})
func (r *Router) MessageReaction(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.MessageReaction != nil
	}, handler)
}

// MessageReactionCount registers a handler for message_reaction_count updates,
// sent when the reaction totals of a message in a chat with restricted
// reactions change. Individual reactors are not reported; use MessageReaction
// for chats that expose them.
//
// Parameters:
//   - handler: Called once for each message_reaction_count update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.MessageReactionCount(func(c *routing.Context) error {
//	    count := c.Update().MessageReactionCount
//	    _ = count.Reactions
//	    return nil
//	})
func (r *Router) MessageReactionCount(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.MessageReactionCount != nil
	}, handler)
}

// ChatBoost registers a handler for chat_boost updates, sent when a boost is
// added to a chat the bot administers or is a member of. The boosted chat and
// the boost itself are available via Update.ChatBoost.
//
// Parameters:
//   - handler: Called once for each chat_boost update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.ChatBoost(func(c *routing.Context) error {
//	    boost := c.Update().ChatBoost
//	    _ = boost.Boost.Source.Source
//	    return nil
//	})
func (r *Router) ChatBoost(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.ChatBoost != nil
	}, handler)
}

// RemovedChatBoost registers a handler for removed_chat_boost updates, sent
// when a previously delivered boost stops being applied to a chat. The
// identifiers needed to correlate the removal with an earlier ChatBoost update
// are available via Update.RemovedChatBoost.
//
// Parameters:
//   - handler: Called once for each removed_chat_boost update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.RemovedChatBoost(func(c *routing.Context) error {
//	    removed := c.Update().RemovedChatBoost
//	    _ = removed.BoostID
//	    return nil
//	})
func (r *Router) RemovedChatBoost(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.RemovedChatBoost != nil
	}, handler)
}
