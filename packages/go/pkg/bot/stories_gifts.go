package bot

import (
	"context"

	"github.com/Nam088/telebot-go/pkg/types"
)

// PostStory posts a story on behalf of a connected business account.
//
// This is a minimal parity implementation. Advanced business-account story
// features (areas, privacy details, expiration, etc.) are not yet supported
// because the required model types are not available.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - content: Story content (e.g. a photo or video InputStoryContent placeholder).
//   - activePeriod: Number of seconds the story will be active.
//   - caption: Optional story caption.
//   - privacy: Privacy setting, e.g. "everybody", "contacts" or "close_friends".
//
// Returns:
//   - *types.Story: The posted Story object on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) PostStory(ctx context.Context, businessConnectionID string, content any, activePeriod int, caption string, privacy string) (*types.Story, error) {
	payload := map[string]any{
		"business_connection_id": businessConnectionID,
		"content":                content,
		"active_period":          activePeriod,
	}
	if caption != "" {
		payload["caption"] = caption
	}
	if privacy != "" {
		payload["privacy"] = privacy
	}

	var story types.Story
	if err := b.Request(ctx, "postStory", payload, &story); err != nil {
		return nil, err
	}
	return &story, nil
}
