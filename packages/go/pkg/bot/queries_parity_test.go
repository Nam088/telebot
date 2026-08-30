package bot_test

import (
	"context"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestQueries_AnswerGuestQuery covers answerGuestQuery ported from
// packages/node/src/client/methods/business/stories-boosts.ts: the positional
// (guest_query_id, result) pair and the SentWebAppMessage-shaped result.
func TestQueries_AnswerGuestQuery(t *testing.T) {
	srv := profileServer(t, "answerGuestQuery", map[string]any{
		"guest_query_id": "gq1",
		"result":         map[string]any{"inline_message_id": "im1"},
	}, types.SentWebAppMessage{InlineMessageID: "im1"})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	sent, err := b.AnswerGuestQuery(context.Background(), "gq1", map[string]any{"inline_message_id": "im1"})
	if err != nil {
		t.Fatalf("AnswerGuestQuery error: %v", err)
	}
	if sent.InlineMessageID != "im1" {
		t.Errorf("unexpected inline_message_id: %q", sent.InlineMessageID)
	}
}

// TestQueries_AnswerGuestQueryEmptyResult asserts the payload keeps both keys
// even when the result is an empty record, as node's answerGuestQuery("g1", {})
// call sends.
func TestQueries_AnswerGuestQueryEmptyResult(t *testing.T) {
	srv := profileServer(t, "answerGuestQuery", map[string]any{
		"guest_query_id": "gq1",
		"result":         map[string]any{},
	}, types.SentWebAppMessage{})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	sent, err := b.AnswerGuestQuery(context.Background(), "gq1", map[string]any{})
	if err != nil {
		t.Fatalf("AnswerGuestQuery error: %v", err)
	}
	if sent.InlineMessageID != "" {
		t.Errorf("expected an empty inline_message_id, got %q", sent.InlineMessageID)
	}
}

// TestQueries_SendChatJoinRequestWebApp covers sendChatJoinRequestWebApp, whose
// docs parameters are chat_join_request_query_id and web_app_url.
func TestQueries_SendChatJoinRequestWebApp(t *testing.T) {
	srv := profileServer(t, "sendChatJoinRequestWebApp", map[string]any{
		"chat_join_request_query_id": "q1",
		"web_app_url":                "https://example.com/join",
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SendChatJoinRequestWebApp(context.Background(), &types.SendChatJoinRequestWebAppOptions{
		ChatJoinRequestQueryID: "q1",
		WebAppURL:              "https://example.com/join",
	})
	if err != nil || !ok {
		t.Fatalf("SendChatJoinRequestWebApp = (%v, %v)", ok, err)
	}
}

// TestQueries_AnswerChatJoinRequestQuery covers answerChatJoinRequestQuery
// (Bot API 10.3+): chat_join_request_query_id + a result object, returning bool.
func TestQueries_AnswerChatJoinRequestQuery(t *testing.T) {
	srv := profileServer(t, "answerChatJoinRequestQuery", map[string]any{
		"chat_join_request_query_id": "q1",
		"result":                     map[string]any{"status": "allowed"},
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.AnswerChatJoinRequestQuery(context.Background(), &types.AnswerChatJoinRequestQueryOptions{
		ChatJoinRequestQueryID: "q1",
		Result:                 map[string]any{"status": "allowed"},
	})
	if err != nil || !ok {
		t.Fatalf("AnswerChatJoinRequestQuery = (%v, %v)", ok, err)
	}
}

// TestMessages_GetUserPersonalChatMessages covers getUserPersonalChatMessages
// ported from packages/node/src/client/methods/messages/send-basic.ts, whose
// result node types as Message[].
func TestMessages_GetUserPersonalChatMessages(t *testing.T) {
	result := []types.Message{
		{MessageID: 1, Chat: &types.Chat{ID: 123456}, Text: "first"},
		{MessageID: 2, Chat: &types.Chat{ID: 123456}, Text: "second"},
	}
	srv := profileServer(t, "getUserPersonalChatMessages", map[string]any{
		"user_id": int64(123456),
		"limit":   float64(10),
	}, result)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msgs, err := b.GetUserPersonalChatMessages(context.Background(), int64(123456), 10)
	if err != nil {
		t.Fatalf("GetUserPersonalChatMessages error: %v", err)
	}
	if len(msgs) != 2 || msgs[0].MessageID != 1 || msgs[1].Text != "second" {
		t.Fatalf("unexpected messages: %+v", msgs)
	}
	if msgs[0].Chat == nil || msgs[0].Chat.ID != 123456 {
		t.Errorf("unexpected chat: %+v", msgs[0].Chat)
	}
}

// TestMessages_GetUserPersonalChatMessagesSendsBothRequired asserts both the
// required user_id and limit keys are always serialized and that the old
// chat_id key is never sent.
func TestMessages_GetUserPersonalChatMessagesSendsBothRequired(t *testing.T) {
	srv := omittingServer(t, "getUserPersonalChatMessages", []string{"chat_id"},
		map[string]any{"user_id": float64(123456), "limit": float64(1)}, []types.Message{})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msgs, err := b.GetUserPersonalChatMessages(context.Background(), int64(123456), 1)
	if err != nil {
		t.Fatalf("GetUserPersonalChatMessages error: %v", err)
	}
	if len(msgs) != 0 {
		t.Errorf("expected no messages, got %+v", msgs)
	}
}

// TestProfile_GetUserProfileAudios covers getUserProfileAudios ported from
// packages/node/src/client/methods/business/gifts.ts, including its optional
// offset/limit paging pair and the raw audios object decode.
func TestProfile_GetUserProfileAudios(t *testing.T) {
	audios := map[string]any{
		"total_count": float64(1),
		"audios": []map[string]any{
			{"file_id": "AfAC", "file_unique_id": "u1", "duration": float64(12)},
		},
	}
	srv := profileServer(t, "getUserProfileAudios", map[string]any{
		"user_id": float64(123456),
		"offset":  float64(2),
		"limit":   float64(10),
	}, audios)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	result, err := b.GetUserProfileAudios(context.Background(), 123456, 2, 10)
	if err != nil {
		t.Fatalf("GetUserProfileAudios error: %v", err)
	}
	got, ok := result.(map[string]any)
	if !ok {
		t.Fatalf("expected map result, got %#v", result)
	}
	if got["total_count"] != float64(1) {
		t.Errorf("unexpected total_count: %v", got["total_count"])
	}
	list, ok := got["audios"].([]any)
	if !ok || len(list) != 1 {
		t.Fatalf("unexpected audios list: %#v", got["audios"])
	}
}

// TestProfile_GetUserProfileAudiosOmitsPaging asserts offset and limit are
// dropped when both are 0.
func TestProfile_GetUserProfileAudiosOmitsPaging(t *testing.T) {
	srv := omittingServer(t, "getUserProfileAudios", []string{"offset", "limit"},
		map[string]any{"user_id": float64(123456)}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	result, err := b.GetUserProfileAudios(context.Background(), 123456, 0, 0)
	if err != nil {
		t.Fatalf("GetUserProfileAudios error: %v", err)
	}
	if result != true {
		t.Errorf("expected the bare true result to decode, got %#v", result)
	}
}

// TestInline_SavePreparedKeyboardButton covers savePreparedKeyboardButton
// ported from packages/node/src/client/methods/business/gifts.ts.
func TestInline_SavePreparedKeyboardButton(t *testing.T) {
	srv := profileServer(t, "savePreparedKeyboardButton", map[string]any{
		"user_id": float64(123456),
		"button":  map[string]any{"text": "Open", "type": "web_app"},
	}, map[string]any{"id": "pk1", "expiration_date": float64(1702592000)})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	result, err := b.SavePreparedKeyboardButton(context.Background(), &types.SavePreparedKeyboardButtonOptions{
		UserID: int64(123456),
		Button: map[string]any{"text": "Open", "type": "web_app"},
	})
	if err != nil {
		t.Fatalf("SavePreparedKeyboardButton error: %v", err)
	}
	got, ok := result.(map[string]any)
	if !ok {
		t.Fatalf("expected map result, got %#v", result)
	}
	if got["id"] != "pk1" || got["expiration_date"] != float64(1702592000) {
		t.Errorf("unexpected prepared button: %#v", got)
	}
}

// TestQueries_TelegramError asserts the query and misc message methods reject
// with a typed Telegram error instead of a bare message string.
func TestQueries_TelegramError(t *testing.T) {
	srv := telegramErrorServer(400, "Bad Request: QUERY_ID_INVALID")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if sent, err := b.AnswerGuestQuery(context.Background(), "gq1", nil); sent != nil {
		t.Errorf("expected nil result on error, got %+v", sent)
	} else {
		requireTelegramError(t, err, 400)
	}
	if ok, err := b.SendChatJoinRequestWebApp(context.Background(), &types.SendChatJoinRequestWebAppOptions{ChatJoinRequestQueryID: "q1", WebAppURL: "https://e.com"}); ok {
		t.Errorf("expected false on error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.GetUserPersonalChatMessages(context.Background(), int64(1), 10); err == nil {
		t.Errorf("expected getUserPersonalChatMessages to reject")
	}
	if _, err := b.GetUserProfileAudios(context.Background(), 1, 0, 0); err == nil {
		t.Errorf("expected getUserProfileAudios to reject")
	}
	if _, err := b.SavePreparedKeyboardButton(context.Background(), &types.SavePreparedKeyboardButtonOptions{UserID: 1}); err == nil {
		t.Errorf("expected savePreparedKeyboardButton to reject")
	}
}
