package types

// SendAudioOptions represents parameters for the sendAudio method.
type SendAudioOptions struct {
	BusinessConnectionID       string                      `json:"business_connection_id,omitempty"`
	ChatID                     any                         `json:"chat_id"`
	Audio                      any                         `json:"audio"`
	Caption                    string                      `json:"caption,omitempty"`
	ParseMode                  string                      `json:"parse_mode,omitempty"`
	CaptionEntities            []MessageEntity             `json:"caption_entities,omitempty"`
	Duration                   int                         `json:"duration,omitempty"`
	Performer                  string                      `json:"performer,omitempty"`
	Title                      string                      `json:"title,omitempty"`
	Thumbnail                  any                         `json:"thumbnail,omitempty"`
	DisableNotification        bool                        `json:"disable_notification,omitempty"`
	ProtectContent             bool                        `json:"protect_content,omitempty"`
	AllowPaidBroadcast         bool                        `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID            string                      `json:"message_effect_id,omitempty"`
	SuggestedPostParameters    *SuggestedPostParameters    `json:"suggested_post_parameters,omitempty"`
	ReplyParameters            *ReplyParameters            `json:"reply_parameters,omitempty"`
	ReplyMarkup                *InlineKeyboardMarkup       `json:"reply_markup,omitempty"`
	MessageThreadID            int64                       `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID      int64                       `json:"direct_messages_topic_id,omitempty"`
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
}

// SendVideoOptions represents parameters for the sendVideo method.
type SendVideoOptions struct {
	BusinessConnectionID       string                      `json:"business_connection_id,omitempty"`
	ChatID                     any                         `json:"chat_id"`
	Video                      any                         `json:"video"`
	Duration                   int                         `json:"duration,omitempty"`
	Width                      int                         `json:"width,omitempty"`
	Height                     int                         `json:"height,omitempty"`
	Thumbnail                  any                         `json:"thumbnail,omitempty"`
	Caption                    string                      `json:"caption,omitempty"`
	ParseMode                  string                      `json:"parse_mode,omitempty"`
	CaptionEntities            []MessageEntity             `json:"caption_entities,omitempty"`
	ShowCaptionAboveMedia      bool                        `json:"show_caption_above_media,omitempty"`
	HasSpoiler                 bool                        `json:"has_spoiler,omitempty"`
	SupportsStreaming          bool                        `json:"supports_streaming,omitempty"`
	DisableNotification        bool                        `json:"disable_notification,omitempty"`
	ProtectContent             bool                        `json:"protect_content,omitempty"`
	AllowPaidBroadcast         bool                        `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID            string                      `json:"message_effect_id,omitempty"`
	SuggestedPostParameters    *SuggestedPostParameters    `json:"suggested_post_parameters,omitempty"`
	ReplyParameters            *ReplyParameters            `json:"reply_parameters,omitempty"`
	ReplyMarkup                *InlineKeyboardMarkup       `json:"reply_markup,omitempty"`
	MessageThreadID            int64                       `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID      int64                       `json:"direct_messages_topic_id,omitempty"`
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
}

// SendAnimationOptions represents parameters for the sendAnimation method.
type SendAnimationOptions struct {
	BusinessConnectionID       string                      `json:"business_connection_id,omitempty"`
	ChatID                     any                         `json:"chat_id"`
	Animation                  any                         `json:"animation"`
	Duration                   int                         `json:"duration,omitempty"`
	Width                      int                         `json:"width,omitempty"`
	Height                     int                         `json:"height,omitempty"`
	Thumbnail                  any                         `json:"thumbnail,omitempty"`
	Caption                    string                      `json:"caption,omitempty"`
	ParseMode                  string                      `json:"parse_mode,omitempty"`
	CaptionEntities            []MessageEntity             `json:"caption_entities,omitempty"`
	ShowCaptionAboveMedia      bool                        `json:"show_caption_above_media,omitempty"`
	HasSpoiler                 bool                        `json:"has_spoiler,omitempty"`
	DisableNotification        bool                        `json:"disable_notification,omitempty"`
	ProtectContent             bool                        `json:"protect_content,omitempty"`
	AllowPaidBroadcast         bool                        `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID            string                      `json:"message_effect_id,omitempty"`
	SuggestedPostParameters    *SuggestedPostParameters    `json:"suggested_post_parameters,omitempty"`
	ReplyParameters            *ReplyParameters            `json:"reply_parameters,omitempty"`
	ReplyMarkup                *InlineKeyboardMarkup       `json:"reply_markup,omitempty"`
	MessageThreadID            int64                       `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID      int64                       `json:"direct_messages_topic_id,omitempty"`
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
}

// SendVoiceOptions represents parameters for the sendVoice method.
type SendVoiceOptions struct {
	BusinessConnectionID       string                      `json:"business_connection_id,omitempty"`
	ChatID                     any                         `json:"chat_id"`
	Voice                      any                         `json:"voice"`
	Caption                    string                      `json:"caption,omitempty"`
	ParseMode                  string                      `json:"parse_mode,omitempty"`
	CaptionEntities            []MessageEntity             `json:"caption_entities,omitempty"`
	Duration                   int                         `json:"duration,omitempty"`
	DisableNotification        bool                        `json:"disable_notification,omitempty"`
	ProtectContent             bool                        `json:"protect_content,omitempty"`
	AllowPaidBroadcast         bool                        `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID            string                      `json:"message_effect_id,omitempty"`
	SuggestedPostParameters    *SuggestedPostParameters    `json:"suggested_post_parameters,omitempty"`
	ReplyParameters            *ReplyParameters            `json:"reply_parameters,omitempty"`
	ReplyMarkup                *InlineKeyboardMarkup       `json:"reply_markup,omitempty"`
	MessageThreadID            int64                       `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID      int64                       `json:"direct_messages_topic_id,omitempty"`
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
}

// SendVideoNoteOptions represents parameters for the sendVideoNote method.
type SendVideoNoteOptions struct {
	BusinessConnectionID       string                      `json:"business_connection_id,omitempty"`
	ChatID                     any                         `json:"chat_id"`
	VideoNote                  any                         `json:"video_note"`
	Duration                   int                         `json:"duration,omitempty"`
	Length                     int                         `json:"length,omitempty"`
	Thumbnail                  any                         `json:"thumbnail,omitempty"`
	DisableNotification        bool                        `json:"disable_notification,omitempty"`
	ProtectContent             bool                        `json:"protect_content,omitempty"`
	AllowPaidBroadcast         bool                        `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID            string                      `json:"message_effect_id,omitempty"`
	SuggestedPostParameters    *SuggestedPostParameters    `json:"suggested_post_parameters,omitempty"`
	ReplyParameters            *ReplyParameters            `json:"reply_parameters,omitempty"`
	ReplyMarkup                *InlineKeyboardMarkup       `json:"reply_markup,omitempty"`
	MessageThreadID            int64                       `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID      int64                       `json:"direct_messages_topic_id,omitempty"`
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
}

// SendLocationOptions represents parameters for the sendLocation method.
type SendLocationOptions struct {
	BusinessConnectionID       string                      `json:"business_connection_id,omitempty"`
	ChatID                     any                         `json:"chat_id"`
	Latitude                   float64                     `json:"latitude"`
	Longitude                  float64                     `json:"longitude"`
	HorizontalAccuracy         float64                     `json:"horizontal_accuracy,omitempty"`
	LivePeriod                 int                         `json:"live_period,omitempty"`
	Heading                    int                         `json:"heading,omitempty"`
	ProximityAlertRadius       int                         `json:"proximity_alert_radius,omitempty"`
	DisableNotification        bool                        `json:"disable_notification,omitempty"`
	ProtectContent             bool                        `json:"protect_content,omitempty"`
	AllowPaidBroadcast         bool                        `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID            string                      `json:"message_effect_id,omitempty"`
	SuggestedPostParameters    *SuggestedPostParameters    `json:"suggested_post_parameters,omitempty"`
	ReplyParameters            *ReplyParameters            `json:"reply_parameters,omitempty"`
	ReplyMarkup                *InlineKeyboardMarkup       `json:"reply_markup,omitempty"`
	MessageThreadID            int64                       `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID      int64                       `json:"direct_messages_topic_id,omitempty"`
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
}

// SendVenueOptions represents parameters for the sendVenue method.
type SendVenueOptions struct {
	BusinessConnectionID       string                      `json:"business_connection_id,omitempty"`
	ChatID                     any                         `json:"chat_id"`
	Latitude                   float64                     `json:"latitude"`
	Longitude                  float64                     `json:"longitude"`
	Title                      string                      `json:"title"`
	Address                    string                      `json:"address"`
	FoursquareID               string                      `json:"foursquare_id,omitempty"`
	FoursquareType             string                      `json:"foursquare_type,omitempty"`
	GooglePlaceID              string                      `json:"google_place_id,omitempty"`
	GooglePlaceType            string                      `json:"google_place_type,omitempty"`
	DisableNotification        bool                        `json:"disable_notification,omitempty"`
	ProtectContent             bool                        `json:"protect_content,omitempty"`
	AllowPaidBroadcast         bool                        `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID            string                      `json:"message_effect_id,omitempty"`
	SuggestedPostParameters    *SuggestedPostParameters    `json:"suggested_post_parameters,omitempty"`
	ReplyParameters            *ReplyParameters            `json:"reply_parameters,omitempty"`
	ReplyMarkup                *InlineKeyboardMarkup       `json:"reply_markup,omitempty"`
	MessageThreadID            int64                       `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID      int64                       `json:"direct_messages_topic_id,omitempty"`
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
}

// SendContactOptions represents parameters for the sendContact method.
type SendContactOptions struct {
	BusinessConnectionID       string                      `json:"business_connection_id,omitempty"`
	ChatID                     any                         `json:"chat_id"`
	PhoneNumber                string                      `json:"phone_number"`
	FirstName                  string                      `json:"first_name"`
	LastName                   string                      `json:"last_name,omitempty"`
	VCard                      string                      `json:"vcard,omitempty"`
	DisableNotification        bool                        `json:"disable_notification,omitempty"`
	ProtectContent             bool                        `json:"protect_content,omitempty"`
	AllowPaidBroadcast         bool                        `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID            string                      `json:"message_effect_id,omitempty"`
	SuggestedPostParameters    *SuggestedPostParameters    `json:"suggested_post_parameters,omitempty"`
	ReplyParameters            *ReplyParameters            `json:"reply_parameters,omitempty"`
	ReplyMarkup                *InlineKeyboardMarkup       `json:"reply_markup,omitempty"`
	MessageThreadID            int64                       `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID      int64                       `json:"direct_messages_topic_id,omitempty"`
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
}

// SendPhotoOptions represents parameters for the sendPhoto method.
type SendPhotoOptions struct {
	BusinessConnectionID       string                      `json:"business_connection_id,omitempty"`
	ChatID                     any                         `json:"chat_id"`
	MessageThreadID            int64                       `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID      int64                       `json:"direct_messages_topic_id,omitempty"`
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
	Photo                      any                         `json:"photo"`
	Caption                    string                      `json:"caption,omitempty"`
	ParseMode                  string                      `json:"parse_mode,omitempty"`
	CaptionEntities            []MessageEntity             `json:"caption_entities,omitempty"`
	ShowCaptionAboveMedia      bool                        `json:"show_caption_above_media,omitempty"`
	HasSpoiler                 bool                        `json:"has_spoiler,omitempty"`
	DisableNotification        bool                        `json:"disable_notification,omitempty"`
	ProtectContent             bool                        `json:"protect_content,omitempty"`
	AllowPaidBroadcast         bool                        `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID            string                      `json:"message_effect_id,omitempty"`
	SuggestedPostParameters    *SuggestedPostParameters    `json:"suggested_post_parameters,omitempty"`
	ReplyParameters            *ReplyParameters            `json:"reply_parameters,omitempty"`
	ReplyMarkup                *InlineKeyboardMarkup       `json:"reply_markup,omitempty"`
}

// SendDocumentOptions represents parameters for the sendDocument method.
type SendDocumentOptions struct {
	BusinessConnectionID        string                      `json:"business_connection_id,omitempty"`
	ChatID                      any                         `json:"chat_id"`
	MessageThreadID             int64                       `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID       int64                       `json:"direct_messages_topic_id,omitempty"`
	EphemeralMessageParameters  *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
	Document                    any                         `json:"document"`
	Thumbnail                   any                         `json:"thumbnail,omitempty"`
	Caption                     string                      `json:"caption,omitempty"`
	ParseMode                   string                      `json:"parse_mode,omitempty"`
	CaptionEntities             []MessageEntity             `json:"caption_entities,omitempty"`
	DisableContentTypeDetection bool                        `json:"disable_content_type_detection,omitempty"`
	DisableNotification         bool                        `json:"disable_notification,omitempty"`
	ProtectContent              bool                        `json:"protect_content,omitempty"`
	AllowPaidBroadcast          bool                        `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID             string                      `json:"message_effect_id,omitempty"`
	SuggestedPostParameters     *SuggestedPostParameters    `json:"suggested_post_parameters,omitempty"`
	ReplyParameters             *ReplyParameters            `json:"reply_parameters,omitempty"`
	ReplyMarkup                 *InlineKeyboardMarkup       `json:"reply_markup,omitempty"`
}

// SendPollOptions represents parameters for the sendPoll method.
type SendPollOptions struct {
	BusinessConnectionID   string            `json:"business_connection_id,omitempty"`
	ChatID                 any               `json:"chat_id"`
	MessageThreadID        int64             `json:"message_thread_id,omitempty"`
	Question               string            `json:"question"`
	QuestionParseMode      string            `json:"question_parse_mode,omitempty"`
	QuestionEntities       []MessageEntity   `json:"question_entities,omitempty"`
	Options                []InputPollOption `json:"options"`
	IsAnonymous            bool              `json:"is_anonymous,omitempty"`
	Type                   string            `json:"type,omitempty"`
	AllowsMultipleAnswers  bool              `json:"allows_multiple_answers,omitempty"`
	AllowsRevoting         bool              `json:"allows_revoting,omitempty"`
	ShuffleOptions         bool              `json:"shuffle_options,omitempty"`
	AllowAddingOptions     bool              `json:"allow_adding_options,omitempty"`
	HideResultsUntilCloses bool              `json:"hide_results_until_closes,omitempty"`
	MembersOnly            bool              `json:"members_only,omitempty"`
	CountryCodes           []string          `json:"country_codes,omitempty"`
	CorrectOptionIDs       []int             `json:"correct_option_ids,omitempty"`
	Explanation            string            `json:"explanation,omitempty"`
	ExplanationParseMode   string            `json:"explanation_parse_mode,omitempty"`
	ExplanationEntities    []MessageEntity   `json:"explanation_entities,omitempty"`
	// ExplanationMedia is typed InputPollMedia in the docs, an abstract union
	// of the InputMedia* classes. This package models that union through the
	// InputMedia interface, so any InputMedia* value satisfies it.
	ExplanationMedia     InputMedia      `json:"explanation_media,omitempty"`
	OpenPeriod           int             `json:"open_period,omitempty"`
	CloseDate            int64           `json:"close_date,omitempty"`
	IsClosed             bool            `json:"is_closed,omitempty"`
	Description          string          `json:"description,omitempty"`
	DescriptionParseMode string          `json:"description_parse_mode,omitempty"`
	DescriptionEntities  []MessageEntity `json:"description_entities,omitempty"`
	// Media is typed InputPollMedia in the docs, an abstract union of the
	// InputMedia* classes. This package models that union through the
	// InputMedia interface, so any InputMedia* value satisfies it.
	Media               InputMedia            `json:"media,omitempty"`
	DisableNotification bool                  `json:"disable_notification,omitempty"`
	ProtectContent      bool                  `json:"protect_content,omitempty"`
	AllowPaidBroadcast  bool                  `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID     string                `json:"message_effect_id,omitempty"`
	ReplyParameters     *ReplyParameters      `json:"reply_parameters,omitempty"`
	ReplyMarkup         *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// SendDiceOptions represents parameters for the sendDice method.
type SendDiceOptions struct {
	BusinessConnectionID    string                   `json:"business_connection_id,omitempty"`
	ChatID                  any                      `json:"chat_id"`
	Emoji                   string                   `json:"emoji,omitempty"`
	DisableNotification     bool                     `json:"disable_notification,omitempty"`
	ProtectContent          bool                     `json:"protect_content,omitempty"`
	AllowPaidBroadcast      bool                     `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID         string                   `json:"message_effect_id,omitempty"`
	SuggestedPostParameters *SuggestedPostParameters `json:"suggested_post_parameters,omitempty"`
	ReplyParameters         *ReplyParameters         `json:"reply_parameters,omitempty"`
	ReplyMarkup             *InlineKeyboardMarkup    `json:"reply_markup,omitempty"`
	MessageThreadID         int64                    `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID   int64                    `json:"direct_messages_topic_id,omitempty"`
}

// SendMediaGroupOptions represents parameters for the sendMediaGroup method.
type SendMediaGroupOptions struct {
	BusinessConnectionID  string           `json:"business_connection_id,omitempty"`
	ChatID                any              `json:"chat_id"`
	Media                 []InputMedia     `json:"media"`
	DisableNotification   bool             `json:"disable_notification,omitempty"`
	ProtectContent        bool             `json:"protect_content,omitempty"`
	AllowPaidBroadcast    bool             `json:"allow_paid_broadcast,omitempty"`
	MessageEffectID       string           `json:"message_effect_id,omitempty"`
	ReplyParameters       *ReplyParameters `json:"reply_parameters,omitempty"`
	MessageThreadID       int64            `json:"message_thread_id,omitempty"`
	DirectMessagesTopicID int64            `json:"direct_messages_topic_id,omitempty"`
}

// SendLivePhotoOptions represents parameters for the sendLivePhoto method
// (Bot API 10.3+).
//
// Port of SendLivePhotoOptions in
// packages/node/src/client/types/messages/send-options.ts.
//
// See https://core.telegram.org/bots/api#sendlivephoto
type SendLivePhotoOptions struct {
	BusinessConnectionID string `json:"business_connection_id,omitempty"`
	// Unique identifier for the target chat or username of the target channel.
	ChatID any `json:"chat_id"`
	// Photo to send: a file_id, an HTTP URL, or an InputFile for an upload.
	Photo any `json:"photo"`
	// Live photo video to send: a file_id, an HTTP URL, or an InputFile for
	// an upload.
	LivePhoto any `json:"live_photo"`
	// Live photo caption, 0-1024 characters after entities parsing.
	Caption string `json:"caption,omitempty"`
	// Mode for parsing entities in the photo caption.
	ParseMode string `json:"parse_mode,omitempty"`
	// A list of special entities that appear in the caption.
	CaptionEntities []MessageEntity `json:"caption_entities,omitempty"`
	// True, if the caption must be shown above the message media.
	ShowCaptionAboveMedia bool `json:"show_caption_above_media,omitempty"`
	// True, if the photo needs to be covered with a spoiler animation.
	HasSpoiler bool `json:"has_spoiler,omitempty"`
	// Sends the message silently.
	DisableNotification bool `json:"disable_notification,omitempty"`
	// Protects the contents of the sent message from forwarding and saving.
	ProtectContent bool `json:"protect_content,omitempty"`
	// Pass True to allow paid broadcast of the message.
	AllowPaidBroadcast bool `json:"allow_paid_broadcast,omitempty"`
	// Unique identifier of the message effect to be added to the message.
	MessageEffectID string `json:"message_effect_id,omitempty"`
	// Object describing the suggested post parameters; only for business bots.
	SuggestedPostParameters *SuggestedPostParameters `json:"suggested_post_parameters,omitempty"`
	// Description of the message to reply to.
	ReplyParameters *ReplyParameters `json:"reply_parameters,omitempty"`
	// ReplyMarkup accepts *InlineKeyboardMarkup, *keyboard.ReplyKeyboardMarkup,
	// or any other Telegram reply_markup value.
	ReplyMarkup any `json:"reply_markup,omitempty"`
	// Unique identifier for the target message thread (topic) of the forum.
	MessageThreadID int64 `json:"message_thread_id,omitempty"`
	// Identifier of the topic the message will be sent to in a direct messages
	// chat.
	DirectMessagesTopicID int64 `json:"direct_messages_topic_id,omitempty"`
	// Ephemeral message parameters (Bot API 10.3+).
	EphemeralMessageParameters *EphemeralMessageParameters `json:"ephemeral_message_parameters,omitempty"`
}

// SendPaidMediaOptions represents parameters for the sendPaidMedia method.
//
// Telegram API: https://core.telegram.org/bots/api#sendpaidmedia
type SendPaidMediaOptions struct {
	// Unique identifier of the business connection on behalf of which the
	// message will be sent.
	BusinessConnectionID string `json:"business_connection_id,omitempty"`
	// Unique identifier for the target chat or username of the target channel.
	ChatID any `json:"chat_id"`
	// Unique identifier for the target message thread (topic) of the forum.
	MessageThreadID int64 `json:"message_thread_id,omitempty"`
	// Identifier of the topic the message will be sent to in a direct messages
	// chat.
	DirectMessagesTopicID int64 `json:"direct_messages_topic_id,omitempty"`
	// The number of Telegram Stars to be charged for the media.
	StarCount int `json:"star_count"`
	// The array of objects to be sent; each an InputPaidMedia object.
	Media []any `json:"media"`
	// Object passed to the bot after a successful purchase.
	Payload string `json:"payload,omitempty"`
	// Media caption, 0-1024 characters after entities parsing.
	Caption string `json:"caption,omitempty"`
	// Mode for parsing entities in the media caption.
	ParseMode string `json:"parse_mode,omitempty"`
	// A JSON-serialized list of special entities that appear in the caption.
	CaptionEntities []MessageEntity `json:"caption_entities,omitempty"`
	// True, if the caption must be shown above the message media.
	ShowCaptionAboveMedia bool `json:"show_caption_above_media,omitempty"`
	// Sends the message silently.
	DisableNotification bool `json:"disable_notification,omitempty"`
	// Protects the contents of the sent message from forwarding and saving.
	ProtectContent bool `json:"protect_content,omitempty"`
	// Pass True to allow the message to ignore the channel-wide limit of
	// simultaneously sent messages.
	AllowPaidBroadcast bool `json:"allow_paid_broadcast,omitempty"`
	// Object describing the suggested post parameters; only for business bots.
	SuggestedPostParameters *SuggestedPostParameters `json:"suggested_post_parameters,omitempty"`
	// Description of the message to reply to.
	ReplyParameters *ReplyParameters `json:"reply_parameters,omitempty"`
	// Additional interface options for a keyboard.
	ReplyMarkup any `json:"reply_markup,omitempty"`
}
