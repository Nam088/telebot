package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// EditStory edits a story previously posted by the bot on behalf of a
// connected business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - storyID: Unique identifier of the story to edit.
//   - content: New content for the story; pass a *types.InputStoryContentPhoto
//     or *types.InputStoryContentVideo.
//   - options: Additional edit parameters serialized as-is, mirroring node's
//     Record<string, unknown> argument (e.g. "caption", "parse_mode",
//     "caption_entities", "areas").
//
// Returns:
//   - *types.Story: The edited Story object on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	story, err := b.EditStory(ctx, "bc1", 42, &types.InputStoryContentPhoto{
//		Type:  "photo",
//		Photo: "AGACQADTAAQCAAFYAQACAgADAgAC8gU0AAu2Y70VbmF0dWxlLmpwZwQ",
//	}, map[string]any{"caption": "Updated", "parse_mode": "HTML"})
func (b *Bot) EditStory(ctx context.Context, businessConnectionID string, storyID int64, content any, options map[string]any) (*types.Story, error) {
	payload := mergePayload(map[string]any{
		"business_connection_id": businessConnectionID,
		"story_id":               storyID,
		"content":                content,
	}, options)

	var story types.Story
	if err := b.Request(ctx, "editStory", payload, &story); err != nil {
		return nil, err
	}
	return &story, nil
}

// DeleteStory deletes a story previously posted on behalf of a connected
// business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - storyID: Identifier of the story to delete.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.DeleteStory(ctx, "bc1", 42)
func (b *Bot) DeleteStory(ctx context.Context, businessConnectionID string, storyID int64) (bool, error) {
	payload := map[string]any{
		"business_connection_id": businessConnectionID,
		"story_id":               storyID,
	}
	var ok bool
	if err := b.Request(ctx, "deleteStory", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// RepostStory reposts a story to a channel or story feed.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - options: Repost parameters serialized as-is, mirroring node's
//     Record<string, unknown> argument (e.g. "chat_id", "story_id",
//     "business_connection_id"). Pass nil for an empty object payload.
//
// Returns:
//   - any: The raw result returned by Telegram — node types it as unknown, so
//     both a bare bool and an object decode.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	result, err := b.RepostStory(ctx, map[string]any{
//		"chat_id":  int64(-1001234567890),
//		"story_id": int64(42),
//		"privacy":  "everybody",
//	})
func (b *Bot) RepostStory(ctx context.Context, options map[string]any) (any, error) {
	return b.requestUnknown(ctx, "repostStory", payloadOrEmpty(options))
}
