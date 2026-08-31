package routing

import (
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// BusinessConnection registers a handler for business_connection updates, sent
// when a user connects or disconnects their business account to the bot. The
// payload is available via Context.Update, and its ID is the
// business_connection_id accepted by the on-behalf-of Bot methods.
//
// Parameters:
//   - handler: Called once for each business_connection update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.BusinessConnection(func(c *routing.Context) error {
//	    connection := c.Update().BusinessConnection
//	    _ = connection.ID
//	    return nil
//	})
func (r *Router) BusinessConnection(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.BusinessConnection != nil
	}, handler)
}

// BusinessMessage registers a handler for business_message updates: messages
// sent by a customer to a business account that the bot is connected to. The
// message is available via Update.BusinessMessage and also through
// Context.User and Context.Chat, which resolve to the sender and the private
// chat with the customer.
//
// Parameters:
//   - handler: Called once for each business_message update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.BusinessMessage(func(c *routing.Context) error {
//	    message := c.Update().BusinessMessage
//	    _, err := c.Bot().SendMessage(c.Ctx(), &types.SendMessageOptions{
//	        ChatID:               message.Chat.ID,
//	        Text:                 "got it",
//	        BusinessConnectionID: message.BusinessConnectionID,
//	    })
//	    return err
//	})
func (r *Router) BusinessMessage(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.BusinessMessage != nil
	}, handler)
}

// EditedBusinessMessage registers a handler for edited_business_message
// updates, sent when a message in a chat between a customer and a connected
// business account is edited.
//
// Parameters:
//   - handler: Called once for each edited_business_message update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.EditedBusinessMessage(func(c *routing.Context) error {
//	    edited := c.Update().EditedBusinessMessage
//	    _ = edited.MessageID
//	    return nil
//	})
func (r *Router) EditedBusinessMessage(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.EditedBusinessMessage != nil
	}, handler)
}

// DeletedBusinessMessages registers a handler for deleted_business_messages
// updates, sent when messages are deleted from a chat between a customer and a
// connected business account. The identifiers of the removed messages are
// available via Update.DeletedBusinessMessages.MessageIDs.
//
// Parameters:
//   - handler: Called once for each deleted_business_messages update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.DeletedBusinessMessages(func(c *routing.Context) error {
//	    deleted := c.Update().DeletedBusinessMessages
//	    _ = deleted.MessageIDs
//	    return nil
//	})
func (r *Router) DeletedBusinessMessages(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.DeletedBusinessMessages != nil
	}, handler)
}
