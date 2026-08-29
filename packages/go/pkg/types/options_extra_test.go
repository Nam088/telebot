package types_test

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestStickerOptionsSerialization(t *testing.T) {
	send := &types.SendStickerOptions{
		ChatID:  int64(1),
		Sticker: "sticker_id",
		Emoji:   "😀",
	}
	b, _ := json.Marshal(send)
	assertContains(t, string(b), `"sticker":"sticker_id"`)
	assertContains(t, string(b), `"emoji":"😀"`)

	upload := &types.UploadStickerFileOptions{
		UserID:        123,
		Sticker:       "file",
		StickerFormat: "static",
	}
	b, _ = json.Marshal(upload)
	assertContains(t, string(b), `"sticker_format":"static"`)

	create := &types.CreateNewStickerSetOptions{
		UserID: 123,
		Name:   "set",
		Title:  "Set",
		Stickers: []types.InputSticker{
			{Sticker: "s", Format: "static", EmojiList: []string{"😀"}},
		},
	}
	b, _ = json.Marshal(create)
	assertContains(t, string(b), `"name":"set"`)
	assertContains(t, string(b), `"emoji_list":["😀"]`)

	add := &types.AddStickerToSetOptions{UserID: 123, Name: "set", Sticker: types.InputSticker{Sticker: "s", Format: "static", EmojiList: []string{"😀"}}}
	b, _ = json.Marshal(add)
	assertContains(t, string(b), `"user_id":123`)

	replace := &types.ReplaceStickerInSetOptions{UserID: 123, Name: "set", OldSticker: "old", Sticker: types.InputSticker{Sticker: "s", Format: "static", EmojiList: []string{"😀"}}}
	b, _ = json.Marshal(replace)
	assertContains(t, string(b), `"old_sticker":"old"`)

	pos := &types.SetStickerPositionInSetOptions{Sticker: "s", Position: 0}
	b, _ = json.Marshal(pos)
	assertContains(t, string(b), `"position":0`)

	del := &types.DeleteStickerFromSetOptions{Sticker: "s"}
	b, _ = json.Marshal(del)
	assertContains(t, string(b), `"sticker":"s"`)

	emoji := &types.SetStickerEmojiListOptions{Sticker: "s", EmojiList: []string{"😀"}}
	b, _ = json.Marshal(emoji)
	assertContains(t, string(b), `"emoji_list":["😀"]`)

	keywords := &types.SetStickerKeywordsOptions{Sticker: "s", Keywords: []string{"kw"}}
	b, _ = json.Marshal(keywords)
	assertContains(t, string(b), `"keywords":["kw"]`)

	mask := &types.SetStickerMaskPositionOptions{
		Sticker: "s",
		MaskPosition: &types.MaskPosition{
			Point:  "eyes",
			XShift: 0.5,
			YShift: 0.5,
			Scale:  1.0,
		},
	}
	b, _ = json.Marshal(mask)
	assertContains(t, string(b), `"point":"eyes"`)

	delSet := &types.DeleteStickerSetOptions{Name: "set"}
	b, _ = json.Marshal(delSet)
	assertContains(t, string(b), `"name":"set"`)

	thumb := &types.SetStickerSetThumbnailOptions{Name: "set", UserID: 123, Format: "static"}
	b, _ = json.Marshal(thumb)
	assertContains(t, string(b), `"format":"static"`)

	setTitle := &types.SetStickerSetTitleOptions{Name: "set", Title: "New"}
	b, _ = json.Marshal(setTitle)
	assertContains(t, string(b), `"title":"New"`)
}

func TestPaymentOptionsSerialization(t *testing.T) {
	invoice := &types.SendInvoiceOptions{
		ChatID:      int64(1),
		Title:       "Title",
		Description: "Desc",
		Payload:     "payload",
		Currency:    "XTR",
		Prices:      []types.LabeledPrice{{Label: "L", Amount: 100}},
	}
	b, _ := json.Marshal(invoice)
	assertContains(t, string(b), `"currency":"XTR"`)
	assertContains(t, string(b), `"prices":[{"label":"L","amount":100}]`)

	link := &types.CreateInvoiceLinkOptions{
		Title:       "T",
		Description: "D",
		Payload:     "p",
		Currency:    "USD",
		Prices:      []types.LabeledPrice{{Label: "L", Amount: 100}},
	}
	b, _ = json.Marshal(link)
	assertNotContains(t, string(b), `"chat_id"`)
	assertContains(t, string(b), `"currency":"USD"`)

	shipping := &types.AnswerShippingQueryOptions{
		ShippingQueryID: "q",
		OK:              true,
		ShippingOptions: []types.ShippingOption{{ID: "s", Title: "S", Prices: []types.LabeledPrice{{Label: "L", Amount: 10}}}},
	}
	b, _ = json.Marshal(shipping)
	assertContains(t, string(b), `"ok":true`)
	assertContains(t, string(b), `"shipping_options"`)

	pre := &types.AnswerPreCheckoutQueryOptions{
		PreCheckoutQueryID: "q",
		OK:                 false,
		ErrorMessage:       "err",
	}
	b, _ = json.Marshal(pre)
	assertContains(t, string(b), `"ok":false`)
	assertContains(t, string(b), `"error_message":"err"`)

	stars := &types.GetStarTransactionsOptions{Offset: 0, Limit: 10}
	b, _ = json.Marshal(stars)
	assertContains(t, string(b), `"limit":10`)

	refund := &types.RefundStarPaymentOptions{
		UserID:                  123,
		TelegramPaymentChargeID: "c",
	}
	b, _ = json.Marshal(refund)
	assertContains(t, string(b), `"telegram_payment_charge_id":"c"`)

	sub := &types.EditUserStarSubscriptionOptions{
		UserID:                  123,
		TelegramPaymentChargeID: "c",
		IsCanceled:              true,
	}
	b, _ = json.Marshal(sub)
	assertContains(t, string(b), `"is_canceled":true`)
}

func TestGameOptionsSerialization(t *testing.T) {
	send := &types.SendGameOptions{
		ChatID:        int64(1),
		GameShortName: "game",
	}
	b, _ := json.Marshal(send)
	assertContains(t, string(b), `"game_short_name":"game"`)

	score := &types.SetGameScoreOptions{
		UserID: 123,
		Score:  100,
		Force:  true,
	}
	b, _ = json.Marshal(score)
	assertContains(t, string(b), `"score":100`)
	assertContains(t, string(b), `"force":true`)

	high := &types.GetGameHighScoresOptions{
		UserID:    123,
		MessageID: 42,
	}
	b, _ = json.Marshal(high)
	assertContains(t, string(b), `"message_id":42`)
}

func TestTelegramError(t *testing.T) {
	err := &types.TelegramError{
		ErrorCode:   429,
		Description: "Too Many Requests",
		Parameters: &types.Parameters{
			RetryAfter: 5,
		},
	}
	msg := err.Error()
	if !strings.Contains(msg, "429") || !strings.Contains(msg, "Too Many Requests") {
		t.Errorf("unexpected error message: %s", msg)
	}

	var resp types.Response[string]
	if err := json.Unmarshal([]byte(`{"ok":false,"error_code":400,"description":"Bad Request","parameters":{"retry_after":10}}`), &resp); err != nil {
		t.Fatalf("unmarshal error response: %v", err)
	}
	if resp.Ok || resp.ErrorCode != 400 || resp.Description != "Bad Request" || resp.Parameters.RetryAfter != 10 {
		t.Errorf("unexpected error response: %+v", resp)
	}
}

func TestInterfaceMethodsCoverage(t *testing.T) {
	var _ types.InputMedia = types.InputMediaPhoto{}
	var _ types.InputMedia = types.InputMediaVideo{}
	var _ types.InputMedia = types.InputMediaAnimation{}
	var _ types.InputMedia = types.InputMediaAudio{}
	var _ types.InputMedia = types.InputMediaDocument{}

	var _ types.ReactionType = types.ReactionTypeEmoji{}
	var _ types.ReactionType = types.ReactionTypeCustomEmoji{}
	var _ types.ReactionType = types.ReactionTypePaid{}

	var _ types.MenuButton = types.MenuButtonDefault{}
	var _ types.MenuButton = types.MenuButtonCommands{}
	var _ types.MenuButton = types.MenuButtonWebApp{}

	var _ types.BotCommandScope = types.BotCommandScopeDefault{}
	var _ types.BotCommandScope = types.BotCommandScopeAllPrivateChats{}
	var _ types.BotCommandScope = types.BotCommandScopeAllGroupChats{}
	var _ types.BotCommandScope = types.BotCommandScopeAllChatAdministrators{}
	var _ types.BotCommandScope = types.BotCommandScopeChat{}
	var _ types.BotCommandScope = types.BotCommandScopeChatAdministrators{}
	var _ types.BotCommandScope = types.BotCommandScopeChatMember{}
}

func TestEffectiveHelpersBranches(t *testing.T) {
	user := &types.User{ID: 1, FirstName: "U"}
	chat := &types.Chat{ID: 2, Type: "private"}

	callbackUpdate := &types.Update{
		UpdateID: 1,
		CallbackQuery: &types.CallbackQuery{
			ID:   "q",
			From: user,
			Message: &types.Message{
				MessageID: 10,
				Chat:      chat,
			},
		},
	}
	if callbackUpdate.EffectiveUser() == nil || callbackUpdate.EffectiveUser().ID != 1 {
		t.Errorf("expected effective user from callback query")
	}
	if callbackUpdate.EffectiveChat() == nil || callbackUpdate.EffectiveChat().ID != 2 {
		t.Errorf("expected effective chat from callback query message")
	}
	if callbackUpdate.EffectiveMessage() == nil || callbackUpdate.EffectiveMessage().MessageID != 10 {
		t.Errorf("expected effective message from callback query")
	}

	editedUpdate := &types.Update{
		UpdateID:      2,
		EditedMessage: &types.Message{MessageID: 20, From: user, Chat: chat},
	}
	if editedUpdate.EffectiveUser() == nil || editedUpdate.EffectiveUser().ID != 1 {
		t.Errorf("expected effective user from edited message")
	}
	if editedUpdate.EffectiveChat() == nil || editedUpdate.EffectiveChat().ID != 2 {
		t.Errorf("expected effective chat from edited message")
	}
	if editedUpdate.EffectiveMessage() == nil || editedUpdate.EffectiveMessage().MessageID != 20 {
		t.Errorf("expected effective message from edited message")
	}

	channelPostUpdate := &types.Update{
		UpdateID:    3,
		ChannelPost: &types.Message{MessageID: 30, Chat: chat},
	}
	if channelPostUpdate.EffectiveUser() != nil {
		t.Errorf("expected no effective user from channel post")
	}
	if channelPostUpdate.EffectiveChat() == nil || channelPostUpdate.EffectiveChat().ID != 2 {
		t.Errorf("expected effective chat from channel post")
	}
	if channelPostUpdate.EffectiveMessage() == nil || channelPostUpdate.EffectiveMessage().MessageID != 30 {
		t.Errorf("expected effective message from channel post")
	}
}

func TestEntitiesSerialization(t *testing.T) {
	entity := types.MessageEntity{Type: "bold", Offset: 0, Length: 4}
	b, _ := json.Marshal(entity)
	assertContains(t, string(b), `"type":"bold"`)

	rp := types.ReplyParameters{MessageID: 1, Quote: "q"}
	b, _ = json.Marshal(rp)
	assertContains(t, string(b), `"message_id":1`)
	assertContains(t, string(b), `"quote":"q"`)

	lp := types.LinkPreviewOptions{IsDisabled: true, URL: "https://t.me"}
	b, _ = json.Marshal(lp)
	assertContains(t, string(b), `"is_disabled":true`)
	assertContains(t, string(b), `"url":"https://t.me"`)

	webapp := types.WebAppInfo{URL: "https://example.com"}
	b, _ = json.Marshal(webapp)
	assertContains(t, string(b), `"url":"https://example.com"`)

	reaction := types.ReactionTypeEmoji{Type: "emoji", Emoji: "👍"}
	b, _ = json.Marshal(reaction)
	assertContains(t, string(b), `"emoji":"👍"`)
}
