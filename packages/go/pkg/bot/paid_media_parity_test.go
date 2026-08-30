package bot_test

import (
	"context"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestPaidMedia_SendPaidMedia covers sendPaidMedia ported from
// packages/node/src/client/methods/messages/send-media.ts: node passes the
// caller's record straight through, so the snake_case keys must reach the wire
// untouched and the Message result must decode.
func TestPaidMedia_SendPaidMedia(t *testing.T) {
	srv := profileServer(t, "sendPaidMedia", map[string]any{
		"chat_id":              int64(123456),
		"star_count":           50,
		"media":                []map[string]any{{"type": "photo", "id": "AGACQADTAAQCAAFY"}},
		"paid_media_payload":   "premium_content",
		"caption":              "Behind the scenes",
		"parse_mode":           "Markdown",
		"disable_notification": true,
	}, types.Message{MessageID: 55, Chat: &types.Chat{ID: 123456}, Text: "Behind the scenes"})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, err := b.SendPaidMedia(context.Background(), map[string]any{
		"chat_id":              int64(123456),
		"star_count":           50,
		"media":                []map[string]any{{"type": "photo", "id": "AGACQADTAAQCAAFY"}},
		"paid_media_payload":   "premium_content",
		"caption":              "Behind the scenes",
		"parse_mode":           "Markdown",
		"disable_notification": true,
	})
	if err != nil {
		t.Fatalf("SendPaidMedia error: %v", err)
	}
	if msg.MessageID != 55 || msg.Chat == nil || msg.Chat.ID != 123456 {
		t.Errorf("unexpected message: %+v", msg)
	}
	if msg.Text != "Behind the scenes" {
		t.Errorf("unexpected text: %q", msg.Text)
	}
}

// TestPaidMedia_SendPaidMediaEmptyPayload asserts nil options still sends a
// JSON object body instead of the parameterless request shape.
func TestPaidMedia_SendPaidMediaEmptyPayload(t *testing.T) {
	srv := emptyObjectServer(t, "sendPaidMedia", types.Message{MessageID: 1, Chat: &types.Chat{ID: 1}})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SendPaidMedia(context.Background(), nil); err != nil {
		t.Fatalf("SendPaidMedia error: %v", err)
	}
}

// TestPaidMedia_SendLivePhoto covers sendLivePhoto with node's full
// SendLivePhotoOptions field set, including the ephemeral parameters object.
func TestPaidMedia_SendLivePhoto(t *testing.T) {
	srv := profileServer(t, "sendLivePhoto", map[string]any{
		"business_connection_id":       "bc1",
		"chat_id":                      int64(123456),
		"photo":                        "AGACQADTAAQCAAFYAQACAgADAgAC8gU0AAQD",
		"video":                        "BAACAgADAgAC8gU0AxAAGoJtV5",
		"caption":                      "Sunset",
		"parse_mode":                   "HTML",
		"caption_entities":             []map[string]any{{"offset": 0, "length": 6, "type": "bold"}},
		"show_caption_above_media":     true,
		"has_spoiler":                  true,
		"disable_notification":         true,
		"protect_content":              true,
		"message_effect_id":            "5368323575420792074",
		"reply_parameters":             map[string]any{"chat_id": float64(123456), "message_id": float64(7)},
		"message_thread_id":            int64(3),
		"ephemeral_message_parameters": map[string]any{"receiver_user_id": float64(654321), "callback_query_id": "cq1", "replace_callback_query_message": true},
	}, types.Message{MessageID: 61, Chat: &types.Chat{ID: 123456}, Caption: "Sunset"})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, err := b.SendLivePhoto(context.Background(), &types.SendLivePhotoOptions{
		BusinessConnectionID:  "bc1",
		ChatID:                int64(123456),
		Photo:                 "AGACQADTAAQCAAFYAQACAgADAgAC8gU0AAQD",
		Video:                 "BAACAgADAgAC8gU0AxAAGoJtV5",
		Caption:               "Sunset",
		ParseMode:             "HTML",
		CaptionEntities:       []types.MessageEntity{{Offset: 0, Length: 6, Type: "bold"}},
		ShowCaptionAboveMedia: true,
		HasSpoiler:            true,
		DisableNotification:   true,
		ProtectContent:        true,
		MessageEffectID:       "5368323575420792074",
		ReplyParameters:       &types.ReplyParameters{ChatID: 123456, MessageID: 7},
		MessageThreadID:       3,
		EphemeralMessageParameters: &types.EphemeralMessageParameters{
			ReceiverUserID:              654321,
			CallbackQueryID:             "cq1",
			ReplaceCallbackQueryMessage: true,
		},
	})
	if err != nil {
		t.Fatalf("SendLivePhoto error: %v", err)
	}
	if msg.MessageID != 61 || msg.Caption != "Sunset" {
		t.Errorf("unexpected message: %+v", msg)
	}
}

// TestPaidMedia_SendLivePhotoOmitsOptionalFields asserts only the required
// chat_id/photo/video triple is serialized for a minimal call.
func TestPaidMedia_SendLivePhotoOmitsOptionalFields(t *testing.T) {
	srv := omittingServer(t, "sendLivePhoto",
		[]string{
			"caption", "parse_mode", "caption_entities", "show_caption_above_media",
			"has_spoiler", "disable_notification", "protect_content", "message_effect_id",
			"reply_parameters", "reply_markup", "business_connection_id", "message_thread_id",
			"ephemeral_message_parameters",
		},
		map[string]any{
			"chat_id": int64(123456),
			"photo":   "PHOTO_ID",
			"video":   "VIDEO_ID",
		}, types.Message{MessageID: 62, Chat: &types.Chat{ID: 123456}})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SendLivePhoto(context.Background(), &types.SendLivePhotoOptions{
		ChatID: int64(123456),
		Photo:  "PHOTO_ID",
		Video:  "VIDEO_ID",
	}); err != nil {
		t.Fatalf("SendLivePhoto error: %v", err)
	}
}

// TestPaidMedia_TelegramError asserts both paid media methods reject with a
// typed Telegram error.
func TestPaidMedia_TelegramError(t *testing.T) {
	srv := telegramErrorServer(400, "Bad Request: PAID_MEDIA_PAY_REQUIRED")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if msg, err := b.SendPaidMedia(context.Background(), map[string]any{"chat_id": int64(1)}); msg != nil {
		t.Errorf("expected nil message on error, got %+v", msg)
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.SendLivePhoto(context.Background(), &types.SendLivePhotoOptions{
		ChatID: int64(1),
		Photo:  "p",
		Video:  "v",
	}); err == nil {
		t.Errorf("expected sendLivePhoto to reject")
	}
}
