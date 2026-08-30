package types

// MessageEntity represents a special entity in a text message.
//
// Telegram API: https://core.telegram.org/bots/api#messageentity
type MessageEntity struct {
	Type          string `json:"type"`
	Offset        int    `json:"offset"`
	Length        int    `json:"length"`
	URL           string `json:"url,omitempty"`
	User          *User  `json:"user,omitempty"`
	Language      string `json:"language,omitempty"`
	CustomEmojiID string `json:"custom_emoji_id,omitempty"`
}

// WebAppInfo describes a Web App that can be launched from a button.
//
// Telegram API: https://core.telegram.org/bots/api#webappinfo
type WebAppInfo struct {
	URL string `json:"url"`
}

// LinkPreviewOptions configures link preview generation for a message.
//
// Telegram API: https://core.telegram.org/bots/api#linkpreviewoptions
type LinkPreviewOptions struct {
	IsDisabled       bool   `json:"is_disabled,omitempty"`
	URL              string `json:"url,omitempty"`
	PreferSmallMedia bool   `json:"prefer_small_media,omitempty"`
	PreferLargeMedia bool   `json:"prefer_large_media,omitempty"`
	ShowAboveText    bool   `json:"show_above_text,omitempty"`
}

// ReplyParameters describes a message to reply to.
//
// Telegram API: https://core.telegram.org/bots/api#replyparameters
type ReplyParameters struct {
	// Identifier of the original message; optional, so a quote-only reply that
	// carries just chat_id/quote omits it instead of sending 0.
	MessageID                *int64          `json:"message_id,omitempty"`
	ChatID                   any             `json:"chat_id,omitempty"`
	AllowSendingWithoutReply bool            `json:"allow_sending_without_reply,omitempty"`
	Quote                    string          `json:"quote,omitempty"`
	QuoteParseMode           string          `json:"quote_parse_mode,omitempty"`
	QuoteEntities            []MessageEntity `json:"quote_entities,omitempty"`
	QuotePosition            int             `json:"quote_position,omitempty"`
	ChecklistTaskID          int             `json:"checklist_task_id,omitempty"`
	PollOptionID             string          `json:"poll_option_id,omitempty"`
	EphemeralMessageID       int             `json:"ephemeral_message_id,omitempty"`
}

// InputMedia is the union of all input media types that can be sent in a media group or edited.
//
// Telegram API: https://core.telegram.org/bots/api#inputmedia
type InputMedia interface {
	inputMedia()
}

// InputMediaPhoto represents a photo to be sent as part of a media group or edited media.
//
// Telegram API: https://core.telegram.org/bots/api#inputmediaphoto
type InputMediaPhoto struct {
	Type                  string          `json:"type"`
	Media                 string          `json:"media"`
	Caption               string          `json:"caption,omitempty"`
	ParseMode             string          `json:"parse_mode,omitempty"`
	CaptionEntities       []MessageEntity `json:"caption_entities,omitempty"`
	ShowCaptionAboveMedia bool            `json:"show_caption_above_media,omitempty"`
	HasSpoiler            bool            `json:"has_spoiler,omitempty"`
}

func (InputMediaPhoto) inputMedia() {}

// InputMediaVideo represents a video to be sent as part of a media group or edited media.
//
// Telegram API: https://core.telegram.org/bots/api#inputmediavideo
type InputMediaVideo struct {
	Type                  string          `json:"type"`
	Media                 string          `json:"media"`
	Thumbnail             string          `json:"thumbnail,omitempty"`
	Caption               string          `json:"caption,omitempty"`
	ParseMode             string          `json:"parse_mode,omitempty"`
	CaptionEntities       []MessageEntity `json:"caption_entities,omitempty"`
	ShowCaptionAboveMedia bool            `json:"show_caption_above_media,omitempty"`
	Width                 int             `json:"width,omitempty"`
	Height                int             `json:"height,omitempty"`
	Duration              int             `json:"duration,omitempty"`
	SupportsStreaming     bool            `json:"supports_streaming,omitempty"`
	HasSpoiler            bool            `json:"has_spoiler,omitempty"`
}

func (InputMediaVideo) inputMedia() {}

// InputMediaAnimation represents an animation to be sent as part of a media group or edited media.
//
// Telegram API: https://core.telegram.org/bots/api#inputmediaanimation
type InputMediaAnimation struct {
	Type                  string          `json:"type"`
	Media                 string          `json:"media"`
	Thumbnail             string          `json:"thumbnail,omitempty"`
	Caption               string          `json:"caption,omitempty"`
	ParseMode             string          `json:"parse_mode,omitempty"`
	CaptionEntities       []MessageEntity `json:"caption_entities,omitempty"`
	ShowCaptionAboveMedia bool            `json:"show_caption_above_media,omitempty"`
	Width                 int             `json:"width,omitempty"`
	Height                int             `json:"height,omitempty"`
	Duration              int             `json:"duration,omitempty"`
	HasSpoiler            bool            `json:"has_spoiler,omitempty"`
}

func (InputMediaAnimation) inputMedia() {}

// InputMediaAudio represents an audio file to be sent as part of a media group or edited media.
//
// Telegram API: https://core.telegram.org/bots/api#inputmediaaudio
type InputMediaAudio struct {
	Type            string          `json:"type"`
	Media           string          `json:"media"`
	Thumbnail       string          `json:"thumbnail,omitempty"`
	Caption         string          `json:"caption,omitempty"`
	ParseMode       string          `json:"parse_mode,omitempty"`
	CaptionEntities []MessageEntity `json:"caption_entities,omitempty"`
	Duration        int             `json:"duration,omitempty"`
	Performer       string          `json:"performer,omitempty"`
	Title           string          `json:"title,omitempty"`
}

func (InputMediaAudio) inputMedia() {}

// InputMediaDocument represents a general file to be sent as part of a media group or edited media.
//
// Telegram API: https://core.telegram.org/bots/api#inputmediadocument
type InputMediaDocument struct {
	Type                        string          `json:"type"`
	Media                       string          `json:"media"`
	Thumbnail                   string          `json:"thumbnail,omitempty"`
	Caption                     string          `json:"caption,omitempty"`
	ParseMode                   string          `json:"parse_mode,omitempty"`
	CaptionEntities             []MessageEntity `json:"caption_entities,omitempty"`
	DisableContentTypeDetection bool            `json:"disable_content_type_detection,omitempty"`
}

func (InputMediaDocument) inputMedia() {}

// InputMediaVoiceNote represents a voice message to be sent (Bot API 10.3+).
//
// It joins the InputMedia union alongside the other InputMedia* classes and is
// the media type InputRichBlockVoiceNote and InputRichMessageMedia expect for
// voice notes. Optional scalars are pointers so an explicit zero (e.g. a
// duration of 0) stays distinguishable from an unset field on the wire.
//
// Telegram API: https://core.telegram.org/bots/api#inputmediavoicenote
type InputMediaVoiceNote struct {
	// Type of the media, must be voice_note.
	Type string `json:"type"`
	// File to send. Pass a file_id to send a file that exists on the Telegram
	// servers, pass an HTTP URL for Telegram to get a file from the Internet, or
	// pass "attach://<file_attach_name>" to upload a new one.
	Media string `json:"media"`
	// Caption of the voice message to be sent, 0-1024 characters after entities parsing.
	Caption *string `json:"caption,omitempty"`
	// Mode for parsing entities in the voice message caption.
	ParseMode *string `json:"parse_mode,omitempty"`
	// List of special entities that appear in the caption, which can be specified
	// instead of parse_mode.
	CaptionEntities []MessageEntity `json:"caption_entities,omitempty"`
	// Duration of the voice message in seconds.
	Duration *int64 `json:"duration,omitempty"`
}

func (InputMediaVoiceNote) inputMedia() {}

// ReactionType is the union of reaction types that can be set on a message.
//
// Telegram API: https://core.telegram.org/bots/api#reactiontype
type ReactionType interface {
	reactionType()
}

// ReactionTypeEmoji represents a reaction with a regular emoji.
//
// Telegram API: https://core.telegram.org/bots/api#reactiontypeemoji
type ReactionTypeEmoji struct {
	Type  string `json:"type"`
	Emoji string `json:"emoji"`
}

func (ReactionTypeEmoji) reactionType() {}

// ReactionTypeCustomEmoji represents a reaction with a custom emoji.
//
// Telegram API: https://core.telegram.org/bots/api#reactiontypecustomemoji
type ReactionTypeCustomEmoji struct {
	Type          string `json:"type"`
	CustomEmojiID string `json:"custom_emoji_id"`
}

func (ReactionTypeCustomEmoji) reactionType() {}

// ReactionTypePaid represents a paid reaction.
//
// Telegram API: https://core.telegram.org/bots/api#reactiontypepaid
type ReactionTypePaid struct {
	Type string `json:"type"`
}

func (ReactionTypePaid) reactionType() {}
