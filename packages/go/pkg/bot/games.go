package bot

import (
	"bytes"
	"context"
	"encoding/json"

	"github.com/Nam088/telebot-go/pkg/types"
)

// SendGame sends a game to a chat.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Game options including chat_id and game_short_name.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) SendGame(ctx context.Context, opts *types.SendGameOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendGame", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SetGameScore sets the score of a game.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Score options including user_id, score and target message identifiers.
//
// Returns:
//   - *types.Message: The edited Message object when a chat message was targeted.
//   - bool: True when an inline message was targeted.
//   - error: TelegramError if the API returns an error.
func (b *Bot) SetGameScore(ctx context.Context, opts *types.SetGameScoreOptions) (*types.Message, bool, error) {
	var raw json.RawMessage
	if err := b.Request(ctx, "setGameScore", opts, &raw); err != nil {
		return nil, false, err
	}

	if bytes.Equal(raw, []byte("true")) {
		return nil, true, nil
	}

	var msg types.Message
	if err := json.Unmarshal(raw, &msg); err != nil {
		return nil, false, err
	}
	return &msg, false, nil
}

// GetGameHighScores returns the high scores for a game.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options including user_id and target message identifiers.
//
// Returns:
//   - []types.GameHighScore: A list of high scores on success.
//   - error: TelegramError if the API returns an error.
func (b *Bot) GetGameHighScores(ctx context.Context, opts *types.GetGameHighScoresOptions) ([]types.GameHighScore, error) {
	var scores []types.GameHighScore
	if err := b.Request(ctx, "getGameHighScores", opts, &scores); err != nil {
		return nil, err
	}
	return scores, nil
}
