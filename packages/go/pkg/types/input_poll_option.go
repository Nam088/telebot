package types

// InputPollOption contains information about one answer option in a poll to be
// sent.
//
// Telegram API: https://core.telegram.org/bots/api#inputpolloption
type InputPollOption struct {
	// Option text, 1-100 characters.
	Text string `json:"text"`
	// Mode for parsing entities in the text. Currently, only custom emoji entities
	// are allowed.
	TextParseMode string `json:"text_parse_mode,omitempty"`
	// A JSON-serialized list of special entities that appear in the poll option
	// text. It can be specified instead of text_parse_mode.
	TextEntities []MessageEntity `json:"text_entities,omitempty"`
	// Media added to the poll option. Telegram types this field as
	// InputPollOptionMedia, a union of the InputMedia* classes. This package
	// models that union through the InputMedia interface, so InputMediaAnimation,
	// InputMediaPhoto and InputMediaVideo satisfy it today.
	Media InputMedia `json:"media,omitempty"`
}
