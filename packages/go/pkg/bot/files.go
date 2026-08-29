package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// GetFile gets basic information about a file and prepares it for downloading.
//
// Returns a File object on success, or an error if the API call fails.
func (b *Bot) GetFile(ctx context.Context, opts *types.GetFileOptions) (*types.File, error) {
	var file types.File
	if err := b.Request(ctx, "getFile", opts, &file); err != nil {
		return nil, err
	}
	return &file, nil
}

// GetUserProfilePhotos gets a list of profile pictures for a user.
//
// Returns a UserProfilePhotos object on success, or an error if the API call fails.
func (b *Bot) GetUserProfilePhotos(ctx context.Context, opts *types.GetUserProfilePhotosOptions) (*types.UserProfilePhotos, error) {
	var photos types.UserProfilePhotos
	if err := b.Request(ctx, "getUserProfilePhotos", opts, &photos); err != nil {
		return nil, err
	}
	return &photos, nil
}
