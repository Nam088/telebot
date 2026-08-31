package routing_test

import (
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/routing"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// countingHandler returns a handler that increments *calls when it runs.
func countingHandler(calls *int) routing.HandlerFunc {
	return func(c *routing.Context) error {
		*calls++
		return nil
	}
}

func businessMessageUpdate(text string) *types.Update {
	return &types.Update{
		UpdateID: 1,
		BusinessMessage: &types.Message{
			MessageID: 55,
			Chat:      &types.Chat{ID: 777, Type: "private"},
			From:      &types.User{ID: 777, FirstName: "Boss"},
			Text:      text,
		},
	}
}

func TestRouter_BusinessConnection(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	router.BusinessConnection(countingHandler(&calls))

	processOrFail(t, router, &types.Update{UpdateID: 1, BusinessConnection: &types.BusinessConnection{ID: "bc-1"}})
	processOrFail(t, router, businessMessageUpdate("hi"))

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
}

func TestRouter_BusinessMessage(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	router.BusinessMessage(countingHandler(&calls))

	processOrFail(t, router, businessMessageUpdate("hello"))
	processOrFail(t, router, &types.Update{UpdateID: 2, EditedBusinessMessage: &types.Message{MessageID: 56}})
	processOrFail(t, router, &types.Update{UpdateID: 3, Message: &types.Message{MessageID: 1, Text: "plain"}})
	processOrFail(t, router, &types.Update{UpdateID: 4, DeletedBusinessMessages: &types.BusinessMessagesDeleted{}})

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
}

func TestRouter_EditedBusinessMessage(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	router.EditedBusinessMessage(countingHandler(&calls))

	processOrFail(t, router, &types.Update{UpdateID: 1, EditedBusinessMessage: &types.Message{MessageID: 56, Text: "edited"}})
	processOrFail(t, router, businessMessageUpdate("hello"))
	processOrFail(t, router, &types.Update{UpdateID: 2, EditedMessage: &types.Message{MessageID: 57}})

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
}

func TestRouter_DeletedBusinessMessages(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	var ids []int64
	router.DeletedBusinessMessages(func(c *routing.Context) error {
		calls++
		ids = c.Update().DeletedBusinessMessages.MessageIDs
		return nil
	})

	processOrFail(t, router, &types.Update{UpdateID: 1, DeletedBusinessMessages: &types.BusinessMessagesDeleted{
		BusinessConnectionID: "bc-1",
		Chat:                 &types.Chat{ID: 777, Type: "private"},
		MessageIDs:           []int64{10, 11},
	}})
	processOrFail(t, router, businessMessageUpdate("hello"))

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
	if len(ids) != 2 || ids[1] != 11 {
		t.Errorf("unexpected deleted message ids: %v", ids)
	}
}

func TestRouter_ChatBoost(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	router.ChatBoost(countingHandler(&calls))

	processOrFail(t, router, &types.Update{UpdateID: 1, ChatBoost: &types.ChatBoostUpdated{
		Chat:  &types.Chat{ID: -1002, Type: "supergroup"},
		Boost: &types.ChatBoost{BoostID: "b-1"},
	}})
	processOrFail(t, router, &types.Update{UpdateID: 2, RemovedChatBoost: &types.ChatBoostRemoved{BoostID: "b-1"}})
	processOrFail(t, router, businessMessageUpdate("hello"))

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
}

func TestRouter_RemovedChatBoost(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	router.RemovedChatBoost(countingHandler(&calls))

	processOrFail(t, router, &types.Update{UpdateID: 1, RemovedChatBoost: &types.ChatBoostRemoved{BoostID: "b-1"}})
	processOrFail(t, router, &types.Update{UpdateID: 2, ChatBoost: &types.ChatBoostUpdated{
		Chat:  &types.Chat{ID: -1002, Type: "supergroup"},
		Boost: &types.ChatBoost{BoostID: "b-1"},
	}})

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
}

func TestRouter_MessageReaction(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	router.MessageReaction(countingHandler(&calls))

	processOrFail(t, router, &types.Update{UpdateID: 1, MessageReaction: &types.MessageReactionUpdated{
		Chat: &types.Chat{ID: 64, Type: "private"}, MessageID: 99,
	}})
	processOrFail(t, router, &types.Update{UpdateID: 2, MessageReactionCount: &types.MessageReactionCountUpdated{
		Chat: &types.Chat{ID: 64, Type: "private"}, MessageID: 99,
	}})
	processOrFail(t, router, businessMessageUpdate("hello"))

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
}

func TestRouter_MessageReactionCount(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	router.MessageReactionCount(countingHandler(&calls))

	processOrFail(t, router, &types.Update{UpdateID: 1, MessageReactionCount: &types.MessageReactionCountUpdated{
		Chat: &types.Chat{ID: 64, Type: "private"}, MessageID: 99,
	}})
	processOrFail(t, router, &types.Update{UpdateID: 2, MessageReaction: &types.MessageReactionUpdated{
		Chat: &types.Chat{ID: 64, Type: "private"}, MessageID: 99,
	}})

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
}

func chosenResultUpdate(resultID, query string) *types.Update {
	return &types.Update{
		UpdateID: 1,
		ChosenInlineResult: &types.ChosenInlineResult{
			ResultID: resultID,
			Query:    query,
			From:     &types.User{ID: 200, FirstName: "Chooser"},
		},
	}
}

func TestRouter_ChosenInlineResult_Any(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	router.ChosenInlineResult("", countingHandler(&calls))

	processOrFail(t, router, chosenResultUpdate("r-1", "cats"))
	processOrFail(t, router, chosenResultUpdate("r-2", "dogs"))
	processOrFail(t, router, &types.Update{UpdateID: 3, InlineQuery: &types.InlineQuery{ID: "iq-1", Query: "cats"}})

	if calls != 2 {
		t.Errorf("expected 2 matching calls, got %d", calls)
	}
}

func TestRouter_ChosenInlineResult_ExactResultID(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	router.ChosenInlineResult("r-1", countingHandler(&calls))

	processOrFail(t, router, chosenResultUpdate("r-1", "cats"))
	processOrFail(t, router, chosenResultUpdate("r-2", "cats"))

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
}

func TestRouter_ShippingQuery(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	router.ShippingQuery(countingHandler(&calls))

	processOrFail(t, router, &types.Update{UpdateID: 1, ShippingQuery: &types.ShippingQuery{
		ID: "sq-1", InvoicePayload: "p",
	}})
	processOrFail(t, router, &types.Update{UpdateID: 2, PreCheckoutQuery: &types.PreCheckoutQuery{ID: "pq-1"}})
	processOrFail(t, router, businessMessageUpdate("hello"))

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
}

func TestRouter_PreCheckoutQuery(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	var payload string
	router.PreCheckoutQuery(func(c *routing.Context) error {
		calls++
		payload = c.Update().PreCheckoutQuery.InvoicePayload
		return nil
	})

	processOrFail(t, router, &types.Update{UpdateID: 1, PreCheckoutQuery: &types.PreCheckoutQuery{
		ID: "pq-1", InvoicePayload: "order-77", Currency: "XTR", TotalAmount: 2500,
	}})
	processOrFail(t, router, &types.Update{UpdateID: 2, ShippingQuery: &types.ShippingQuery{ID: "sq-1"}})
	processOrFail(t, router, &types.Update{UpdateID: 3, PurchasedPaidMedia: &types.PaidMediaPurchased{
		PaidMediaPayload: "promo",
	}})

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
	if payload != "order-77" {
		t.Errorf("unexpected invoice payload: %q", payload)
	}
}

func TestRouter_PurchasedPaidMedia(t *testing.T) {
	router := newUpdateRouter()
	var calls int
	router.PurchasedPaidMedia(countingHandler(&calls))

	processOrFail(t, router, &types.Update{UpdateID: 1, PurchasedPaidMedia: &types.PaidMediaPurchased{
		PaidMediaPayload: "promo-2026",
	}})
	processOrFail(t, router, &types.Update{UpdateID: 2, PreCheckoutQuery: &types.PreCheckoutQuery{ID: "pq-1"}})

	if calls != 1 {
		t.Errorf("expected exactly 1 matching call, got %d", calls)
	}
}
