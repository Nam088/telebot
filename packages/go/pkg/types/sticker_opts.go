package types

// InputSticker represents a sticker to be added to a set.
//
// Telegram API: https://core.telegram.org/bots/api#inputsticker
type InputSticker struct {
	Sticker      any           `json:"sticker"`
	Format       string        `json:"format"`
	EmojiList    []string      `json:"emoji_list"`
	MaskPosition *MaskPosition `json:"mask_position,omitempty"`
	Keywords     []string      `json:"keywords,omitempty"`
}

// SendStickerOptions represents parameters for the sendSticker method.
type SendStickerOptions struct {
	BusinessConnectionID string                `json:"business_connection_id,omitempty"`
	ChatID               any                   `json:"chat_id"`
	Sticker              any                   `json:"sticker"`
	MessageThreadID      int64                 `json:"message_thread_id,omitempty"`
	Emoji                string                `json:"emoji,omitempty"`
	DisableNotification  bool                  `json:"disable_notification,omitempty"`
	ProtectContent       bool                  `json:"protect_content,omitempty"`
	MessageEffectID      string                `json:"message_effect_id,omitempty"`
	ReplyParameters      *ReplyParameters      `json:"reply_parameters,omitempty"`
	ReplyMarkup          *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// GetStickerSetOptions represents parameters for the getStickerSet method.
type GetStickerSetOptions struct {
	Name string `json:"name"`
}

// UploadStickerFileOptions represents parameters for the uploadStickerFile method.
type UploadStickerFileOptions struct {
	UserID        int64  `json:"user_id"`
	Sticker       any    `json:"sticker"`
	StickerFormat string `json:"sticker_format"`
}

// CreateNewStickerSetOptions represents parameters for the createNewStickerSet method.
type CreateNewStickerSetOptions struct {
	UserID          int64          `json:"user_id"`
	Name            string         `json:"name"`
	Title           string         `json:"title"`
	Stickers        []InputSticker `json:"stickers"`
	StickerType     string         `json:"sticker_type,omitempty"`
	NeedsRepainting bool           `json:"needs_repainting,omitempty"`
}

// AddStickerToSetOptions represents parameters for the addStickerToSet method.
type AddStickerToSetOptions struct {
	UserID  int64        `json:"user_id"`
	Name    string       `json:"name"`
	Sticker InputSticker `json:"sticker"`
}

// ReplaceStickerInSetOptions represents parameters for the replaceStickerInSet method.
type ReplaceStickerInSetOptions struct {
	UserID     int64        `json:"user_id"`
	Name       string       `json:"name"`
	OldSticker string       `json:"old_sticker"`
	Sticker    InputSticker `json:"sticker"`
}

// SetStickerPositionInSetOptions represents parameters for the setStickerPositionInSet method.
type SetStickerPositionInSetOptions struct {
	Sticker  string `json:"sticker"`
	Position int    `json:"position"`
}

// DeleteStickerFromSetOptions represents parameters for the deleteStickerFromSet method.
type DeleteStickerFromSetOptions struct {
	Sticker string `json:"sticker"`
}

// SetStickerEmojiListOptions represents parameters for the setStickerEmojiList method.
type SetStickerEmojiListOptions struct {
	Sticker   string   `json:"sticker"`
	EmojiList []string `json:"emoji_list"`
}

// SetStickerKeywordsOptions represents parameters for the setStickerKeywords method.
type SetStickerKeywordsOptions struct {
	Sticker  string   `json:"sticker"`
	Keywords []string `json:"keywords,omitempty"`
}

// SetStickerMaskPositionOptions represents parameters for the setStickerMaskPosition method.
type SetStickerMaskPositionOptions struct {
	Sticker      string        `json:"sticker"`
	MaskPosition *MaskPosition `json:"mask_position,omitempty"`
}

// DeleteStickerSetOptions represents parameters for the deleteStickerSet method.
type DeleteStickerSetOptions struct {
	Name string `json:"name"`
}

// SetStickerSetThumbnailOptions represents parameters for the setStickerSetThumbnail method.
type SetStickerSetThumbnailOptions struct {
	Name      string `json:"name"`
	UserID    int64  `json:"user_id"`
	Format    string `json:"format"`
	Thumbnail any    `json:"thumbnail,omitempty"`
}

// SetStickerSetTitleOptions represents parameters for the setStickerSetTitle method.
type SetStickerSetTitleOptions struct {
	Name  string `json:"name"`
	Title string `json:"title"`
}
