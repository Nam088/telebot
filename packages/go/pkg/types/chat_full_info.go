package types

// ChatPhoto represents a chat photo.
//
// Telegram API: https://core.telegram.org/bots/api#chatphoto
type ChatPhoto struct {
	// File identifier of small (160x160) chat photo. This file_id can be used
	// only for photo download and only for as long as the photo is not changed.
	SmallFileID string `json:"small_file_id"`
	// Unique file identifier of small (160x160) chat photo, which is supposed to
	// be the same over time and for different bots. Can't be used to download or
	// reuse the file.
	SmallFileUniqueID string `json:"small_file_unique_id"`
	// File identifier of big (640x640) chat photo. This file_id can be used only
	// for photo download and only for as long as the photo is not changed.
	BigFileID string `json:"big_file_id"`
	// Unique file identifier of big (640x640) chat photo, which is supposed to be
	// the same over time and for different bots. Can't be used to download or
	// reuse the file.
	BigFileUniqueID string `json:"big_file_unique_id"`
}

// ChatLocation represents a location to which a chat is connected.
//
// Telegram API: https://core.telegram.org/bots/api#chatlocation
type ChatLocation struct {
	// The location to which the supergroup is connected. Can't be a live location.
	Location *Location `json:"location"`
	// Location address; 1-64 characters, as defined by the chat owner.
	Address string `json:"address"`
}

// Birthdate describes the birthdate of a user.
//
// Telegram API: https://core.telegram.org/bots/api#birthdate
type Birthdate struct {
	// Day of the user's birth; 1-31.
	Day int64 `json:"day"`
	// Month of the user's birth; 1-12.
	Month int64 `json:"month"`
	// Year of the user's birth.
	Year int64 `json:"year,omitempty"`
}

// UserRating describes the rating of a user based on their Telegram Star
// spendings.
//
// Telegram API: https://core.telegram.org/bots/api#userrating
type UserRating struct {
	// Current level of the user, indicating their reliability when purchasing
	// digital goods and services. A higher level suggests a more trustworthy
	// customer; a negative level is likely reason for concern.
	Level int64 `json:"level"`
	// Numerical value of the user's rating; the higher the rating, the better.
	Rating int64 `json:"rating"`
	// The rating value required to get the current level.
	CurrentLevelRating int64 `json:"current_level_rating"`
	// The rating value required to get to the next level; omitted if the maximum
	// level was reached.
	NextLevelRating int64 `json:"next_level_rating,omitempty"`
}

// ChatFullInfo contains full information about a chat.
//
// It is what the Bot API method getChat returns. ChatFullInfo repeats every
// field Chat declares (id, type, title, username, first_name, last_name,
// is_forum and is_direct_messages), so it answers everything Chat does, but the
// two remain distinct structs because Telegram sends the plain Chat shape on
// other wires.
//
// Telegram API: https://core.telegram.org/bots/api#chatfullinfo
type ChatFullInfo struct {
	// Unique identifier for this chat.
	ID int64 `json:"id"`
	// Type of the chat, can be either "private", "group", "supergroup" or "channel".
	Type string `json:"type"`
	// Title, for supergroups, channels and group chats.
	Title string `json:"title,omitempty"`
	// Username, for private chats, supergroups and channels if available.
	Username string `json:"username,omitempty"`
	// First name of the other party in a private chat.
	FirstName string `json:"first_name,omitempty"`
	// Last name of the other party in a private chat.
	LastName string `json:"last_name,omitempty"`
	// True, if the supergroup chat is a forum (has topics enabled).
	IsForum bool `json:"is_forum,omitempty"`
	// True, if the chat is the direct messages chat of a channel.
	IsDirectMessages bool `json:"is_direct_messages,omitempty"`
	// Identifier of the accent color for the chat name and backgrounds of the chat
	// photo, reply header, and link preview.
	AccentColorID int64 `json:"accent_color_id"`
	// The maximum number of reactions that can be set on a message in the chat.
	MaxReactionCount int64 `json:"max_reaction_count"`
	// Chat photo; nil when Telegram omits the field.
	Photo *ChatPhoto `json:"photo,omitempty"`
	// If non-empty, the list of all active chat usernames; for private chats,
	// supergroups and channels.
	ActiveUsernames []string `json:"active_usernames,omitempty"`
	// For private chats, the date of birth of the user.
	Birthdate *Birthdate `json:"birthdate,omitempty"`
	// For private chats with business accounts, the intro of the business.
	BusinessIntro *BusinessIntro `json:"business_intro,omitempty"`
	// For private chats with business accounts, the location of the business.
	BusinessLocation *BusinessLocation `json:"business_location,omitempty"`
	// For private chats with business accounts, the opening hours of the business.
	BusinessOpeningHours *BusinessOpeningHours `json:"business_opening_hours,omitempty"`
	// For private chats, the personal channel of the user.
	PersonalChat *Chat `json:"personal_chat,omitempty"`
	// Information about the corresponding channel chat; for direct messages chats
	// only.
	ParentChat *Chat `json:"parent_chat,omitempty"`
	// List of available reactions allowed in the chat. If omitted, then all emoji
	// reactions are allowed.
	AvailableReactions ReactionTypeList `json:"available_reactions,omitempty"`
	// Custom emoji identifier of the emoji chosen by the chat for the reply header
	// and link preview background.
	BackgroundCustomEmojiID string `json:"background_custom_emoji_id,omitempty"`
	// Identifier of the accent color for the chat's profile background.
	ProfileAccentColorID int64 `json:"profile_accent_color_id,omitempty"`
	// Custom emoji identifier of the emoji chosen by the chat for its profile
	// background.
	ProfileBackgroundCustomEmojiID string `json:"profile_background_custom_emoji_id,omitempty"`
	// Custom emoji identifier of the emoji status of the chat or the other party
	// in a private chat.
	EmojiStatusCustomEmojiID string `json:"emoji_status_custom_emoji_id,omitempty"`
	// Expiration date of the emoji status of the chat or the other party in a
	// private chat, in Unix time, if any.
	EmojiStatusExpirationDate int64 `json:"emoji_status_expiration_date,omitempty"`
	// Bio of the other party in a private chat.
	Bio string `json:"bio,omitempty"`
	// True, if privacy settings of the other party in the private chat allows to
	// use tg://user?id=<user_id> links only in chats with the user.
	HasPrivateForwards bool `json:"has_private_forwards,omitempty"`
	// True, if the privacy settings of the other party restrict sending voice and
	// video note messages in the private chat.
	HasRestrictedVoiceAndVideoMessages bool `json:"has_restricted_voice_and_video_messages,omitempty"`
	// True, if users need to join the supergroup before they can send messages.
	JoinToSendMessages bool `json:"join_to_send_messages,omitempty"`
	// True, if all users directly joining the supergroup without using an invite
	// link need to be approved by supergroup administrators.
	JoinByRequest bool `json:"join_by_request,omitempty"`
	// Description, for groups, supergroups and channel chats.
	Description string `json:"description,omitempty"`
	// Primary invite link, for groups, supergroups and channel chats.
	InviteLink string `json:"invite_link,omitempty"`
	// The most recent pinned message (by sending date).
	PinnedMessage *Message `json:"pinned_message,omitempty"`
	// Default chat member permissions, for groups and supergroups.
	Permissions *ChatPermissions `json:"permissions,omitempty"`
	// Information about types of gifts that are accepted by the chat or by the
	// corresponding user for private chats.
	AcceptedGiftTypes AcceptedGiftTypes `json:"accepted_gift_types"`
	// True, if paid media messages can be sent or forwarded to the channel chat.
	// The field is available only for channel chats.
	CanSendPaidMedia bool `json:"can_send_paid_media,omitempty"`
	// For supergroups, the minimum allowed delay between consecutive messages sent
	// by each unprivileged user; in seconds.
	SlowModeDelay int64 `json:"slow_mode_delay,omitempty"`
	// For supergroups, the minimum number of boosts that a non-administrator user
	// needs to add in order to ignore slow mode and chat permissions.
	UnrestrictBoostCount int64 `json:"unrestrict_boost_count,omitempty"`
	// The time after which all messages sent to the chat will be automatically
	// deleted; in seconds.
	MessageAutoDeleteTime int64 `json:"message_auto_delete_time,omitempty"`
	// True, if aggressive anti-spam checks are enabled in the supergroup. The
	// field is only available to chat administrators.
	HasAggressiveAntiSpamEnabled bool `json:"has_aggressive_anti_spam_enabled,omitempty"`
	// True, if non-administrators can only get the list of bots and administrators
	// in the chat.
	HasHiddenMembers bool `json:"has_hidden_members,omitempty"`
	// True, if messages from the chat can't be forwarded to other chats.
	HasProtectedContent bool `json:"has_protected_content,omitempty"`
	// True, if new chat members will have access to old messages; available only
	// to chat administrators.
	HasVisibleHistory bool `json:"has_visible_history,omitempty"`
	// For supergroups, name of the group sticker set.
	StickerSetName string `json:"sticker_set_name,omitempty"`
	// True, if the bot can change the group sticker set.
	CanSetStickerSet bool `json:"can_set_sticker_set,omitempty"`
	// For supergroups, the name of the group's custom emoji sticker set. Custom
	// emoji from this set can be used by all users and bots in the group.
	CustomEmojiStickerSetName string `json:"custom_emoji_sticker_set_name,omitempty"`
	// Unique identifier for the linked chat, i.e. the discussion group identifier
	// for a channel and vice versa; for supergroups and channel chats.
	LinkedChatID int64 `json:"linked_chat_id,omitempty"`
	// For supergroups, the location to which the supergroup is connected.
	Location *ChatLocation `json:"location,omitempty"`
	// For private chats, the rating of the user if any.
	Rating *UserRating `json:"rating,omitempty"`
	// For private chats, the first audio added to the profile of the user.
	FirstProfileAudio *Audio `json:"first_profile_audio,omitempty"`
	// The color scheme based on a unique gift that must be used for the chat's
	// name, message replies and link previews.
	UniqueGiftColors *UniqueGiftColors `json:"unique_gift_colors,omitempty"`
	// The number of Telegram Stars a general user has to pay to send a message to
	// the chat.
	PaidMessageStarCount int64 `json:"paid_message_star_count,omitempty"`
	// The bot that processes join request queries in the chat. The field is only
	// available to chat administrators.
	GuardBot *User `json:"guard_bot,omitempty"`
	// The Community to which the chat belongs.
	Community *Community `json:"community,omitempty"`
}
