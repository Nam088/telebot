package bot

import (
	"context"

	"github.com/Nam088/telebot-go/pkg/types"
)

// SendSticker sends a sticker to a chat.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Send sticker options including chat_id and sticker identifier.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) SendSticker(ctx context.Context, opts *types.SendStickerOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendSticker", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// GetStickerSet returns information about a sticker set.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options containing the sticker set name.
//
// Returns:
//   - *types.StickerSet: The sticker set on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) GetStickerSet(ctx context.Context, opts *types.GetStickerSetOptions) (*types.StickerSet, error) {
	var set types.StickerSet
	if err := b.Request(ctx, "getStickerSet", opts, &set); err != nil {
		return nil, err
	}
	return &set, nil
}

// GetCustomEmojiStickers returns information about custom emoji stickers.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - customEmojiIDs: List of custom emoji identifiers.
//
// Returns:
//   - []types.Sticker: A list of sticker objects on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) GetCustomEmojiStickers(ctx context.Context, customEmojiIDs []string) ([]types.Sticker, error) {
	payload := map[string]any{
		"custom_emoji_ids": customEmojiIDs,
	}
	var stickers []types.Sticker
	if err := b.Request(ctx, "getCustomEmojiStickers", payload, &stickers); err != nil {
		return nil, err
	}
	return stickers, nil
}

// UploadStickerFile uploads a sticker file.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Upload options including user_id, sticker file and format.
//
// Returns:
//   - *types.File: The uploaded File object on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) UploadStickerFile(ctx context.Context, opts *types.UploadStickerFileOptions) (*types.File, error) {
	var file types.File
	if err := b.Request(ctx, "uploadStickerFile", opts, &file); err != nil {
		return nil, err
	}
	return &file, nil
}

// CreateNewStickerSet creates a new sticker set.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Creation options including user_id, name, title and stickers.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) CreateNewStickerSet(ctx context.Context, opts *types.CreateNewStickerSetOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "createNewStickerSet", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// AddStickerToSet adds a sticker to an existing set.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options containing user_id, set name and the new sticker.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) AddStickerToSet(ctx context.Context, opts *types.AddStickerToSetOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "addStickerToSet", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetStickerPositionInSet moves a sticker to a new position.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options containing sticker file_id and target position.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) SetStickerPositionInSet(ctx context.Context, opts *types.SetStickerPositionInSetOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setStickerPositionInSet", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeleteStickerFromSet removes a sticker from the set it belongs to.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options containing the sticker file_id.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) DeleteStickerFromSet(ctx context.Context, opts *types.DeleteStickerFromSetOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "deleteStickerFromSet", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// ReplaceStickerInSet replaces an existing sticker in a set with a new one.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options containing user_id, set name, old sticker and new sticker.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) ReplaceStickerInSet(ctx context.Context, opts *types.ReplaceStickerInSetOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "replaceStickerInSet", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetStickerEmojiList changes the list of emojis associated with a sticker.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options containing sticker file_id and emoji list.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) SetStickerEmojiList(ctx context.Context, opts *types.SetStickerEmojiListOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setStickerEmojiList", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetStickerKeywords changes search keywords for a sticker.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options containing sticker file_id and optional keywords.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) SetStickerKeywords(ctx context.Context, opts *types.SetStickerKeywordsOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setStickerKeywords", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetStickerMaskPosition changes the mask position of a mask sticker.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options containing sticker file_id and mask position.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) SetStickerMaskPosition(ctx context.Context, opts *types.SetStickerMaskPositionOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setStickerMaskPosition", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeleteStickerSet deletes a sticker set.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options containing the sticker set name.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) DeleteStickerSet(ctx context.Context, opts *types.DeleteStickerSetOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "deleteStickerSet", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetCustomEmojiStickerSetThumbnail sets the thumbnail of a custom emoji sticker set.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - name: Sticker set name.
//   - customEmojiID: Custom emoji identifier; pass an empty string to remove the thumbnail.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) SetCustomEmojiStickerSetThumbnail(ctx context.Context, name string, customEmojiID string) (bool, error) {
	payload := map[string]any{
		"name": name,
	}
	if customEmojiID != "" {
		payload["custom_emoji_id"] = customEmojiID
	}
	var ok bool
	if err := b.Request(ctx, "setCustomEmojiStickerSetThumbnail", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetStickerSetThumbnail sets the thumbnail of a sticker set.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options containing set name, user_id, format and thumbnail.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) SetStickerSetThumbnail(ctx context.Context, opts *types.SetStickerSetThumbnailOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setStickerSetThumbnail", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetStickerSetTitle changes the title of a sticker set.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options containing set name and new title.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) SetStickerSetTitle(ctx context.Context, opts *types.SetStickerSetTitleOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "setStickerSetTitle", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetForumTopicIconStickers returns the list of stickers that can be used as forum topic icons.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//
// Returns:
//   - []types.Sticker: A list of sticker objects on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) GetForumTopicIconStickers(ctx context.Context) ([]types.Sticker, error) {
	var stickers []types.Sticker
	if err := b.Request(ctx, "getForumTopicIconStickers", nil, &stickers); err != nil {
		return nil, err
	}
	return stickers, nil
}
