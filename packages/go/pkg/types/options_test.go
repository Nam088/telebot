package types_test

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/Nam088/telebot-go/pkg/types"
)

func assertContains(t *testing.T, got, want string) {
	t.Helper()
	if !strings.Contains(got, want) {
		t.Errorf("expected JSON to contain %q, got %s", want, got)
	}
}

func assertNotContains(t *testing.T, got, want string) {
	t.Helper()
	if strings.Contains(got, want) {
		t.Errorf("expected JSON not to contain %q, got %s", want, got)
	}
}

func TestSendMediaOptionsSerialization(t *testing.T) {
	audio := &types.SendAudioOptions{
		ChatID:          int64(123),
		Audio:           "file_id",
		Caption:         "caption",
		Duration:        120,
		Performer:       "artist",
		Title:           "track",
		MessageThreadID: 7,
	}
	b, err := json.Marshal(audio)
	if err != nil {
		t.Fatalf("marshal SendAudioOptions: %v", err)
	}
	assertContains(t, string(b), `"chat_id":123`)
	assertContains(t, string(b), `"audio":"file_id"`)
	assertContains(t, string(b), `"caption":"caption"`)
	assertContains(t, string(b), `"duration":120`)
	assertContains(t, string(b), `"performer":"artist"`)
	assertContains(t, string(b), `"title":"track"`)
	assertContains(t, string(b), `"message_thread_id":7`)

	video := &types.SendVideoOptions{
		ChatID:     "@channel",
		Video:      "http://example.com/v.mp4",
		Width:      1920,
		Height:     1080,
		HasSpoiler: true,
	}
	b, err = json.Marshal(video)
	if err != nil {
		t.Fatalf("marshal SendVideoOptions: %v", err)
	}
	assertContains(t, string(b), `"chat_id":"@channel"`)
	assertContains(t, string(b), `"video":"http://example.com/v.mp4"`)
	assertContains(t, string(b), `"width":1920`)
	assertContains(t, string(b), `"has_spoiler":true`)
	assertNotContains(t, string(b), `"duration"`)

	animation := &types.SendAnimationOptions{ChatID: int64(1), Animation: "anim"}
	b, _ = json.Marshal(animation)
	assertContains(t, string(b), `"animation":"anim"`)

	voice := &types.SendVoiceOptions{ChatID: int64(1), Voice: "voice"}
	b, _ = json.Marshal(voice)
	assertContains(t, string(b), `"voice":"voice"`)

	videoNote := &types.SendVideoNoteOptions{ChatID: int64(1), VideoNote: "vn"}
	b, _ = json.Marshal(videoNote)
	assertContains(t, string(b), `"video_note":"vn"`)

	location := &types.SendLocationOptions{
		ChatID:    int64(1),
		Latitude:  10.5,
		Longitude: 20.5,
	}
	b, _ = json.Marshal(location)
	assertContains(t, string(b), `"latitude":10.5`)
	assertContains(t, string(b), `"longitude":20.5`)

	venue := &types.SendVenueOptions{
		ChatID:    int64(1),
		Latitude:  1.0,
		Longitude: 2.0,
		Title:     "Cafe",
		Address:   "Main St",
	}
	b, _ = json.Marshal(venue)
	assertContains(t, string(b), `"title":"Cafe"`)
	assertContains(t, string(b), `"address":"Main St"`)

	contact := &types.SendContactOptions{
		ChatID:      int64(1),
		PhoneNumber: "+123",
		FirstName:   "Alice",
	}
	b, _ = json.Marshal(contact)
	assertContains(t, string(b), `"phone_number":"+123"`)
	assertContains(t, string(b), `"first_name":"Alice"`)

	poll := &types.SendPollOptions{
		ChatID:   int64(1),
		Question: "Q?",
		Options:  []string{"A", "B"},
	}
	b, _ = json.Marshal(poll)
	assertContains(t, string(b), `"question":"Q?"`)
	assertContains(t, string(b), `"options":["A","B"]`)

	dice := &types.SendDiceOptions{ChatID: int64(1), Emoji: "🎲"}
	b, _ = json.Marshal(dice)
	assertContains(t, string(b), `"emoji":"🎲"`)

	mg := &types.SendMediaGroupOptions{
		ChatID: int64(1),
		Media: []types.InputMedia{
			types.InputMediaPhoto{Type: "photo", Media: "p1"},
			types.InputMediaVideo{Type: "video", Media: "v1"},
		},
	}
	b, _ = json.Marshal(mg)
	assertContains(t, string(b), `"type":"photo"`)
	assertContains(t, string(b), `"type":"video"`)
}

func TestSendMediaOptionsOmitempty(t *testing.T) {
	minimal := &types.SendAudioOptions{ChatID: int64(1), Audio: "a"}
	b, _ := json.Marshal(minimal)
	assertNotContains(t, string(b), `"business_connection_id"`)
	assertNotContains(t, string(b), `"caption"`)
	assertNotContains(t, string(b), `"duration"`)
	assertNotContains(t, string(b), `"reply_markup"`)
}

func TestEditingOptionsSerialization(t *testing.T) {
	text := &types.EditMessageTextOptions{
		ChatID:    int64(1),
		MessageID: 42,
		Text:      "new text",
		ParseMode: "HTML",
		LinkPreviewOptions: &types.LinkPreviewOptions{
			IsDisabled: true,
		},
	}
	b, err := json.Marshal(text)
	if err != nil {
		t.Fatalf("marshal EditMessageTextOptions: %v", err)
	}
	assertContains(t, string(b), `"chat_id":1`)
	assertContains(t, string(b), `"message_id":42`)
	assertContains(t, string(b), `"text":"new text"`)
	assertContains(t, string(b), `"parse_mode":"HTML"`)
	assertContains(t, string(b), `"link_preview_options":{"is_disabled":true}`)

	caption := &types.EditMessageCaptionOptions{
		InlineMessageID: "abc",
		Caption:         "cap",
	}
	b, _ = json.Marshal(caption)
	assertContains(t, string(b), `"inline_message_id":"abc"`)
	assertContains(t, string(b), `"caption":"cap"`)

	media := &types.EditMessageMediaOptions{
		ChatID: int64(1),
		Media:  types.InputMediaDocument{Type: "document", Media: "doc"},
	}
	b, _ = json.Marshal(media)
	assertContains(t, string(b), `"media":{"type":"document","media":"doc"}`)

	live := &types.EditMessageLiveLocationOptions{
		Latitude:  1.0,
		Longitude: 2.0,
		Heading:   90,
	}
	b, _ = json.Marshal(live)
	assertContains(t, string(b), `"latitude":1`)
	assertContains(t, string(b), `"heading":90`)

	stopLive := &types.StopMessageLiveLocationOptions{
		ChatID:    int64(1),
		MessageID: 42,
	}
	b, _ = json.Marshal(stopLive)
	assertContains(t, string(b), `"message_id":42`)

	poll := &types.StopPollOptions{
		ChatID:    int64(1),
		MessageID: 42,
	}
	b, _ = json.Marshal(poll)
	assertContains(t, string(b), `"chat_id":1`)
	assertContains(t, string(b), `"message_id":42`)
}

func TestChatOptionsSerialization(t *testing.T) {
	title := &types.SetChatTitleOptions{ChatID: int64(1), Title: "T"}
	b, _ := json.Marshal(title)
	assertContains(t, string(b), `"title":"T"`)

	desc := &types.SetChatDescriptionOptions{ChatID: int64(1)}
	b, _ = json.Marshal(desc)
	assertNotContains(t, string(b), `"description"`)

	photo := &types.SetChatPhotoOptions{ChatID: int64(1), Photo: "photo"}
	b, _ = json.Marshal(photo)
	assertContains(t, string(b), `"photo":"photo"`)

	pin := &types.PinChatMessageOptions{ChatID: int64(1), MessageID: 42}
	b, _ = json.Marshal(pin)
	assertContains(t, string(b), `"message_id":42`)

	unpin := &types.UnpinChatMessageOptions{ChatID: int64(1)}
	b, _ = json.Marshal(unpin)
	assertNotContains(t, string(b), `"message_id"`)

	permissions := &types.SetChatPermissionsOptions{
		ChatID: int64(1),
		Permissions: types.ChatPermissions{
			CanSendMessages: true,
		},
		UseIndependentChatPermissions: true,
	}
	b, _ = json.Marshal(permissions)
	assertContains(t, string(b), `"can_send_messages":true`)
	assertContains(t, string(b), `"use_independent_chat_permissions":true`)

	export := &types.ExportChatInviteLinkOptions{ChatID: "@c"}
	b, _ = json.Marshal(export)
	assertContains(t, string(b), `"chat_id":"@c"`)

	menu := &types.SetChatMenuButtonOptions{
		ChatID:     int64(1),
		MenuButton: types.MenuButtonWebApp{Type: "web_app", Text: "Open", WebApp: types.WebAppInfo{URL: "https://example.com"}},
	}
	b, _ = json.Marshal(menu)
	assertContains(t, string(b), `"type":"web_app"`)
	assertContains(t, string(b), `"text":"Open"`)

	getMenu := &types.GetChatMenuButtonOptions{ChatID: int64(1)}
	b, _ = json.Marshal(getMenu)
	assertContains(t, string(b), `"chat_id":1`)

	rights := &types.SetMyDefaultAdministratorRightsOptions{
		Rights: &types.ChatAdministratorRights{
			IsAnonymous:   false,
			CanManageChat: true,
		},
		ForChannels: true,
	}
	b, _ = json.Marshal(rights)
	assertContains(t, string(b), `"can_manage_chat":true`)
	assertContains(t, string(b), `"for_channels":true`)
}

func TestProfileOptionsSerialization(t *testing.T) {
	name := &types.SetMyNameOptions{Name: "Bot", LanguageCode: "en"}
	b, _ := json.Marshal(name)
	assertContains(t, string(b), `"name":"Bot"`)
	assertContains(t, string(b), `"language_code":"en"`)

	getName := &types.GetMyNameOptions{LanguageCode: "en"}
	b, _ = json.Marshal(getName)
	assertContains(t, string(b), `"language_code":"en"`)

	desc := &types.SetMyDescriptionOptions{Description: "desc", LanguageCode: "en"}
	b, _ = json.Marshal(desc)
	assertContains(t, string(b), `"description":"desc"`)

	getDesc := &types.GetMyDescriptionOptions{LanguageCode: "en"}
	b, _ = json.Marshal(getDesc)
	assertContains(t, string(b), `"language_code":"en"`)

	short := &types.SetMyShortDescriptionOptions{ShortDescription: "short", LanguageCode: "en"}
	b, _ = json.Marshal(short)
	assertContains(t, string(b), `"short_description":"short"`)

	getShort := &types.GetMyShortDescriptionOptions{LanguageCode: "en"}
	b, _ = json.Marshal(getShort)
	assertContains(t, string(b), `"language_code":"en"`)

	scope := types.BotCommandScopeChat{Type: "chat", ChatID: int64(1)}
	del := &types.DeleteMyCommandsOptions{Scope: scope, LanguageCode: "en"}
	b, _ = json.Marshal(del)
	assertContains(t, string(b), `"type":"chat"`)
	assertContains(t, string(b), `"chat_id":1`)
}

func TestInlineOptionsSerialization(t *testing.T) {
	answer := &types.AnswerInlineQueryOptions{
		InlineQueryID: "q1",
		Results: []types.InlineQueryResult{
			{"type": "article", "id": "1", "title": "A"},
		},
		CacheTime:  60,
		IsPersonal: true,
		NextOffset: "off",
	}
	b, err := json.Marshal(answer)
	if err != nil {
		t.Fatalf("marshal AnswerInlineQueryOptions: %v", err)
	}
	assertContains(t, string(b), `"inline_query_id":"q1"`)
	assertContains(t, string(b), `"results":[{`)
	assertContains(t, string(b), `"type":"article"`)
	assertContains(t, string(b), `"cache_time":60`)
	assertContains(t, string(b), `"is_personal":true`)
	assertContains(t, string(b), `"next_offset":"off"`)

	webapp := &types.AnswerWebAppQueryOptions{
		WebAppQueryID: "w1",
		Result:        types.InlineQueryResult{"type": "article"},
	}
	b, _ = json.Marshal(webapp)
	assertContains(t, string(b), `"web_app_query_id":"w1"`)

	save := &types.SavePreparedInlineMessageOptions{
		UserID:            123,
		Result:            types.InlineQueryResult{"type": "article"},
		AllowUserChats:    true,
		AllowChannelChats: true,
	}
	b, _ = json.Marshal(save)
	assertContains(t, string(b), `"user_id":123`)
	assertContains(t, string(b), `"allow_user_chats":true`)
	assertContains(t, string(b), `"allow_channel_chats":true`)
}
