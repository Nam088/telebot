package bot_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestBot_SendAudio(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/sendAudio") {
			t.Errorf("expected sendAudio endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["chat_id"] != "@channel" {
			t.Errorf("expected chat_id @channel, got %v", payload["chat_id"])
		}
		if payload["audio"] != "audio_file_id" {
			t.Errorf("expected audio file id, got %v", payload["audio"])
		}
		if payload["caption"] != "song" {
			t.Errorf("expected caption song, got %v", payload["caption"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{
			Ok:     true,
			Result: types.Message{MessageID: 1},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	msg, err := b.SendAudio(context.Background(), &types.SendAudioOptions{
		ChatID:  "@channel",
		Audio:   "audio_file_id",
		Caption: "song",
	})
	if err != nil {
		t.Fatalf("SendAudio failed: %v", err)
	}
	if msg.MessageID != 1 {
		t.Errorf("expected message id 1, got %d", msg.MessageID)
	}
}

func TestBot_SendVideo(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/sendVideo") {
			t.Errorf("expected sendVideo endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["chat_id"] != float64(123) {
			t.Errorf("expected chat_id 123, got %v", payload["chat_id"])
		}
		if payload["video"] != "video_file_id" {
			t.Errorf("expected video file id, got %v", payload["video"])
		}
		if payload["width"] != float64(1920) {
			t.Errorf("expected width 1920, got %v", payload["width"])
		}
		if payload["supports_streaming"] != true {
			t.Errorf("expected supports_streaming true, got %v", payload["supports_streaming"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{
			Ok:     true,
			Result: types.Message{MessageID: 2},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	msg, err := b.SendVideo(context.Background(), &types.SendVideoOptions{
		ChatID:            123,
		Video:             "video_file_id",
		Width:             1920,
		Height:            1080,
		SupportsStreaming: true,
	})
	if err != nil {
		t.Fatalf("SendVideo failed: %v", err)
	}
	if msg.MessageID != 2 {
		t.Errorf("expected message id 2, got %d", msg.MessageID)
	}
}

func TestBot_SendAnimation(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/sendAnimation") {
			t.Errorf("expected sendAnimation endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["animation"] != "anim_file_id" {
			t.Errorf("expected animation file id, got %v", payload["animation"])
		}
		if payload["has_spoiler"] != true {
			t.Errorf("expected has_spoiler true, got %v", payload["has_spoiler"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{
			Ok:     true,
			Result: types.Message{MessageID: 3},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	msg, err := b.SendAnimation(context.Background(), &types.SendAnimationOptions{
		ChatID:     123,
		Animation:  "anim_file_id",
		HasSpoiler: true,
	})
	if err != nil {
		t.Fatalf("SendAnimation failed: %v", err)
	}
	if msg.MessageID != 3 {
		t.Errorf("expected message id 3, got %d", msg.MessageID)
	}
}

func TestBot_SendVoice(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/sendVoice") {
			t.Errorf("expected sendVoice endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["voice"] != "voice_file_id" {
			t.Errorf("expected voice file id, got %v", payload["voice"])
		}
		if payload["duration"] != float64(10) {
			t.Errorf("expected duration 10, got %v", payload["duration"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{
			Ok:     true,
			Result: types.Message{MessageID: 4},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	msg, err := b.SendVoice(context.Background(), &types.SendVoiceOptions{
		ChatID:   123,
		Voice:    "voice_file_id",
		Duration: 10,
	})
	if err != nil {
		t.Fatalf("SendVoice failed: %v", err)
	}
	if msg.MessageID != 4 {
		t.Errorf("expected message id 4, got %d", msg.MessageID)
	}
}

func TestBot_SendVideoNote(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/sendVideoNote") {
			t.Errorf("expected sendVideoNote endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["video_note"] != "vn_file_id" {
			t.Errorf("expected video_note file id, got %v", payload["video_note"])
		}
		if payload["length"] != float64(240) {
			t.Errorf("expected length 240, got %v", payload["length"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{
			Ok:     true,
			Result: types.Message{MessageID: 5},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	msg, err := b.SendVideoNote(context.Background(), &types.SendVideoNoteOptions{
		ChatID:    123,
		VideoNote: "vn_file_id",
		Length:    240,
	})
	if err != nil {
		t.Fatalf("SendVideoNote failed: %v", err)
	}
	if msg.MessageID != 5 {
		t.Errorf("expected message id 5, got %d", msg.MessageID)
	}
}

func TestBot_SendLocation(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/sendLocation") {
			t.Errorf("expected sendLocation endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["latitude"] != 40.7 {
			t.Errorf("expected latitude 40.7, got %v", payload["latitude"])
		}
		if payload["longitude"] != -74.0 {
			t.Errorf("expected longitude -74.0, got %v", payload["longitude"])
		}
		if payload["live_period"] != float64(60) {
			t.Errorf("expected live_period 60, got %v", payload["live_period"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{
			Ok:     true,
			Result: types.Message{MessageID: 6},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	msg, err := b.SendLocation(context.Background(), &types.SendLocationOptions{
		ChatID:     123,
		Latitude:   40.7,
		Longitude:  -74.0,
		LivePeriod: 60,
	})
	if err != nil {
		t.Fatalf("SendLocation failed: %v", err)
	}
	if msg.MessageID != 6 {
		t.Errorf("expected message id 6, got %d", msg.MessageID)
	}
}

func TestBot_SendVenue(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/sendVenue") {
			t.Errorf("expected sendVenue endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["title"] != "Cafe" {
			t.Errorf("expected title Cafe, got %v", payload["title"])
		}
		if payload["address"] != "1 Main St" {
			t.Errorf("expected address, got %v", payload["address"])
		}
		if payload["foursquare_id"] != "4sq" {
			t.Errorf("expected foursquare_id, got %v", payload["foursquare_id"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{
			Ok:     true,
			Result: types.Message{MessageID: 7},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	msg, err := b.SendVenue(context.Background(), &types.SendVenueOptions{
		ChatID:       123,
		Latitude:     40.7,
		Longitude:    -74.0,
		Title:        "Cafe",
		Address:      "1 Main St",
		FoursquareID: "4sq",
	})
	if err != nil {
		t.Fatalf("SendVenue failed: %v", err)
	}
	if msg.MessageID != 7 {
		t.Errorf("expected message id 7, got %d", msg.MessageID)
	}
}

func TestBot_SendContact(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/sendContact") {
			t.Errorf("expected sendContact endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["phone_number"] != "+123" {
			t.Errorf("expected phone_number +123, got %v", payload["phone_number"])
		}
		if payload["first_name"] != "Alice" {
			t.Errorf("expected first_name Alice, got %v", payload["first_name"])
		}
		if payload["last_name"] != "Smith" {
			t.Errorf("expected last_name Smith, got %v", payload["last_name"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{
			Ok:     true,
			Result: types.Message{MessageID: 8},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	msg, err := b.SendContact(context.Background(), &types.SendContactOptions{
		ChatID:      123,
		PhoneNumber: "+123",
		FirstName:   "Alice",
		LastName:    "Smith",
	})
	if err != nil {
		t.Fatalf("SendContact failed: %v", err)
	}
	if msg.MessageID != 8 {
		t.Errorf("expected message id 8, got %d", msg.MessageID)
	}
}

func TestBot_SendPoll(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/sendPoll") {
			t.Errorf("expected sendPoll endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["question"] != "Q?" {
			t.Errorf("expected question Q?, got %v", payload["question"])
		}
		options, ok := payload["options"].([]any)
		if !ok || len(options) != 2 {
			t.Errorf("expected 2 poll options, got %v", payload["options"])
		}
		// IsAnonymous is a plain bool with omitempty, so a false value is
		// omitted from the payload rather than serialized as false.
		if _, present := payload["is_anonymous"]; present {
			t.Errorf("expected is_anonymous to be omitted when false, got %v", payload["is_anonymous"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{
			Ok:     true,
			Result: types.Message{MessageID: 9},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	msg, err := b.SendPoll(context.Background(), &types.SendPollOptions{
		ChatID:      123,
		Question:    "Q?",
		Options:     []types.InputPollOption{{Text: "A"}, {Text: "B"}},
		IsAnonymous: false,
	})
	if err != nil {
		t.Fatalf("SendPoll failed: %v", err)
	}
	if msg.MessageID != 9 {
		t.Errorf("expected message id 9, got %d", msg.MessageID)
	}
}

func TestBot_SendDice(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/sendDice") {
			t.Errorf("expected sendDice endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		if payload["emoji"] != "🎲" {
			t.Errorf("expected emoji dice, got %v", payload["emoji"])
		}

		_ = json.NewEncoder(w).Encode(types.Response[types.Message]{
			Ok:     true,
			Result: types.Message{MessageID: 10},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	msg, err := b.SendDice(context.Background(), &types.SendDiceOptions{
		ChatID: 123,
		Emoji:  "🎲",
	})
	if err != nil {
		t.Fatalf("SendDice failed: %v", err)
	}
	if msg.MessageID != 10 {
		t.Errorf("expected message id 10, got %d", msg.MessageID)
	}
}

func TestBot_SendMediaGroup(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/sendMediaGroup") {
			t.Errorf("expected sendMediaGroup endpoint, got %s", r.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("decode payload: %v", err)
		}
		media, ok := payload["media"].([]any)
		if !ok || len(media) != 2 {
			t.Fatalf("expected 2 media items, got %v", payload["media"])
		}
		first, ok := media[0].(map[string]any)
		if !ok || first["type"] != "photo" || first["media"] != "photo_id" {
			t.Errorf("unexpected first media item: %v", first)
		}
		second, ok := media[1].(map[string]any)
		if !ok || second["type"] != "video" || second["media"] != "video_id" {
			t.Errorf("unexpected second media item: %v", second)
		}

		_ = json.NewEncoder(w).Encode(types.Response[[]types.Message]{
			Ok:     true,
			Result: []types.Message{{MessageID: 11}, {MessageID: 12}},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	msgs, err := b.SendMediaGroup(context.Background(), &types.SendMediaGroupOptions{
		ChatID: 123,
		Media: []types.InputMedia{
			types.InputMediaPhoto{Type: "photo", Media: "photo_id"},
			types.InputMediaVideo{Type: "video", Media: "video_id"},
		},
	})
	if err != nil {
		t.Fatalf("SendMediaGroup failed: %v", err)
	}
	if len(msgs) != 2 || msgs[0].MessageID != 11 || msgs[1].MessageID != 12 {
		t.Errorf("unexpected messages: %v", msgs)
	}
}

func TestBot_SendVideo_TelegramErrorWithRetryAfter(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   429,
			Description: "Too Many Requests",
			Parameters:  &types.Parameters{RetryAfter: 42},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	_, err := b.SendVideo(context.Background(), &types.SendVideoOptions{
		ChatID: 123,
		Video:  "video_id",
	})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	te, ok := err.(*types.TelegramError)
	if !ok {
		t.Fatalf("expected *types.TelegramError, got %T", err)
	}
	if te.ErrorCode != 429 {
		t.Errorf("expected error code 429, got %d", te.ErrorCode)
	}
	if te.Parameters == nil || te.Parameters.RetryAfter != 42 {
		t.Errorf("expected retry_after 42, got %v", te.Parameters)
	}
}
