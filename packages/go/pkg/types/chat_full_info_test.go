package types_test

import (
	"encoding/json"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// TestChatFullInfoDecodesEveryDocsField pins every field of the ChatFullInfo
// shape getChat returns, which is the payload Chat silently drops: photo,
// birthdate, the three business fields, chat location, user rating, accepted
// gift types, first profile audio, unique gift colors, guard bot and community.
func TestChatFullInfoDecodesEveryDocsField(t *testing.T) {
	payload := `{
	  "id": -1001234567890,
	  "type": "supergroup",
	  "title": "Telebot Devs",
	  "username": "telebotdevs",
	  "first_name": "Ann",
	  "last_name": "Nguyen",
	  "is_forum": true,
	  "is_direct_messages": true,
	  "accent_color_id": 6,
	  "max_reaction_count": 5,
	  "photo": {
	    "small_file_id": "sf", "small_file_unique_id": "sfu",
	    "big_file_id": "bf", "big_file_unique_id": "bfu"
	  },
	  "active_usernames": ["oldname", "telebotdevs"],
	  "birthdate": {"day": 12, "month": 7, "year": 1990},
	  "business_intro": {
	    "title": "We build bots", "message": "Hi there",
	    "sticker": {"file_id": "st", "file_unique_id": "stu", "type": "regular", "width": 512, "height": 512, "is_animated": false, "is_video": true}
	  },
	  "business_location": {
	    "address": "1 Nguyen Hue",
	    "location": {"latitude": 10.7769, "longitude": 106.7009}
	  },
	  "business_opening_hours": {
	    "time_zone_name": "Asia/Ho_Chi_Minh",
	    "opening_hours": [{"opening_minute": 540, "closing_minute": 1020}, {"opening_minute": 2000, "closing_minute": 2400}]
	  },
	  "personal_chat": {"id": 42, "type": "private", "first_name": "Ann"},
	  "parent_chat": {"id": -100999, "type": "channel", "title": "Channel"},
	  "available_reactions": [
	    {"type": "emoji", "emoji": "👍"},
	    {"type": "custom_emoji", "custom_emoji_id": "ce1"},
	    {"type": "paid"}
	  ],
	  "background_custom_emoji_id": "bg1",
	  "profile_accent_color_id": 2,
	  "profile_background_custom_emoji_id": "pbg1",
	  "emoji_status_custom_emoji_id": "es1",
	  "emoji_status_expiration_date": 1760000000,
	  "bio": "shipping since 2024",
	  "has_private_forwards": true,
	  "has_restricted_voice_and_video_messages": true,
	  "join_to_send_messages": true,
	  "join_by_request": true,
	  "description": "Long form description",
	  "invite_link": "https://t.me/telebotdevs/abc",
	  "pinned_message": {"message_id": 99, "date": 1750000000, "chat": {"id": -1001234567890, "type": "supergroup"}, "text": "read first"},
	  "permissions": {"can_send_messages": true, "can_send_polls": false},
	  "accepted_gift_types": {
	    "unlimited_gifts": true, "limited_gifts": false,
	    "unique_gifts": true, "premium_subscription": true, "gifts_from_channels": false
	  },
	  "can_send_paid_media": true,
	  "slow_mode_delay": 30,
	  "unrestrict_boost_count": 4,
	  "message_auto_delete_time": 86400,
	  "has_aggressive_anti_spam_enabled": true,
	  "has_hidden_members": true,
	  "has_protected_content": true,
	  "has_visible_history": false,
	  "sticker_set_name": "TelebotSet",
	  "can_set_sticker_set": true,
	  "custom_emoji_sticker_set_name": "TelebotEmojiSet",
	  "linked_chat_id": -100555,
	  "location": {
	    "location": {"latitude": 10.7626, "longitude": 106.6602},
	    "address": "Ho Chi Minh City"
	  },
	  "rating": {"level": 3, "rating": 1250, "current_level_rating": 1000, "next_level_rating": 2000},
	  "first_profile_audio": {"file_id": "Af1", "file_unique_id": "Af1u", "duration": 61, "title": "Intro"},
	  "unique_gift_colors": {
	    "model_custom_emoji_id": "m1", "symbol_custom_emoji_id": "s1",
	    "light_theme_main_color": 1122867, "light_theme_other_colors": [1, 2],
	    "dark_theme_main_color": 2233445, "dark_theme_other_colors": [3]
	  },
	  "paid_message_star_count": 25,
	  "guard_bot": {"id": 77, "is_bot": true, "first_name": "Guard"},
	  "community": {"id": -100777, "name": "Games"}
	}`

	var info types.ChatFullInfo
	if err := json.Unmarshal([]byte(payload), &info); err != nil {
		t.Fatalf("unmarshal ChatFullInfo: %v", err)
	}

	// Scalars carried over from the plain Chat shape.
	if info.ID != -1001234567890 || info.Type != "supergroup" || info.Title != "Telebot Devs" ||
		info.Username != "telebotdevs" || info.FirstName != "Ann" || info.LastName != "Nguyen" ||
		!info.IsForum || !info.IsDirectMessages {
		t.Errorf("chat identity fields not decoded: %+v", info)
	}
	if info.AccentColorID != 6 || info.MaxReactionCount != 5 {
		t.Errorf("accent/reaction ceiling not decoded: %+v", info)
	}
	if len(info.ActiveUsernames) != 2 || info.ActiveUsernames[0] != "oldname" {
		t.Errorf("active_usernames = %v", info.ActiveUsernames)
	}
	if info.BackgroundCustomEmojiID != "bg1" || info.ProfileAccentColorID != 2 ||
		info.ProfileBackgroundCustomEmojiID != "pbg1" || info.EmojiStatusCustomEmojiID != "es1" ||
		info.EmojiStatusExpirationDate != 1760000000 {
		t.Errorf("emoji/accent color fields not decoded: %+v", info)
	}
	if info.Bio != "shipping since 2024" || info.Description != "Long form description" ||
		info.InviteLink != "https://t.me/telebotdevs/abc" {
		t.Errorf("bio/description/invite_link not decoded: %+v", info)
	}
	if !info.HasPrivateForwards || !info.HasRestrictedVoiceAndVideoMessages ||
		!info.JoinToSendMessages || !info.JoinByRequest {
		t.Errorf("privacy/join flags not decoded: %+v", info)
	}
	if !info.CanSendPaidMedia || !info.HasAggressiveAntiSpamEnabled || !info.HasHiddenMembers ||
		!info.HasProtectedContent || info.HasVisibleHistory {
		t.Errorf("channel/anti-spam/protection flags not decoded: %+v", info)
	}
	if info.SlowModeDelay != 30 || info.UnrestrictBoostCount != 4 || info.MessageAutoDeleteTime != 86400 {
		t.Errorf("slow mode/boost/auto-delete not decoded: %+v", info)
	}
	if info.StickerSetName != "TelebotSet" || !info.CanSetStickerSet ||
		info.CustomEmojiStickerSetName != "TelebotEmojiSet" {
		t.Errorf("sticker set fields not decoded: %+v", info)
	}
	if info.LinkedChatID != -100555 || info.PaidMessageStarCount != 25 {
		t.Errorf("linked_chat_id/paid_message_star_count not decoded: %+v", info)
	}

	// Nested objects, each of which is a docs type this pass added.
	if info.Photo == nil || info.Photo.SmallFileID != "sf" || info.Photo.SmallFileUniqueID != "sfu" ||
		info.Photo.BigFileID != "bf" || info.Photo.BigFileUniqueID != "bfu" {
		t.Errorf("photo = %+v", info.Photo)
	}
	if info.Birthdate == nil || info.Birthdate.Day != 12 || info.Birthdate.Month != 7 || info.Birthdate.Year != 1990 {
		t.Errorf("birthdate = %+v", info.Birthdate)
	}
	if info.BusinessIntro == nil || info.BusinessIntro.Title != "We build bots" ||
		info.BusinessIntro.Message != "Hi there" ||
		info.BusinessIntro.Sticker == nil || info.BusinessIntro.Sticker.FileID != "st" ||
		!info.BusinessIntro.Sticker.IsVideo {
		t.Errorf("business_intro = %+v", info.BusinessIntro)
	}
	if info.BusinessLocation == nil || info.BusinessLocation.Address != "1 Nguyen Hue" ||
		info.BusinessLocation.Location == nil || info.BusinessLocation.Location.Latitude != 10.7769 {
		t.Errorf("business_location = %+v", info.BusinessLocation)
	}
	if info.BusinessOpeningHours == nil ||
		info.BusinessOpeningHours.TimeZoneName != "Asia/Ho_Chi_Minh" ||
		len(info.BusinessOpeningHours.OpeningHours) != 2 ||
		info.BusinessOpeningHours.OpeningHours[0].OpeningMinute != 540 ||
		info.BusinessOpeningHours.OpeningHours[1].ClosingMinute != 2400 {
		t.Errorf("business_opening_hours = %+v", info.BusinessOpeningHours)
	}
	if info.PersonalChat == nil || info.PersonalChat.ID != 42 ||
		info.ParentChat == nil || info.ParentChat.ID != -100999 {
		t.Errorf("personal_chat/parent_chat = %+v / %+v", info.PersonalChat, info.ParentChat)
	}
	if len(info.AvailableReactions) != 3 {
		t.Fatalf("available_reactions = %+v", info.AvailableReactions)
	}
	emoji, ok := info.AvailableReactions[0].(types.ReactionTypeEmoji)
	if !ok || emoji.Emoji != "👍" {
		t.Errorf("available_reactions[0] = %#v, want ReactionTypeEmoji", info.AvailableReactions[0])
	}
	custom, ok := info.AvailableReactions[1].(types.ReactionTypeCustomEmoji)
	if !ok || custom.CustomEmojiID != "ce1" {
		t.Errorf("available_reactions[1] = %#v, want ReactionTypeCustomEmoji", info.AvailableReactions[1])
	}
	if _, ok := info.AvailableReactions[2].(types.ReactionTypePaid); !ok {
		t.Errorf("available_reactions[2] = %#v, want ReactionTypePaid", info.AvailableReactions[2])
	}
	if info.PinnedMessage == nil || info.PinnedMessage.MessageID != 99 ||
		info.PinnedMessage.Text != "read first" {
		t.Errorf("pinned_message = %+v", info.PinnedMessage)
	}
	if info.Permissions == nil || !info.Permissions.CanSendMessages ||
		info.Permissions.CanSendPolls {
		t.Errorf("permissions = %+v", info.Permissions)
	}
	if !info.AcceptedGiftTypes.UnlimitedGifts || info.AcceptedGiftTypes.LimitedGifts ||
		!info.AcceptedGiftTypes.UniqueGifts || !info.AcceptedGiftTypes.PremiumSubscription ||
		info.AcceptedGiftTypes.GiftsFromChannels {
		t.Errorf("accepted_gift_types = %+v", info.AcceptedGiftTypes)
	}
	if info.Location == nil || info.Location.Address != "Ho Chi Minh City" ||
		info.Location.Location == nil || info.Location.Location.Longitude != 106.6602 {
		t.Errorf("location = %+v", info.Location)
	}
	if info.Rating == nil || info.Rating.Level != 3 || info.Rating.Rating != 1250 ||
		info.Rating.CurrentLevelRating != 1000 || info.Rating.NextLevelRating != 2000 {
		t.Errorf("rating = %+v", info.Rating)
	}
	if info.FirstProfileAudio == nil || info.FirstProfileAudio.FileID != "Af1" ||
		info.FirstProfileAudio.Title != "Intro" || info.FirstProfileAudio.Duration != 61 {
		t.Errorf("first_profile_audio = %+v", info.FirstProfileAudio)
	}
	if info.UniqueGiftColors == nil || info.UniqueGiftColors.ModelCustomEmojiID != "m1" ||
		info.UniqueGiftColors.SymbolCustomEmojiID != "s1" ||
		info.UniqueGiftColors.LightThemeMainColor != 1122867 ||
		len(info.UniqueGiftColors.LightThemeOtherColors) != 2 ||
		info.UniqueGiftColors.DarkThemeMainColor != 2233445 ||
		len(info.UniqueGiftColors.DarkThemeOtherColors) != 1 {
		t.Errorf("unique_gift_colors = %+v", info.UniqueGiftColors)
	}
	if info.GuardBot == nil || info.GuardBot.ID != 77 || !info.GuardBot.IsBot {
		t.Errorf("guard_bot = %+v", info.GuardBot)
	}
	if info.Community == nil || info.Community.ID != -100777 || info.Community.Name != "Games" {
		t.Errorf("community = %+v", info.Community)
	}
}

// TestChatFullInfoOmitsUnsetOptionals asserts a minimal getChat response does
// not gain empty optional keys on the way back out.
func TestChatFullInfoOmitsUnsetOptionals(t *testing.T) {
	raw, err := json.Marshal(&types.ChatFullInfo{
		ID:               1,
		Type:             "private",
		AccentColorID:    1,
		MaxReactionCount: 1,
	})
	if err != nil {
		t.Fatalf("marshal ChatFullInfo: %v", err)
	}
	want := `{"id":1,"type":"private","accent_color_id":1,"max_reaction_count":1,"accepted_gift_types":{"unlimited_gifts":false,"limited_gifts":false,"unique_gifts":false,"premium_subscription":false,"gifts_from_channels":false}}`
	if string(raw) != want {
		t.Errorf("ChatFullInfo payload:\n got %s\nwant %s", raw, want)
	}
}

// TestUserProfileAudiosDecodesPagedAudios covers the getUserProfileAudios
// result that the bot method used to hand back as an untyped value.
func TestUserProfileAudiosDecodesPagedAudios(t *testing.T) {
	var audios types.UserProfileAudios
	payload := `{"total_count": 2, "audios": [
	  {"file_id": "Aa1", "file_unique_id": "Aa1u", "duration": 30, "performer": "DJ", "title": "One", "file_name": "one.mp3", "mime_type": "audio/mpeg", "file_size": 4096},
	  {"file_id": "Aa2", "file_unique_id": "Aa2u", "duration": 90, "thumbnail": {"file_id": "t", "file_unique_id": "tu", "width": 80, "height": 80}}
	]}`
	if err := json.Unmarshal([]byte(payload), &audios); err != nil {
		t.Fatalf("unmarshal UserProfileAudios: %v", err)
	}
	if audios.TotalCount != 2 || len(audios.Audios) != 2 {
		t.Fatalf("UserProfileAudios = %+v", audios)
	}
	first := audios.Audios[0]
	if first.FileID != "Aa1" || first.FileUniqueID != "Aa1u" || first.Duration != 30 ||
		first.Performer != "DJ" || first.Title != "One" || first.FileName != "one.mp3" ||
		first.MimeType != "audio/mpeg" || first.FileSize != 4096 {
		t.Errorf("first audio not fully decoded: %+v", first)
	}
	second := audios.Audios[1]
	if second.Thumbnail == nil || second.Thumbnail.Width != 80 {
		t.Errorf("second audio thumbnail = %+v", second.Thumbnail)
	}
}

// TestAffiliateInfoDecodesCommissionFields covers the affiliate block Telegram
// nests inside a star transaction's partner object.
func TestAffiliateInfoDecodesCommissionFields(t *testing.T) {
	var info types.AffiliateInfo
	payload := `{
	  "affiliate_user": {"id": 11, "is_bot": true, "first_name": "Affiliate"},
	  "affiliate_chat": {"id": -10022, "type": "channel", "title": "Referrers"},
	  "commission_per_mille": 50,
	  "amount": 12,
	  "nanostar_amount": -500
	}`
	if err := json.Unmarshal([]byte(payload), &info); err != nil {
		t.Fatalf("unmarshal AffiliateInfo: %v", err)
	}
	if info.AffiliateUser == nil || info.AffiliateUser.ID != 11 || !info.AffiliateUser.IsBot {
		t.Errorf("affiliate_user = %+v", info.AffiliateUser)
	}
	if info.AffiliateChat == nil || info.AffiliateChat.ID != -10022 || info.AffiliateChat.Title != "Referrers" {
		t.Errorf("affiliate_chat = %+v", info.AffiliateChat)
	}
	if info.CommissionPerMille != 50 || info.Amount != 12 || info.NanostarAmount != -500 {
		t.Errorf("commission fields not decoded: %+v", info)
	}
}

// TestInaccessibleMessageDecodesDeletedArm covers the deleted-message arm of
// Telegram's MaybeInaccessibleMessage union, which reports date 0.
func TestInaccessibleMessageDecodesDeletedArm(t *testing.T) {
	var msg types.InaccessibleMessage
	payload := `{"chat": {"id": -10055, "type": "channel", "title": "Archive"}, "message_id": 7, "date": 0}`
	if err := json.Unmarshal([]byte(payload), &msg); err != nil {
		t.Fatalf("unmarshal InaccessibleMessage: %v", err)
	}
	if msg.Chat == nil || msg.Chat.ID != -10055 || msg.Chat.Type != "channel" {
		t.Errorf("chat = %+v", msg.Chat)
	}
	if msg.MessageID != 7 {
		t.Errorf("message_id = %d, want 7", msg.MessageID)
	}
	if msg.Date != 0 {
		t.Errorf("date = %d, want the docs-mandated 0", msg.Date)
	}
}

// TestResponseParametersDecodesErrorNode covers the error "parameters" node,
// reachable under both the docs name and the retained alias.
func TestResponseParametersDecodesErrorNode(t *testing.T) {
	var docs types.ResponseParameters
	payload := `{"migrate_to_chat_id": -1009876543210, "retry_after": 37}`
	if err := json.Unmarshal([]byte(payload), &docs); err != nil {
		t.Fatalf("unmarshal ResponseParameters: %v", err)
	}
	if docs.MigrateToChatID != -1009876543210 || docs.RetryAfter != 37 {
		t.Errorf("ResponseParameters = %+v", docs)
	}

	// Parameters is an alias, so an error envelope decoded through the old name
	// still yields the docs type.
	var resp types.Response[any]
	if err := json.Unmarshal([]byte(`{"ok":false,"error_code":429,"description":"Too Many Requests",
	  "parameters":{"retry_after":5}}`), &resp); err != nil {
		t.Fatalf("unmarshal error response: %v", err)
	}
	var alias *types.ResponseParameters = resp.Parameters
	if alias == nil || alias.RetryAfter != 5 {
		t.Errorf("Parameters alias did not decode to *ResponseParameters: %+v", alias)
	}
}
