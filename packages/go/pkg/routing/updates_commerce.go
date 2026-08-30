package routing

import (
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// ChosenInlineResult registers a handler for chosen_inline_result updates, sent
// when a user picks one of the bot's inline results. When resultID is empty
// every chosen result matches; otherwise the chosen result's result_id must
// equal resultID exactly, mirroring the string pattern semantics of the other
// Router routes.
//
// Parameters:
//   - resultID: Exact result_id to match, or "" to match every chosen result.
//   - handler:  Called for each matching chosen_inline_result update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.ChosenInlineResult("", func(c *routing.Context) error {
//	    chosen := c.Update().ChosenInlineResult
//	    _ = chosen.ResultID
//	    return nil
//	})
func (r *Router) ChosenInlineResult(resultID string, handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		if u.ChosenInlineResult == nil {
			return false
		}
		if resultID == "" {
			return true
		}
		return u.ChosenInlineResult.ResultID == resultID
	}, handler)
}

// ShippingQuery registers a handler for shipping_query updates, sent when a
// user submits shipping details for a flexible invoice. Answer within the
// handler with Bot.AnswerShippingQuery, otherwise the payment fails.
//
// Parameters:
//   - handler: Called once for each shipping_query update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.ShippingQuery(func(c *routing.Context) error {
//	    query := c.Update().ShippingQuery
//	    _, err := c.Bot().AnswerShippingQuery(c.Ctx(), &types.AnswerShippingQueryOptions{
//	        ShippingQueryID: query.ID,
//	        OK:              true,
//	    })
//	    return err
//	})
func (r *Router) ShippingQuery(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.ShippingQuery != nil
	}, handler)
}

// PreCheckoutQuery registers a handler for pre_checkout_query updates, sent
// before a user confirms a payment. The bot must answer with
// Bot.AnswerPreCheckoutQuery within ten seconds for the payment to proceed.
//
// Parameters:
//   - handler: Called once for each pre_checkout_query update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.PreCheckoutQuery(func(c *routing.Context) error {
//	    query := c.Update().PreCheckoutQuery
//	    _, err := c.Bot().AnswerPreCheckoutQuery(c.Ctx(), &types.AnswerPreCheckoutQueryOptions{
//	        PreCheckoutQueryID: query.ID,
//	        OK:                 true,
//	    })
//	    return err
//	})
func (r *Router) PreCheckoutQuery(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.PreCheckoutQuery != nil
	}, handler)
}

// PurchasedPaidMedia registers a handler for purchased_paid_media updates, sent
// when a user unlocks paid media attached to one of the bot's messages. The
// bot-supplied payload of the purchased media is available via
// Update.PurchasedPaidMedia.PaidMediaPayload.
//
// Parameters:
//   - handler: Called once for each purchased_paid_media update.
//
// Returns:
//   - Nothing; the route is appended to the router's route list.
//
// Example:
//
//	router.PurchasedPaidMedia(func(c *routing.Context) error {
//	    purchased := c.Update().PurchasedPaidMedia
//	    _ = purchased.PaidMediaPayload
//	    return nil
//	})
func (r *Router) PurchasedPaidMedia(handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		return u.PurchasedPaidMedia != nil
	}, handler)
}
