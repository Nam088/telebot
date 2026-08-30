package types

// UserProfilePhotos contains a user's profile pictures.
//
// Telegram API: https://core.telegram.org/bots/api#userprofilephotos
type UserProfilePhotos struct {
	TotalCount int           `json:"total_count"`
	Photos     [][]PhotoSize `json:"photos"`
}

// GetFileOptions represents parameters for the getFile method.
type GetFileOptions struct {
	FileID string `json:"file_id"`
}

// GetUserProfilePhotosOptions represents parameters for the getUserProfilePhotos method.
type GetUserProfilePhotosOptions struct {
	UserID int64 `json:"user_id"`
	Offset int   `json:"offset,omitempty"`
	Limit  int   `json:"limit,omitempty"`
}
