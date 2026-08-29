package bot_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/types"
)

func paymentServer(t *testing.T, wantMethod string, wantPayload map[string]any, result any) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/"+wantMethod) {
			t.Errorf("expected path to end with /%s, got %s", wantMethod, r.URL.Path)
		}
		if wantPayload != nil {
			var got map[string]any
			if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
				t.Fatalf("decode body: %v", err)
			}
			for k, v := range wantPayload {
				gv, ok := got[k]
				if !ok {
					t.Errorf("missing payload field %q", k)
					continue
				}
				if !jsonEqual(gv, v) {
					t.Errorf("payload field %q: got %v, want %v", k, gv, v)
				}
			}
		}
		resp := types.Response[any]{Ok: true, Result: result}
		_ = json.NewEncoder(w).Encode(resp)
	}))
}

func TestPayments_SendInvoice(t *testing.T) {
	srv := paymentServer(t, "sendInvoice", map[string]any{
		"chat_id":     1,
		"title":       "Coffee",
		"description": "A fine coffee",
		"payload":     "order-1",
		"currency":    "XTR",
		"prices":      []any{map[string]any{"label": "base", "amount": 100}},
	}, types.Message{MessageID: 20})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, err := b.SendInvoice(context.Background(), &types.SendInvoiceOptions{
		ChatID:      int64(1),
		Title:       "Coffee",
		Description: "A fine coffee",
		Payload:     "order-1",
		Currency:    "XTR",
		Prices:      []types.LabeledPrice{{Label: "base", Amount: 100}},
	})
	if err != nil {
		t.Fatalf("SendInvoice error: %v", err)
	}
	if msg.MessageID != 20 {
		t.Errorf("unexpected message id: %d", msg.MessageID)
	}
}

func TestPayments_CreateInvoiceLink(t *testing.T) {
	srv := paymentServer(t, "createInvoiceLink", map[string]any{
		"title":       "Coffee",
		"description": "A fine coffee",
		"payload":     "order-1",
		"currency":    "XTR",
		"prices":      []any{map[string]any{"label": "base", "amount": 100}},
	}, "https://t.me/$invoice")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	link, err := b.CreateInvoiceLink(context.Background(), &types.CreateInvoiceLinkOptions{
		Title:       "Coffee",
		Description: "A fine coffee",
		Payload:     "order-1",
		Currency:    "XTR",
		Prices:      []types.LabeledPrice{{Label: "base", Amount: 100}},
	})
	if err != nil {
		t.Fatalf("CreateInvoiceLink error: %v", err)
	}
	if link != "https://t.me/$invoice" {
		t.Errorf("unexpected link: %s", link)
	}
}

func TestPayments_AnswerShippingQuery_Approve(t *testing.T) {
	srv := paymentServer(t, "answerShippingQuery", map[string]any{
		"shipping_query_id": "sq1",
		"ok":                true,
		"shipping_options": []any{map[string]any{
			"id":     "std",
			"title":  "Standard",
			"prices": []any{map[string]any{"label": "base", "amount": 50}},
		}},
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.AnswerShippingQuery(context.Background(), &types.AnswerShippingQueryOptions{
		ShippingQueryID: "sq1",
		OK:              true,
		ShippingOptions: []types.ShippingOption{{
			ID:     "std",
			Title:  "Standard",
			Prices: []types.LabeledPrice{{Label: "base", Amount: 50}},
		}},
	})
	if err != nil {
		t.Fatalf("AnswerShippingQuery error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestPayments_AnswerShippingQuery_Reject(t *testing.T) {
	srv := paymentServer(t, "answerShippingQuery", map[string]any{
		"shipping_query_id": "sq1",
		"ok":                false,
		"error_message":     "no shipping available",
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.AnswerShippingQuery(context.Background(), &types.AnswerShippingQueryOptions{
		ShippingQueryID: "sq1",
		OK:              false,
		ErrorMessage:    "no shipping available",
	})
	if err != nil {
		t.Fatalf("AnswerShippingQuery error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestPayments_AnswerPreCheckoutQuery_Approve(t *testing.T) {
	srv := paymentServer(t, "answerPreCheckoutQuery", map[string]any{
		"pre_checkout_query_id": "pcq1",
		"ok":                    true,
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.AnswerPreCheckoutQuery(context.Background(), &types.AnswerPreCheckoutQueryOptions{
		PreCheckoutQueryID: "pcq1",
		OK:                 true,
	})
	if err != nil {
		t.Fatalf("AnswerPreCheckoutQuery error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestPayments_AnswerPreCheckoutQuery_Reject(t *testing.T) {
	srv := paymentServer(t, "answerPreCheckoutQuery", map[string]any{
		"pre_checkout_query_id": "pcq1",
		"ok":                    false,
		"error_message":         "out of stock",
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.AnswerPreCheckoutQuery(context.Background(), &types.AnswerPreCheckoutQueryOptions{
		PreCheckoutQueryID: "pcq1",
		OK:                 false,
		ErrorMessage:       "out of stock",
	})
	if err != nil {
		t.Fatalf("AnswerPreCheckoutQuery error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestPayments_GetStarTransactions(t *testing.T) {
	srv := paymentServer(t, "getStarTransactions", map[string]any{"limit": 10}, types.StarTransactions{
		Transactions: []types.StarTransaction{{ID: "tx1", Amount: 250, Date: 1700000000}},
	})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	transactions, err := b.GetStarTransactions(context.Background(), &types.GetStarTransactionsOptions{Limit: 10})
	if err != nil {
		t.Fatalf("GetStarTransactions error: %v", err)
	}
	if len(transactions.Transactions) != 1 || transactions.Transactions[0].ID != "tx1" {
		t.Errorf("unexpected transactions: %+v", transactions)
	}
}

func TestPayments_RefundStarPayment(t *testing.T) {
	srv := paymentServer(t, "refundStarPayment", map[string]any{
		"user_id":                    1,
		"telegram_payment_charge_id": "charge-1",
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.RefundStarPayment(context.Background(), &types.RefundStarPaymentOptions{
		UserID:                  1,
		TelegramPaymentChargeID: "charge-1",
	})
	if err != nil {
		t.Fatalf("RefundStarPayment error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestPayments_EditUserStarSubscription(t *testing.T) {
	srv := paymentServer(t, "editUserStarSubscription", map[string]any{
		"user_id":                    1,
		"telegram_payment_charge_id": "charge-1",
		"is_canceled":                true,
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.EditUserStarSubscription(context.Background(), &types.EditUserStarSubscriptionOptions{
		UserID:                  1,
		TelegramPaymentChargeID: "charge-1",
		IsCanceled:              true,
	})
	if err != nil {
		t.Fatalf("EditUserStarSubscription error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestPayments_TelegramErrors(t *testing.T) {
	srv := telegramErrorServer(402, "Payment required")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ctx := context.Background()

	if _, err := b.SendInvoice(ctx, &types.SendInvoiceOptions{ChatID: int64(1)}); err == nil {
		t.Error("SendInvoice: expected error")
	} else {
		requireTelegramError(t, err, 402)
	}
	if _, err := b.CreateInvoiceLink(ctx, &types.CreateInvoiceLinkOptions{Title: "x"}); err == nil {
		t.Error("CreateInvoiceLink: expected error")
	} else {
		requireTelegramError(t, err, 402)
	}
	if _, err := b.AnswerShippingQuery(ctx, &types.AnswerShippingQueryOptions{ShippingQueryID: "sq"}); err == nil {
		t.Error("AnswerShippingQuery: expected error")
	} else {
		requireTelegramError(t, err, 402)
	}
	if _, err := b.AnswerPreCheckoutQuery(ctx, &types.AnswerPreCheckoutQueryOptions{PreCheckoutQueryID: "pcq"}); err == nil {
		t.Error("AnswerPreCheckoutQuery: expected error")
	} else {
		requireTelegramError(t, err, 402)
	}
	if _, err := b.GetStarTransactions(ctx, &types.GetStarTransactionsOptions{}); err == nil {
		t.Error("GetStarTransactions: expected error")
	} else {
		requireTelegramError(t, err, 402)
	}
	if _, err := b.RefundStarPayment(ctx, &types.RefundStarPaymentOptions{UserID: 1}); err == nil {
		t.Error("RefundStarPayment: expected error")
	} else {
		requireTelegramError(t, err, 402)
	}
	if _, err := b.EditUserStarSubscription(ctx, &types.EditUserStarSubscriptionOptions{UserID: 1}); err == nil {
		t.Error("EditUserStarSubscription: expected error")
	} else {
		requireTelegramError(t, err, 402)
	}
}
