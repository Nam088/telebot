// Package inlinequery provides fluent builders for constructing Telegram
// InlineQueryResult objects used to answer inline queries.
//
// The builders produce values of types.InlineQueryResult, which can be passed
// directly to Bot.AnswerInlineQuery via AnswerInlineQueryOptions.Results.
package inlinequery

import (
	"encoding/json"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// InputTextMessageContent represents the text content of a message to be sent
// when an inline query result is chosen.
type InputTextMessageContent struct {
	// MessageText is the text of the message to be sent, 1-4096 characters.
	MessageText string `json:"message_text"`
	// ParseMode is the mode used to parse entities in the message text.
	ParseMode string `json:"parse_mode,omitempty"`
	// DisableWebPagePreview disables link previews for links in the message.
	DisableWebPagePreview bool `json:"disable_web_page_preview,omitempty"`
}

// toResult converts a typed inline result struct into the generic
// types.InlineQueryResult map by round-tripping through JSON so that the
// snake_case tags and omitempty directives are honored exactly. It returns nil
// if marshaling fails, which cannot happen for the plain-data structs used here.
func toResult(v any) types.InlineQueryResult {
	data, err := json.Marshal(v)
	if err != nil {
		return nil
	}
	var result types.InlineQueryResult
	if err := json.Unmarshal(data, &result); err != nil {
		return nil
	}
	return result
}
