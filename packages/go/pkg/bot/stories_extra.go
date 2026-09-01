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
//
// Telegram API: https://core.telegram.org/bots/api#editstory
func (b *Bot) EditStory(ctx context.Context, businessConnectionID string, storyID int64, content any, options any, opts ...*types.EditStoryOptions) (*types.Story, error) {
	var payload any
	if len(opts) > 0 && opts[0] != nil {
		opts[0].BusinessConnectionID = businessConnectionID
		opts[0].StoryID = storyID
		opts[0].Content = content
		payload = opts[0]
	} else if optMap, ok := options.(map[string]any); ok {
		payload = mergePayload(map[string]any{
			"business_connection_id": businessConnectionID,
			"story_id":               storyID,
			"content":                content,
		}, optMap)
	} else if optStruct, ok := options.(*types.EditStoryOptions); ok && optStruct != nil {
		optStruct.BusinessConnectionID = businessConnectionID
		optStruct.StoryID = storyID
		optStruct.Content = content
		payload = optStruct
	} else {
		payload = map[string]any{
			"business_connection_id": businessConnectionID,
			"story_id":               storyID,
			"content":                content,
		}
	}

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
//
// Telegram API: https://core.telegram.org/bots/api#deletestory
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
//   - opts: Repost options carrying business_connection_id, from_chat_id,
//     from_story_id and active_period, plus the optional post_to_chat_page and
//     protect_content fields.
//
// Returns:
//   - any: The raw result returned by Telegram — node types it as unknown, so
//     both a bare bool and an object decode.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	result, err := b.RepostStory(ctx, &types.RepostStoryOptions{
//		BusinessConnectionID: "423778511293324225",
//		FromChatID:           int64(-1001234567890),
//		FromStoryID:          42,
//		ActivePeriod:         86400,
//	})
//
// Telegram API: https://core.telegram.org/bots/api#repoststory
func (b *Bot) RepostStory(ctx context.Context, opts *types.RepostStoryOptions) (any, error) {
	return b.requestUnknown(ctx, "repostStory", opts)
}
