package routing

import (
	"github.com/Nam088/telebot-go/pkg/types"
)

// ChatMemberScope selects which chat member update variants a ChatMember
// route matches. It mirrors the chatMemberTypes mask of the Node
// framework's ChatMemberHandler.
type ChatMemberScope int

// Chat member update variants accepted by Router.ChatMember.
const (
	// AnyChatMember matches both chat_member and my_chat_member updates.
	AnyChatMember ChatMemberScope = iota
	// ChatMemberOnly matches only chat_member updates, i.e. status changes
	// of members other than the bot itself.
	ChatMemberOnly
	// MyChatMemberOnly matches only my_chat_member updates, i.e. status
	// changes of the bot itself.
	MyChatMemberOnly
)

// InlineQuery registers a handler for inline_query updates, sent when a user
// invokes the bot in inline mode. When query is empty every inline query
// matches; otherwise the inline query's text must equal query exactly,
// mirroring the string pattern semantics of the Node InlineQueryHandler.
//
// Example:
//
//	router.InlineQuery("weather", func(c *routing.Context) error {
//	    return nil
//	})
func (r *Router) InlineQuery(query string, handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		if u.InlineQuery == nil {
			return false
		}
		if query == "" {
			return true
		}
		return u.InlineQuery.Query == query
	}, handler)
}

// Poll registers a handler for poll updates: top-level updates carrying the
// new state of a poll known to the bot (vote casts, closures), delivered in
// Update.Poll. Messages that merely contain a poll do not match this route;
// use filters.Poll together with Router.Handle for those.
//
// Example:
//
//	router.Poll(func(c *routing.Context) error {
//	    poll := c.Update().Poll
//	    _ = poll
//	    return nil
//	})
func (r *Router) Poll(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.Poll != nil
	}, handler)
}

// PollAnswer registers a handler for poll_answer updates, sent when a user
// changes their answer in a non-anonymous poll. The voter is available via
// Context.User.
//
// Example:
//
//	router.PollAnswer(func(c *routing.Context) error {
//	    answer := c.Update().PollAnswer
//	    _ = answer.OptionIDs
//	    return nil
//	})
func (r *Router) PollAnswer(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.PollAnswer != nil
	}, handler)
}

// ChatMember registers a handler for chat member status change updates. The
// scope argument selects which variants match: routing.AnyChatMember handles
// both chat_member and my_chat_member updates, routing.ChatMemberOnly only
// updates about other members, and routing.MyChatMemberOnly only updates
// about the bot itself.
//
// Example:
//
//	router.ChatMember(routing.MyChatMemberOnly, func(c *routing.Context) error {
//	    updated := c.Update().MyChatMember
//	    _ = updated.NewChatMember.Status
//	    return nil
//	})
func (r *Router) ChatMember(scope ChatMemberScope, handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		switch scope {
		case ChatMemberOnly:
			return u.ChatMember != nil
		case MyChatMemberOnly:
			return u.MyChatMember != nil
		default:
			return u.ChatMember != nil || u.MyChatMember != nil
		}
	}, handler)
}

// ChatJoinRequest registers a handler for chat_join_request updates, sent
// when a user asks to join a chat that requires approval. Approve or decline
// the request with Bot.ApproveChatJoinRequest or Bot.DeclineChatJoinRequest.
//
// Example:
//
//	router.ChatJoinRequest(func(c *routing.Context) error {
//	    req := c.Update().ChatJoinRequest
//	    _, err := c.Bot().ApproveChatJoinRequest(c.Ctx(), req.Chat.ID, req.From.ID)
//	    return err
//	})
func (r *Router) ChatJoinRequest(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.ChatJoinRequest != nil
	}, handler)
}
