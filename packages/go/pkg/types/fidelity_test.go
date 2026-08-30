package types_test

import (
	"encoding/json"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestPollDecodesBotApiTenFields covers the Bot API 10.x poll fields: quiz
// media, persistent option identifiers and the description/entity split.
func TestPollDecodesBotApiTenFields(t *testing.T) {
	payload := `{
      "id": "poll-1",
      "question": "Best language? [b]really[/b]",
      "question_entities": [{"type": "bold", "offset": 16, "length": 19}],
      "description": "pick one",
      "description_entities": [],
      "media": {"link": {"url": "https://example.com"}},
      "options": [
        {"text": "Go", "voter_count": 3, "persistent_id": "po-1", "text_entities": [],
         "media": {"photo": [{"file_id": "f", "file_unique_id": "u", "width": 1, "height": 1}]},
         "added_by_user": {"id": 5, "is_bot": false, "first_name": "Ann"}, "addition_date": 1750000000},
        {"text": "Python", "voter_count": 2, "persistent_id": "po-2"}
      ],
      "total_voter_count": 5,
      "is_closed": false,
      "is_anonymous": true,
      "type": "quiz",
      "allows_multiple_answers": false,
      "allows_revoting": true,
      "correct_option_ids": [0],
      "members_only": true,
      "country_codes": ["VN"],
      "explanation": "why",
      "explanation_entities": [],
      "explanation_media": {"animation": {"file_id": "a", "file_unique_id": "au"}},
      "open_period": 60,
      "close_date": 1750009999
    }`
	var poll types.Poll
	if err := json.Unmarshal([]byte(payload), &poll); err != nil {
		t.Fatalf("unmarshal poll: %v", err)
	}
	if !poll.AllowsRevoting || !poll.MembersOnly || poll.OpenPeriod != 60 || poll.CloseDate != 1750009999 {
		t.Errorf("poll flags/times not decoded: %+v", poll)
	}
	if len(poll.CorrectOptionIDs) != 1 || poll.CorrectOptionIDs[0] != 0 {
		t.Errorf("correct_option_ids = %v, want [0]", poll.CorrectOptionIDs)
	}
	if len(poll.QuestionEntities) != 1 || poll.QuestionEntities[0].Type != "bold" {
		t.Errorf("question_entities = %+v", poll.QuestionEntities)
	}
	if poll.Media == nil || poll.Media.Link == nil || poll.Media.Link.URL != "https://example.com" {
		t.Errorf("poll media = %+v, want link", poll.Media)
	}
	if poll.ExplanationMedia == nil || poll.ExplanationMedia.Animation == nil {
		t.Errorf("explanation_media = %+v, want animation", poll.ExplanationMedia)
	}
	opt := poll.Options[0]
	if opt.PersistentID != "po-1" {
		t.Errorf("option persistent_id = %q", opt.PersistentID)
	}
	if opt.Media == nil || len(opt.Media.Photo) != 1 || opt.AdditionDate != 1750000000 {
		t.Errorf("option media/date = %+v", opt)
	}
	if opt.AddedByUser == nil || opt.AddedByUser.ID != 5 {
		t.Errorf("option added_by_user = %+v", opt.AddedByUser)
	}
}

func TestPollAnswerCarriesPersistentOptionIDs(t *testing.T) {
	var answer types.PollAnswer
	err := json.Unmarshal([]byte(`{"poll_id":"p","option_ids":[1],"option_persistent_ids":["a","b"],
	  "voter_chat":{"id":-100,"type":"channel","title":"T"}}`), &answer)
	if err != nil {
		t.Fatalf("unmarshal poll answer: %v", err)
	}
	if len(answer.OptionPersistentIDs) != 2 || answer.OptionPersistentIDs[1] != "b" {
		t.Errorf("option_persistent_ids = %v", answer.OptionPersistentIDs)
	}
}

func TestInlineKeyboardButtonDecodesAllVariants(t *testing.T) {
	var button types.InlineKeyboardButton
	payload := `{"text":"Go","style":"danger","icon_custom_emoji_id":"e1",
	  "login_url":{"url":"https://example.com","forward_text":"hi","request_write_access":true},
	  "copy_text":{"text":"copied"},"switch_inline_query_chosen_chat":{"query":"q","allow_user_chats":true},
	  "callback_game":{},"disabled":{}}`
	if err := json.Unmarshal([]byte(payload), &button); err != nil {
		t.Fatalf("unmarshal inline button: %v", err)
	}
	if button.Style != "danger" || button.IconCustomEmojiID != "e1" {
		t.Errorf("style/emoji not decoded: %+v", button)
	}
	if button.LoginURL == nil || button.LoginURL.URL != "https://example.com" ||
		!button.LoginURL.RequestWriteAccess {
		t.Errorf("login_url = %+v", button.LoginURL)
	}
	if button.CopyText == nil || button.CopyText.Text != "copied" {
		t.Errorf("copy_text = %+v", button.CopyText)
	}
	if button.SwitchInlineQueryChosenChat == nil || !button.SwitchInlineQueryChosenChat.AllowUserChats {
		t.Errorf("switch_inline_query_chosen_chat = %+v", button.SwitchInlineQueryChosenChat)
	}
	if button.CallbackGame == nil {
		t.Error("callback_game = nil, want non-nil placeholder")
	}
	if button.Disabled == nil {
		t.Error("disabled = nil, want non-nil disabled marker")
	}
}

func TestUserDecodesBotCapabilitiesAndChatFlags(t *testing.T) {
	var user types.User
	payload := `{"id":7,"is_bot":true,"first_name":"Bot","username":"a_bot",
	  "can_manage_bots":true,"supports_guest_queries":true,
	  "supports_join_request_queries":true,"has_topics_enabled":true,
	  "allows_users_to_create_topics":true}`
	if err := json.Unmarshal([]byte(payload), &user); err != nil {
		t.Fatalf("unmarshal user: %v", err)
	}
	if !user.CanManageBots || !user.SupportsGuestQueries || !user.SupportsJoinRequestQueries {
		t.Errorf("bot capability flags not decoded: %+v", user)
	}
	if !user.HasTopicsEnabled || !user.AllowsUsersToCreateTopics {
		t.Errorf("topic flags not decoded: %+v", user)
	}

	var chat types.Chat
	if err := json.Unmarshal([]byte(`{"id":1,"type":"private","is_direct_messages":true}`), &chat); err != nil {
		t.Fatalf("unmarshal chat: %v", err)
	}
	if !chat.IsDirectMessages {
		t.Error("chat.is_direct_messages not decoded")
	}
}

func TestAdminRightsDecodeStoryAndTagFields(t *testing.T) {
	var rights types.ChatAdministratorRights
	payload := `{"can_manage_chat":true,"can_delete_messages":false,"can_manage_video_chats":false,
	  "can_restrict_members":false,"can_promote_members":false,"can_change_info":false,
	  "can_invite_users":false,"can_pin_messages":false,"can_post_stories":true,
	  "can_edit_stories":true,"can_delete_stories":true,"can_post_messages":false,
	  "can_edit_messages":false,"can_manage_topics":false,"can_manage_tags":true,
	  "can_manage_direct_messages":true,"is_anonymous":false}`
	if err := json.Unmarshal([]byte(payload), &rights); err != nil {
		t.Fatalf("unmarshal admin rights: %v", err)
	}
	if !rights.CanPostStories || !rights.CanEditStories || !rights.CanDeleteStories {
		t.Errorf("story rights not decoded: %+v", rights)
	}
	if !rights.CanManageTags || !rights.CanManageDirectMessages {
		t.Errorf("tag/direct-message rights not decoded: %+v", rights)
	}
}
