package bot_test

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// noPayloadServer serves a parameterless Bot API method: it asserts the wire
// method name in the path and that no request body was sent, matching node's
// `this.request("removeMyProfilePhoto")` call shape.
func noPayloadServer(t *testing.T, wantMethod string, result any) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/"+wantMethod) {
			t.Errorf("expected path to end with /%s, got %s", wantMethod, r.URL.Path)
		}
		body, err := io.ReadAll(r.Body)
		if err != nil {
			t.Fatalf("read body: %v", err)
		}
		if len(body) > 0 {
			t.Errorf("expected empty request body, got %s", body)
		}
		if ct := r.Header.Get("Content-Type"); ct != "" {
			t.Errorf("expected no Content-Type header, got %s", ct)
		}
		_ = json.NewEncoder(w).Encode(types.Response[any]{Ok: true, Result: result})
	}))
}

// TestBusiness_MyProfilePhotoMethods covers setMyProfilePhoto and
// removeMyProfilePhoto ported from
// packages/node/src/client/methods/business/gifts.ts.
func TestBusiness_MyProfilePhotoMethods(t *testing.T) {
	t.Run("SetMyProfilePhoto", func(t *testing.T) {
		srv := profileServer(t, "setMyProfilePhoto", map[string]any{
			"photo": map[string]any{"type": "input_file", "id": "12345"},
		}, true)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		ok, err := b.SetMyProfilePhoto(context.Background(), map[string]any{
			"type": "input_file",
			"id":   "12345",
		})
		if err != nil {
			t.Fatalf("SetMyProfilePhoto error: %v", err)
		}
		if !ok {
			t.Errorf("expected true result")
		}
	})

	t.Run("RemoveMyProfilePhoto", func(t *testing.T) {
		srv := noPayloadServer(t, "removeMyProfilePhoto", true)
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		ok, err := b.RemoveMyProfilePhoto(context.Background())
		if err != nil {
			t.Fatalf("RemoveMyProfilePhoto error: %v", err)
		}
		if !ok {
			t.Errorf("expected true result")
		}
	})
}

// TestBusiness_SetChatMemberTag covers setChatMemberTag, asserting the optional
// tag is sent when present and omitted when empty.
func TestBusiness_SetChatMemberTag(t *testing.T) {
	srv := profileServer(t, "setChatMemberTag", map[string]any{
		"chat_id": -1001234567890,
		"user_id": 123456,
		"tag":     "Top contributor",
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SetChatMemberTag(context.Background(), int64(-1001234567890), 123456, "Top contributor")
	if err != nil {
		t.Fatalf("SetChatMemberTag error: %v", err)
	}
	if !ok {
		t.Errorf("expected true result")
	}
}

func TestBusiness_SetChatMemberTag_OmitsEmptyTag(t *testing.T) {
	srv := omittingServer(t, "setChatMemberTag", []string{"tag"}, map[string]any{
		"chat_id": -1001234567890,
		"user_id": 123456,
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SetChatMemberTag(context.Background(), int64(-1001234567890), 123456, ""); err != nil {
		t.Fatalf("SetChatMemberTag error: %v", err)
	}
}

// TestBusiness_ChatSubscriptionInviteLinks covers the subscription invite link
// methods, asserting the snake_case subscription_period/subscription_price keys
// and the typed ChatInviteLink decode.
func TestBusiness_ChatSubscriptionInviteLinks(t *testing.T) {
	t.Run("CreateChatSubscriptionInviteLink", func(t *testing.T) {
		srv := profileServer(t, "createChatSubscriptionInviteLink", map[string]any{
			"chat_id":             "@channel",
			"name":                "Monthly",
			"subscription_period": 2592000,
			"subscription_price":  50,
		}, types.ChatInviteLink{
			InviteLink:         "https://t.me/joinchat/sub1",
			Name:               "Monthly",
			SubscriptionPeriod: 2592000,
			SubscriptionPrice:  50,
		})
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		link, err := b.CreateChatSubscriptionInviteLink(context.Background(), &types.CreateChatSubscriptionInviteLinkOptions{
			ChatID:             "@channel",
			Name:               "Monthly",
			SubscriptionPeriod: 2592000,
			SubscriptionPrice:  50,
		})
		if err != nil {
			t.Fatalf("CreateChatSubscriptionInviteLink error: %v", err)
		}
		if link.InviteLink != "https://t.me/joinchat/sub1" {
			t.Errorf("unexpected invite link: %s", link.InviteLink)
		}
		if link.SubscriptionPeriod != 2592000 || link.SubscriptionPrice != 50 {
			t.Errorf("unexpected subscription fields: %+v", link)
		}
	})

	t.Run("EditChatSubscriptionInviteLink", func(t *testing.T) {
		srv := profileServer(t, "editChatSubscriptionInviteLink", map[string]any{
			"chat_id":     "@channel",
			"invite_link": "https://t.me/joinchat/sub1",
			"name":        "Renamed",
		}, types.ChatInviteLink{
			InviteLink: "https://t.me/joinchat/sub1",
			Name:       "Renamed",
		})
		defer srv.Close()

		b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
		link, err := b.EditChatSubscriptionInviteLink(context.Background(), &types.EditChatSubscriptionInviteLinkOptions{
			ChatID:     "@channel",
			InviteLink: "https://t.me/joinchat/sub1",
			Name:       "Renamed",
		})
		if err != nil {
			t.Fatalf("EditChatSubscriptionInviteLink error: %v", err)
		}
		if link.Name != "Renamed" {
			t.Errorf("unexpected name: %s", link.Name)
		}
	})
}

// TestBusiness_EditChatSubscriptionInviteLinkOmitsName asserts that the
// optional name is left off the wire payload when unset.
func TestBusiness_EditChatSubscriptionInviteLinkOmitsName(t *testing.T) {
	srv := omittingServer(t, "editChatSubscriptionInviteLink", []string{"name"}, map[string]any{
		"chat_id":     "@channel",
		"invite_link": "https://t.me/joinchat/sub1",
	}, types.ChatInviteLink{InviteLink: "https://t.me/joinchat/sub1"})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.EditChatSubscriptionInviteLink(context.Background(), &types.EditChatSubscriptionInviteLinkOptions{
		ChatID:     "@channel",
		InviteLink: "https://t.me/joinchat/sub1",
	}); err != nil {
		t.Fatalf("EditChatSubscriptionInviteLink error: %v", err)
	}
}

// TestBusiness_SetUserEmojiStatus covers setUserEmojiStatus ported from
// packages/node/src/client/methods/business/stories-boosts.ts.
func TestBusiness_SetUserEmojiStatus(t *testing.T) {
	srv := profileServer(t, "setUserEmojiStatus", map[string]any{
		"user_id":                      123456,
		"custom_emoji_id":              "5368323575420792074",
		"emoji_status_expiration_date": 1702592000,
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SetUserEmojiStatus(context.Background(), 123456, "5368323575420792074", 1702592000)
	if err != nil {
		t.Fatalf("SetUserEmojiStatus error: %v", err)
	}
	if !ok {
		t.Errorf("expected true result")
	}
}

func TestBusiness_SetUserEmojiStatus_OmitsOptionalFields(t *testing.T) {
	srv := omittingServer(t, "setUserEmojiStatus", []string{"custom_emoji_id", "emoji_status_expiration_date"},
		map[string]any{"user_id": 123456}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, err := b.SetUserEmojiStatus(context.Background(), 123456, "", 0); err != nil {
		t.Fatalf("SetUserEmojiStatus error: %v", err)
	}
}

// TestPayments_GetMyStarBalance asserts the typed StarAmount decode of a
// parameterless request.
func TestPayments_GetMyStarBalance(t *testing.T) {
	srv := noPayloadServer(t, "getMyStarBalance", map[string]any{
		"amount":          123,
		"nanostar_amount": 456,
	})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	balance, err := b.GetMyStarBalance(context.Background())
	if err != nil {
		t.Fatalf("GetMyStarBalance error: %v", err)
	}
	if balance == nil {
		t.Fatalf("expected non-nil balance")
	}
	if balance.Amount != 123 {
		t.Errorf("unexpected amount: %d", balance.Amount)
	}
	if balance.NanostarAmount != 456 {
		t.Errorf("unexpected nanostar_amount: %d", balance.NanostarAmount)
	}
}

// TestGames_SetPassportDataErrors asserts the errors array is serialized under
// the snake_case wire key with node's PassportElementError shape.
func TestGames_SetPassportDataErrors(t *testing.T) {
	srv := profileServer(t, "setPassportDataErrors", map[string]any{
		"user_id": 123456,
		"errors": []map[string]any{
			{"source": "data", "type": "passport", "message": "Data is incorrect"},
		},
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SetPassportDataErrors(context.Background(), 123456, []types.PassportElementError{
		{Source: "data", Type: "passport", Message: "Data is incorrect"},
	})
	if err != nil {
		t.Fatalf("SetPassportDataErrors error: %v", err)
	}
	if !ok {
		t.Errorf("expected true result")
	}
}
