package bot_test

import (
	"context"
	"errors"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestBusinessAccount_GetBusinessConnection covers getBusinessConnection,
// asserting the typed BusinessConnection decode from the documented wire shape,
// where the bot's permissions arrive as a nested BusinessBotRights object under
// "rights" (https://core.telegram.org/bots/api#businessconnection).
func TestBusinessAccount_GetBusinessConnection(t *testing.T) {
	srv := profileServer(t, "getBusinessConnection", map[string]any{
		"business_connection_id": "423778511293324225",
	}, map[string]any{
		"id":           "423778511293324225",
		"user":         map[string]any{"id": 123456, "is_bot": true, "first_name": "Acme"},
		"user_chat_id": 123456,
		"date":         1702592000,
		"is_enabled":   true,
		"rights": map[string]any{
			"can_reply":                  true,
			"can_read_messages":          true,
			"can_edit_name":              true,
			"can_convert_gifts_to_stars": true,
		},
	})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	conn, err := b.GetBusinessConnection(context.Background(), "423778511293324225")
	if err != nil {
		t.Fatalf("GetBusinessConnection error: %v", err)
	}
	if conn.ID != "423778511293324225" || conn.UserChatID != 123456 {
		t.Errorf("unexpected connection: %+v", conn)
	}
	if conn.Date != 1702592000 || !conn.IsEnabled {
		t.Errorf("unexpected date/is_enabled: %+v", conn)
	}
	if conn.Rights == nil {
		t.Fatalf("expected rights to decode, got nil for %+v", conn)
	}
	if !conn.Rights.CanReply || !conn.Rights.CanReadMessages {
		t.Errorf("expected can_reply/can_read_messages true: %+v", conn.Rights)
	}
	if !conn.Rights.CanEditName || !conn.Rights.CanConvertGiftsToStars {
		t.Errorf("expected can_edit_name/can_convert_gifts_to_stars true: %+v", conn.Rights)
	}
	if conn.Rights.CanTransferStars {
		t.Errorf("expected unlisted can_transfer_stars to stay false: %+v", conn.Rights)
	}
}

// TestBusinessAccount_BusinessMessageMethods covers readBusinessMessage and
// deleteBusinessMessages, asserting readBusinessMessage's required chat_id plus
// the message_id vs message_ids array key difference.
func TestBusinessAccount_BusinessMessageMethods(t *testing.T) {
	t.Run("ReadBusinessMessage", func(t *testing.T) {
		srv := profileServer(t, "readBusinessMessage", map[string]any{
			"business_connection_id": "423778511293324225",
			"chat_id":                123456,
			"message_id":             42,
		}, true)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		ok, err := b.ReadBusinessMessage(context.Background(), "423778511293324225", 123456, 42)
		if err != nil || !ok {
			t.Fatalf("ReadBusinessMessage = (%v, %v)", ok, err)
		}
	})

	t.Run("DeleteBusinessMessages", func(t *testing.T) {
		srv := profileServer(t, "deleteBusinessMessages", map[string]any{
			"business_connection_id": "423778511293324225",
			"message_ids":            []int64{41, 42},
		}, true)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		ok, err := b.DeleteBusinessMessages(context.Background(), "423778511293324225", []int64{41, 42})
		if err != nil || !ok {
			t.Fatalf("DeleteBusinessMessages = (%v, %v)", ok, err)
		}
	})
}

// TestBusinessAccount_StarBalance covers getBusinessAccountStarBalance, which
// node types as { amount: number } and Go decodes into types.StarAmount.
func TestBusinessAccount_StarBalance(t *testing.T) {
	srv := profileServer(t, "getBusinessAccountStarBalance", map[string]any{
		"business_connection_id": "423778511293324225",
	}, map[string]any{"amount": 4200, "nanostar_amount": 17})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	balance, err := b.GetBusinessAccountStarBalance(context.Background(), "423778511293324225")
	if err != nil {
		t.Fatalf("GetBusinessAccountStarBalance error: %v", err)
	}
	if balance.Amount != 4200 || balance.NanostarAmount != 17 {
		t.Errorf("unexpected balance: %+v", balance)
	}
}

// TestBusinessAccount_GetBusinessAccountGifts asserts that node's `unknown`
// result passes through as a raw map keyed by the wire field names.
func TestBusinessAccount_GetBusinessAccountGifts(t *testing.T) {
	srv := profileServer(t, "getBusinessAccountGifts", map[string]any{
		"business_connection_id": "423778511293324225",
	}, map[string]any{
		"total_count": 1,
		"saved_gifts": []map[string]any{{"gift": map[string]any{"id": "g1"}}},
	})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	gifts, err := b.GetBusinessAccountGifts(context.Background(), "423778511293324225")
	if err != nil {
		t.Fatalf("GetBusinessAccountGifts error: %v", err)
	}
	if gifts["total_count"] != float64(1) {
		t.Errorf("unexpected total_count: %v", gifts["total_count"])
	}
	if _, ok := gifts["saved_gifts"]; !ok {
		t.Errorf("expected saved_gifts key in result: %v", gifts)
	}
}

// TestBusinessAccount_ManagementMethods covers the boolean business-account
// management methods ported from
// packages/node/src/client/methods/business/gifts.ts.
func TestBusinessAccount_ManagementMethods(t *testing.T) {
	tests := []struct {
		name    string
		wire    string
		payload map[string]any
		invoke  func(b *bot.Bot) (bool, error)
	}{
		{
			name:    "SetBusinessAccountName",
			wire:    "setBusinessAccountName",
			payload: map[string]any{"business_connection_id": "bc1", "first_name": "Acme", "last_name": "Support"},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.SetBusinessAccountName(context.Background(), "bc1", "Acme", "Support")
			},
		},
		{
			name:    "SetBusinessAccountUsername",
			wire:    "setBusinessAccountUsername",
			payload: map[string]any{"business_connection_id": "bc1", "username": "acme_support"},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.SetBusinessAccountUsername(context.Background(), "bc1", "acme_support")
			},
		},
		{
			name:    "SetBusinessAccountBio",
			wire:    "setBusinessAccountBio",
			payload: map[string]any{"business_connection_id": "bc1", "bio": "Replies in 5 minutes"},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.SetBusinessAccountBio(context.Background(), "bc1", "Replies in 5 minutes")
			},
		},
		{
			name: "SetBusinessAccountGiftSettings",
			wire: "setBusinessAccountGiftSettings",
			payload: map[string]any{
				"business_connection_id":    "bc1",
				"is_storable_gifts_allowed": true,
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.SetBusinessAccountGiftSettings(context.Background(), "bc1", map[string]any{
					"is_storable_gifts_allowed": true,
				})
			},
		},
		{
			name: "SetBusinessAccountProfilePhoto",
			wire: "setBusinessAccountProfilePhoto",
			payload: map[string]any{
				"business_connection_id": "bc1",
				"photo":                  map[string]any{"type": "input_file", "id": "ph1"},
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.SetBusinessAccountProfilePhoto(context.Background(), "bc1", map[string]any{
					"type": "input_file",
					"id":   "ph1",
				}, false)
			},
		},
		{
			name:    "RemoveBusinessAccountProfilePhoto",
			wire:    "removeBusinessAccountProfilePhoto",
			payload: map[string]any{"business_connection_id": "bc1"},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.RemoveBusinessAccountProfilePhoto(context.Background(), "bc1", false)
			},
		},
		{
			name:    "TransferBusinessAccountStars",
			wire:    "transferBusinessAccountStars",
			payload: map[string]any{"business_connection_id": "bc1", "star_count": 100},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.TransferBusinessAccountStars(context.Background(), "bc1", 100)
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			srv := profileServer(t, tc.wire, tc.payload, true)
			defer srv.Close()

			b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
			ok, err := tc.invoke(b)
			if err != nil {
				t.Fatalf("%s error: %v", tc.name, err)
			}
			if !ok {
				t.Errorf("%s: expected true result", tc.name)
			}
		})
	}
}

// TestBusinessAccount_ProfilePhotoIsPublic covers the documented optional
// is_public key of setBusinessAccountProfilePhoto and
// removeBusinessAccountProfilePhoto.
func TestBusinessAccount_ProfilePhotoIsPublic(t *testing.T) {
	t.Run("Set", func(t *testing.T) {
		srv := profileServer(t, "setBusinessAccountProfilePhoto", map[string]any{
			"business_connection_id": "bc1",
			"photo":                  "BAACAgIAAxkBAAI",
			"is_public":              true,
		}, true)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		if _, err := b.SetBusinessAccountProfilePhoto(context.Background(), "bc1", "BAACAgIAAxkBAAI", true); err != nil {
			t.Fatalf("SetBusinessAccountProfilePhoto error: %v", err)
		}
	})

	t.Run("Remove", func(t *testing.T) {
		srv := profileServer(t, "removeBusinessAccountProfilePhoto", map[string]any{
			"business_connection_id": "bc1",
			"is_public":              true,
		}, true)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		if _, err := b.RemoveBusinessAccountProfilePhoto(context.Background(), "bc1", true); err != nil {
			t.Fatalf("RemoveBusinessAccountProfilePhoto error: %v", err)
		}
	})
}

// TestBusinessAccount_OptionalFieldOmission asserts username, bio, last_name and
// is_public stay off the wire when their argument carries the Go zero value,
// matching node's `!== undefined` payload guards.
func TestBusinessAccount_OptionalFieldOmission(t *testing.T) {
	cases := []struct {
		name   string
		wire   string
		absent string
		invoke func(b *bot.Bot) (bool, error)
	}{
		{
			name:   "Username",
			wire:   "setBusinessAccountUsername",
			absent: "username",
			invoke: func(b *bot.Bot) (bool, error) {
				return b.SetBusinessAccountUsername(context.Background(), "bc1", "")
			},
		},
		{
			name:   "Bio",
			wire:   "setBusinessAccountBio",
			absent: "bio",
			invoke: func(b *bot.Bot) (bool, error) {
				return b.SetBusinessAccountBio(context.Background(), "bc1", "")
			},
		},
		{
			name:   "LastName",
			wire:   "setBusinessAccountName",
			absent: "last_name",
			invoke: func(b *bot.Bot) (bool, error) {
				return b.SetBusinessAccountName(context.Background(), "bc1", "Acme", "")
			},
		},
		{
			name:   "ProfilePhotoIsPublic",
			wire:   "removeBusinessAccountProfilePhoto",
			absent: "is_public",
			invoke: func(b *bot.Bot) (bool, error) {
				return b.RemoveBusinessAccountProfilePhoto(context.Background(), "bc1", false)
			},
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			srv := omittingServer(t, tc.wire, []string{tc.absent}, map[string]any{
				"business_connection_id": "bc1",
			}, true)
			defer srv.Close()

			b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
			if _, err := tc.invoke(b); err != nil {
				t.Fatalf("%s error: %v", tc.wire, err)
			}
		})
	}
}

// TestBusinessAccount_TelegramError asserts a failed envelope surfaces as a
// typed *types.TelegramError for business account methods.
func TestBusinessAccount_TelegramError(t *testing.T) {
	srv := telegramErrorServer(400, "Bad Request: BUSINESS_ACCOUNT_ID_INVALID")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	_, err := b.SetBusinessAccountName(context.Background(), "bc1", "Acme", "")
	requireTelegramError(t, err, 400)

	_, err = b.GetBusinessConnection(context.Background(), "bc1")
	var tgErr *types.TelegramError
	if !errors.As(err, &tgErr) {
		t.Fatalf("expected *types.TelegramError, got %T: %v", err, err)
	}
	if tgErr.Description != "Bad Request: BUSINESS_ACCOUNT_ID_INVALID" {
		t.Errorf("unexpected description: %s", tgErr.Description)
	}
}
