package types_test

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestInputChecklistRoundTripsEveryField pins the wire shape of the checklist
// request object that SendChecklistOptions and EditMessageChecklistOptions now
// type as *types.InputChecklist instead of a raw map.
func TestInputChecklistRoundTripsEveryField(t *testing.T) {
	checklist := types.InputChecklist{
		Title:     "Departure",
		ParseMode: "MarkdownV2",
		TitleEntities: []types.MessageEntity{
			{Type: "bold", Offset: 0, Length: 8},
		},
		Tasks: []types.InputChecklistTask{
			{ID: 1, Text: "Pack the bag"},
			{ID: 2, Text: "Check in", ParseMode: "HTML", TextEntities: []types.MessageEntity{
				{Type: "italic", Offset: 1, Length: 3},
			}},
		},
		OthersCanAddTasks:        true,
		OthersCanMarkTasksAsDone: true,
	}

	raw, err := json.Marshal(&checklist)
	if err != nil {
		t.Fatalf("marshal InputChecklist: %v", err)
	}
	for _, want := range []string{
		`"title":"Departure"`, `"parse_mode":"MarkdownV2"`, `"title_entities":[{`,
		`"tasks":[{`, `"id":2`, `"text":"Check in"`, `"text_entities":[{`,
		`"others_can_add_tasks":true`, `"others_can_mark_tasks_as_done":true`,
	} {
		if !strings.Contains(string(raw), want) {
			t.Errorf("serialized checklist missing %s\n got %s", want, raw)
		}
	}

	var decoded types.InputChecklist
	if err := json.Unmarshal(raw, &decoded); err != nil {
		t.Fatalf("unmarshal InputChecklist: %v", err)
	}
	if decoded.Title != "Departure" || decoded.ParseMode != "MarkdownV2" ||
		len(decoded.TitleEntities) != 1 || decoded.TitleEntities[0].Type != "bold" ||
		!decoded.OthersCanAddTasks || !decoded.OthersCanMarkTasksAsDone {
		t.Errorf("checklist header not round-tripped: %+v", decoded)
	}
	if len(decoded.Tasks) != 2 {
		t.Fatalf("tasks = %+v", decoded.Tasks)
	}
	if decoded.Tasks[0].ID != 1 || decoded.Tasks[0].Text != "Pack the bag" ||
		decoded.Tasks[0].ParseMode != "" || len(decoded.Tasks[0].TextEntities) != 0 {
		t.Errorf("task 1 = %+v", decoded.Tasks[0])
	}
	if decoded.Tasks[1].ID != 2 || decoded.Tasks[1].Text != "Check in" ||
		decoded.Tasks[1].ParseMode != "HTML" || len(decoded.Tasks[1].TextEntities) != 1 ||
		decoded.Tasks[1].TextEntities[0].Type != "italic" {
		t.Errorf("task 2 = %+v", decoded.Tasks[1])
	}

	// A minimal checklist omits every optional key.
	trimmed, err := json.Marshal(&types.InputChecklist{
		Title: "T",
		Tasks: []types.InputChecklistTask{{ID: 1, Text: "t"}},
	})
	if err != nil {
		t.Fatalf("marshal minimal InputChecklist: %v", err)
	}
	want := `{"title":"T","tasks":[{"id":1,"text":"t"}]}`
	if string(trimmed) != want {
		t.Errorf("minimal checklist:\n got %s\nwant %s", trimmed, want)
	}
}

// TestInputPollOptionDecodesEntitiesAndMedia covers the sendPoll option object.
// It is request-only, and its media field is the InputMedia union interface, so
// the decode direction is pinned without media and the media direction is
// pinned on the way out to the wire.
func TestInputPollOptionDecodesEntitiesAndMedia(t *testing.T) {
	var option types.InputPollOption
	payload := `{
	  "text": "Go",
	  "text_parse_mode": "MarkdownV2",
	  "text_entities": [{"type": "custom_emoji", "offset": 0, "length": 2, "custom_emoji_id": "ce9"}]
	}`
	if err := json.Unmarshal([]byte(payload), &option); err != nil {
		t.Fatalf("unmarshal InputPollOption: %v", err)
	}
	if option.Text != "Go" || option.TextParseMode != "MarkdownV2" {
		t.Errorf("InputPollOption header = %+v", option)
	}
	if len(option.TextEntities) != 1 || option.TextEntities[0].CustomEmojiID != "ce9" {
		t.Errorf("text_entities = %+v", option.TextEntities)
	}
	if option.Media != nil {
		t.Errorf("media = %+v, want nil when the wire omits it", option.Media)
	}

	raw, err := json.Marshal(&types.InputPollOption{
		Text:          "Python",
		TextParseMode: "HTML",
		TextEntities:  []types.MessageEntity{{Type: "custom_emoji", Offset: 1, Length: 2, CustomEmojiID: "ce1"}},
		Media:         &types.InputMediaPhoto{Type: "photo", Media: "AgAC", Caption: "nice"},
	})
	if err != nil {
		t.Fatalf("marshal InputPollOption: %v", err)
	}
	body := string(raw)
	for _, want := range []string{
		`"text":"Python"`, `"text_parse_mode":"HTML"`, `"text_entities":[{`,
		`"media":{"type":"photo","media":"AgAC","caption":"nice"}`,
	} {
		if !strings.Contains(body, want) {
			t.Errorf("serialized option missing %s\n got %s", want, body)
		}
	}

	trimmed, err := json.Marshal(&types.InputPollOption{Text: "Rust"})
	if err != nil {
		t.Fatalf("marshal minimal InputPollOption: %v", err)
	}
	if string(trimmed) != `{"text":"Rust"}` {
		t.Errorf("minimal InputPollOption payload = %s", trimmed)
	}
}

// TestInputProfilePhotoVariants pin the two shapes setMyProfilePhoto and
// setBusinessAccountProfilePhoto accept for their InputProfilePhoto parameter.
func TestInputProfilePhotoVariants(t *testing.T) {
	static, err := json.Marshal(&types.InputProfilePhotoStatic{Type: "static", Photo: "attach://photo"})
	if err != nil {
		t.Fatalf("marshal InputProfilePhotoStatic: %v", err)
	}
	if string(static) != `{"type":"static","photo":"attach://photo"}` {
		t.Errorf("static profile photo = %s", static)
	}

	animated, err := json.Marshal(&types.InputProfilePhotoAnimated{
		Type:               "animated",
		Animation:          "attach://animation",
		MainFrameTimestamp: 1.5,
	})
	if err != nil {
		t.Fatalf("marshal InputProfilePhotoAnimated: %v", err)
	}
	if string(animated) != `{"type":"animated","animation":"attach://animation","main_frame_timestamp":1.5}` {
		t.Errorf("animated profile photo = %s", animated)
	}

	var decoded types.InputProfilePhotoAnimated
	if err := json.Unmarshal(animated, &decoded); err != nil {
		t.Fatalf("unmarshal InputProfilePhotoAnimated: %v", err)
	}
	if decoded.Type != "animated" || decoded.Animation != "attach://animation" || decoded.MainFrameTimestamp != 1.5 {
		t.Errorf("animated profile photo not decoded: %+v", decoded)
	}
}

// TestInlineInputMessageContents pin the four input_message_content variants
// that ride inside types.InlineQueryResult maps.
func TestInlineInputMessageContents(t *testing.T) {
	var contact types.InputContactMessageContent
	if err := json.Unmarshal([]byte(`{
	  "phone_number": "+84900000000", "first_name": "Ann", "last_name": "Nguyen", "vcard": "VCARD"
	}`), &contact); err != nil {
		t.Fatalf("unmarshal InputContactMessageContent: %v", err)
	}
	if contact.PhoneNumber != "+84900000000" || contact.FirstName != "Ann" ||
		contact.LastName != "Nguyen" || contact.VCard != "VCARD" {
		t.Errorf("InputContactMessageContent = %+v", contact)
	}

	var location types.InputLocationMessageContent
	if err := json.Unmarshal([]byte(`{
	  "latitude": 10.7769, "longitude": 106.7009, "horizontal_accuracy": 25.5,
	  "live_period": 3600, "heading": 90, "proximity_alert_radius": 500
	}`), &location); err != nil {
		t.Fatalf("unmarshal InputLocationMessageContent: %v", err)
	}
	if location.Latitude != 10.7769 || location.Longitude != 106.7009 ||
		location.HorizontalAccuracy != 25.5 || location.LivePeriod != 3600 ||
		location.Heading != 90 || location.ProximityAlertRadius != 500 {
		t.Errorf("InputLocationMessageContent = %+v", location)
	}

	var venue types.InputVenueMessageContent
	if err := json.Unmarshal([]byte(`{
	  "latitude": 10.5, "longitude": 106.6, "title": "Opera House", "address": "Lam Son square",
	  "foursquare_id": "fs1", "foursquare_type": "arts_entertainment/theater",
	  "google_place_id": "gp1", "google_place_type": "point_of_interest"
	}`), &venue); err != nil {
		t.Fatalf("unmarshal InputVenueMessageContent: %v", err)
	}
	if venue.Latitude != 10.5 || venue.Longitude != 106.6 || venue.Title != "Opera House" ||
		venue.Address != "Lam Son square" || venue.FoursquareID != "fs1" ||
		venue.FoursquareType != "arts_entertainment/theater" ||
		venue.GooglePlaceID != "gp1" || venue.GooglePlaceType != "point_of_interest" {
		t.Errorf("InputVenueMessageContent = %+v", venue)
	}

	var invoice types.InputInvoiceMessageContent
	if err := json.Unmarshal([]byte(`{
	  "title": "Shirt", "description": "Cotton shirt", "payload": "order-1",
	  "provider_token": "pt", "currency": "XTR",
	  "prices": [{"label": "Shirt", "amount": 500}],
	  "max_tip_amount": 200, "suggested_tip_amounts": [50, 100, 200],
	  "provider_data": "{}", "photo_url": "https://example.com/p.png",
	  "photo_size": 1024, "photo_width": 200, "photo_height": 100,
	  "need_name": true, "need_phone_number": true, "need_email": true,
	  "need_shipping_address": true, "send_phone_number_to_provider": true,
	  "send_email_to_provider": true, "is_flexible": true
	}`), &invoice); err != nil {
		t.Fatalf("unmarshal InputInvoiceMessageContent: %v", err)
	}
	if invoice.Title != "Shirt" || invoice.Description != "Cotton shirt" ||
		invoice.Payload != "order-1" || invoice.ProviderToken != "pt" ||
		invoice.Currency != "XTR" {
		t.Errorf("invoice header = %+v", invoice)
	}
	if len(invoice.Prices) != 1 || invoice.Prices[0].Label != "Shirt" || invoice.Prices[0].Amount != 500 {
		t.Errorf("prices = %+v", invoice.Prices)
	}
	if invoice.MaxTipAmount != 200 || len(invoice.SuggestedTipAmounts) != 3 ||
		invoice.SuggestedTipAmounts[2] != 200 || invoice.ProviderData != "{}" ||
		invoice.PhotoURL != "https://example.com/p.png" || invoice.PhotoSize != 1024 ||
		invoice.PhotoWidth != 200 || invoice.PhotoHeight != 100 {
		t.Errorf("invoice amounts/photo not decoded: %+v", invoice)
	}
	if !invoice.NeedName || !invoice.NeedPhoneNumber || !invoice.NeedEmail ||
		!invoice.NeedShippingAddress || !invoice.SendPhoneNumberToProvider ||
		!invoice.SendEmailToProvider || !invoice.IsFlexible {
		t.Errorf("invoice requirement flags not decoded: %+v", invoice)
	}

	raw, err := json.Marshal(&invoice)
	if err != nil {
		t.Fatalf("marshal InputInvoiceMessageContent: %v", err)
	}
	for _, key := range []string{
		`"title"`, `"description"`, `"payload"`, `"provider_token"`, `"currency"`, `"prices"`,
		`"max_tip_amount"`, `"suggested_tip_amounts"`, `"provider_data"`, `"photo_url"`,
		`"photo_size"`, `"photo_width"`, `"photo_height"`, `"need_name"`, `"need_phone_number"`,
		`"need_email"`, `"need_shipping_address"`, `"send_phone_number_to_provider"`,
		`"send_email_to_provider"`, `"is_flexible"`,
	} {
		if !strings.Contains(string(raw), key) {
			t.Errorf("serialized invoice missing %s\n got %s", key, raw)
		}
	}
}

// TestSuggestedPostParametersDecodes covers the request-side suggested post
// object that SendRichMessageOptions and SendPaidMediaOptions now type
// concretely.
func TestSuggestedPostParametersDecodes(t *testing.T) {
	var params types.SuggestedPostParameters
	if err := json.Unmarshal([]byte(`{
	  "price": {"currency": "XTR", "amount": 100},
	  "send_date": 1770000000
	}`), &params); err != nil {
		t.Fatalf("unmarshal SuggestedPostParameters: %v", err)
	}
	if params.Price == nil || params.Price.Currency != "XTR" || params.Price.Amount != 100 {
		t.Errorf("price = %+v", params.Price)
	}
	if params.SendDate != 1770000000 {
		t.Errorf("send_date = %d", params.SendDate)
	}

	// An unpaid, undated post still encodes as an empty object once the pointer
	// is set, which is how a caller distinguishes "no suggestions" from "free and
	// whenever".
	raw, err := json.Marshal(&types.SendRichMessageOptions{
		ChatID:                  int64(1),
		SuggestedPostParameters: &types.SuggestedPostParameters{},
	})
	if err != nil {
		t.Fatalf("marshal SendRichMessageOptions: %v", err)
	}
	if !strings.Contains(string(raw), `"suggested_post_parameters":{}`) {
		t.Errorf("suggested_post_parameters not serialized: %s", raw)
	}
	if strings.Contains(string(raw), `"suggested_post_parameters":null`) {
		t.Errorf("unset suggested post parameters must not serialize as null: %s", raw)
	}
}

// TestLocationAddressDecodesEveryField covers the address object Telegram sends
// for a location story area and a location-annotated chat.
func TestLocationAddressDecodesEveryField(t *testing.T) {
	var address types.LocationAddress
	if err := json.Unmarshal([]byte(`{
	  "country_code": "VN", "state": "Ho Chi Minh", "city": "District 1", "street": "Nguyen Hue"
	}`), &address); err != nil {
		t.Fatalf("unmarshal LocationAddress: %v", err)
	}
	if address.CountryCode != "VN" || address.State != "Ho Chi Minh" ||
		address.City != "District 1" || address.Street != "Nguyen Hue" {
		t.Errorf("LocationAddress = %+v", address)
	}

	// Only country_code is required, so the other three drop out of the wire.
	raw, err := json.Marshal(&types.LocationAddress{CountryCode: "DE"})
	if err != nil {
		t.Fatalf("marshal LocationAddress: %v", err)
	}
	if string(raw) != `{"country_code":"DE"}` {
		t.Errorf("LocationAddress payload = %s", raw)
	}
}

// TestPreparedKeyboardButtonAndSentGuestMessageDecode covers the two small
// inline result objects: the savePreparedKeyboardButton reply, which the bot
// method now returns typed, and the answerGuestQuery reply shape.
func TestPreparedKeyboardButtonAndSentGuestMessageDecode(t *testing.T) {
	var button types.PreparedKeyboardButton
	if err := json.Unmarshal([]byte(`{"id": "pk1"}`), &button); err != nil {
		t.Fatalf("unmarshal PreparedKeyboardButton: %v", err)
	}
	if button.ID != "pk1" {
		t.Errorf("PreparedKeyboardButton = %+v", button)
	}

	var sent types.SentGuestMessage
	if err := json.Unmarshal([]byte(`{"inline_message_id": "abc"}`), &sent); err != nil {
		t.Fatalf("unmarshal SentGuestMessage: %v", err)
	}
	if sent.InlineMessageID != "abc" {
		t.Errorf("SentGuestMessage = %+v", sent)
	}
	// inline_message_id is required, so unlike SentWebAppMessage the field never
	// drops off the wire.
	raw, err := json.Marshal(&types.SentGuestMessage{})
	if err != nil {
		t.Fatalf("marshal SentGuestMessage: %v", err)
	}
	if string(raw) != `{"inline_message_id":""}` {
		t.Errorf("SentGuestMessage payload = %s", raw)
	}
}

// The blank-identifier assignment below is a compile-time check: if
// StoryAreaTypeUniqueGift ever stops implementing the union interface this
// file fails to build instead of silently passing.
var _ types.StoryAreaType = types.StoryAreaTypeUniqueGift{}

// TestStoryAreaTypeUniqueGiftDecodes reads back the unique gift story area
// variant through the StoryAreaType union slot.
func TestStoryAreaTypeUniqueGiftDecodes(t *testing.T) {
	var gift types.StoryAreaTypeUniqueGift
	if err := json.Unmarshal([]byte(`{"type": "unique_gift", "name": "Bear"}`), &gift); err != nil {
		t.Fatalf("unmarshal StoryAreaTypeUniqueGift: %v", err)
	}
	if gift.Type != "unique_gift" || gift.Name != "Bear" {
		t.Errorf("StoryAreaTypeUniqueGift = %+v", gift)
	}

	// The variant can be placed in a StoryArea without a cast.
	area := types.StoryArea{Type: gift}
	stored, ok := area.Type.(types.StoryAreaTypeUniqueGift)
	if !ok || stored.Name != "Bear" {
		t.Errorf("StoryArea.Type = %#v, want the unique gift variant", area.Type)
	}
}

// TestBusinessChatTypesDecode reads the four business objects ChatFullInfo
// nests, independently of the full chat payload.
func TestBusinessChatTypesDecode(t *testing.T) {
	var intro types.BusinessIntro
	if err := json.Unmarshal([]byte(`{
	  "title": "Acme", "message": "How can we help?",
	  "sticker": {"file_id": "S1", "file_unique_id": "S1u", "type": "custom_emoji", "width": 100, "height": 100, "is_animated": false, "is_video": false, "custom_emoji_id": "ce2"}
	}`), &intro); err != nil {
		t.Fatalf("unmarshal BusinessIntro: %v", err)
	}
	if intro.Title != "Acme" || intro.Message != "How can we help?" ||
		intro.Sticker == nil || intro.Sticker.CustomEmojiID != "ce2" {
		t.Errorf("BusinessIntro = %+v", intro)
	}

	var location types.BusinessLocation
	if err := json.Unmarshal([]byte(`{
	  "address": "10 Example St",
	  "location": {"latitude": 1.3521, "longitude": 103.8198, "horizontal_accuracy": 12.5, "live_period": 60, "heading": 45, "proximity_alert_radius": 100}
	}`), &location); err != nil {
		t.Fatalf("unmarshal BusinessLocation: %v", err)
	}
	if location.Address != "10 Example St" || location.Location == nil ||
		location.Location.Latitude != 1.3521 || location.Location.Heading != 45 {
		t.Errorf("BusinessLocation = %+v", location)
	}

	// A business location without a pinned map point omits the location key.
	bare, err := json.Marshal(&types.BusinessLocation{Address: "Somewhere"})
	if err != nil {
		t.Fatalf("marshal BusinessLocation: %v", err)
	}
	if string(bare) != `{"address":"Somewhere"}` {
		t.Errorf("BusinessLocation payload = %s", bare)
	}

	var hours types.BusinessOpeningHours
	if err := json.Unmarshal([]byte(`{
	  "time_zone_name": "Asia/Singapore",
	  "opening_hours": [{"opening_minute": 0, "closing_minute": 60}, {"opening_minute": 1440, "closing_minute": 1500}]
	}`), &hours); err != nil {
		t.Fatalf("unmarshal BusinessOpeningHours: %v", err)
	}
	if hours.TimeZoneName != "Asia/Singapore" || len(hours.OpeningHours) != 2 {
		t.Fatalf("BusinessOpeningHours = %+v", hours)
	}
	if hours.OpeningHours[0].OpeningMinute != 0 || hours.OpeningHours[0].ClosingMinute != 60 ||
		hours.OpeningHours[1].OpeningMinute != 1440 || hours.OpeningHours[1].ClosingMinute != 1500 {
		t.Errorf("opening hour intervals = %+v", hours.OpeningHours)
	}
}
