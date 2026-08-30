package bot_test

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestBot_MessageMethods_OptionalParams verifies that the Bot API 10.3
// optional params reach the wire when set and stay omitted at zero values.
func TestBot_MessageMethods_OptionalParams(t *testing.T) {
	var payload map[string]any
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		payload = map[string]any{}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Errorf("decode payload: %v", err)
		}
		result := `{"message_id":30}`
		if strings.HasSuffix(r.URL.Path, "/sendChatAction") {
			result = `true`
		}
		fmt.Fprintf(w, `{"ok":true,"result":%s}`, result)
	}))
	defer server.Close()
	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	ctx := context.Background()

	_, err := b.SendPhoto(ctx, &types.SendPhotoOptions{
		ChatID:                     int64(1),
		Photo:                      "photo_id",
		Caption:                    "cap",
		MessageThreadID:            4,
		DirectMessagesTopicID:      7,
		EphemeralMessageParameters: &types.EphemeralMessageParameters{ReceiverUserID: 9},
		ParseMode:                  "HTML",
		CaptionEntities:            []types.MessageEntity{{Type: "bold", Offset: 0, Length: 3}},
		ShowCaptionAboveMedia:      true,
		HasSpoiler:                 true,
		DisableNotification:        true,
		ProtectContent:             true,
		AllowPaidBroadcast:         true,
		MessageEffectID:            "effect-1",
		SuggestedPostParameters:    &types.SuggestedPostParameters{SendDate: 1700000000},
		BusinessConnectionID:       "bc-1",
		ReplyParameters:            &types.ReplyParameters{MessageID: types.Ptr(int64(21))},
		ReplyMarkup: &types.InlineKeyboardMarkup{
			InlineKeyboard: [][]types.InlineKeyboardButton{{{Text: "btn", CallbackData: "d"}}},
		},
	})
	if err != nil {
		t.Fatalf("SendPhoto with optional params = %v", err)
	}
	if payload["message_thread_id"] != float64(4) {
		t.Errorf("message_thread_id = %v", payload["message_thread_id"])
	}
	if payload["direct_messages_topic_id"] != float64(7) {
		t.Errorf("direct_messages_topic_id = %v", payload["direct_messages_topic_id"])
	}
	if payload["parse_mode"] != "HTML" {
		t.Errorf("parse_mode = %v", payload["parse_mode"])
	}
	if _, ok := payload["caption_entities"].([]any); !ok {
		t.Errorf("caption_entities = %v", payload["caption_entities"])
	}
	if payload["show_caption_above_media"] != true {
		t.Errorf("show_caption_above_media = %v", payload["show_caption_above_media"])
	}
	if payload["has_spoiler"] != true {
		t.Errorf("has_spoiler = %v", payload["has_spoiler"])
	}
	if payload["disable_notification"] != true {
		t.Errorf("disable_notification = %v", payload["disable_notification"])
	}
	if payload["protect_content"] != true {
		t.Errorf("protect_content = %v", payload["protect_content"])
	}
	if payload["allow_paid_broadcast"] != true {
		t.Errorf("allow_paid_broadcast = %v", payload["allow_paid_broadcast"])
	}
	if payload["message_effect_id"] != "effect-1" {
		t.Errorf("message_effect_id = %v", payload["message_effect_id"])
	}
	if payload["business_connection_id"] != "bc-1" {
		t.Errorf("business_connection_id = %v", payload["business_connection_id"])
	}
	if _, ok := payload["ephemeral_message_parameters"].(map[string]any); !ok {
		t.Errorf("ephemeral_message_parameters = %v", payload["ephemeral_message_parameters"])
	}
	if _, ok := payload["suggested_post_parameters"].(map[string]any); !ok {
		t.Errorf("suggested_post_parameters = %v", payload["suggested_post_parameters"])
	}
	if _, ok := payload["reply_parameters"].(map[string]any); !ok {
		t.Errorf("reply_parameters = %v", payload["reply_parameters"])
	}
	if _, ok := payload["reply_markup"].(map[string]any); !ok {
		t.Errorf("reply_markup = %v", payload["reply_markup"])
	}

	// Every documented sendDocument optional reaches the wire when set.
	if _, err := b.SendDocument(ctx, &types.SendDocumentOptions{
		ChatID:                      int64(1),
		Document:                    "doc_id",
		Caption:                     "cap",
		MessageThreadID:             5,
		DirectMessagesTopicID:       6,
		EphemeralMessageParameters:  &types.EphemeralMessageParameters{ReceiverUserID: 9},
		Thumbnail:                   "thumb_id",
		ParseMode:                   "MarkdownV2",
		CaptionEntities:             []types.MessageEntity{{Type: "italic", Offset: 0, Length: 3}},
		DisableContentTypeDetection: true,
		DisableNotification:         true,
		ProtectContent:              true,
		AllowPaidBroadcast:          true,
		MessageEffectID:             "effect-5",
		SuggestedPostParameters:     &types.SuggestedPostParameters{SendDate: 1700000000},
		BusinessConnectionID:        "bc-3",
		ReplyParameters:             &types.ReplyParameters{MessageID: types.Ptr(int64(22))},
		ReplyMarkup:                 &types.InlineKeyboardMarkup{},
	}); err != nil {
		t.Fatalf("SendDocument with optional params = %v", err)
	}
	if payload["thumbnail"] != "thumb_id" {
		t.Errorf("sendDocument thumbnail = %v", payload["thumbnail"])
	}
	if payload["disable_content_type_detection"] != true {
		t.Errorf("sendDocument disable_content_type_detection = %v", payload["disable_content_type_detection"])
	}
	if payload["parse_mode"] != "MarkdownV2" {
		t.Errorf("sendDocument parse_mode = %v", payload["parse_mode"])
	}
	if payload["message_thread_id"] != float64(5) {
		t.Errorf("sendDocument message_thread_id = %v", payload["message_thread_id"])
	}
	if _, ok := payload["reply_markup"].(map[string]any); !ok {
		t.Errorf("sendDocument reply_markup = %v", payload["reply_markup"])
	}

	// Zero values must stay omitted on the wire.
	if _, err := b.SendDocument(ctx, &types.SendDocumentOptions{ChatID: int64(1), Document: "doc_id"}); err != nil {
		t.Fatalf("SendDocument minimal = %v", err)
	}
	for _, key := range []string{"message_thread_id", "direct_messages_topic_id", "ephemeral_message_parameters", "thumbnail", "caption", "parse_mode", "caption_entities", "disable_content_type_detection", "disable_notification", "protect_content", "allow_paid_broadcast", "message_effect_id", "suggested_post_parameters", "business_connection_id", "reply_parameters", "reply_markup"} {
		if _, present := payload[key]; present {
			t.Errorf("expected %s to be omitted at zero value, got %v", key, payload[key])
		}
	}

	// Zero-valued sendPhoto optionals must stay omitted as well.
	if _, err := b.SendPhoto(ctx, &types.SendPhotoOptions{ChatID: int64(1), Photo: "photo_id"}); err != nil {
		t.Fatalf("SendPhoto minimal = %v", err)
	}
	for _, key := range []string{"message_thread_id", "direct_messages_topic_id", "caption", "parse_mode", "caption_entities", "show_caption_above_media", "has_spoiler", "disable_notification", "protect_content", "reply_parameters", "reply_markup"} {
		if _, present := payload[key]; present {
			t.Errorf("expected %s to be omitted at zero value, got %v", key, payload[key])
		}
	}

	if _, err := b.ForwardMessage(ctx, int64(1), int64(2), 14, 8, "effect-2", &types.SuggestedPostParameters{SendDate: 1700000000}); err != nil {
		t.Fatalf("ForwardMessage with optional params = %v", err)
	}
	if payload["direct_messages_topic_id"] != float64(8) {
		t.Errorf("forwardMessage direct_messages_topic_id = %v", payload["direct_messages_topic_id"])
	}
	if payload["message_effect_id"] != "effect-2" {
		t.Errorf("forwardMessage message_effect_id = %v", payload["message_effect_id"])
	}

	if _, err := b.CopyMessage(ctx, &types.CopyMessageOptions{
		ChatID:                  int64(1),
		FromChatID:              int64(2),
		MessageID:               14,
		MessageThreadID:         9,
		DirectMessagesTopicID:   10,
		VideoStartTimestamp:     30,
		Caption:                 "copied",
		ParseMode:               "HTML",
		CaptionEntities:         []types.MessageEntity{{Type: "bold", Offset: 0, Length: 6}},
		ShowCaptionAboveMedia:   true,
		DisableNotification:     true,
		ProtectContent:          true,
		AllowPaidBroadcast:      true,
		MessageEffectID:         "effect-3",
		SuggestedPostParameters: &types.SuggestedPostParameters{SendDate: 1700000000},
		ReplyParameters:         &types.ReplyParameters{MessageID: types.Ptr(int64(23))},
		ReplyMarkup:             &types.InlineKeyboardMarkup{},
	}); err != nil {
		t.Fatalf("CopyMessage with optional params = %v", err)
	}
	if payload["message_thread_id"] != float64(9) {
		t.Errorf("copyMessage message_thread_id = %v", payload["message_thread_id"])
	}
	if payload["direct_messages_topic_id"] != float64(10) {
		t.Errorf("copyMessage direct_messages_topic_id = %v", payload["direct_messages_topic_id"])
	}
	if payload["video_start_timestamp"] != float64(30) {
		t.Errorf("copyMessage video_start_timestamp = %v", payload["video_start_timestamp"])
	}
	if payload["caption"] != "copied" {
		t.Errorf("copyMessage caption = %v", payload["caption"])
	}
	if payload["parse_mode"] != "HTML" {
		t.Errorf("copyMessage parse_mode = %v", payload["parse_mode"])
	}
	if _, ok := payload["caption_entities"].([]any); !ok {
		t.Errorf("copyMessage caption_entities = %v", payload["caption_entities"])
	}
	if payload["show_caption_above_media"] != true {
		t.Errorf("copyMessage show_caption_above_media = %v", payload["show_caption_above_media"])
	}
	if payload["disable_notification"] != true {
		t.Errorf("copyMessage disable_notification = %v", payload["disable_notification"])
	}
	if payload["protect_content"] != true {
		t.Errorf("copyMessage protect_content = %v", payload["protect_content"])
	}
	if payload["allow_paid_broadcast"] != true {
		t.Errorf("copyMessage allow_paid_broadcast = %v", payload["allow_paid_broadcast"])
	}
	if payload["message_effect_id"] != "effect-3" {
		t.Errorf("copyMessage message_effect_id = %v", payload["message_effect_id"])
	}
	if _, ok := payload["reply_parameters"].(map[string]any); !ok {
		t.Errorf("copyMessage reply_parameters = %v", payload["reply_parameters"])
	}
	if _, ok := payload["reply_markup"].(map[string]any); !ok {
		t.Errorf("copyMessage reply_markup = %v", payload["reply_markup"])
	}

	// Zero-valued copyMessage optionals must stay omitted as well.
	if _, err := b.CopyMessage(ctx, &types.CopyMessageOptions{ChatID: int64(1), FromChatID: int64(2), MessageID: 14}); err != nil {
		t.Fatalf("CopyMessage minimal = %v", err)
	}
	for _, key := range []string{"message_thread_id", "direct_messages_topic_id", "video_start_timestamp", "caption", "parse_mode", "caption_entities", "show_caption_above_media", "disable_notification", "protect_content", "allow_paid_broadcast", "message_effect_id", "suggested_post_parameters", "reply_parameters", "reply_markup"} {
		if _, present := payload[key]; present {
			t.Errorf("expected copyMessage %s to be omitted at zero value, got %v", key, payload[key])
		}
	}

	if _, err := b.SendChatAction(ctx, int64(1), "typing", "bc-2"); err != nil {
		t.Fatalf("SendChatAction with optional params = %v", err)
	}
	if payload["business_connection_id"] != "bc-2" {
		t.Errorf("sendChatAction business_connection_id = %v", payload["business_connection_id"])
	}

	// Options-struct path: SendMessageOptions carries the same fields.
	if _, err := b.SendMessage(ctx, &types.SendMessageOptions{
		ChatID:                     int64(1),
		Text:                       "hi",
		DirectMessagesTopicID:      3,
		AllowPaidBroadcast:         true,
		MessageEffectID:            "effect-4",
		SuggestedPostParameters:    &types.SuggestedPostParameters{SendDate: 1700000000},
		EphemeralMessageParameters: &types.EphemeralMessageParameters{ReceiverUserID: 9},
	}); err != nil {
		t.Fatalf("SendMessage with optional params = %v", err)
	}
	if payload["direct_messages_topic_id"] != float64(3) {
		t.Errorf("sendMessage direct_messages_topic_id = %v", payload["direct_messages_topic_id"])
	}
	if payload["allow_paid_broadcast"] != true {
		t.Errorf("sendMessage allow_paid_broadcast = %v", payload["allow_paid_broadcast"])
	}
	if payload["message_effect_id"] != "effect-4" {
		t.Errorf("sendMessage message_effect_id = %v", payload["message_effect_id"])
	}
	if _, ok := payload["suggested_post_parameters"].(map[string]any); !ok {
		t.Errorf("sendMessage suggested_post_parameters = %v", payload["suggested_post_parameters"])
	}
	if _, ok := payload["ephemeral_message_parameters"].(map[string]any); !ok {
		t.Errorf("sendMessage ephemeral_message_parameters = %v", payload["ephemeral_message_parameters"])
	}
}
