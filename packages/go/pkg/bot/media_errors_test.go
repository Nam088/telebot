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

// TestMediaMethods_TelegramError exercises the error branch of every media
// send method by pointing the client at a server that answers with a
// Telegram API error envelope.
func TestMediaMethods_TelegramError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   400,
			Description: "Bad Request: chat not found",
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ctx := context.Background()

	tests := []struct {
		name string
		call func() error
	}{
		{"SendAudio", func() error {
			_, err := b.SendAudio(ctx, &types.SendAudioOptions{ChatID: int64(1), Audio: "a"})
			return err
		}},
		{"SendVideo", func() error {
			_, err := b.SendVideo(ctx, &types.SendVideoOptions{ChatID: int64(1), Video: "v"})
			return err
		}},
		{"SendAnimation", func() error {
			_, err := b.SendAnimation(ctx, &types.SendAnimationOptions{ChatID: int64(1), Animation: "g"})
			return err
		}},
		{"SendVoice", func() error {
			_, err := b.SendVoice(ctx, &types.SendVoiceOptions{ChatID: int64(1), Voice: "o"})
			return err
		}},
		{"SendVideoNote", func() error {
			_, err := b.SendVideoNote(ctx, &types.SendVideoNoteOptions{ChatID: int64(1), VideoNote: "n"})
			return err
		}},
		{"SendLocation", func() error {
			_, err := b.SendLocation(ctx, &types.SendLocationOptions{ChatID: int64(1), Latitude: 1, Longitude: 2})
			return err
		}},
		{"SendVenue", func() error {
			_, err := b.SendVenue(ctx, &types.SendVenueOptions{ChatID: int64(1), Title: "t", Address: "a"})
			return err
		}},
		{"SendContact", func() error {
			_, err := b.SendContact(ctx, &types.SendContactOptions{ChatID: int64(1), PhoneNumber: "+1", FirstName: "A"})
			return err
		}},
		{"SendPoll", func() error {
			_, err := b.SendPoll(ctx, &types.SendPollOptions{ChatID: int64(1), Question: "Q", Options: []types.InputPollOption{{Text: "A"}}})
			return err
		}},
		{"SendDice", func() error {
			_, err := b.SendDice(ctx, &types.SendDiceOptions{ChatID: int64(1)})
			return err
		}},
		{"SendMediaGroup", func() error {
			_, err := b.SendMediaGroup(ctx, &types.SendMediaGroupOptions{
				ChatID: int64(1),
				Media:  []types.InputMedia{types.InputMediaPhoto{Type: "photo", Media: "p"}},
			})
			return err
		}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.call()
			if err == nil {
				t.Fatal("expected error, got nil")
			}
			te, ok := err.(*types.TelegramError)
			if !ok {
				t.Fatalf("expected *types.TelegramError, got %T", err)
			}
			if te.ErrorCode != 400 {
				t.Errorf("expected error code 400, got %d", te.ErrorCode)
			}
		})
	}
}
