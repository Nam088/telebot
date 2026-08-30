package keyboard_test

import (
	"encoding/json"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/components/keyboard"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestKeyboardButtonDecodesRequestVariants covers the Bot API reply-keyboard
// button fields that are modelled in this package: style, icon and every
// request_* variant.
func TestKeyboardButtonDecodesRequestVariants(t *testing.T) {
	var button keyboard.KeyboardButton
	payload := `{
	  "text": "Pick",
	  "style": "primary",
	  "icon_custom_emoji_id": "e2",
	  "request_users": {"request_id": 1, "max_quantity": 3, "request_name": true},
	  "request_chat": {"request_id": 2, "chat_is_channel": true,
	    "user_administrator_rights": {"can_manage_chat": true, "can_post_stories": true}},
	  "request_poll": {"type": "quiz"},
	  "request_managed_bot": {"request_id": 3, "suggested_name": "My bot", "suggested_username": "my_bot"},
	  "web_app": {"url": "https://example.com"},
	  "request_contact": true
	}`
	if err := json.Unmarshal([]byte(payload), &button); err != nil {
		t.Fatalf("unmarshal keyboard button: %v", err)
	}
	if button.Style != "primary" || button.IconCustomEmojiID != "e2" {
		t.Errorf("style/emoji not decoded: %+v", button)
	}
	if button.RequestUsers == nil || button.RequestUsers.RequestID != 1 ||
		button.RequestUsers.MaxQuantity != 3 || !button.RequestUsers.RequestName {
		t.Errorf("request_users = %+v", button.RequestUsers)
	}
	if button.RequestChat == nil || !button.RequestChat.ChatIsChannel ||
		button.RequestChat.UserAdministratorRights == nil ||
		!button.RequestChat.UserAdministratorRights.CanPostStories {
		t.Errorf("request_chat = %+v", button.RequestChat)
	}
	if button.RequestPoll == nil || button.RequestPoll.Type != "quiz" {
		t.Errorf("request_poll = %+v", button.RequestPoll)
	}
	if button.RequestManagedBot == nil || button.RequestManagedBot.SuggestedUsername != "my_bot" {
		t.Errorf("request_managed_bot = %+v", button.RequestManagedBot)
	}
	if button.WebApp == nil || button.WebApp.URL != "https://example.com" {
		t.Errorf("web_app = %+v", button.WebApp)
	}
	if !button.RequestContact {
		t.Error("request_contact not decoded")
	}
}

// TestReplyKeyboardMarkupEncodesAllFields pins the wire shape of every
// ReplyKeyboardMarkup option, including the Bot API 10.3 additions.
func TestReplyKeyboardMarkupEncodesAllFields(t *testing.T) {
	markup := keyboard.ReplyKeyboardMarkup{
		Keyboard: [][]keyboard.KeyboardButton{{
			{Text: "Share", RequestUsers: &types.KeyboardButtonRequestUsers{RequestID: 1}},
		}},
		IsPersistent: true,
		Selective:    true,
		ForceReply:   true,
	}
	raw, err := json.Marshal(markup)
	if err != nil {
		t.Fatalf("marshal markup: %v", err)
	}
	var got map[string]any
	if err := json.Unmarshal(raw, &got); err != nil {
		t.Fatalf("unmarshal markup: %v", err)
	}
	for _, key := range []string{"is_persistent", "selective", "force_reply", "keyboard"} {
		if _, ok := got[key]; !ok {
			t.Errorf("missing %q in %s", key, raw)
		}
	}
	for _, key := range []string{"resize_keyboard", "one_time_keyboard", "input_field_placeholder"} {
		if _, ok := got[key]; ok {
			t.Errorf("unset %q leaked into %s", key, raw)
		}
	}
}

// TestReplyKeyboardRemoveAndForceReplyMarshalMarkers checks that the marker
// field of each reply-markup type is always present on the wire.
func TestReplyKeyboardRemoveAndForceReplyMarshalMarkers(t *testing.T) {
	remove, err := json.Marshal(keyboard.ReplyKeyboardRemove{RemoveKeyboard: true, Selective: true})
	if err != nil {
		t.Fatalf("marshal reply keyboard remove: %v", err)
	}
	if string(remove) != `{"remove_keyboard":true,"selective":true}` {
		t.Errorf("remove markup = %s", remove)
	}

	force, err := json.Marshal(keyboard.ForceReply{ForceReply: true, InputFieldPlaceholder: "Type here"})
	if err != nil {
		t.Fatalf("marshal force reply: %v", err)
	}
	if string(force) != `{"force_reply":true,"input_field_placeholder":"Type here"}` {
		t.Errorf("force-reply markup = %s", force)
	}
}
