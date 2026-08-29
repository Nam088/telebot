package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// SendAudio sends an audio file to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id, audio file, caption, and duration.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error, or a network error.
func (b *Bot) SendAudio(ctx context.Context, opts *types.SendAudioOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendAudio", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendVideo sends a video file to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id, video file, dimensions, and thumbnail.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error, or a network error.
func (b *Bot) SendVideo(ctx context.Context, opts *types.SendVideoOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendVideo", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendAnimation sends an animation file (GIF or H.264 video) to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id, animation file, dimensions, and thumbnail.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error, or a network error.
func (b *Bot) SendAnimation(ctx context.Context, opts *types.SendAnimationOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendAnimation", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendVoice sends a voice note to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id, voice file, caption, and duration.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error, or a network error.
func (b *Bot) SendVoice(ctx context.Context, opts *types.SendVoiceOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendVoice", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendVideoNote sends a round video message to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id, video note file, duration, and length.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error, or a network error.
func (b *Bot) SendVideoNote(ctx context.Context, opts *types.SendVideoNoteOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendVideoNote", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendLocation sends a point on the map to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id, latitude, longitude, and live period.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error, or a network error.
func (b *Bot) SendLocation(ctx context.Context, opts *types.SendLocationOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendLocation", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendVenue sends information about a venue to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id, coordinates, title, and address.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error, or a network error.
func (b *Bot) SendVenue(ctx context.Context, opts *types.SendVenueOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendVenue", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendContact sends a phone contact to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id, phone number, and first name.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error, or a network error.
func (b *Bot) SendContact(ctx context.Context, opts *types.SendContactOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendContact", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendPoll sends a native poll to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id, question, poll options, and settings.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error, or a network error.
func (b *Bot) SendPoll(ctx context.Context, opts *types.SendPollOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendPoll", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendDice sends an animated emoji that displays a random value to a Telegram chat.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id and emoji type.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error, or a network error.
func (b *Bot) SendDice(ctx context.Context, opts *types.SendDiceOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendDice", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendMediaGroup sends a group of photos, videos, documents, or audios as an album.
//
// Parameters:
//   - ctx: Context for request cancellation and timeout.
//   - opts: Send options including chat_id and the media album.
//
// Returns:
//   - []types.Message: The sent messages on success.
//   - error: TelegramError if the API returns an error, or a network error.
func (b *Bot) SendMediaGroup(ctx context.Context, opts *types.SendMediaGroupOptions) ([]types.Message, error) {
	var msgs []types.Message
	if err := b.Request(ctx, "sendMediaGroup", opts, &msgs); err != nil {
		return nil, err
	}
	return msgs, nil
}
