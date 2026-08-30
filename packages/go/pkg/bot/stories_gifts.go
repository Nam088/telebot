package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// PostStory posts a story on behalf of a connected business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Story options carrying business_connection_id, content and
//     active_period plus the optional caption, parse_mode, caption_entities,
//     areas, post_to_chat_page and protect_content fields.
//
// Returns:
//   - *types.Story: The posted Story object on success.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#poststory
func (b *Bot) PostStory(ctx context.Context, opts *types.PostStoryOptions) (*types.Story, error) {
	var story types.Story
	if err := b.Request(ctx, "postStory", opts, &story); err != nil {
		return nil, err
	}
	return &story, nil
}

// SetUserEmojiStatus changes the emoji status for a given user that previously
// allowed the bot to manage their emoji status via the Mini App method
// requestEmojiStatusAccess.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the target user.
//   - emojiStatusCustomEmojiID: Custom emoji identifier of the emoji status to
//     set. The docs' "pass an empty string to remove the status" form maps to
//     an empty argument here, which omits the key from the payload entirely.
//   - emojiStatusExpirationDate: Point in time (Unix timestamp) when the emoji
//     status will expire and be cleared automatically. Pass 0 to omit the
//     expiration date.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SetUserEmojiStatus(ctx, 123456, "5368323575420792074", 0)
//
// Telegram API: https://core.telegram.org/bots/api#setuseremojistatus
func (b *Bot) SetUserEmojiStatus(ctx context.Context, userID int64, emojiStatusCustomEmojiID string, emojiStatusExpirationDate int64) (bool, error) {
	payload := map[string]any{"user_id": userID}
	if emojiStatusCustomEmojiID != "" {
		payload["emoji_status_custom_emoji_id"] = emojiStatusCustomEmojiID
	}
	if emojiStatusExpirationDate > 0 {
		payload["emoji_status_expiration_date"] = emojiStatusExpirationDate
	}
	var ok bool
	if err := b.Request(ctx, "setUserEmojiStatus", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
