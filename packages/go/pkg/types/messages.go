package types

// PhotoSize represents one size of a photo or a file / sticker thumbnail.
//
// Telegram API: https://core.telegram.org/bots/api#photosize
type PhotoSize struct {
	FileID       string `json:"file_id"`
	FileUniqueID string `json:"file_unique_id"`
	Width        int    `json:"width"`
	Height       int    `json:"height"`
	FileSize     int64  `json:"file_size,omitempty"`
}

// Audio represents an audio file.
//
// Telegram API: https://core.telegram.org/bots/api#audio
type Audio struct {
	FileID       string     `json:"file_id"`
	FileUniqueID string     `json:"file_unique_id"`
	Duration     int        `json:"duration"`
	Performer    string     `json:"performer,omitempty"`
	Title        string     `json:"title,omitempty"`
	FileName     string     `json:"file_name,omitempty"`
	MimeType     string     `json:"mime_type,omitempty"`
	FileSize     int64      `json:"file_size,omitempty"`
	Thumbnail    *PhotoSize `json:"thumbnail,omitempty"`
}

// Document represents a general file.
//
// Telegram API: https://core.telegram.org/bots/api#document
type Document struct {
	FileID       string     `json:"file_id"`
	FileUniqueID string     `json:"file_unique_id"`
	Thumbnail    *PhotoSize `json:"thumbnail,omitempty"`
	FileName     string     `json:"file_name,omitempty"`
	MimeType     string     `json:"mime_type,omitempty"`
	FileSize     int64      `json:"file_size,omitempty"`
}

// Video represents a video file.
//
// Telegram API: https://core.telegram.org/bots/api#video
type Video struct {
	FileID         string         `json:"file_id"`
	FileUniqueID   string         `json:"file_unique_id"`
	Width          int            `json:"width"`
	Height         int            `json:"height"`
	Duration       int            `json:"duration"`
	Thumbnail      *PhotoSize     `json:"thumbnail,omitempty"`
	FileName       string         `json:"file_name,omitempty"`
	MimeType       string         `json:"mime_type,omitempty"`
	FileSize       int64          `json:"file_size,omitempty"`
	Cover          []PhotoSize    `json:"cover,omitempty"`
	Qualities      []VideoQuality `json:"qualities,omitempty"`
	StartTimestamp int64          `json:"start_timestamp,omitempty"`
}

// Animation represents an animation file (GIF or H.264 video).
//
// Telegram API: https://core.telegram.org/bots/api#animation
type Animation struct {
	FileID       string     `json:"file_id"`
	FileUniqueID string     `json:"file_unique_id"`
	Width        int        `json:"width"`
	Height       int        `json:"height"`
	Duration     int        `json:"duration"`
	Thumbnail    *PhotoSize `json:"thumbnail,omitempty"`
	FileName     string     `json:"file_name,omitempty"`
	MimeType     string     `json:"mime_type,omitempty"`
	FileSize     int64      `json:"file_size,omitempty"`
}

// Voice represents a voice note.
//
// Telegram API: https://core.telegram.org/bots/api#voice
type Voice struct {
	FileID       string `json:"file_id"`
	FileUniqueID string `json:"file_unique_id"`
	Duration     int    `json:"duration"`
	MimeType     string `json:"mime_type,omitempty"`
	FileSize     int64  `json:"file_size,omitempty"`
}

// VideoNote represents a video note (round video message).
//
// Telegram API: https://core.telegram.org/bots/api#videonote
type VideoNote struct {
	FileID       string     `json:"file_id"`
	FileUniqueID string     `json:"file_unique_id"`
	Length       int        `json:"length"`
	Duration     int        `json:"duration"`
	Thumbnail    *PhotoSize `json:"thumbnail,omitempty"`
	FileSize     int64      `json:"file_size,omitempty"`
}

// Contact represents a phone contact.
//
// Telegram API: https://core.telegram.org/bots/api#contact
type Contact struct {
	PhoneNumber string `json:"phone_number"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name,omitempty"`
	UserID      int64  `json:"user_id,omitempty"`
	VCard       string `json:"vcard,omitempty"`
}

// Location represents a point on the map.
//
// Telegram API: https://core.telegram.org/bots/api#location
type Location struct {
	Latitude             float64 `json:"latitude"`
	Longitude            float64 `json:"longitude"`
	HorizontalAccuracy   float64 `json:"horizontal_accuracy,omitempty"`
	LivePeriod           int     `json:"live_period,omitempty"`
	Heading              int     `json:"heading,omitempty"`
	ProximityAlertRadius int     `json:"proximity_alert_radius,omitempty"`
}

// Venue represents a venue.
//
// Telegram API: https://core.telegram.org/bots/api#venue
type Venue struct {
	Location        Location `json:"location"`
	Title           string   `json:"title"`
	Address         string   `json:"address"`
	FoursquareID    string   `json:"foursquare_id,omitempty"`
	FoursquareType  string   `json:"foursquare_type,omitempty"`
	GooglePlaceID   string   `json:"google_place_id,omitempty"`
	GooglePlaceType string   `json:"google_place_type,omitempty"`
}

// PollOption contains information about one answer option in a poll.
//
// Telegram API: https://core.telegram.org/bots/api#polloption
type PollOption struct {
	Text         string          `json:"text"`
	VoterCount   int             `json:"voter_count"`
	AddedByChat  *Chat           `json:"added_by_chat,omitempty"`
	AddedByUser  *User           `json:"added_by_user,omitempty"`
	AdditionDate int64           `json:"addition_date,omitempty"`
	Media        *PollMedia      `json:"media,omitempty"`
	PersistentID string          `json:"persistent_id"`
	TextEntities []MessageEntity `json:"text_entities,omitempty"`
}

// Poll contains information about a poll.
//
// Telegram API: https://core.telegram.org/bots/api#poll
type Poll struct {
	ID                    string          `json:"id"`
	Question              string          `json:"question"`
	Options               []PollOption    `json:"options"`
	TotalVoterCount       int             `json:"total_voter_count"`
	IsClosed              bool            `json:"is_closed"`
	IsAnonymous           bool            `json:"is_anonymous"`
	Type                  string          `json:"type"`
	AllowsMultipleAnswers bool            `json:"allows_multiple_answers"`
	CorrectOptionID       int             `json:"correct_option_id,omitempty"`
	Explanation           string          `json:"explanation,omitempty"`
	AllowsRevoting        bool            `json:"allows_revoting"`
	CloseDate             int64           `json:"close_date,omitempty"`
	CorrectOptionIDs      []int64         `json:"correct_option_ids,omitempty"`
	CountryCodes          []string        `json:"country_codes,omitempty"`
	Description           string          `json:"description,omitempty"`
	DescriptionEntities   []MessageEntity `json:"description_entities,omitempty"`
	ExplanationEntities   []MessageEntity `json:"explanation_entities,omitempty"`
	ExplanationMedia      *PollMedia      `json:"explanation_media,omitempty"`
	Media                 *PollMedia      `json:"media,omitempty"`
	MembersOnly           bool            `json:"members_only"`
	OpenPeriod            int64           `json:"open_period,omitempty"`
	QuestionEntities      []MessageEntity `json:"question_entities,omitempty"`
}

// PollAnswer represents a change of answer by a user in a non-anonymous poll.
//
// Telegram API: https://core.telegram.org/bots/api#pollanswer
type PollAnswer struct {
	PollID              string   `json:"poll_id"`
	VoterChat           *Chat    `json:"voter_chat,omitempty"`
	User                *User    `json:"user,omitempty"`
	OptionIDs           []int    `json:"option_ids"`
	OptionPersistentIDs []string `json:"option_persistent_ids"`
}

// Dice represents an animated emoji that displays a random value.
//
// Telegram API: https://core.telegram.org/bots/api#dice
type Dice struct {
	Emoji string `json:"emoji"`
	Value int    `json:"value"`
}

// MessageId contains a unique message identifier.
//
// Telegram API: https://core.telegram.org/bots/api#messageid
type MessageId struct {
	MessageID int64 `json:"message_id"`
}

// EditMessageReplyMarkupOptions parameters for editMessageReplyMarkup.
type EditMessageReplyMarkupOptions struct {
	ChatID          any                   `json:"chat_id,omitempty"`
	MessageID       int64                 `json:"message_id,omitempty"`
	InlineMessageID string                `json:"inline_message_id,omitempty"`
	ReplyMarkup     *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// InaccessibleMessage describes a message that was deleted or is otherwise
// inaccessible to the bot.
//
// Telegram declares several fields whose type is the MaybeInaccessibleMessage
// union of Message and this object. This package keeps those fields typed
// *Message, which decodes an inaccessible message as a Message whose Date is 0,
// so a zero Date plus a non-nil Chat is the discriminator; use this struct when
// a caller wants the inaccessible arm named explicitly.
//
// Telegram API: https://core.telegram.org/bots/api#inaccessiblemessage
type InaccessibleMessage struct {
	// Chat the message belonged to.
	Chat *Chat `json:"chat"`
	// Unique message identifier inside the chat.
	MessageID int64 `json:"message_id"`
	// Always 0. The field can be used to differentiate regular and inaccessible
	// messages.
	Date int64 `json:"date"`
}
