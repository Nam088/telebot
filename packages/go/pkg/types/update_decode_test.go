package types_test

import (
	"encoding/json"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// decodeUpdate unmarshals a raw Update payload and fails the test on error.
func decodeUpdate(t *testing.T, payload string) *types.Update {
	t.Helper()
	var u types.Update
	if err := json.Unmarshal([]byte(payload), &u); err != nil {
		t.Fatalf("unmarshal update: %v", err)
	}
	return &u
}

const (
	testUserJSON  = `{"id":777,"is_bot":false,"first_name":"Alice","username":"alice"}`
	testChatJSON  = `{"id":-1002,"type":"supergroup","title":"Fans"}`
	testPrivJSON  = `{"id":64,"type":"private","first_name":"Bob"}`
	testBoostJSON = `{"boost_id":"b-1","add_date":1750000000,"expiration_date":1752592000,` +
		`"source":{"source":"premium","user":` + testUserJSON + `}}`
)

func TestUpdateDecode_BusinessMessage(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":1,"business_message":{"message_id":55,"date":1750000000,`+
		`"chat":`+testPrivJSON+`,"from":`+testUserJSON+`,"text":"hello from business"}}`)

	if u.BusinessMessage == nil {
		t.Fatal("expected business_message to decode")
	}
	if u.BusinessMessage.MessageID != 55 || u.BusinessMessage.Text != "hello from business" {
		t.Fatalf("unexpected business message: %+v", u.BusinessMessage)
	}
	if u.BusinessMessage.From == nil || u.BusinessMessage.From.ID != 777 {
		t.Fatalf("unexpected business message sender: %+v", u.BusinessMessage.From)
	}
	if user := u.EffectiveUser(); user == nil || user.ID != 777 {
		t.Fatalf("expected effective user from business message, got %+v", user)
	}
}

func TestUpdateDecode_EditedBusinessMessage(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":2,"edited_business_message":{"message_id":56,`+
		`"date":1750000000,"chat":`+testPrivJSON+`,"text":"edited"}}`)

	if u.EditedBusinessMessage == nil {
		t.Fatal("expected edited_business_message to decode")
	}
	if u.EditedBusinessMessage.MessageID != 56 || u.EditedBusinessMessage.Text != "edited" {
		t.Fatalf("unexpected edited business message: %+v", u.EditedBusinessMessage)
	}
	if u.BusinessMessage != nil {
		t.Fatal("edited_business_message must not populate business_message")
	}
}

func TestUpdateDecode_DeletedBusinessMessages(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":3,"deleted_business_messages":{`+
		`"business_connection_id":"bc-42","chat":`+testPrivJSON+`,"message_ids":[10,11,12]}}`)

	deleted := u.DeletedBusinessMessages
	if deleted == nil {
		t.Fatal("expected deleted_business_messages to decode")
	}
	if deleted.BusinessConnectionID != "bc-42" {
		t.Fatalf("unexpected business connection id: %q", deleted.BusinessConnectionID)
	}
	if deleted.Chat == nil || deleted.Chat.ID != 64 {
		t.Fatalf("unexpected chat: %+v", deleted.Chat)
	}
	if len(deleted.MessageIDs) != 3 || deleted.MessageIDs[2] != 12 {
		t.Fatalf("unexpected message ids: %v", deleted.MessageIDs)
	}
}

func TestUpdateDecode_ChatBoost(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":4,"chat_boost":{"chat":`+testChatJSON+`,"boost":`+testBoostJSON+`}}`)

	updated := u.ChatBoost
	if updated == nil {
		t.Fatal("expected chat_boost to decode")
	}
	if updated.Chat == nil || updated.Chat.Title != "Fans" {
		t.Fatalf("unexpected chat: %+v", updated.Chat)
	}
	if updated.Boost == nil || updated.Boost.BoostID != "b-1" {
		t.Fatalf("unexpected boost: %+v", updated.Boost)
	}
	if updated.Boost.Source.Source != "premium" {
		t.Fatalf("unexpected boost source: %+v", updated.Boost.Source)
	}
	if updated.Boost.Source.User == nil || updated.Boost.Source.User.ID != 777 {
		t.Fatalf("unexpected boost source user: %+v", updated.Boost.Source.User)
	}
	if updated.Boost.ExpirationDate != 1752592000 {
		t.Fatalf("unexpected expiration date: %d", updated.Boost.ExpirationDate)
	}
}

func TestUpdateDecode_RemovedChatBoost(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":5,"removed_chat_boost":{"boost_id":"b-1",`+
		`"remove_date":1751000000,"chat":`+testChatJSON+`,`+
		`"source":{"source":"gift_code","user":`+testUserJSON+`}}}`)

	removed := u.RemovedChatBoost
	if removed == nil {
		t.Fatal("expected removed_chat_boost to decode")
	}
	if removed.BoostID != "b-1" || removed.RemoveDate != 1751000000 {
		t.Fatalf("unexpected removed boost: %+v", removed)
	}
	if removed.Chat == nil || removed.Chat.ID != -1002 {
		t.Fatalf("unexpected chat: %+v", removed.Chat)
	}
	if removed.Source == nil || removed.Source.Source != "gift_code" {
		t.Fatalf("unexpected source: %+v", removed.Source)
	}
}

func TestUpdateDecode_MessageReaction(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":6,"message_reaction":{"chat":`+testPrivJSON+`,`+
		`"message_id":99,"date":1750000001,`+
		`"old_reaction":[{"type":"emoji","emoji":"👍"}],`+
		`"new_reaction":[{"type":"custom_emoji","custom_emoji_id":"abc123"},{"type":"paid"}],`+
		`"user":`+testUserJSON+`,"actor_chat":`+testChatJSON+`}}`)

	reaction := u.MessageReaction
	if reaction == nil {
		t.Fatal("expected message_reaction to decode")
	}
	if reaction.MessageID != 99 || reaction.Date != 1750000001 {
		t.Fatalf("unexpected reaction header: %+v", reaction)
	}
	if reaction.Chat == nil || reaction.Chat.ID != 64 {
		t.Fatalf("unexpected chat: %+v", reaction.Chat)
	}
	if reaction.User == nil || reaction.User.ID != 777 {
		t.Fatalf("unexpected user: %+v", reaction.User)
	}
	if reaction.ActorChat == nil || reaction.ActorChat.ID != -1002 {
		t.Fatalf("unexpected actor_chat: %+v", reaction.ActorChat)
	}
	if len(reaction.OldReaction) != 1 {
		t.Fatalf("unexpected old_reaction: %+v", reaction.OldReaction)
	}
	emoji, ok := reaction.OldReaction[0].(types.ReactionTypeEmoji)
	if !ok || emoji.Emoji != "\U0001F44D" {
		t.Fatalf("unexpected old_reaction variant: %#v", reaction.OldReaction[0])
	}
	if len(reaction.NewReaction) != 2 {
		t.Fatalf("unexpected new_reaction: %+v", reaction.NewReaction)
	}
	custom, ok := reaction.NewReaction[0].(types.ReactionTypeCustomEmoji)
	if !ok || custom.CustomEmojiID != "abc123" {
		t.Fatalf("unexpected custom emoji reaction: %#v", reaction.NewReaction[0])
	}
	paid, ok := reaction.NewReaction[1].(types.ReactionTypePaid)
	if !ok || paid.Type != "paid" {
		t.Fatalf("unexpected paid reaction: %#v", reaction.NewReaction[1])
	}
}

func TestUpdateDecode_MessageReactionCount(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":7,"message_reaction_count":{"chat":`+testPrivJSON+`,`+
		`"message_id":99,"date":1750000002,"reactions":[`+
		`{"type":{"type":"emoji","emoji":"❤️"},"total_count":12},`+
		`{"type":{"type":"paid"},"total_count":3}]}}`)

	count := u.MessageReactionCount
	if count == nil {
		t.Fatal("expected message_reaction_count to decode")
	}
	if count.Chat == nil || count.MessageID != 99 || count.Date != 1750000002 {
		t.Fatalf("unexpected count header: %+v", count)
	}
	if len(count.Reactions) != 2 {
		t.Fatalf("unexpected reactions: %+v", count.Reactions)
	}
	first, ok := count.Reactions[0].Type.(types.ReactionTypeEmoji)
	if !ok || first.Emoji != "❤️" {
		t.Fatalf("unexpected first reaction type: %#v", count.Reactions[0].Type)
	}
	if count.Reactions[0].TotalCount != 12 || count.Reactions[1].TotalCount != 3 {
		t.Fatalf("unexpected total counts: %+v", count.Reactions)
	}
}

func TestUpdateDecode_ChosenInlineResult(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":8,"chosen_inline_result":{"result_id":"r-9",`+
		`"from":`+testUserJSON+`,"query":"cats","inline_message_id":"im-1",`+
		`"location":{"latitude":10.5,"longitude":20.5}}}`)

	chosen := u.ChosenInlineResult
	if chosen == nil {
		t.Fatal("expected chosen_inline_result to decode")
	}
	if chosen.ResultID != "r-9" || chosen.Query != "cats" || chosen.InlineMessageID != "im-1" {
		t.Fatalf("unexpected chosen result: %+v", chosen)
	}
	if chosen.From == nil || chosen.From.ID != 777 {
		t.Fatalf("unexpected from: %+v", chosen.From)
	}
	if chosen.Location == nil || chosen.Location.Longitude != 20.5 {
		t.Fatalf("unexpected location: %+v", chosen.Location)
	}
}

func TestUpdateDecode_ShippingQuery(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":9,"shipping_query":{"id":"sq-1",`+
		`"from":`+testUserJSON+`,"invoice_payload":"payload-1",`+
		`"shipping_address":{"country_code":"US","state":"CA","city":"San Francisco",`+
		`"street_line1":"1 Market","street_line2":"Suite 2","post_code":"94105"}}}`)

	query := u.ShippingQuery
	if query == nil {
		t.Fatal("expected shipping_query to decode")
	}
	if query.ID != "sq-1" || query.InvoicePayload != "payload-1" {
		t.Fatalf("unexpected shipping query: %+v", query)
	}
	if query.From == nil || query.From.Username != "alice" {
		t.Fatalf("unexpected payer: %+v", query.From)
	}
	addr := query.ShippingAddress
	if addr == nil || addr.CountryCode != "US" || addr.City != "San Francisco" {
		t.Fatalf("unexpected shipping address: %+v", addr)
	}
	if addr.PostCode != "94105" || addr.StreetLine1 != "1 Market" || addr.StreetLine2 != "Suite 2" {
		t.Fatalf("unexpected shipping address: %+v", addr)
	}
}

func TestUpdateDecode_PreCheckoutQuery(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":10,"pre_checkout_query":{"id":"pq-1",`+
		`"from":`+testUserJSON+`,"currency":"XTR","total_amount":2500,`+
		`"invoice_payload":"payload-1","shipping_option_id":"ship-1",`+
		`"order_info":{"name":"Alice","phone_number":"+1555000","email":"a@example.com",`+
		`"shipping_address":{"country_code":"US","state":"CA","city":"SF",`+
		`"street_line1":"1 Market","street_line2":"","post_code":"94105"}}}}`)

	query := u.PreCheckoutQuery
	if query == nil {
		t.Fatal("expected pre_checkout_query to decode")
	}
	if query.ID != "pq-1" || query.Currency != "XTR" || query.TotalAmount != 2500 {
		t.Fatalf("unexpected pre-checkout query: %+v", query)
	}
	if query.ShippingOptionID != "ship-1" || query.InvoicePayload != "payload-1" {
		t.Fatalf("unexpected pre-checkout query fields: %+v", query)
	}
	if query.OrderInfo == nil || query.OrderInfo.Email != "a@example.com" {
		t.Fatalf("unexpected order info: %+v", query.OrderInfo)
	}
	if query.OrderInfo.ShippingAddress == nil || query.OrderInfo.ShippingAddress.City != "SF" {
		t.Fatalf("unexpected order shipping address: %+v", query.OrderInfo.ShippingAddress)
	}
}

func TestUpdateDecode_PreCheckoutQueryWithoutOptionals(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":11,"pre_checkout_query":{"id":"pq-2",`+
		`"from":`+testUserJSON+`,"currency":"USD","total_amount":10,`+
		`"invoice_payload":"p"}}`)

	query := u.PreCheckoutQuery
	if query == nil {
		t.Fatal("expected pre_checkout_query to decode")
	}
	if query.ShippingOptionID != "" || query.OrderInfo != nil {
		t.Fatalf("expected optional fields to stay empty, got %+v", query)
	}
}

func TestUpdateDecode_PurchasedPaidMedia(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":12,"purchased_paid_media":{`+
		`"from":`+testUserJSON+`,"paid_media_payload":"promo-2026"}}`)

	purchased := u.PurchasedPaidMedia
	if purchased == nil {
		t.Fatal("expected purchased_paid_media to decode")
	}
	if purchased.PaidMediaPayload != "promo-2026" {
		t.Fatalf("unexpected payload: %+v", purchased)
	}
	if purchased.From == nil || purchased.From.FirstName != "Alice" {
		t.Fatalf("unexpected buyer: %+v", purchased.From)
	}
}

func TestUpdateDecode_Subscription(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":13,"subscription":{"invoice_payload":"sub-1",`+
		`"state":"renewed","user":`+testUserJSON+`}}`)

	subscription := u.Subscription
	if subscription == nil {
		t.Fatal("expected subscription to decode")
	}
	if subscription.InvoicePayload != "sub-1" || subscription.State != "renewed" {
		t.Fatalf("unexpected subscription: %+v", subscription)
	}
	if subscription.User == nil || subscription.User.ID != 777 {
		t.Fatalf("unexpected subscriber: %+v", subscription.User)
	}
}

func TestUpdateDecode_StoppedMessageGeneration(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":14,"stopped_message_generation":{"chat":`+testPrivJSON+`,`+
		`"draft_id":4242,"message_thread_id":77}}`)

	stopped := u.StoppedMessageGeneration
	if stopped == nil {
		t.Fatal("expected stopped_message_generation to decode")
	}
	if stopped.DraftID != 4242 {
		t.Fatalf("unexpected draft id: %+v", stopped)
	}
	if stopped.Chat == nil || stopped.Chat.ID != 64 {
		t.Fatalf("unexpected chat: %+v", stopped.Chat)
	}
	if stopped.MessageThreadID == nil || *stopped.MessageThreadID != 77 {
		t.Fatalf("unexpected message thread id: %+v", stopped.MessageThreadID)
	}
}

func TestUpdateDecode_StoppedMessageGenerationWithoutThread(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":15,"stopped_message_generation":{"chat":`+testPrivJSON+`,`+
		`"draft_id":1}}`)

	stopped := u.StoppedMessageGeneration
	if stopped == nil {
		t.Fatal("expected stopped_message_generation to decode")
	}
	if stopped.MessageThreadID != nil {
		t.Fatalf("expected optional message_thread_id to stay nil, got %v", *stopped.MessageThreadID)
	}
}

func TestUpdateDecode_ManagedBot(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":16,"managed_bot":{"bot":{"id":900,"is_bot":true,`+
		`"first_name":"Managed"},"user":`+testUserJSON+`}}`)

	updated := u.ManagedBot
	if updated == nil {
		t.Fatal("expected managed_bot to decode")
	}
	if updated.Bot == nil || updated.Bot.ID != 900 || !updated.Bot.IsBot {
		t.Fatalf("unexpected bot: %+v", updated.Bot)
	}
	if updated.User == nil || updated.User.ID != 777 {
		t.Fatalf("unexpected user: %+v", updated.User)
	}
}

func TestUpdateDecode_GuestMessage(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":17,"guest_message":{"message_id":21,"date":1750000005,`+
		`"chat":`+testPrivJSON+`,"from":`+testUserJSON+`,"text":"guest post"}}`)

	if u.GuestMessage == nil {
		t.Fatal("expected guest_message to decode")
	}
	if u.GuestMessage.MessageID != 21 || u.GuestMessage.Text != "guest post" {
		t.Fatalf("unexpected guest message: %+v", u.GuestMessage)
	}
}

func TestUpdateDecode_AllFieldsRoundTrip(t *testing.T) {
	u := decodeUpdate(t, `{"update_id":18,"business_message":{"message_id":1,"date":1750000000,`+
		`"chat":`+testPrivJSON+`},"deleted_business_messages":{"business_connection_id":"bc",`+
		`"chat":`+testPrivJSON+`,"message_ids":[1]},`+
		`"message_reaction":{"chat":`+testPrivJSON+`,"message_id":1,"date":1,"old_reaction":[],`+
		`"new_reaction":[{"type":"future_kind","value":"x"}]}}`)

	if u.BusinessMessage == nil || u.DeletedBusinessMessages == nil || u.MessageReaction == nil {
		t.Fatalf("expected all three payloads to decode: %+v", u)
	}
	if len(u.MessageReaction.NewReaction) != 1 {
		t.Fatalf("unexpected new_reaction: %+v", u.MessageReaction.NewReaction)
	}
	unknown, ok := u.MessageReaction.NewReaction[0].(types.ReactionTypeUnknown)
	if !ok || unknown.Type != "future_kind" {
		t.Fatalf("expected an unknown reaction variant, got %#v", u.MessageReaction.NewReaction[0])
	}
	if len(unknown.Raw) == 0 {
		t.Fatal("expected unknown reaction to keep its raw JSON")
	}
}
