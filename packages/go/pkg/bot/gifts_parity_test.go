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
				ID:                     "9bbee321504743a9817031dfc2ba25a3",
				Sticker:                types.Sticker{FileID: "st1", FileUniqueID: "u1", Type: "regular", Width: 100, Height: 100},
				StarCount:              50,
				TotalCount:             1000,
				RemainingCount:         999,
				PersonalTotalCount:     10,
				PersonalRemainingCount: 4,
				UpgradeStarCount:       500,
				IsPremium:              true,
				HasColors:              true,
				Background:             &types.GiftBackground{CenterColor: 16766720, EdgeColor: 16777215, TextColor: 0},
				UniqueGiftVariantCount: 3,
				PublisherChat:          &types.Chat{ID: -1001234567890, Title: "Gift Shop"},
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
	if !g.IsPremium || !g.HasColors || g.UniqueGiftVariantCount != 3 {
		t.Errorf("unexpected premium/colors/variant fields: %+v", g)
	}
	if g.PersonalTotalCount != 10 || g.PersonalRemainingCount != 4 {
		t.Errorf("unexpected personal counts: %+v", g)
	}
	if g.Background == nil || g.Background.CenterColor != 16766720 || g.Background.TextColor != 0 {
		t.Errorf("unexpected background: %+v", g.Background)
	}
	if g.PublisherChat == nil || g.PublisherChat.Title != "Gift Shop" {
		t.Errorf("unexpected publisher_chat: %+v", g.PublisherChat)
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
		UserID:        types.Ptr(int64(123456)),
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

// TestGifts_SendGiftOmitsOptionalFields asserts the optional text fields and the
// unused half of the user_id/chat_id pair stay off the wire, keeping the payload
// to the docs' required gift_id plus the chosen recipient.
func TestGifts_SendGiftOmitsOptionalFields(t *testing.T) {
	srv := omittingServer(t, "sendGift",
		[]string{"pay_for_upgrade", "text", "text_parse_mode", "text_entities", "chat_id"},
		map[string]any{
			"user_id": 123456,
			"gift_id": "9bbee321504743a9817031dfc2ba25a3",
		}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SendGift(context.Background(), &types.SendGiftOptions{
		UserID: types.Ptr(int64(123456)),
		GiftID: "9bbee321504743a9817031dfc2ba25a3",
	}); err != nil {
		t.Fatalf("SendGift error: %v", err)
	}
}

// TestGifts_SendGiftToChannelChat asserts the docs' channel-chat form, where
// chat_id replaces user_id.
func TestGifts_SendGiftToChannelChat(t *testing.T) {
	srv := omittingServer(t, "sendGift", []string{"user_id"}, map[string]any{
		"chat_id": "@channel",
		"gift_id": "9bbee321504743a9817031dfc2ba25a3",
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SendGift(context.Background(), &types.SendGiftOptions{
		ChatID: "@channel",
		GiftID: "9bbee321504743a9817031dfc2ba25a3",
	}); err != nil {
		t.Fatalf("SendGift error: %v", err)
	}
}

// TestGifts_OwnedGiftMethods covers giftPremiumSubscription and the three
// business-account gift methods convertGiftToStars, upgradeGift and transferGift.
// The latter pair are keyed by business_connection_id, not user_id, per
// https://core.telegram.org/bots/api#convertgifttostars.
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
				"user_id":     123456,
				"month_count": 3,
				"star_count":  1000,
				"text":        "Enjoy Premium",
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.GiftPremiumSubscription(context.Background(), &types.GiftPremiumSubscriptionOptions{
					UserID:     123456,
					MonthCount: 3,
					StarCount:  1000,
					Text:       "Enjoy Premium",
				})
			},
		},
		{
			name:    "ConvertGiftToStars",
			wire:    "convertGiftToStars",
			payload: map[string]any{"business_connection_id": "bc1", "owned_gift_id": "og1"},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.ConvertGiftToStars(context.Background(), "bc1", "og1")
			},
		},
		{
			name: "UpgradeGift",
			wire: "upgradeGift",
			payload: map[string]any{
				"business_connection_id": "bc1",
				"owned_gift_id":          "og1",
				"keep_original_details":  true,
				"star_count":             500,
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.UpgradeGift(context.Background(), "bc1", "og1", map[string]any{
					"keep_original_details": true,
					"star_count":            500,
				})
			},
		},
		{
			name: "TransferGift",
			wire: "transferGift",
			payload: map[string]any{
				"business_connection_id": "bc1",
				"owned_gift_id":          "og1",
				"new_owner_chat_id":      int64(-1001234567890),
				"star_count":             250,
			},
			invoke: func(b *bot.Bot) (bool, error) {
				return b.TransferGift(context.Background(), "bc1", "og1", int64(-1001234567890), map[string]any{
					"star_count": 250,
				})
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

// TestGifts_OwnedGiftMethodsOmitOptionals asserts that upgradeGift and
// transferGift send only their required keys when no options are passed, and
// that none of the three business gift methods ever leak a user_id key.
func TestGifts_OwnedGiftMethodsOmitOptionals(t *testing.T) {
	tests := []struct {
		name   string
		wire   string
		invoke func(b *bot.Bot) (bool, error)
		want   map[string]any
		absent []string
	}{
		{
			name:   "ConvertGiftToStars",
			wire:   "convertGiftToStars",
			invoke: func(b *bot.Bot) (bool, error) { return b.ConvertGiftToStars(context.Background(), "bc1", "og1") },
			want:   map[string]any{"business_connection_id": "bc1", "owned_gift_id": "og1"},
			absent: []string{"user_id", "chat_id", "star_count", "keep_original_details"},
		},
		{
			name:   "UpgradeGift",
			wire:   "upgradeGift",
			invoke: func(b *bot.Bot) (bool, error) { return b.UpgradeGift(context.Background(), "bc1", "og1", nil) },
			want:   map[string]any{"business_connection_id": "bc1", "owned_gift_id": "og1"},
			absent: []string{"user_id", "star_count", "keep_original_details"},
		},
		{
			name: "TransferGift",
			wire: "transferGift",
			invoke: func(b *bot.Bot) (bool, error) {
				return b.TransferGift(context.Background(), "bc1", "og1", int64(987654), nil)
			},
			want: map[string]any{
				"business_connection_id": "bc1",
				"owned_gift_id":          "og1",
				"new_owner_chat_id":      int64(987654),
			},
			absent: []string{"user_id", "star_count", "keep_original_details"},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			srv := omittingServer(t, tc.wire, tc.absent, tc.want, true)
			defer srv.Close()

			b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
			if _, err := tc.invoke(b); err != nil {
				t.Fatalf("%s error: %v", tc.name, err)
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
		srv := omittingServer(t, "getUserGifts",
			[]string{"limit", "offset", "exclude_unsaved", "exclude_saved"},
			map[string]any{"user_id": 123456}, result)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		if _, err := b.GetUserGifts(context.Background(), 123456, nil); err != nil {
			t.Fatalf("GetUserGifts error: %v", err)
		}
	})

	t.Run("GetChatGifts", func(t *testing.T) {
		srv := profileServer(t, "getChatGifts", map[string]any{
			"chat_id":         "@channel",
			"offset":          "abc",
			"exclude_unsaved": true,
		}, result)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		gifts, err := b.GetChatGifts(context.Background(), "@channel", map[string]any{
			"offset":          "abc",
			"exclude_unsaved": true,
		})
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
	ok, err := b.UpgradeGift(context.Background(), "bc1", "og1", nil)
	if ok {
		t.Errorf("expected false on error")
	}
	requireTelegramError(t, err, 400)

	if _, err := b.GetAvailableGifts(context.Background()); err == nil {
		t.Errorf("expected getAvailableGifts to reject")
	}
}
