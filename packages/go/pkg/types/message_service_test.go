package types_test

import (
	"encoding/json"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// serviceMessagePayload covers the Bot API 10.3 service-message and metadata
// fields that Message must decode without dropping data.
const serviceMessagePayload = `{
  "message_id": 42,
  "date": 1750000000,
  "edit_date": 1750000600,
  "chat": {"id": -1001, "type": "supergroup", "title": "Mods"},
  "from": {"id": 7, "is_bot": false, "first_name": "Alice"},
  "via_bot": {"id": 99, "is_bot": true, "first_name": "Widget"},
  "sender_chat": {"id": -1001, "type": "supergroup", "title": "Mods"},
  "author_signature": "Alice",
  "sender_boost_count": 5,
  "sender_business_bot": {"id": 12, "is_bot": true, "first_name": "Shop"},
  "sender_tag": "TAG",
  "receiver_user": {"id": 21, "is_bot": false, "first_name": "Bob"},
  "business_connection_id": "conn-1",
  "media_group_id": "mg-1",
  "effect_id": "ef-1",
  "has_media_spoiler": true,
  "is_from_offline": true,
  "chat_shared": {
    "chat_id": 5,
    "request_id": 66,
    "title": "Announcements",
    "photo": [{"file_id": "p1", "file_unique_id": "u1", "width": 90, "height": 90}]
  },
  "users_shared": {
    "request_id": 12,
    "users": [{"user_id": 3, "first_name": "Carol"}]
  },
  "video_chat_scheduled": {"start_date": 1750001000},
  "video_chat_started": {},
  "video_chat_ended": {"duration": 120},
  "video_chat_participants_invited": {"users": [{"id": 4, "is_bot": false, "first_name": "Dan"}]},
  "forum_topic_created": {"name": "Releases", "icon_color": 13732070, "is_name_implicit": true},
  "forum_topic_edited": {"name": "Builds"},
  "forum_topic_closed": {},
  "forum_topic_reopened": {},
  "general_forum_topic_hidden": {},
  "general_forum_topic_unhidden": {},
  "write_access_allowed": {"from_request": true, "web_app_name": "Widget"},
  "proximity_alert_triggered": {
    "traveler": {"id": 5, "is_bot": false, "first_name": "Eve"},
    "watcher": {"id": 6, "is_bot": false, "first_name": "Fay"},
    "distance": 42
  },
  "message_auto_delete_timer_changed": {"message_auto_delete_time": 3600},
  "web_app_data": {"data": "payload", "button_text": "Send"},
  "external_reply": {
    "origin": {"type": "user", "date": 1749000000, "sender_user": {"id": 8, "is_bot": false, "first_name": "Gus"}},
    "chat": {"id": -1002, "type": "channel", "title": "News"},
    "message_id": 11,
    "poll": {"id": "pl", "question": "Best?", "options": [], "total_voter_count": 0, "is_closed": false, "is_anonymous": true, "type": "regular", "allows_multiple_answers": false}
  },
  "quote": {"text": "the quoted bit", "position": 3},
  "reply_to_story": {
    "chat": {"id": -1003, "type": "channel", "title": "Stories"},
    "id": 4
  },
  "giveaway": {
    "chats": [{"id": -1004, "type": "channel", "title": "Prize"}],
    "winners_selection_date": 1750002000,
    "winner_count": 100,
    "prize_star_count": 500,
    "only_new_members": true
  },
  "giveaway_created": {"prize_star_count": 500},
  "giveaway_completed": {"winner_count": 90, "unclaimed_prize_count": 10, "is_star_giveaway": true},
  "giveaway_winners": {
    "chat": {"id": -1004, "type": "channel", "title": "Prize"},
    "giveaway_message_id": 77,
    "winners_selection_date": 1750002000,
    "winner_count": 2,
    "winners": [{"id": 9, "is_bot": false, "first_name": "Hal"}]
  },
  "gift": {
    "gift": {"id": "g1", "sticker": {"file_id": "s1", "file_unique_id": "su1", "type": "regular", "width": 512, "height": 512}, "star_count": 50},
    "text": "congrats",
    "can_be_upgraded": true,
    "is_private": true
  },
  "gift_upgrade_sent": {"gift": {"id": "g2", "sticker": {"file_id": "s2", "file_unique_id": "su2", "type": "regular", "width": 512, "height": 512}, "star_count": 0}},
  "checklist": {
    "title": "Ship checklist",
    "tasks": [{"id": 1, "text": "tag release"}, {"id": 2, "text": "publish", "completion_date": 1750000900}]
  },
  "checklist_tasks_done": {"marked_as_done_task_ids": [2], "marked_as_not_done_task_ids": []},
  "checklist_tasks_added": {
    "tasks": [{"id": 3, "text": "announce"}]
  },
  "poll_option_added": {
    "option_persistent_id": "op-1",
    "option_text": "Rust"
  },
  "poll_option_deleted": {"option_persistent_id": "op-2", "option_text": "Go"},
  "paid_media": {
    "star_count": 25,
    "paid_media": [
      {"type": "photo", "photo": [{"file_id": "p2", "file_unique_id": "u2", "width": 100, "height": 100}]},
      {"type": "preview", "width": 320, "height": 240, "duration": 5},
      {"type": "video", "video": {"file_id": "v1", "file_unique_id": "vu", "width": 640, "height": 360, "duration": 12}}
    ]
  },
  "chat_background_set": {
    "type": {"type": "fill", "fill": {"type": "solid", "color": 16777215}, "dark_theme_dimming": 0}
  },
  "suggested_post_info": {"state": "pending", "send_date": 1750003000},
  "suggested_post_paid": {"currency": "XTR", "star_amount": {"amount": 10, "nanostar_amount": 500}},
  "suggested_post_refunded": {"reason": "expired"},
  "community_chat_added": {"community": {"id": 31337, "name": "Telegram Chats"}},
  "community_chat_removed": {},
  "chat_owner_changed": {"new_owner": {"id": 15, "is_bot": false, "first_name": "Ivy"}},
  "managed_bot_created": {"bot": {"id": 16, "is_bot": true, "first_name": "Managed"}},
  "direct_messages_topic": {"topic_id": 123, "user": {"id": 17, "is_bot": false, "first_name": "Jo"}},
  "direct_message_price_changed": {"are_direct_messages_enabled": true, "direct_message_star_count": 20},
  "paid_message_price_changed": {"paid_message_star_count": 15},
  "live_photo": {
    "photo": [{"file_id": "lp", "file_unique_id": "lpu", "width": 10, "height": 10}],
    "file_id": "lf",
    "file_unique_id": "lfu",
    "width": 1080,
    "height": 1920,
    "duration": 3
  },
  "is_paid_post": true,
  "paid_star_count": 50,
  "refunded_payment": {
    "currency": "XTR",
    "total_amount": 10,
    "invoice_payload": "abc",
    "telegram_payment_charge_id": "tpc-1"
  },
  "guest_query_id": "gq-1",
  "ephemeral_message_id": 900,
  "reply_to_checklist_task_id": 2,
  "reply_to_poll_option_id": "op-3",
  "has_protected_content": true,
  "is_topic_message": true,
  "show_caption_above_media": true,
  "passport_data": {
    "data": [{"type": "personal_details", "hash": "h1"}],
    "credentials": {"data": "d", "hash": "h", "secret": "s"}
  }
}`

func TestMessageDecodesServiceMessages(t *testing.T) {
	var msg types.Message
	if err := json.Unmarshal([]byte(serviceMessagePayload), &msg); err != nil {
		t.Fatalf("unmarshal message: %v", err)
	}

	if msg.EditDate != 1750000600 {
		t.Errorf("edit_date = %d, want 1750000600", msg.EditDate)
	}
	if msg.ViaBot == nil || msg.ViaBot.ID != 99 {
		t.Errorf("via_bot = %+v, want bot 99", msg.ViaBot)
	}
	if msg.AuthorSignature != "Alice" || msg.SenderTag != "TAG" || msg.EffectID != "ef-1" {
		t.Errorf("sender metadata not decoded: %+v %+v %+v", msg.AuthorSignature, msg.SenderTag, msg.EffectID)
	}
	if msg.WebAppData == nil || msg.WebAppData.ButtonText != "Send" {
		t.Errorf("web_app_data = %+v, want button_text Send", msg.WebAppData)
	}
	if msg.ChatShared == nil || msg.ChatShared.Title != "Announcements" || msg.ChatShared.RequestID != 66 {
		t.Errorf("chat_shared = %+v, not decoded", msg.ChatShared)
	}
	if msg.UsersShared == nil || len(msg.UsersShared.Users) != 1 || msg.UsersShared.Users[0].UserID != 3 {
		t.Errorf("users_shared = %+v, not decoded", msg.UsersShared)
	}
	if msg.VideoChatScheduled == nil || msg.VideoChatScheduled.StartDate != 1750001000 {
		t.Errorf("video_chat_scheduled = %+v, not decoded", msg.VideoChatScheduled)
	}
	if msg.VideoChatStarted == nil {
		t.Error("video_chat_started = nil, want non-nil empty service message")
	}
	if msg.ForumTopicCreated == nil || !msg.ForumTopicCreated.IsNameImplicit ||
		msg.ForumTopicCreated.IconCustomEmojiID != "" {
		t.Errorf("forum_topic_created = %+v, not decoded", msg.ForumTopicCreated)
	}
	if msg.GeneralForumTopicUnhidden == nil || msg.ForumTopicReopened == nil {
		t.Error("empty service messages general_forum_topic_unhidden/forum_topic_reopened not decoded")
	}
	if msg.WriteAccessAllowed == nil || !msg.WriteAccessAllowed.FromRequest {
		t.Errorf("write_access_allowed = %+v, not decoded", msg.WriteAccessAllowed)
	}
	if msg.ProximityAlertTriggered == nil || msg.ProximityAlertTriggered.Distance != 42 {
		t.Errorf("proximity_alert_triggered = %+v, not decoded", msg.ProximityAlertTriggered)
	}
	if msg.MessageAutoDeleteTimerChanged == nil || msg.MessageAutoDeleteTimerChanged.MessageAutoDeleteTime != 3600 {
		t.Errorf("message_auto_delete_timer_changed = %+v, not decoded", msg.MessageAutoDeleteTimerChanged)
	}
	if msg.Giveaway == nil || msg.Giveaway.PrizeStarCount != 500 || len(msg.Giveaway.Chats) != 1 {
		t.Errorf("giveaway = %+v, not decoded", msg.Giveaway)
	}
	if msg.GiveawayWinners == nil || msg.GiveawayWinners.GiveawayMessageID != 77 ||
		len(msg.GiveawayWinners.Winners) != 1 {
		t.Errorf("giveaway_winners = %+v, not decoded", msg.GiveawayWinners)
	}
	if msg.Gift == nil || msg.Gift.Gift == nil || msg.Gift.Gift.ID != "g1" || !msg.Gift.CanBeUpgraded {
		t.Errorf("gift = %+v, not decoded", msg.Gift)
	}
	if msg.Checklist == nil || len(msg.Checklist.Tasks) != 2 ||
		msg.Checklist.Tasks[1].CompletionDate != 1750000900 {
		t.Errorf("checklist = %+v, not decoded", msg.Checklist)
	}
	if msg.ChecklistTasksDone == nil || len(msg.ChecklistTasksDone.MarkedAsDoneTaskIDs) != 1 {
		t.Errorf("checklist_tasks_done = %+v, not decoded", msg.ChecklistTasksDone)
	}
	if msg.PollOptionAdded == nil || msg.PollOptionAdded.OptionText != "Rust" {
		t.Errorf("poll_option_added = %+v, not decoded", msg.PollOptionAdded)
	}
	if msg.ExternalReply == nil || msg.ExternalReply.Origin == nil ||
		msg.ExternalReply.Origin.Type != "user" || msg.ExternalReply.MessageID != 11 {
		t.Errorf("external_reply = %+v, not decoded", msg.ExternalReply)
	}
	if msg.Quote == nil || msg.Quote.Position != 3 || msg.Quote.Text != "the quoted bit" {
		t.Errorf("quote = %+v, not decoded", msg.Quote)
	}
	if msg.ReplyToStory == nil || msg.ReplyToStory.ID != 4 {
		t.Errorf("reply_to_story = %+v, not decoded", msg.ReplyToStory)
	}
	if msg.SuggestedPostInfo == nil || msg.SuggestedPostInfo.State != "pending" {
		t.Errorf("suggested_post_info = %+v, not decoded", msg.SuggestedPostInfo)
	}
	if msg.SuggestedPostPaid == nil || msg.SuggestedPostPaid.StarAmount == nil ||
		msg.SuggestedPostPaid.StarAmount.NanostarAmount != 500 {
		t.Errorf("suggested_post_paid = %+v, not decoded", msg.SuggestedPostPaid)
	}
	if msg.CommunityChatAdded == nil || msg.CommunityChatAdded.Community.Name != "Telegram Chats" {
		t.Errorf("community_chat_added = %+v, not decoded", msg.CommunityChatAdded)
	}
	if msg.ChatOwnerChanged == nil || msg.ChatOwnerChanged.NewOwner.ID != 15 {
		t.Errorf("chat_owner_changed = %+v, not decoded", msg.ChatOwnerChanged)
	}
	if msg.DirectMessagesTopic == nil || msg.DirectMessagesTopic.TopicID != 123 {
		t.Errorf("direct_messages_topic = %+v, not decoded", msg.DirectMessagesTopic)
	}
	if msg.PaidMessagePriceChanged == nil || msg.PaidMessagePriceChanged.PaidMessageStarCount != 15 {
		t.Errorf("paid_message_price_changed = %+v, not decoded", msg.PaidMessagePriceChanged)
	}
	if msg.LivePhoto == nil || msg.LivePhoto.Width != 1080 || len(msg.LivePhoto.Photo) != 1 {
		t.Errorf("live_photo = %+v, not decoded", msg.LivePhoto)
	}
	if msg.RefundedPayment == nil || msg.RefundedPayment.TelegramPaymentChargeID != "tpc-1" {
		t.Errorf("refunded_payment = %+v, not decoded", msg.RefundedPayment)
	}
	if msg.PassportData == nil || len(msg.PassportData.Data) != 1 ||
		msg.PassportData.Credentials.Secret != "s" {
		t.Errorf("passport_data = %+v, not decoded", msg.PassportData)
	}
	if !msg.IsPaidPost || msg.PaidStarCount != 50 || !msg.IsTopicMessage ||
		!msg.HasProtectedContent || !msg.ShowCaptionAboveMedia {
		t.Errorf("boolean/int flags not decoded: %+v", msg)
	}
}

func TestMessageDecodesFlattenedUnions(t *testing.T) {
	var msg types.Message
	if err := json.Unmarshal([]byte(serviceMessagePayload), &msg); err != nil {
		t.Fatalf("unmarshal message: %v", err)
	}

	if msg.PaidMedia == nil || msg.PaidMedia.StarCount != 25 || len(msg.PaidMedia.PaidMedia) != 3 {
		t.Fatalf("paid_media = %+v, want 3 items", msg.PaidMedia)
	}
	photo, preview, video := msg.PaidMedia.PaidMedia[0], msg.PaidMedia.PaidMedia[1], msg.PaidMedia.PaidMedia[2]
	if photo.Type != "photo" || len(photo.Photo) != 1 || photo.Video != nil {
		t.Errorf("paid media photo = %+v", photo)
	}
	if preview.Type != "preview" || preview.Width != 320 || preview.Duration != 5 {
		t.Errorf("paid media preview = %+v", preview)
	}
	if video.Type != "video" || video.Video == nil || video.Video.Width != 640 {
		t.Errorf("paid media video = %+v", video)
	}

	if msg.ChatBackgroundSet == nil || msg.ChatBackgroundSet.Type == nil {
		t.Fatalf("chat_background_set = %+v", msg.ChatBackgroundSet)
	}
	bg := msg.ChatBackgroundSet.Type
	if bg.Type != "fill" || bg.Fill == nil || bg.Fill.Type != "solid" || bg.Fill.Color != 16777215 {
		t.Errorf("chat background = %+v, want solid fill", bg)
	}
}

func TestMessageRoundTripsServiceMessages(t *testing.T) {
	var msg types.Message
	if err := json.Unmarshal([]byte(serviceMessagePayload), &msg); err != nil {
		t.Fatalf("unmarshal message: %v", err)
	}
	out, err := json.Marshal(&msg)
	if err != nil {
		t.Fatalf("marshal message: %v", err)
	}
	var again types.Message
	if err := json.Unmarshal(out, &again); err != nil {
		t.Fatalf("re-unmarshal message: %v", err)
	}
	if again.Giveaway == nil || again.Giveaway.WinnerCount != 100 {
		t.Errorf("giveaway lost in round trip: %+v", again.Giveaway)
	}
	if again.PaidMedia == nil || len(again.PaidMedia.PaidMedia) != 3 {
		t.Errorf("paid_media lost in round trip: %+v", again.PaidMedia)
	}
	if again.VideoChatStarted == nil {
		t.Error("empty service message lost in round trip")
	}
}

func TestUpdateDecodesBusinessAndCommerceFields(t *testing.T) {
	payload := `{"update_id":1,"message":{"message_id":1,"date":2,"chat":{"id":1,"type":"private"},
      "suggested_post_approved":{"send_date":555,"price":{"currency":"XTR","amount":0}},
      "suggested_post_declined":{},"managed_bot_created":{"bot":{"id":3,"is_bot":true,"first_name":"M"}},
      "link_preview_options":{"is_disabled":true},"guest_bot_caller_user":{"id":4,"is_bot":false,"first_name":"G"},
      "guest_bot_caller_chat":{"id":5,"type":"channel","title":"C"}}}`
	var upd types.Update
	if err := json.Unmarshal([]byte(payload), &upd); err != nil {
		t.Fatalf("unmarshal update: %v", err)
	}
	if upd.Message == nil || upd.Message.SuggestedPostApproved == nil ||
		upd.Message.SuggestedPostApproved.SendDate != 555 {
		t.Fatalf("suggested_post_approved not decoded: %+v", upd.Message)
	}
	if upd.Message.SuggestedPostDeclined == nil {
		t.Error("empty suggested_post_declined not decoded")
	}
	if upd.Message.ManagedBotCreated == nil || upd.Message.ManagedBotCreated.Bot.ID != 3 {
		t.Errorf("managed_bot_created = %+v", upd.Message.ManagedBotCreated)
	}
	if upd.Message.LinkPreviewOptions == nil || !upd.Message.LinkPreviewOptions.IsDisabled {
		t.Errorf("link_preview_options = %+v", upd.Message.LinkPreviewOptions)
	}
	if upd.Message.GuestBotCallerUser == nil || upd.Message.GuestBotCallerChat == nil {
		t.Errorf("guest_bot_caller_* not decoded")
	}
}
