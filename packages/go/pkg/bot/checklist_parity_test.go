package bot_test

import (
	"context"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestChecklist_SendChecklist covers sendChecklist ported from
// packages/node/src/client/methods/messages/edit.ts, where the checklist object
// node types as a record must reach the wire with its nested snake_case keys.
func TestChecklist_SendChecklist(t *testing.T) {
	srv := profileServer(t, "sendChecklist", map[string]any{
		"chat_id": int64(123456),
		"checklist": map[string]any{
			"items": []map[string]any{
				{"id": "i1", "text": "Pack the bag"},
				{"id": "i2", "text": "Check in"},
			},
			"max_selected_count": float64(1),
		},
		"need_until_everyone_checked": true,
	}, types.Message{MessageID: 71, Chat: &types.Chat{ID: 123456}})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, err := b.SendChecklist(context.Background(), map[string]any{
		"chat_id": int64(123456),
		"checklist": map[string]any{
			"items": []map[string]any{
				{"id": "i1", "text": "Pack the bag"},
				{"id": "i2", "text": "Check in"},
			},
			"max_selected_count": 1,
		},
		"need_until_everyone_checked": true,
	})
	if err != nil {
		t.Fatalf("SendChecklist error: %v", err)
	}
	if msg.MessageID != 71 || msg.Chat == nil || msg.Chat.ID != 123456 {
		t.Errorf("unexpected message: %+v", msg)
	}
}

// TestChecklist_SendChecklistEmptyPayload asserts nil options sends an empty
// JSON object body rather than no body at all.
func TestChecklist_SendChecklistEmptyPayload(t *testing.T) {
	srv := emptyObjectServer(t, "sendChecklist", types.Message{MessageID: 1, Chat: &types.Chat{ID: 1}})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SendChecklist(context.Background(), nil); err != nil {
		t.Fatalf("SendChecklist error: %v", err)
	}
}

// TestChecklist_EditMessageChecklist splits node's `Message | boolean` union:
// an echoed Message decodes into the first result, a bare true into the second.
func TestChecklist_EditMessageChecklist(t *testing.T) {
	wantPayload := map[string]any{
		"chat_id":    int64(123456),
		"message_id": int64(71),
		"checklist": map[string]any{
			"items": []map[string]any{{"id": "i1", "text": "Pack the bag", "is_selected": true}},
		},
	}

	t.Run("MessageResult", func(t *testing.T) {
		srv := profileServer(t, "editMessageChecklist", wantPayload,
			types.Message{MessageID: 71, Chat: &types.Chat{ID: 123456}})
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		msg, ok, err := b.EditMessageChecklist(context.Background(), wantPayload)
		if err != nil {
			t.Fatalf("EditMessageChecklist error: %v", err)
		}
		if ok {
			t.Errorf("expected the boolean arm to be false for a Message result")
		}
		if msg == nil || msg.MessageID != 71 {
			t.Fatalf("expected edited message, got %+v", msg)
		}
	})

	t.Run("BooleanResult", func(t *testing.T) {
		srv := profileServer(t, "editMessageChecklist", wantPayload, true)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		msg, ok, err := b.EditMessageChecklist(context.Background(), wantPayload)
		if err != nil {
			t.Fatalf("EditMessageChecklist error: %v", err)
		}
		if !ok {
			t.Errorf("expected the boolean arm to be true")
		}
		if msg != nil {
			t.Errorf("expected nil message for a boolean result, got %+v", msg)
		}
	})
}

// TestDraft_SendMessageDraft covers sendMessageDraft with node's full
// SendMessageDraftOptions field set.
func TestDraft_SendMessageDraft(t *testing.T) {
	srv := profileServer(t, "sendMessageDraft", map[string]any{
		"chat_id":           int64(123456),
		"draft_id":          int64(7),
		"message_thread_id": float64(3),
		"text":              "Final answer",
		"parse_mode":        "MarkdownV2",
		"entities":          []map[string]any{{"offset": 0, "length": 5, "type": "bold"}},
		"can_stop":          true,
		"keep_on_stop":      true,
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SendMessageDraft(context.Background(), &types.SendMessageDraftOptions{
		ChatID:          int64(123456),
		DraftID:         7,
		MessageThreadID: 3,
		Text:            "Final answer",
		ParseMode:       "MarkdownV2",
		Entities:        []types.MessageEntity{{Offset: 0, Length: 5, Type: "bold"}},
		CanStop:         true,
		KeepOnStop:      true,
	})
	if err != nil || !ok {
		t.Fatalf("SendMessageDraft = (%v, %v)", ok, err)
	}
}

// TestDraft_SendMessageDraftOmitsOptionalFields asserts the required chat_id
// and draft_id pair is sent alone for a minimal call, matching node where every
// other field is optional.
func TestDraft_SendMessageDraftOmitsOptionalFields(t *testing.T) {
	srv := omittingServer(t, "sendMessageDraft",
		[]string{"message_thread_id", "text", "parse_mode", "entities", "can_stop", "keep_on_stop"},
		map[string]any{"chat_id": int64(123456), "draft_id": int64(7)}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SendMessageDraft(context.Background(), &types.SendMessageDraftOptions{
		ChatID:  int64(123456),
		DraftID: 7,
	}); err != nil {
		t.Fatalf("SendMessageDraft error: %v", err)
	}
}

// TestChecklist_TelegramError asserts the checklist and draft methods reject
// with a typed Telegram error.
func TestChecklist_TelegramError(t *testing.T) {
	srv := telegramErrorServer(400, "Bad Request: CHECKLIST_IDENTIFIER_INVALID")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if msg, err := b.SendChecklist(context.Background(), map[string]any{"chat_id": int64(1)}); msg != nil {
		t.Errorf("expected nil message on error, got %+v", msg)
	} else {
		requireTelegramError(t, err, 400)
	}
	if msg, ok, err := b.EditMessageChecklist(context.Background(), map[string]any{"chat_id": int64(1)}); msg != nil || ok {
		t.Errorf("expected empty result on error, got (%+v, %v)", msg, ok)
	} else {
		requireTelegramError(t, err, 400)
	}
	if ok, err := b.SendMessageDraft(context.Background(), &types.SendMessageDraftOptions{ChatID: int64(1), DraftID: 7}); ok {
		t.Errorf("expected false on error")
	} else {
		requireTelegramError(t, err, 400)
	}
}
