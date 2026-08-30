package bot_test

import (
	"context"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestGifts_GetAvailableGifts asserts the parameterless wire call (no request
// body, matching node's this.request("getAvailableGifts")) and the typed Gifts
// decode, including the nested sticker object.
func TestGifts_GetAvailableGifts(t *testing.T) {
	srv := noPayloadServer(t, "getAvailableGifts", types.Gifts{
		Gifts: []types.Gift{
			{
				ID:               "9bbee321504743a9817031dfc2ba25a3",
				Sticker:          types.Sticker{FileID: "st1", FileUniqueID: "u1", Type: "regular", Width: 100, Height: 100},
				StarCount:        50,
				TotalCount:       1000,
				RemainingCount:   999,
				UpgradeStarCount: 500,
			},
		},
	})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	gifts, err := b.GetAvailableGifts(context.Background())
	if err != nil {
		t.Fatalf("GetAvailableGifts error: %v", err)
	}
	if len(gifts.Gifts) != 1 {
		t.Fatalf("expected 1 gift, got %d", len(gifts.Gifts))
	}
	g := gifts.Gifts[0]
	if g.ID != "9bbee321504743a9817031dfc2ba25a3" || g.StarCount != 50 || g.UpgradeStarCount != 500 {
		t.Errorf("unexpected gift: %+v", g)
	}
	if g.Sticker.FileID != "st1" || g.TotalCount != 1000 || g.RemainingCount != 999 {
		t.Errorf("unexpected nested/optional fields: %+v", g)
	}
}

// TestGifts_SendGift covers sendGift with the full option set.
func TestGifts_SendGift(t *testing.T) {
	srv := profileServer(t, "sendGift", map[string]any{
		"user_id":         123456,
		"gift_id":         "9bbee321504743a9817031dfc2ba25a3",
		"pay_for_upgrade": true,
		"text":            "Enjoy your gift!",
		"text_parse_mode": "HTML",
		"text_entities":   []map[string]any{{"offset": 0, "length": 5, "type": "bold"}},
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SendGift(context.Background(), &types.SendGiftOptions{
		UserID:        123456,
		GiftID:        "9bbee321504743a9817031dfc2ba25a3",
		PayForUpgrade: true,
		Text:          "Enjoy your gift!",
		TextParseMode: "HTML",
		TextEntities:  []types.MessageEntity{{Offset: 0, Length: 5, Type: "bold"}},
	})
	if err != nil || !ok {
		t.Fatalf("SendGift = (%v, %v)", ok, err)
	}
}

// TestGifts_SendGiftOmitsOptionalFields asserts the optional text fields are
// omitted, keeping the payload to node's required user_id/gift_id pair.
func TestGifts_SendGiftOmitsOptionalFields(t *testing.T) {
	srv := omittingServer(t, "sendGift",
		[]string{"pay_for_upgrade", "text", "text_parse_mode", "text_entities"},
		map[string]any{
			"user_id": 123456,
			"gift_id": "9bbee321504743a9817031dfc2ba25a3",
		}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SendGift(context.Background(), &types.SendGiftOptions{
		UserID: 123456,
		GiftID: "9bbee321504743a9817031dfc2ba25a3",
	}); err != nil {
		t.Fatalf("SendGift error: %v", err)
	}
}

// TestGifts_OwnedGiftMethods covers giftPremiumSubscription, convertGiftToStars,
// upgradeGift and transferGift ported from
// packages/node/src/client/methods/business/gifts.ts.
func TestGifts_OwnedGiftMethods(t *testing.T) {
	tests := []struct {
		name    string
		wire    string
		payload map[string]any
		invoke  func(b *bot.Bot) (bool, error)
	}{
		{
			name: "GiftPremiumSubscription",
			wire: "giftPremiumSubscription",
			payload: map[string]any{
				"user_id":            123456,
				"gift_id":            "e135440423778511293324225ab619d5",
				"upgrade_star_count": 500,
				"pay_for_upgrade":    true,
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.GiftPremiumSubscription(context.Background(), map[string]any{
					"user_id":            123456,
					"gift_id":            "e135440423778511293324225ab619d5",
					"upgrade_star_count": 500,
					"pay_for_upgrade":    true,
				})
			},
		},
		{
			name:    "ConvertGiftToStars",
			wire:    "convertGiftToStars",
			payload: map[string]any{"user_id": 123456, "owned_gift_id": "og1"},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.ConvertGiftToStars(context.Background(), 123456, "og1")
			},
		},
		{
			name:    "UpgradeGift",
			wire:    "upgradeGift",
			payload: map[string]any{"user_id": 123456, "owned_gift_id": "og1"},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.UpgradeGift(context.Background(), 123456, "og1")
			},
		},
		{
			name: "TransferGift",
			wire: "transferGift",
			payload: map[string]any{
				"user_id":           123456,
				"owned_gift_id":     "og1",
				"new_owner_chat_id": int64(-1001234567890),
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.TransferGift(context.Background(), 123456, "og1", int64(-1001234567890))
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

// TestGifts_GiftListMethods covers getUserGifts and getChatGifts, whose results
// node types as unknown and Go passes through as a raw map.
func TestGifts_GiftListMethods(t *testing.T) {
	result := map[string]any{
		"total_count": 2,
		"gifts": []map[string]any{
			{"gift": map[string]any{"id": "g1", "star_count": 50}, "owned_gift_id": "og1"},
		},
		"next_offset": "abc",
	}

	t.Run("GetUserGifts", func(t *testing.T) {
		srv := profileServer(t, "getUserGifts", map[string]any{
			"user_id":           123456,
			"exclude_unlimited": true,
			"limit":             10,
		}, result)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		gifts, err := b.GetUserGifts(context.Background(), 123456, map[string]any{
			"exclude_unlimited": true,
			"limit":             10,
		})
		if err != nil {
			t.Fatalf("GetUserGifts error: %v", err)
		}
		if gifts["next_offset"] != "abc" {
			t.Errorf("unexpected next_offset: %v", gifts["next_offset"])
		}
	})

	t.Run("GetUserGiftsWithoutOptions", func(t *testing.T) {
		srv := omittingServer(t, "getUserGifts", []string{"limit", "offset"},
			map[string]any{"user_id": 123456}, result)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		if _, err := b.GetUserGifts(context.Background(), 123456, nil); err != nil {
			t.Fatalf("GetUserGifts error: %v", err)
		}
	})

	t.Run("GetChatGifts", func(t *testing.T) {
		srv := profileServer(t, "getChatGifts", map[string]any{
			"chat_id": "@channel",
			"offset":  "abc",
		}, result)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		gifts, err := b.GetChatGifts(context.Background(), "@channel", map[string]any{"offset": "abc"})
		if err != nil {
			t.Fatalf("GetChatGifts error: %v", err)
		}
		if gifts["total_count"] != float64(2) {
			t.Errorf("unexpected total_count: %v", gifts["total_count"])
		}
	})
}

// TestGifts_TelegramError asserts gift methods reject with a typed error rather
// than a bare message string.
func TestGifts_TelegramError(t *testing.T) {
	srv := telegramErrorServer(400, "Bad Request: GIFT_UNIQUE_NOT_UPGRADABLE")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.UpgradeGift(context.Background(), 123456, "og1")
	if ok {
		t.Errorf("expected false on error")
	}
	requireTelegramError(t, err, 400)

	if _, err := b.GetAvailableGifts(context.Background()); err == nil {
		t.Errorf("expected getAvailableGifts to reject")
	}
}
