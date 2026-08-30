package bot_test

import (
	"context"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
)

// TestChats_StickerSetAndVerificationMethods covers the chat sticker set and
// verification methods ported from
// packages/node/src/client/methods/chats/management.ts that return True on
// success.
func TestChats_StickerSetAndVerificationMethods(t *testing.T) {
	tests := []struct {
		name    string
		wire    string
		payload map[string]any
		invoke  func(b *bot.Bot) (bool, error)
	}{
		{
			name: "SetChatStickerSet",
			wire: "setChatStickerSet",
			payload: map[string]any{
				"chat_id":          -1001234567890,
				"sticker_set_name": "TelebotTestSet",
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.SetChatStickerSet(context.Background(), int64(-1001234567890), "TelebotTestSet")
			},
		},
		{
			name:    "DeleteChatStickerSet",
			wire:    "deleteChatStickerSet",
			payload: map[string]any{"chat_id": -1001234567890},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.DeleteChatStickerSet(context.Background(), int64(-1001234567890))
			},
		},
		{
			name: "VerifyUser",
			wire: "verifyUser",
			payload: map[string]any{
				"user_id":            123456,
				"custom_description": "Official Staff",
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.VerifyUser(context.Background(), 123456, "Official Staff")
			},
		},
		{
			name:    "VerifyUserWithoutDescription",
			wire:    "verifyUser",
			payload: map[string]any{"user_id": 123456},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.VerifyUser(context.Background(), 123456, "")
			},
		},
		{
			name: "VerifyChat",
			wire: "verifyChat",
			payload: map[string]any{
				"chat_id":            "@channel",
				"custom_description": "Verified Community",
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.VerifyChat(context.Background(), "@channel", "Verified Community")
			},
		},
		{
			name:    "RemoveUserVerification",
			wire:    "removeUserVerification",
			payload: map[string]any{"user_id": 123456},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.RemoveUserVerification(context.Background(), 123456)
			},
		},
		{
			name:    "RemoveChatVerification",
			wire:    "removeChatVerification",
			payload: map[string]any{"chat_id": "@channel"},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.RemoveChatVerification(context.Background(), "@channel")
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

// TestChats_VerifyChatOmitsEmptyDescription asserts the optional
// custom_description is not sent when the caller passes an empty string.
func TestChats_VerifyChatOmitsEmptyDescription(t *testing.T) {
	srv := omittingServer(t, "verifyChat", []string{"custom_description"},
		map[string]any{"chat_id": -1001234567890}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.VerifyChat(context.Background(), int64(-1001234567890), "")
	if err != nil {
		t.Fatalf("VerifyChat error: %v", err)
	}
	if !ok {
		t.Errorf("expected true result")
	}
}

// TestChats_GetUserChatBoosts asserts the typed UserChatBoosts decode of the
// boosts array, including the flattened ChatBoostSource discriminator.
func TestChats_GetUserChatBoosts(t *testing.T) {
	srv := profileServer(t, "getUserChatBoosts", map[string]any{
		"chat_id": -1001234567890,
		"user_id": 123456,
	}, map[string]any{
		"boosts": []map[string]any{
			{
				"boost_id":        "1",
				"add_date":        1700000000,
				"expiration_date": 1702592000,
				"source": map[string]any{
					"source": "premium",
					"user": map[string]any{
						"id":         123456,
						"is_bot":     false,
						"first_name": "Namu",
					},
				},
			},
			{
				"boost_id":        "2",
				"add_date":        1700000100,
				"expiration_date": 1702592100,
				"source": map[string]any{
					"source":              "giveaway",
					"giveaway_message_id": 99,
					"is_unclaimed":        true,
				},
			},
		},
	})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	boosts, err := b.GetUserChatBoosts(context.Background(), int64(-1001234567890), 123456)
	if err != nil {
		t.Fatalf("GetUserChatBoosts error: %v", err)
	}
	if boosts == nil || len(boosts.Boosts) != 2 {
		t.Fatalf("expected 2 boosts, got %+v", boosts)
	}
	first := boosts.Boosts[0]
	if first.BoostID != "1" || first.AddDate != 1700000000 || first.ExpirationDate != 1702592000 {
		t.Errorf("unexpected boost: %+v", first)
	}
	if first.Source.Source != "premium" || first.Source.User == nil || first.Source.User.ID != 123456 {
		t.Errorf("unexpected boost source: %+v", first.Source)
	}
	second := boosts.Boosts[1]
	if second.Source.Source != "giveaway" || second.Source.GiveawayMessageID != 99 || !second.Source.IsUnclaimed {
		t.Errorf("unexpected giveaway source: %+v", second.Source)
	}
}

// TestChats_GetUserChatBoosts_TelegramError checks the typed error path.
func TestChats_GetUserChatBoosts_TelegramError(t *testing.T) {
	srv := telegramErrorServer(400, "Bad Request: chat_id is incorrect")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	boosts, err := b.GetUserChatBoosts(context.Background(), int64(-1001234567890), 123456)
	if boosts != nil {
		t.Errorf("expected nil boosts, got %+v", boosts)
	}
	requireTelegramError(t, err, 400)
}
