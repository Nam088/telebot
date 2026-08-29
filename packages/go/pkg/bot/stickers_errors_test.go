package bot_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/types"
)

// telegramErrorServer responds with a failed Bot API envelope.
func telegramErrorServer(code int, description string) *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   code,
			Description: description,
		})
	}))
}

// requireTelegramError asserts that err is a *types.TelegramError with the given code.
func requireTelegramError(t *testing.T, err error, wantCode int) {
	t.Helper()
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	var tgErr *types.TelegramError
	if !errors.As(err, &tgErr) {
		t.Fatalf("expected *types.TelegramError, got %T: %v", err, err)
	}
	if tgErr.ErrorCode != wantCode {
		t.Errorf("unexpected error code: got %d, want %d", tgErr.ErrorCode, wantCode)
	}
}

func TestStickers_TelegramErrors(t *testing.T) {
	srv := telegramErrorServer(400, "Bad Request: sticker not found")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ctx := context.Background()

	if _, err := b.SendSticker(ctx, &types.SendStickerOptions{ChatID: int64(1), Sticker: "s"}); err == nil {
		t.Error("SendSticker: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.GetStickerSet(ctx, &types.GetStickerSetOptions{Name: "missing"}); err == nil {
		t.Error("GetStickerSet: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.GetCustomEmojiStickers(ctx, []string{"x"}); err == nil {
		t.Error("GetCustomEmojiStickers: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.UploadStickerFile(ctx, &types.UploadStickerFileOptions{UserID: 1}); err == nil {
		t.Error("UploadStickerFile: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.CreateNewStickerSet(ctx, &types.CreateNewStickerSetOptions{UserID: 1}); err == nil {
		t.Error("CreateNewStickerSet: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.AddStickerToSet(ctx, &types.AddStickerToSetOptions{UserID: 1}); err == nil {
		t.Error("AddStickerToSet: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.SetStickerPositionInSet(ctx, &types.SetStickerPositionInSetOptions{Sticker: "s"}); err == nil {
		t.Error("SetStickerPositionInSet: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.DeleteStickerFromSet(ctx, &types.DeleteStickerFromSetOptions{Sticker: "s"}); err == nil {
		t.Error("DeleteStickerFromSet: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.ReplaceStickerInSet(ctx, &types.ReplaceStickerInSetOptions{UserID: 1}); err == nil {
		t.Error("ReplaceStickerInSet: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.SetStickerEmojiList(ctx, &types.SetStickerEmojiListOptions{Sticker: "s"}); err == nil {
		t.Error("SetStickerEmojiList: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.SetStickerKeywords(ctx, &types.SetStickerKeywordsOptions{Sticker: "s"}); err == nil {
		t.Error("SetStickerKeywords: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.SetStickerMaskPosition(ctx, &types.SetStickerMaskPositionOptions{Sticker: "s"}); err == nil {
		t.Error("SetStickerMaskPosition: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.DeleteStickerSet(ctx, &types.DeleteStickerSetOptions{Name: "missing"}); err == nil {
		t.Error("DeleteStickerSet: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.SetCustomEmojiStickerSetThumbnail(ctx, "missing", ""); err == nil {
		t.Error("SetCustomEmojiStickerSetThumbnail: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.SetStickerSetThumbnail(ctx, &types.SetStickerSetThumbnailOptions{Name: "missing"}); err == nil {
		t.Error("SetStickerSetThumbnail: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.SetStickerSetTitle(ctx, &types.SetStickerSetTitleOptions{Name: "missing"}); err == nil {
		t.Error("SetStickerSetTitle: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
	if _, err := b.GetForumTopicIconStickers(ctx); err == nil {
		t.Error("GetForumTopicIconStickers: expected error")
	} else {
		requireTelegramError(t, err, 400)
	}
}
