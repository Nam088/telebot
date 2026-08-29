package inlinequery

import "github.com/Nam088/telebot/packages/go/pkg/types"

// InlineQueryResultPhoto represents a link to a photo
// (Telegram's InlineQueryResultPhoto object).
type InlineQueryResultPhoto struct {
	// Type of the result, always "photo".
	Type string `json:"type"`
	// ID is the unique identifier of this result, 1-64 bytes.
	ID string `json:"id"`
	// PhotoURL is a valid URL of the photo. The photo must be in JPEG format
	// and must not exceed 5 MB.
	PhotoURL string `json:"photo_url"`
	// ThumbnailURL is the URL of the thumbnail for the photo.
	ThumbnailURL string `json:"thumbnail_url"`
	// PhotoWidth is the width of the photo.
	PhotoWidth int `json:"photo_width,omitempty"`
	// PhotoHeight is the height of the photo.
	PhotoHeight int `json:"photo_height,omitempty"`
	// Title of the result.
	Title string `json:"title,omitempty"`
	// Description is a short description of the result.
	Description string `json:"description,omitempty"`
	// Caption of the photo to be sent, 0-1024 characters.
	Caption string `json:"caption,omitempty"`
	// ParseMode is the mode used to parse entities in the photo caption.
	ParseMode string `json:"parse_mode,omitempty"`
	// ShowCaptionAboveMedia, when true, shows the caption above the photo.
	ShowCaptionAboveMedia bool `json:"show_caption_above_media,omitempty"`
	// ReplyMarkup is the inline keyboard attached to the message.
	ReplyMarkup *types.InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// PhotoBuilder is a fluent builder for photo inline query results.
type PhotoBuilder struct {
	photo InlineQueryResultPhoto
}

// NewPhoto starts building a photo inline query result. The thumbnail URL
// defaults to the photo URL, as Telegram requires a thumbnail for photo
// results.
//
// Parameters:
//   - id: Unique identifier of this result, 1-64 bytes.
//   - photoURL: A valid URL of a JPEG photo not exceeding 5 MB.
//
// Example:
//
//	result := inlinequery.NewPhoto("2", "https://example.com/image.jpg").
//	    Title("Nature Wallpaper").
//	    Caption("Beautiful sunset view").
//	    Build()
func NewPhoto(id, photoURL string) *PhotoBuilder {
	return &PhotoBuilder{
		photo: InlineQueryResultPhoto{
			Type:         "photo",
			ID:           id,
			PhotoURL:     photoURL,
			ThumbnailURL: photoURL,
		},
	}
}

// Title sets the title of the result.
func (b *PhotoBuilder) Title(title string) *PhotoBuilder {
	b.photo.Title = title
	return b
}

// Description sets a short description shown alongside the result title.
func (b *PhotoBuilder) Description(description string) *PhotoBuilder {
	b.photo.Description = description
	return b
}

// Caption sets the caption of the photo to be sent, 0-1024 characters.
func (b *PhotoBuilder) Caption(caption string) *PhotoBuilder {
	b.photo.Caption = caption
	return b
}

// ParseMode sets the mode used to parse entities in the photo caption
// ("", "HTML" or "MarkdownV2").
func (b *PhotoBuilder) ParseMode(parseMode string) *PhotoBuilder {
	b.photo.ParseMode = parseMode
	return b
}

// ShowCaptionAboveMedia controls whether the caption is shown above the photo.
func (b *PhotoBuilder) ShowCaptionAboveMedia(show bool) *PhotoBuilder {
	b.photo.ShowCaptionAboveMedia = show
	return b
}

// Thumbnail overrides the thumbnail URL, which defaults to the photo URL.
func (b *PhotoBuilder) Thumbnail(url string) *PhotoBuilder {
	b.photo.ThumbnailURL = url
	return b
}

// Size sets the declared width and height of the photo. Pass zero to omit.
func (b *PhotoBuilder) Size(width, height int) *PhotoBuilder {
	b.photo.PhotoWidth = width
	b.photo.PhotoHeight = height
	return b
}

// ReplyMarkup attaches an inline keyboard to the message sent when the result
// is selected.
func (b *PhotoBuilder) ReplyMarkup(markup *types.InlineKeyboardMarkup) *PhotoBuilder {
	b.photo.ReplyMarkup = markup
	return b
}

// Build compiles the builder state into a types.InlineQueryResult suitable for
// AnswerInlineQueryOptions.Results. Fields that were never set are omitted.
func (b *PhotoBuilder) Build() types.InlineQueryResult {
	return toResult(b.photo)
}
