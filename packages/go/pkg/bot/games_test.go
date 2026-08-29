package bot_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/types"
)

func gameServer(t *testing.T, wantMethod string, wantPayload map[string]any, result any) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasSuffix(r.URL.Path, "/"+wantMethod) {
			t.Errorf("expected path to end with /%s, got %s", wantMethod, r.URL.Path)
		}
		if wantPayload != nil {
			var got map[string]any
			if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
				t.Fatalf("decode body: %v", err)
			}
			for k, v := range wantPayload {
				gv, ok := got[k]
				if !ok {
					t.Errorf("missing payload field %q", k)
					continue
				}
				if !jsonEqual(gv, v) {
					t.Errorf("payload field %q: got %v, want %v", k, gv, v)
				}
			}
		}
		resp := types.Response[any]{Ok: true, Result: result}
		_ = json.NewEncoder(w).Encode(resp)
	}))
}

func TestGames_SendGame(t *testing.T) {
	srv := gameServer(t, "sendGame", map[string]any{
		"chat_id":         "@gamechannel",
		"game_short_name": "lucas",
	}, types.Message{MessageID: 30})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, err := b.SendGame(context.Background(), &types.SendGameOptions{
		ChatID:        "@gamechannel",
		GameShortName: "lucas",
	})
	if err != nil {
		t.Fatalf("SendGame error: %v", err)
	}
	if msg.MessageID != 30 {
		t.Errorf("unexpected message id: %d", msg.MessageID)
	}
}

func TestGames_SetGameScore_Message(t *testing.T) {
	srv := gameServer(t, "setGameScore", map[string]any{
		"user_id":    1,
		"score":      42,
		"chat_id":    2,
		"message_id": 30,
	}, types.Message{MessageID: 30})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, inline, err := b.SetGameScore(context.Background(), &types.SetGameScoreOptions{
		UserID:    1,
		Score:     42,
		ChatID:    int64(2),
		MessageID: 30,
	})
	if err != nil {
		t.Fatalf("SetGameScore error: %v", err)
	}
	if inline {
		t.Error("expected inline to be false")
	}
	if msg == nil || msg.MessageID != 30 {
		t.Errorf("unexpected message: %+v", msg)
	}
}

func TestGames_SetGameScore_InlineMessage(t *testing.T) {
	srv := gameServer(t, "setGameScore", map[string]any{
		"user_id":           1,
		"score":             10,
		"inline_message_id": "im1",
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, inline, err := b.SetGameScore(context.Background(), &types.SetGameScoreOptions{
		UserID:          1,
		Score:           10,
		InlineMessageID: "im1",
	})
	if err != nil {
		t.Fatalf("SetGameScore error: %v", err)
	}
	if !inline {
		t.Error("expected inline to be true")
	}
	if msg != nil {
		t.Errorf("expected nil message, got %+v", msg)
	}
}

func TestGames_SetGameScore_InvalidResult(t *testing.T) {
	srv := gameServer(t, "setGameScore", nil, "garbage")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, inline, err := b.SetGameScore(context.Background(), &types.SetGameScoreOptions{UserID: 1, Score: 1})
	if err == nil {
		t.Fatal("expected unmarshal error")
	}
	var tgErr *types.TelegramError
	if errors.As(err, &tgErr) {
		t.Fatalf("expected non-telegram error, got %v", err)
	}
	if msg != nil || inline {
		t.Errorf("expected zero values, got msg=%+v inline=%v", msg, inline)
	}
}

func TestGames_GetGameHighScores(t *testing.T) {
	srv := gameServer(t, "getGameHighScores", map[string]any{
		"user_id":    1,
		"chat_id":    2,
		"message_id": 30,
	}, []types.GameHighScore{{
		Position: 1,
		User:     types.User{ID: 1, FirstName: "Alice"},
		Score:    42,
	}})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	scores, err := b.GetGameHighScores(context.Background(), &types.GetGameHighScoresOptions{
		UserID:    1,
		ChatID:    int64(2),
		MessageID: 30,
	})
	if err != nil {
		t.Fatalf("GetGameHighScores error: %v", err)
	}
	if len(scores) != 1 || scores[0].Score != 42 || scores[0].User.FirstName != "Alice" {
		t.Errorf("unexpected scores: %+v", scores)
	}
}

func TestGames_TelegramErrors(t *testing.T) {
	srv := telegramErrorServer(400, "Bad Request: game not found")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ctx := context.Background()

	if _, err := b.SendGame(ctx, &types.SendGameOptions{ChatID: int64(1)}); err == nil {
		t.Error("SendGame: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, _, err := b.SetGameScore(ctx, &types.SetGameScoreOptions{UserID: 1}); err == nil {
		t.Error("SetGameScore: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.GetGameHighScores(ctx, &types.GetGameHighScoresOptions{UserID: 1}); err == nil {
		t.Error("GetGameHighScores: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
}
