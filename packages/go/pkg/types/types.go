package types

// Message represents a Telegram message.
//
// Telegram API: https://core.telegram.org/bots/api#message
type Message struct {
	MessageID                     int64                          `json:"message_id"`
	MessageThreadID               int64                          `json:"message_thread_id,omitempty"`
	BusinessConnectionID          string                         `json:"business_connection_id,omitempty"`
	From                          *User                          `json:"from,omitempty"`
	SenderChat                    *Chat                          `json:"sender_chat,omitempty"`
	Date                          int64                          `json:"date"`
	Chat                          *Chat                          `json:"chat"`
	ForwardOrigin                 *MessageOrigin                 `json:"forward_origin,omitempty"`
	Text                          string                         `json:"text,omitempty"`
	Entities                      []MessageEntity                `json:"entities,omitempty"`
	Caption                       string                         `json:"caption,omitempty"`
	CaptionEntities               []MessageEntity                `json:"caption_entities,omitempty"`
	Game                          *Game                          `json:"game,omitempty"`
	Photo                         []PhotoSize                    `json:"photo,omitempty"`
	Audio                         *Audio                         `json:"audio,omitempty"`
	Document                      *Document                      `json:"document,omitempty"`
	Video                         *Video                         `json:"video,omitempty"`
	Animation                     *Animation                     `json:"animation,omitempty"`
	Voice                         *Voice                         `json:"voice,omitempty"`
	VideoNote                     *VideoNote                     `json:"video_note,omitempty"`
	Contact                       *Contact                       `json:"contact,omitempty"`
	Location                      *Location                      `json:"location,omitempty"`
	Venue                         *Venue                         `json:"venue,omitempty"`
	Poll                          *Poll                          `json:"poll,omitempty"`
	Dice                          *Dice                          `json:"dice,omitempty"`
	Sticker                       *Sticker                       `json:"sticker,omitempty"`
	RichMessage                   *RichMessage                   `json:"rich_message,omitempty"`
	Invoice                       *Invoice                       `json:"invoice,omitempty"`
	SuccessfulPayment             *SuccessfulPayment             `json:"successful_payment,omitempty"`
	DirectMessagesTopic           *DirectMessagesTopic           `json:"direct_messages_topic,omitempty"`
	SenderBoostCount              int64                          `json:"sender_boost_count,omitempty"`
	SenderBusinessBot             *User                          `json:"sender_business_bot,omitempty"`
	SenderTag                     string                         `json:"sender_tag,omitempty"`
	ReceiverUser                  *User                          `json:"receiver_user,omitempty"`
	EphemeralMessageID            int64                          `json:"ephemeral_message_id,omitempty"`
	GuestQueryID                  string                         `json:"guest_query_id,omitempty"`
	IsTopicMessage                bool                           `json:"is_topic_message,omitempty"`
	IsAutomaticForward            bool                           `json:"is_automatic_forward,omitempty"`
	ExternalReply                 *ExternalReplyInfo             `json:"external_reply,omitempty"`
	Quote                         *TextQuote                     `json:"quote,omitempty"`
	ReplyToStory                  *Story                         `json:"reply_to_story,omitempty"`
	ReplyToChecklistTaskID        int64                          `json:"reply_to_checklist_task_id,omitempty"`
	ReplyToPollOptionID           string                         `json:"reply_to_poll_option_id,omitempty"`
	ViaBot                        *User                          `json:"via_bot,omitempty"`
	GuestBotCallerUser            *User                          `json:"guest_bot_caller_user,omitempty"`
	GuestBotCallerChat            *Chat                          `json:"guest_bot_caller_chat,omitempty"`
	EditDate                      int64                          `json:"edit_date,omitempty"`
	HasProtectedContent           bool                           `json:"has_protected_content,omitempty"`
	IsFromOffline                 bool                           `json:"is_from_offline,omitempty"`
	IsPaidPost                    bool                           `json:"is_paid_post,omitempty"`
	MediaGroupID                  string                         `json:"media_group_id,omitempty"`
	AuthorSignature               string                         `json:"author_signature,omitempty"`
	PaidStarCount                 int64                          `json:"paid_star_count,omitempty"`
	LinkPreviewOptions            *LinkPreviewOptions            `json:"link_preview_options,omitempty"`
	SuggestedPostInfo             *SuggestedPostInfo             `json:"suggested_post_info,omitempty"`
	EffectID                      string                         `json:"effect_id,omitempty"`
	LivePhoto                     *LivePhoto                     `json:"live_photo,omitempty"`
	PaidMedia                     *PaidMediaInfo                 `json:"paid_media,omitempty"`
	Story                         *Story                         `json:"story,omitempty"`
	ShowCaptionAboveMedia         bool                           `json:"show_caption_above_media,omitempty"`
	HasMediaSpoiler               bool                           `json:"has_media_spoiler,omitempty"`
	Checklist                     *Checklist                     `json:"checklist,omitempty"`
	ChatOwnerLeft                 *ChatOwnerLeft                 `json:"chat_owner_left,omitempty"`
	ChatOwnerChanged              *ChatOwnerChanged              `json:"chat_owner_changed,omitempty"`
	MessageAutoDeleteTimerChanged *MessageAutoDeleteTimerChanged `json:"message_auto_delete_timer_changed,omitempty"`
	RefundedPayment               *RefundedPayment               `json:"refunded_payment,omitempty"`
	UsersShared                   *UsersShared                   `json:"users_shared,omitempty"`
	ChatShared                    *ChatShared                    `json:"chat_shared,omitempty"`
	Gift                          *GiftInfo                      `json:"gift,omitempty"`
	UniqueGift                    *UniqueGiftInfo                `json:"unique_gift,omitempty"`
	GiftUpgradeSent               *GiftInfo                      `json:"gift_upgrade_sent,omitempty"`
	ConnectedWebsite              string                         `json:"connected_website,omitempty"`
	WriteAccessAllowed            *WriteAccessAllowed            `json:"write_access_allowed,omitempty"`
	PassportData                  *PassportData                  `json:"passport_data,omitempty"`
	ProximityAlertTriggered       *ProximityAlertTriggered       `json:"proximity_alert_triggered,omitempty"`
	BoostAdded                    *ChatBoostAdded                `json:"boost_added,omitempty"`
	ChatBackgroundSet             *ChatBackground                `json:"chat_background_set,omitempty"`
	ChecklistTasksDone            *ChecklistTasksDone            `json:"checklist_tasks_done,omitempty"`
	ChecklistTasksAdded           *ChecklistTasksAdded           `json:"checklist_tasks_added,omitempty"`
	CommunityChatAdded            *CommunityChatAdded            `json:"community_chat_added,omitempty"`
	CommunityChatJoined           *CommunityChatJoined           `json:"community_chat_joined,omitempty"`
	CommunityChatRemoved          *CommunityChatRemoved          `json:"community_chat_removed,omitempty"`
	DirectMessagePriceChanged     *DirectMessagePriceChanged     `json:"direct_message_price_changed,omitempty"`
	ForumTopicCreated             *ForumTopicCreated             `json:"forum_topic_created,omitempty"`
	ForumTopicEdited              *ForumTopicEdited              `json:"forum_topic_edited,omitempty"`
	ForumTopicClosed              *ForumTopicClosed              `json:"forum_topic_closed,omitempty"`
	ForumTopicReopened            *ForumTopicReopened            `json:"forum_topic_reopened,omitempty"`
	GeneralForumTopicHidden       *GeneralForumTopicHidden       `json:"general_forum_topic_hidden,omitempty"`
	GeneralForumTopicUnhidden     *GeneralForumTopicUnhidden     `json:"general_forum_topic_unhidden,omitempty"`
	GiveawayCreated               *GiveawayCreated               `json:"giveaway_created,omitempty"`
	Giveaway                      *Giveaway                      `json:"giveaway,omitempty"`
	GiveawayWinners               *GiveawayWinners               `json:"giveaway_winners,omitempty"`
	GiveawayCompleted             *GiveawayCompleted             `json:"giveaway_completed,omitempty"`
	ManagedBotCreated             *ManagedBotCreated             `json:"managed_bot_created,omitempty"`
	PaidMessagePriceChanged       *PaidMessagePriceChanged       `json:"paid_message_price_changed,omitempty"`
	PollOptionAdded               *PollOptionAdded               `json:"poll_option_added,omitempty"`
	PollOptionDeleted             *PollOptionDeleted             `json:"poll_option_deleted,omitempty"`
	SuggestedPostApproved         *SuggestedPostApproved         `json:"suggested_post_approved,omitempty"`
	SuggestedPostApprovalFailed   *SuggestedPostApprovalFailed   `json:"suggested_post_approval_failed,omitempty"`
	SuggestedPostDeclined         *SuggestedPostDeclined         `json:"suggested_post_declined,omitempty"`
	SuggestedPostPaid             *SuggestedPostPaid             `json:"suggested_post_paid,omitempty"`
	SuggestedPostRefunded         *SuggestedPostRefunded         `json:"suggested_post_refunded,omitempty"`
	VideoChatScheduled            *VideoChatScheduled            `json:"video_chat_scheduled,omitempty"`
	VideoChatStarted              *VideoChatStarted              `json:"video_chat_started,omitempty"`
	VideoChatEnded                *VideoChatEnded                `json:"video_chat_ended,omitempty"`
	VideoChatParticipantsInvited  *VideoChatParticipantsInvited  `json:"video_chat_participants_invited,omitempty"`
	WebAppData                    *WebAppData                    `json:"web_app_data,omitempty"`
	NewChatMembers                []User                         `json:"new_chat_members,omitempty"`
	LeftChatMember                *User                          `json:"left_chat_member,omitempty"`
	NewChatTitle                  string                         `json:"new_chat_title,omitempty"`
	NewChatPhoto                  []PhotoSize                    `json:"new_chat_photo,omitempty"`
	DeleteChatPhoto               bool                           `json:"delete_chat_photo,omitempty"`
	GroupChatCreated              bool                           `json:"group_chat_created,omitempty"`
	SupergroupChatCreated         bool                           `json:"supergroup_chat_created,omitempty"`
	ChannelChatCreated            bool                           `json:"channel_chat_created,omitempty"`
	MigrateToChatID               int64                          `json:"migrate_to_chat_id,omitempty"`
	MigrateFromChatID             int64                          `json:"migrate_from_chat_id,omitempty"`
	PinnedMessage                 *Message                       `json:"pinned_message,omitempty"`
	ReplyToMessage                *Message                       `json:"reply_to_message,omitempty"`
	ReplyMarkup                   *InlineKeyboardMarkup          `json:"reply_markup,omitempty"`
}

// MessageOrigin describes the origin of a forwarded message.
//
// It is a flattened representation of Telegram's MessageOrigin union: the
// Type field discriminates the variant ("user", "hidden_user", "chat" or
// "channel") and only the fields relevant to that variant are populated.
//
// Telegram API: https://core.telegram.org/bots/api#messageorigin
type MessageOrigin struct {
	Type            string `json:"type"`
	Date            int64  `json:"date"`
	SenderUser      *User  `json:"sender_user,omitempty"`
	SenderUserName  string `json:"sender_user_name,omitempty"`
	SenderChat      *Chat  `json:"sender_chat,omitempty"`
	AuthorSignature string `json:"author_signature,omitempty"`
	Chat            *Chat  `json:"chat,omitempty"`
	MessageID       int64  `json:"message_id,omitempty"`
}

// CallbackQuery represents an incoming callback query from an inline button.
//
// Telegram API: https://core.telegram.org/bots/api#callbackquery
type CallbackQuery struct {
	ID              string   `json:"id"`
	From            *User    `json:"from"`
	Message         *Message `json:"message,omitempty"`
	InlineMessageID string   `json:"inline_message_id,omitempty"`
	ChatInstance    string   `json:"chat_instance"`
	Data            string   `json:"data,omitempty"`
	GameShortName   string   `json:"game_short_name,omitempty"`
}

// InlineQuery represents an incoming inline query.
//
// Telegram API: https://core.telegram.org/bots/api#inlinequery
type InlineQuery struct {
	ID       string    `json:"id"`
	From     *User     `json:"from"`
	Query    string    `json:"query"`
	Offset   string    `json:"offset"`
	ChatType string    `json:"chat_type,omitempty"`
	Location *Location `json:"location,omitempty"`
}

// Update represents an incoming update from Telegram.
//
// Telegram API: https://core.telegram.org/bots/api#update
type Update struct {
	UpdateID                 int64                        `json:"update_id"`
	Message                  *Message                     `json:"message,omitempty"`
	EditedMessage            *Message                     `json:"edited_message,omitempty"`
	ChannelPost              *Message                     `json:"channel_post,omitempty"`
	EditedChannelPost        *Message                     `json:"edited_channel_post,omitempty"`
	BusinessConnection       *BusinessConnection          `json:"business_connection,omitempty"`
	BusinessMessage          *Message                     `json:"business_message,omitempty"`
	EditedBusinessMessage    *Message                     `json:"edited_business_message,omitempty"`
	DeletedBusinessMessages  *BusinessMessagesDeleted     `json:"deleted_business_messages,omitempty"`
	MessageReaction          *MessageReactionUpdated      `json:"message_reaction,omitempty"`
	MessageReactionCount     *MessageReactionCountUpdated `json:"message_reaction_count,omitempty"`
	ChatBoost                *ChatBoostUpdated            `json:"chat_boost,omitempty"`
	RemovedChatBoost         *ChatBoostRemoved            `json:"removed_chat_boost,omitempty"`
	InlineQuery              *InlineQuery                 `json:"inline_query,omitempty"`
	ChosenInlineResult       *ChosenInlineResult          `json:"chosen_inline_result,omitempty"`
	CallbackQuery            *CallbackQuery               `json:"callback_query,omitempty"`
	ShippingQuery            *ShippingQuery               `json:"shipping_query,omitempty"`
	PreCheckoutQuery         *PreCheckoutQuery            `json:"pre_checkout_query,omitempty"`
	PurchasedPaidMedia       *PaidMediaPurchased          `json:"purchased_paid_media,omitempty"`
	Poll                     *Poll                        `json:"poll,omitempty"`
	PollAnswer               *PollAnswer                  `json:"poll_answer,omitempty"`
	MyChatMember             *ChatMemberUpdated           `json:"my_chat_member,omitempty"`
	ChatMember               *ChatMemberUpdated           `json:"chat_member,omitempty"`
	ChatJoinRequest          *ChatJoinRequest             `json:"chat_join_request,omitempty"`
	Subscription             *BotSubscriptionUpdated      `json:"subscription,omitempty"`
	StoppedMessageGeneration *MessageGenerationStopped    `json:"stopped_message_generation,omitempty"`
	ManagedBot               *ManagedBotUpdated           `json:"managed_bot,omitempty"`
	GuestMessage             *Message                     `json:"guest_message,omitempty"`
}

// EffectiveUser extracts the sender User from an Update regardless of update type.
func (u *Update) EffectiveUser() *User {
	if u.Message != nil && u.Message.From != nil {
		return u.Message.From
	}
	if u.CallbackQuery != nil && u.CallbackQuery.From != nil {
		return u.CallbackQuery.From
	}
	if u.EditedMessage != nil && u.EditedMessage.From != nil {
		return u.EditedMessage.From
	}
	if u.InlineQuery != nil && u.InlineQuery.From != nil {
		return u.InlineQuery.From
	}
	if u.PollAnswer != nil && u.PollAnswer.User != nil {
		return u.PollAnswer.User
	}
	if u.MyChatMember != nil && u.MyChatMember.From != nil {
		return u.MyChatMember.From
	}
	if u.ChatMember != nil && u.ChatMember.From != nil {
		return u.ChatMember.From
	}
	if u.ChatJoinRequest != nil && u.ChatJoinRequest.From != nil {
		return u.ChatJoinRequest.From
	}
	if u.BusinessMessage != nil && u.BusinessMessage.From != nil {
		return u.BusinessMessage.From
	}
	if u.EditedBusinessMessage != nil && u.EditedBusinessMessage.From != nil {
		return u.EditedBusinessMessage.From
	}
	if u.GuestMessage != nil && u.GuestMessage.From != nil {
		return u.GuestMessage.From
	}
	if u.ChosenInlineResult != nil && u.ChosenInlineResult.From != nil {
		return u.ChosenInlineResult.From
	}
	if u.ShippingQuery != nil && u.ShippingQuery.From != nil {
		return u.ShippingQuery.From
	}
	if u.PreCheckoutQuery != nil && u.PreCheckoutQuery.From != nil {
		return u.PreCheckoutQuery.From
	}
	if u.PurchasedPaidMedia != nil && u.PurchasedPaidMedia.From != nil {
		return u.PurchasedPaidMedia.From
	}
	if u.Subscription != nil && u.Subscription.User != nil {
		return u.Subscription.User
	}
	if u.ManagedBot != nil && u.ManagedBot.User != nil {
		return u.ManagedBot.User
	}
	if u.MessageReaction != nil && u.MessageReaction.User != nil {
		return u.MessageReaction.User
	}
	if u.ChatBoost != nil && u.ChatBoost.Boost != nil && u.ChatBoost.Boost.Source.User != nil {
		return u.ChatBoost.Boost.Source.User
	}
	if u.RemovedChatBoost != nil && u.RemovedChatBoost.Source != nil {
		return u.RemovedChatBoost.Source.User
	}
	return nil
}

// EffectiveChat extracts the target Chat from an Update.
func (u *Update) EffectiveChat() *Chat {
	if u.Message != nil && u.Message.Chat != nil {
		return u.Message.Chat
	}
	if u.CallbackQuery != nil && u.CallbackQuery.Message != nil {
		return u.CallbackQuery.Message.Chat
	}
	if u.EditedMessage != nil && u.EditedMessage.Chat != nil {
		return u.EditedMessage.Chat
	}
	if u.ChannelPost != nil && u.ChannelPost.Chat != nil {
		return u.ChannelPost.Chat
	}
	if u.MyChatMember != nil && u.MyChatMember.Chat != nil {
		return u.MyChatMember.Chat
	}
	if u.ChatMember != nil && u.ChatMember.Chat != nil {
		return u.ChatMember.Chat
	}
	if u.ChatJoinRequest != nil && u.ChatJoinRequest.Chat != nil {
		return u.ChatJoinRequest.Chat
	}
	if u.PollAnswer != nil && u.PollAnswer.VoterChat != nil {
		return u.PollAnswer.VoterChat
	}
	if u.BusinessMessage != nil && u.BusinessMessage.Chat != nil {
		return u.BusinessMessage.Chat
	}
	if u.EditedBusinessMessage != nil && u.EditedBusinessMessage.Chat != nil {
		return u.EditedBusinessMessage.Chat
	}
	if u.GuestMessage != nil && u.GuestMessage.Chat != nil {
		return u.GuestMessage.Chat
	}
	if u.DeletedBusinessMessages != nil && u.DeletedBusinessMessages.Chat != nil {
		return u.DeletedBusinessMessages.Chat
	}
	if u.MessageReaction != nil && u.MessageReaction.Chat != nil {
		return u.MessageReaction.Chat
	}
	if u.MessageReactionCount != nil && u.MessageReactionCount.Chat != nil {
		return u.MessageReactionCount.Chat
	}
	if u.ChatBoost != nil && u.ChatBoost.Chat != nil {
		return u.ChatBoost.Chat
	}
	if u.RemovedChatBoost != nil && u.RemovedChatBoost.Chat != nil {
		return u.RemovedChatBoost.Chat
	}
	if u.StoppedMessageGeneration != nil && u.StoppedMessageGeneration.Chat != nil {
		return u.StoppedMessageGeneration.Chat
	}
	return nil
}

// EffectiveMessage extracts the relevant Message from an Update.
func (u *Update) EffectiveMessage() *Message {
	if u.Message != nil {
		return u.Message
	}
	if u.CallbackQuery != nil && u.CallbackQuery.Message != nil {
		return u.CallbackQuery.Message
	}
	if u.EditedMessage != nil {
		return u.EditedMessage
	}
	if u.ChannelPost != nil {
		return u.ChannelPost
	}
	return nil
}

// InlineKeyboardButton represents a button on an inline keyboard.
//
// Telegram API: https://core.telegram.org/bots/api#inlinekeyboardbutton
type InlineKeyboardButton struct {
	Text                         string                       `json:"text"`
	URL                          string                       `json:"url,omitempty"`
	CallbackData                 string                       `json:"callback_data,omitempty"`
	WebApp                       *WebAppInfo                  `json:"web_app,omitempty"`
	SwitchInlineQuery            string                       `json:"switch_inline_query,omitempty"`
	SwitchInlineQueryCurrentChat string                       `json:"switch_inline_query_current_chat,omitempty"`
	Pay                          bool                         `json:"pay,omitempty"`
	CallbackGame                 *CallbackGame                `json:"callback_game,omitempty"`
	CopyText                     *CopyTextButton              `json:"copy_text,omitempty"`
	Disabled                     *DisabledButton              `json:"disabled,omitempty"`
	IconCustomEmojiID            string                       `json:"icon_custom_emoji_id,omitempty"`
	LoginURL                     *LoginUrl                    `json:"login_url,omitempty"`
	Style                        string                       `json:"style,omitempty"`
	SwitchInlineQueryChosenChat  *SwitchInlineQueryChosenChat `json:"switch_inline_query_chosen_chat,omitempty"`
}

// InlineKeyboardMarkup represents an inline keyboard attached to a message.
//
// Telegram API: https://core.telegram.org/bots/api#inlinekeyboardmarkup
type InlineKeyboardMarkup struct {
	InlineKeyboard [][]InlineKeyboardButton `json:"inline_keyboard"`
	ForceReply     bool                     `json:"force_reply,omitempty"`
}

// SendMessageOptions represents parameters for the sendMessage method.
type SendMessageOptions struct {
	BusinessConnectionID       string                      `json:"business_connection_id,omitempty"`
	ChatID                     any                         `json:"chat_id"`
	Text                       string                      `json:"text"`
	MessageThreadID            int64                       `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID      int64                       `json:"direct_messages_topic_id,omitempty"`
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
	ParseMode                  string                      `json:"parse_mode,omitempty"`
	Entities                   []MessageEntity             `json:"entities,omitempty"`
	LinkPreviewOptions         *LinkPreviewOptions         `json:"link_preview_options,omitempty"`
	DisableNotification        bool                        `json:"disable_notification,omitempty"`
	ProtectContent             bool                        `json:"protect_content,omitempty"`
	AllowPaidBroadcast         bool                        `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID            string                      `json:"message_effect_id,omitempty"`
	SuggestedPostParameters    *SuggestedPostParameters    `json:"suggested_post_parameters,omitempty"`
	ReplyParameters            *ReplyParameters            `json:"reply_parameters,omitempty"`
	// ReplyMarkup accepts *InlineKeyboardMarkup, *keyboard.ReplyKeyboardMarkup,
	// or any other Telegram reply_markup value.
	ReplyMarkup any `json:"reply_markup,omitempty"`
}

// GetUpdatesOptions represents parameters for the getUpdates method.
type GetUpdatesOptions struct {
	Offset         int64    `json:"offset,omitempty"`
	Limit          int      `json:"limit,omitempty"`
	Timeout        int      `json:"timeout,omitempty"`
	AllowedUpdates []string `json:"allowed_updates,omitempty"`
}

// AnswerCallbackQueryOptions represents parameters for answerCallbackQuery.
type AnswerCallbackQueryOptions struct {
	CallbackQueryID string `json:"callback_query_id"`
	Text            string `json:"text,omitempty"`
	ShowAlert       bool   `json:"show_alert,omitempty"`
	URL             string `json:"url,omitempty"`
	CacheTime       int    `json:"cache_time,omitempty"`
}

// Ptr returns a pointer to v, which is how callers set the pointer-typed
// optional fields of request options structs, e.g.
// types.SendGiftOptions{UserID: types.Ptr(int64(123456))}.
//
// Parameters:
//   - v: The value to take the address of.
//
// Returns:
//   - *T: A pointer to a copy of v.
func Ptr[T any](v T) *T {
	return &v
}
