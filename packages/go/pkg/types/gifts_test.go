package types_test

import (
	"encoding/json"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestGiftModels_WireShape pins the snake_case wire keys of the gift models
// ported from packages/node/src/client/types/payments/models.ts, so a response
// straight from Telegram decodes without renaming.
func TestGiftModels_WireShape(t *testing.T) {
	payload := `{
		"gift": {
			"gift_id": "9bbee321504743a9817031dfc2ba25a3",
			"base_name": "Teddy Bear",
			"name": "Golden Teddy Bear",
			"number": 42,
			"model": {"name": "Bear", "sticker": {"file_id": "f", "file_unique_id": "u", "type": "regular", "width": 1, "height": 1}, "rarity_per_mille": 12, "rarity": "rare"},
			"symbol": {"name": "Star", "sticker": {"file_id": "f2", "file_unique_id": "u2", "type": "regular", "width": 1, "height": 1}, "rarity_per_mille": 34},
			"backdrop": {"name": "Gold", "colors": {"center_color": 16766720, "edge_color": 16777215, "symbol_color": 0, "text_color": 16777215}, "rarity_per_mille": 56},
			"is_premium": true,
			"publisher_chat": {"id": -1001234567890, "type": "channel", "title": "Gift Shop"}
		},
		"origin": "upgrade",
		"text": "congrats",
		"entities": [{"offset": 0, "length": 7, "type": "bold"}],
		"is_private": true,
		"last_resale_currency": "XTR",
		"last_resale_amount": 1000,
		"owned_gift_id": "og1",
		"transfer_star_count": 250,
		"next_transfer_date": 1702592000
	}`

	var info types.UniqueGiftInfo
	if err := json.Unmarshal([]byte(payload), &info); err != nil {
		t.Fatalf("unmarshal UniqueGiftInfo: %v", err)
	}
	if info.Origin != "upgrade" || info.OwnedGiftID != "og1" || info.TransferStarCount != 250 {
		t.Errorf("unexpected info: %+v", info)
	}
	if info.NextTransferDate != 1702592000 || info.LastResaleCurrency != "XTR" || !info.IsPrivate {
		t.Errorf("unexpected optional scalars: %+v", info)
	}
	if info.Text != "congrats" || len(info.Entities) != 1 || info.Entities[0].Type != "bold" {
		t.Errorf("unexpected text/entities: %+v", info)
	}
	g := info.Gift
	if g.GiftID != "9bbee321504743a9817031dfc2ba25a3" || g.BaseName != "Teddy Bear" || g.Number != 42 {
		t.Errorf("unexpected unique gift: %+v", g)
	}
	if g.Model.Rarity != "rare" || g.Symbol.RarityPerMille != 34 {
		t.Errorf("unexpected model/symbol: %+v %+v", g.Model, g.Symbol)
	}
	if g.Backdrop.Colors.CenterColor != 16766720 || g.Backdrop.RarityPerMille != 56 {
		t.Errorf("unexpected backdrop: %+v", g.Backdrop)
	}
	if !g.IsPremium || g.PublisherChat == nil || g.PublisherChat.Title != "Gift Shop" {
		t.Errorf("unexpected premium/publisher fields: %+v", g)
	}

	// A zero-value UniqueGiftInfo must serialize only its required keys, so
	// optional wire fields never leak a bogus default.
	out, err := json.Marshal(&types.UniqueGiftInfo{})
	if err != nil {
		t.Fatalf("marshal empty UniqueGiftInfo: %v", err)
	}
	var generic map[string]any
	if err := json.Unmarshal(out, &generic); err != nil {
		t.Fatalf("unmarshal round-trip: %v", err)
	}
	if _, present := generic["gift"]; !present {
		t.Errorf("expected required gift key in %s", out)
	}
	for _, key := range []string{"text", "entities", "is_private", "last_resale_currency", "last_resale_amount", "owned_gift_id", "transfer_star_count", "next_transfer_date"} {
		if _, present := generic[key]; present {
			t.Errorf("expected %q to be omitted when unset: %s", key, out)
		}
	}
}

// TestGiftsOptionPayload pins the request-side wire keys for sendGift per
// https://core.telegram.org/bots/api#sendgift, where user_id and chat_id are
// mutually exclusive alternatives for the recipient and gift_id is required.
func TestGiftsOptionPayload(t *testing.T) {
	out, err := json.Marshal(&types.SendGiftOptions{
		UserID: types.Ptr(int64(123456)),
		GiftID: "g1",
		Text:   "hi",
	})
	if err != nil {
		t.Fatalf("marshal SendGiftOptions: %v", err)
	}
	var generic map[string]any
	if err := json.Unmarshal(out, &generic); err != nil {
		t.Fatalf("unmarshal payload: %v", err)
	}
	for _, key := range []string{"user_id", "gift_id", "text"} {
		if _, present := generic[key]; !present {
			t.Errorf("expected wire key %q in %s", key, out)
		}
	}
	for _, key := range []string{"pay_for_upgrade", "text_parse_mode", "text_entities", "chat_id"} {
		if _, present := generic[key]; present {
			t.Errorf("expected %q to be omitted in %s", key, out)
		}
	}

	// The channel-chat form swaps user_id for chat_id.
	channelOut, err := json.Marshal(&types.SendGiftOptions{ChatID: "@channel", GiftID: "g1"})
	if err != nil {
		t.Fatalf("marshal channel SendGiftOptions: %v", err)
	}
	var channel map[string]any
	if err := json.Unmarshal(channelOut, &channel); err != nil {
		t.Fatalf("unmarshal channel payload: %v", err)
	}
	if channel["chat_id"] != "@channel" || channel["gift_id"] != "g1" {
		t.Errorf("unexpected channel-chat payload: %s", channelOut)
	}
	if _, present := channel["user_id"]; present {
		t.Errorf("expected user_id to be omitted when chat_id is used in %s", channelOut)
	}
}

// TestEditEphemeralMessageOptionsPayload pins the required identifier triple and
// the optional-field omission rules for the ephemeral edit options.
func TestEditEphemeralMessageOptionsPayload(t *testing.T) {
	out, err := json.Marshal(&types.EditEphemeralMessageTextOptions{
		ChatID:             int64(-1001234567890),
		ReceiverUserID:     123456,
		EphemeralMessageID: 7,
	})
	if err != nil {
		t.Fatalf("marshal options: %v", err)
	}
	var generic map[string]any
	if err := json.Unmarshal(out, &generic); err != nil {
		t.Fatalf("unmarshal payload: %v", err)
	}
	for _, key := range []string{"chat_id", "receiver_user_id", "ephemeral_message_id"} {
		if _, present := generic[key]; !present {
			t.Errorf("expected required wire key %q in %s", key, out)
		}
	}
	for _, key := range []string{"text", "parse_mode", "entities", "rich_message", "link_preview_options", "reply_markup"} {
		if _, present := generic[key]; present {
			t.Errorf("expected %q to be omitted in %s", key, out)
		}
	}
}

// TestAcceptedGiftTypes_WireShape pins AcceptedGiftTypes to the five documented
// required booleans (https://core.telegram.org/bots/api#acceptedgifttypes):
// every key must serialize even when false, and the invented premium_gifts /
// storable_gifts keys must never reach the wire.
func TestAcceptedGiftTypes_WireShape(t *testing.T) {
	out, err := json.Marshal(&types.SetBusinessAccountGiftSettingsOptions{
		BusinessConnectionID: "bc1",
		AcceptedGiftTypes:    types.AcceptedGiftTypes{UniqueGifts: true},
	})
	if err != nil {
		t.Fatalf("marshal SetBusinessAccountGiftSettingsOptions: %v", err)
	}
	var generic map[string]any
	if err := json.Unmarshal(out, &generic); err != nil {
		t.Fatalf("unmarshal payload: %v", err)
	}

	typesObj, present := generic["accepted_gift_types"].(map[string]any)
	if !present {
		t.Fatalf("expected nested accepted_gift_types object in %s", out)
	}
	for _, key := range []string{"unlimited_gifts", "limited_gifts", "unique_gifts", "premium_subscription", "gifts_from_channels"} {
		if _, present := typesObj[key]; !present {
			t.Errorf("expected required wire key %q in %s", key, out)
		}
	}
	if typesObj["unique_gifts"] != true {
		t.Errorf("expected unique_gifts true in %s", out)
	}
	for _, key := range []string{"premium_gifts", "storable_gifts"} {
		if _, present := typesObj[key]; present {
			t.Errorf("expected undocumented key %q to be absent in %s", key, out)
		}
	}
}
