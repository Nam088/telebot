package inlinequery

import "github.com/Nam088/telebot/packages/go/pkg/types"

// InlineQueryResultArticle represents a link to an article or web page
// (Telegram's InlineQueryResultArticle object).
type InlineQueryResultArticle struct {
	// Type of the result, always "article".
	Type string `json:"type"`
	// ID is the unique identifier of this result, 1-64 bytes.
	ID string `json:"id"`
	// Title of the result.
	Title string `json:"title"`
	// InputMessageContent is the content of the message to be sent.
	InputMessageContent *InputTextMessageContent `json:"input_message_content,omitempty"`
	// URL of the result.
	URL string `json:"url,omitempty"`
	// HideURL, when true, prevents the URL from being shown in the message.
	HideURL bool `json:"hide_url,omitempty"`
	// Description is a short description of the result.
	Description string `json:"description,omitempty"`
	// ThumbnailURL is the URL of the thumbnail for the result.
	ThumbnailURL string `json:"thumbnail_url,omitempty"`
	// ThumbnailWidth is the thumbnail width.
	ThumbnailWidth int `json:"thumbnail_width,omitempty"`
	// ThumbnailHeight is the thumbnail height.
	ThumbnailHeight int `json:"thumbnail_height,omitempty"`
	// ReplyMarkup is the inline keyboard attached to the message.
	ReplyMarkup *types.InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// ArticleBuilder is a fluent builder for article inline query results.
type ArticleBuilder struct {
	article InlineQueryResultArticle
}

// NewArticle starts building an article inline query result.
//
// Parameters:
//   - id: Unique identifier of this result, 1-64 bytes.
//   - title: Title of the result.
//
// Example:
//
//	result := inlinequery.NewArticle("1", "Telegram Docs").
//	    Description("Official documentation").
//	    Text("https://core.telegram.org").
//	    Build()
func NewArticle(id, title string) *ArticleBuilder {
	return &ArticleBuilder{
		article: InlineQueryResultArticle{
			Type:  "article",
			ID:    id,
			Title: title,
		},
	}
}

// Description sets a short description shown alongside the result title.
func (b *ArticleBuilder) Description(description string) *ArticleBuilder {
	b.article.Description = description
	return b
}

// URL sets the URL of the result.
func (b *ArticleBuilder) URL(url string) *ArticleBuilder {
	b.article.URL = url
	return b
}

// HideURL controls whether the result URL is shown in the message.
func (b *ArticleBuilder) HideURL(hide bool) *ArticleBuilder {
	b.article.HideURL = hide
	return b
}

// Thumbnail sets the thumbnail URL and, optionally, its dimensions.
// Pass zero for width or height to omit the corresponding field.
func (b *ArticleBuilder) Thumbnail(url string, width, height int) *ArticleBuilder {
	b.article.ThumbnailURL = url
	b.article.ThumbnailWidth = width
	b.article.ThumbnailHeight = height
	return b
}

// ReplyMarkup attaches an inline keyboard to the message sent when the result
// is selected.
func (b *ArticleBuilder) ReplyMarkup(markup *types.InlineKeyboardMarkup) *ArticleBuilder {
	b.article.ReplyMarkup = markup
	return b
}

// Text sets the text message content sent when the user selects this result.
// An article result must have message content before Build is called.
//
// Parameters:
//   - messageText: Text of the message to be sent, 1-4096 characters.
//   - parseMode: Optional parse mode applied to the message text ("", "HTML"
//     or "MarkdownV2").
//   - disableWebPagePreview: When true, disables link previews in the message.
func (b *ArticleBuilder) Text(messageText, parseMode string, disableWebPagePreview bool) *ArticleBuilder {
	b.article.InputMessageContent = &InputTextMessageContent{
		MessageText:           messageText,
		ParseMode:             parseMode,
		DisableWebPagePreview: disableWebPagePreview,
	}
	return b
}

// Build compiles the builder state into a types.InlineQueryResult suitable for
// AnswerInlineQueryOptions.Results. Fields that were never set are omitted.
func (b *ArticleBuilder) Build() types.InlineQueryResult {
	return toResult(b.article)
}
