package bot_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// richDraftPayload is the wire payload a two-block rich message with nested
// RichText children and a button row must serialize to. It is reused by the
// sendRichMessage and sendRichMessageDraft assertions so both are checked
// against the same nesting.
var richDraftPayload = map[string]any{
	"blocks": []any{
		map[string]any{
			"type": "paragraph",
			"text": []any{
				"Hello, ",
				map[string]any{"type": "bold", "text": "world"},
			},
		},
		map[string]any{
			"type": "buttons",
			"buttons": []any{
				map[string]any{"text": "Open", "callback_data": "open-1", "style": "danger"},
			},
			"align": "center",
		},
	},
}

func richInputMessagePtr() *types.InputRichMessage {
	m := richInputMessage()
	return &m
}

func richInputMessage() types.InputRichMessage {
	return types.InputRichMessage{
		Blocks: []types.InputRichBlock{
			&types.InputRichBlockParagraph{
				Type: "paragraph",
				Text: []types.RichText{
					"Hello, ",
					&types.RichTextBold{Type: "bold", Text: "world"},
				},
			},
			&types.InputRichBlockButtons{
				Type: "buttons",
				Buttons: []types.RichMessageButton{
					{Text: "Open", CallbackData: types.Ptr("open-1"), Style: types.Ptr("danger")},
				},
				Align: types.Ptr("center"),
			},
		},
	}
}

// richPathServer records the exact request path it was called with.
func richPathServer(t *testing.T, wantPath string, result any) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != wantPath {
			t.Errorf("expected path %q, got %q", wantPath, r.URL.Path)
		}
		_ = json.NewEncoder(w).Encode(types.Response[any]{Ok: true, Result: result})
	}))
}

// TestRich_SendRichMessagePath asserts the camelCase wire name and the
// /bot<token>/<method> path shape.
func TestRich_SendRichMessagePath(t *testing.T) {
	srv := richPathServer(t, "/bottok/sendRichMessage", map[string]any{
		"message_id": 7,
		"date":       1702592000,
		"chat":       map[string]any{"id": 123456, "type": "private"},
	})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, err := b.SendRichMessage(context.Background(), &types.SendRichMessageOptions{
		ChatID:      int64(123456),
		RichMessage: richInputMessage(),
	})
	if err != nil {
		t.Fatalf("SendRichMessage error: %v", err)
	}
	if msg == nil || msg.MessageID != 7 || msg.Chat == nil || msg.Chat.ID != 123456 {
		t.Fatalf("unexpected decoded Message: %+v", msg)
	}
}

// TestRich_SendRichMessageDraftPath asserts the draft method's wire name.
func TestRich_SendRichMessageDraftPath(t *testing.T) {
	srv := richPathServer(t, "/bottok/sendRichMessageDraft", true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SendRichMessageDraft(context.Background(), &types.SendRichMessageDraftOptions{
		ChatID:      int64(123456),
		DraftID:     7,
		RichMessage: richInputMessage(),
	})
	if err != nil {
		t.Fatalf("SendRichMessageDraft error: %v", err)
	}
	if !ok {
		t.Errorf("expected the True result to decode as true")
	}
}

// TestRich_SendRichMessageSerializesNestedRichMessage deep-compares the whole
// rich_message object as it arrives on the wire, so a renamed or dropped JSON
// tag in any of the nested RichText/InputRichBlock models fails the test.
func TestRich_SendRichMessageSerializesNestedRichMessage(t *testing.T) {
	srv := profileServer(t, "sendRichMessage", map[string]any{
		"chat_id":                int64(-1001234567890),
		"business_connection_id": "bc-1",
		"rich_message":           richDraftPayload,
		"reply_markup": map[string]any{
			"inline_keyboard": [][]map[string]any{
				{{"text": "Cancel", "callback_data": "cancel"}},
			},
		},
	}, map[string]any{
		"message_id": 7,
		"date":       1702592000,
		"chat":       map[string]any{"id": -1001234567890, "type": "supergroup"},
	})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SendRichMessage(context.Background(), &types.SendRichMessageOptions{
		BusinessConnectionID: "bc-1",
		ChatID:               int64(-1001234567890),
		RichMessage:          richInputMessage(),
		ReplyMarkup: &types.InlineKeyboardMarkup{
			InlineKeyboard: [][]types.InlineKeyboardButton{
				{{Text: "Cancel", CallbackData: "cancel"}},
			},
		},
	}); err != nil {
		t.Fatalf("SendRichMessage error: %v", err)
	}
}

// TestRich_SendRichMessageDraftSerializesRichMessage covers the same nesting on
// the draft path plus the draft-only required keys.
func TestRich_SendRichMessageDraftSerializesRichMessage(t *testing.T) {
	srv := profileServer(t, "sendRichMessageDraft", map[string]any{
		"chat_id":      int64(123456),
		"draft_id":     float64(7),
		"rich_message": richDraftPayload,
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SendRichMessageDraft(context.Background(), &types.SendRichMessageDraftOptions{
		ChatID:      int64(123456),
		DraftID:     7,
		RichMessage: richInputMessage(),
	})
	if err != nil || !ok {
		t.Fatalf("SendRichMessageDraft = (%v, %v)", ok, err)
	}
}

// TestRich_SendRichMessageOmitsUnsetOptionals asserts the six optional scalars,
// the two optional objects and the reply markup stay off the wire when unset —
// the payload must contain only the two required keys.
func TestRich_SendRichMessageOmitsUnsetOptionals(t *testing.T) {
	srv := omittingServer(t, "sendRichMessage",
		[]string{
			"business_connection_id", "message_thread_id", "direct_messages_topic_id",
			"ephemeral_message_parameters", "disable_notification", "protect_content",
			"allow_paid_broadcast", "message_effect_id", "suggested_post_parameters",
			"reply_parameters", "reply_markup",
		},
		map[string]any{"chat_id": int64(123456)},
		map[string]any{"message_id": 7, "date": 1702592000, "chat": map[string]any{"id": 123456, "type": "private"}})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SendRichMessage(context.Background(), &types.SendRichMessageOptions{
		ChatID:      int64(123456),
		RichMessage: types.InputRichMessage{Markdown: types.Ptr("*hello*")},
	}); err != nil {
		t.Fatalf("SendRichMessage error: %v", err)
	}
}

// TestRich_SendRichMessageDraftOmitsUnsetOptionals asserts the same hygiene on
// the draft method, whose optional set is message_thread_id, can_stop and
// keep_on_stop.
func TestRich_SendRichMessageDraftOmitsUnsetOptionals(t *testing.T) {
	srv := omittingServer(t, "sendRichMessageDraft",
		[]string{"message_thread_id", "can_stop", "keep_on_stop"},
		map[string]any{"chat_id": int64(123456), "draft_id": float64(9)},
		true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SendRichMessageDraft(context.Background(), &types.SendRichMessageDraftOptions{
		ChatID:      int64(123456),
		DraftID:     9,
		RichMessage: types.InputRichMessage{HTML: types.Ptr("<p>hi</p>")},
	}); err != nil {
		t.Fatalf("SendRichMessageDraft error: %v", err)
	}
}

// TestRich_EditsSerializeRichMessage asserts the rich_message parameter node
// also carries reaches the wire through both edit paths, and that Text is
// omitted so a rich-only edit does not send an empty text field.
func TestRich_EditsSerializeRichMessage(t *testing.T) {
	srv := omittingServer(t, "editMessageText", []string{"text"}, map[string]any{
		"chat_id":      int64(123456),
		"message_id":   float64(7),
		"rich_message": map[string]any{"markdown": "*hello*"},
	}, map[string]any{"message_id": 7, "date": 1702592000, "chat": map[string]any{"id": 123456, "type": "private"}})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.EditMessageText(context.Background(), &types.EditMessageTextOptions{
		ChatID:      int64(123456),
		MessageID:   7,
		RichMessage: &types.InputRichMessage{Markdown: types.Ptr("*hello*")},
	}); err != nil {
		t.Fatalf("EditMessageText error: %v", err)
	}
}

// TestRich_EditEphemeralMessageTextSerializesRichMessage covers the docs'
// optional rich_message parameter of editEphemeralMessageText, whose Go field is
// now the typed *types.InputRichMessage instead of any.
func TestRich_EditEphemeralMessageTextSerializesRichMessage(t *testing.T) {
	srv := profileServer(t, "editEphemeralMessageText", map[string]any{
		"chat_id":              int64(-1001234567890),
		"receiver_user_id":     float64(123456),
		"ephemeral_message_id": float64(7),
		"rich_message":         richDraftPayload,
	}, map[string]any{"message_id": 7, "date": 1702592000, "chat": map[string]any{"id": -1001234567890, "type": "supergroup"}})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, ok, err := b.EditEphemeralMessageText(context.Background(), &types.EditEphemeralMessageTextOptions{
		ChatID:             int64(-1001234567890),
		ReceiverUserID:     123456,
		EphemeralMessageID: 7,
		RichMessage:        richInputMessagePtr(),
	})
	if err != nil {
		t.Fatalf("EditEphemeralMessageText error: %v", err)
	}
	if msg == nil || ok {
		t.Errorf("expected the Message branch, got (%v, %v)", msg, ok)
	}
}

// TestRich_TelegramErrors asserts both new methods reject with the package's
// typed error instead of a bare Error or a silent false.
func TestRich_TelegramErrors(t *testing.T) {
	srv := telegramErrorServer(400, "Bad Request: RICH_FORMATTING_NOT_SUPPORTED")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ctx := context.Background()

	msg, err := b.SendRichMessage(ctx, &types.SendRichMessageOptions{ChatID: int64(1), RichMessage: types.InputRichMessage{}})
	if msg != nil {
		t.Errorf("SendRichMessage: expected nil Message on error")
	}
	requireTelegramError(t, err, 400)

	ok, err := b.SendRichMessageDraft(ctx, &types.SendRichMessageDraftOptions{ChatID: int64(1), DraftID: 1, RichMessage: types.InputRichMessage{}})
	if ok {
		t.Errorf("SendRichMessageDraft: expected false on error")
	}
	requireTelegramError(t, err, 400)
}
