package types

// ChatBoostAdded represents a service message about a user boosting a chat.
//
// Telegram API: https://core.telegram.org/bots/api#chatboostadded
type ChatBoostAdded struct {
	BoostCount int64 `json:"boost_count"`
}

// ChatShared contains information about a chat that was shared with the bot
// using a KeyboardButtonRequestChat button.
//
// Telegram API: https://core.telegram.org/bots/api#chatshared
type ChatShared struct {
	RequestID int64       `json:"request_id"`
	ChatID    int64       `json:"chat_id"`
	Title     string      `json:"title,omitempty"`
	Username  string      `json:"username,omitempty"`
	Photo     []PhotoSize `json:"photo,omitempty"`
}

// UsersShared contains information about the users whose identifiers were
// shared with the bot using a KeyboardButtonRequestUsers button.
//
// Telegram API: https://core.telegram.org/bots/api#usersshared
type UsersShared struct {
	RequestID int64        `json:"request_id"`
	Users     []SharedUser `json:"users"`
}

// SharedUser contains information about a user that was shared with the bot
// using a KeyboardButtonRequestUsers button.
//
// Telegram API: https://core.telegram.org/bots/api#shareduser
type SharedUser struct {
	UserID    int64       `json:"user_id"`
	FirstName string      `json:"first_name,omitempty"`
	LastName  string      `json:"last_name,omitempty"`
	Username  string      `json:"username,omitempty"`
	Photo     []PhotoSize `json:"photo,omitempty"`
}

// VideoChatStarted represents a service message about a video chat started
// in the chat. Currently holds no information.
//
// Telegram API: https://core.telegram.org/bots/api#videochatstarted
type VideoChatStarted struct{}

// VideoChatScheduled represents a service message about a video chat
// scheduled in the chat.
//
// Telegram API: https://core.telegram.org/bots/api#videochatscheduled
type VideoChatScheduled struct {
	StartDate int64 `json:"start_date"`
}

// VideoChatEnded represents a service message about a video chat ended in
// the chat.
//
// Telegram API: https://core.telegram.org/bots/api#videochatended
type VideoChatEnded struct {
	Duration int64 `json:"duration"`
}

// VideoChatParticipantsInvited represents a service message about new
// members invited to a video chat.
//
// Telegram API: https://core.telegram.org/bots/api#videochatparticipantsinvited
type VideoChatParticipantsInvited struct {
	Users []User `json:"users"`
}

// ForumTopicClosed represents a service message about a forum topic closed
// in the chat. Currently holds no information.
//
// Telegram API: https://core.telegram.org/bots/api#forumtopicclosed
type ForumTopicClosed struct{}

// ForumTopicCreated represents a service message about a new forum topic
// created in the chat.
//
// Telegram API: https://core.telegram.org/bots/api#forumtopiccreated
type ForumTopicCreated struct {
	Name              string `json:"name"`
	IconColor         int64  `json:"icon_color"`
	IconCustomEmojiID string `json:"icon_custom_emoji_id,omitempty"`
	IsNameImplicit    bool   `json:"is_name_implicit,omitempty"`
}

// ForumTopicEdited represents a service message about an edited forum topic.
//
// Telegram API: https://core.telegram.org/bots/api#forumtopicedited
type ForumTopicEdited struct {
	Name              string `json:"name,omitempty"`
	IconCustomEmojiID string `json:"icon_custom_emoji_id,omitempty"`
}

// ForumTopicReopened represents a service message about a forum topic
// reopened in the chat. Currently holds no information.
//
// Telegram API: https://core.telegram.org/bots/api#forumtopicreopened
type ForumTopicReopened struct{}

// GeneralForumTopicHidden represents a service message about General forum
// topic hidden in the chat. Currently holds no information.
//
// Telegram API: https://core.telegram.org/bots/api#generalforumtopichidden
type GeneralForumTopicHidden struct{}

// GeneralForumTopicUnhidden represents a service message about General forum
// topic unhidden in the chat. Currently holds no information.
//
// Telegram API: https://core.telegram.org/bots/api#generalforumtopicunhidden
type GeneralForumTopicUnhidden struct{}

// MessageAutoDeleteTimerChanged represents a service message about a change
// in auto-delete timer settings.
//
// Telegram API: https://core.telegram.org/bots/api#messageautodeletetimerchanged
type MessageAutoDeleteTimerChanged struct {
	MessageAutoDeleteTime int64 `json:"message_auto_delete_time"`
}

// ProximityAlertTriggered represents the content of a service message, sent
// whenever a user in the chat triggers a proximity alert set by another
// user.
//
// Telegram API: https://core.telegram.org/bots/api#proximityalerttriggered
type ProximityAlertTriggered struct {
	Traveler *User `json:"traveler"`
	Watcher  *User `json:"watcher"`
	Distance int64 `json:"distance"`
}

// WriteAccessAllowed represents a service message about a user allowing a
// bot to write messages after adding it to the attachment menu, launching a
// Web App from a link, or accepting an explicit request from a Web App sent
// by the method requestWriteAccess.
//
// Telegram API: https://core.telegram.org/bots/api#writeaccessallowed
type WriteAccessAllowed struct {
	FromRequest        bool   `json:"from_request,omitempty"`
	WebAppName         string `json:"web_app_name,omitempty"`
	FromAttachmentMenu bool   `json:"from_attachment_menu,omitempty"`
}

// WebAppData describes data sent from a Web App to the bot.
//
// Telegram API: https://core.telegram.org/bots/api#webappdata
type WebAppData struct {
	Data       string `json:"data"`
	ButtonText string `json:"button_text"`
}
