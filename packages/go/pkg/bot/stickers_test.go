package bot_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/types"
)

func stickerServer(t *testing.T, wantMethod string, wantPayload map[string]any, result any) *httptest.Server {
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

func TestStickers_SendSticker(t *testing.T) {
	srv := stickerServer(t, "sendSticker", map[string]any{
		"chat_id": 1,
		"sticker": "sticker-file-id",
		"emoji":   "😀",
	}, types.Message{MessageID: 10})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, err := b.SendSticker(context.Background(), &types.SendStickerOptions{
		ChatID:  int64(1),
		Sticker: "sticker-file-id",
		Emoji:   "😀",
	})
	if err != nil {
		t.Fatalf("SendSticker error: %v", err)
	}
	if msg.MessageID != 10 {
		t.Errorf("unexpected message id: %d", msg.MessageID)
	}
}

func TestStickers_GetStickerSet(t *testing.T) {
	srv := stickerServer(t, "getStickerSet", map[string]any{"name": "TestSet"}, types.StickerSet{
		Name:        "TestSet",
		Title:       "Test Set",
		StickerType: "regular",
		Stickers:    []types.Sticker{{FileID: "s1", Type: "regular", Width: 512, Height: 512}},
	})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	set, err := b.GetStickerSet(context.Background(), &types.GetStickerSetOptions{Name: "TestSet"})
	if err != nil {
		t.Fatalf("GetStickerSet error: %v", err)
	}
	if set.Name != "TestSet" || len(set.Stickers) != 1 || set.Stickers[0].FileID != "s1" {
		t.Errorf("unexpected sticker set: %+v", set)
	}
}

func TestStickers_GetCustomEmojiStickers(t *testing.T) {
	srv := stickerServer(t, "getCustomEmojiStickers", map[string]any{
		"custom_emoji_ids": []string{"5368324170671202286"},
	}, []types.Sticker{{FileID: "s1", CustomEmojiID: "5368324170671202286"}})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	stickers, err := b.GetCustomEmojiStickers(context.Background(), []string{"5368324170671202286"})
	if err != nil {
		t.Fatalf("GetCustomEmojiStickers error: %v", err)
	}
	if len(stickers) != 1 || stickers[0].CustomEmojiID != "5368324170671202286" {
		t.Errorf("unexpected stickers: %+v", stickers)
	}
}

func TestStickers_UploadStickerFile(t *testing.T) {
	srv := stickerServer(t, "uploadStickerFile", map[string]any{
		"user_id":        1,
		"sticker":        "attach://sticker.png",
		"sticker_format": "static",
	}, types.File{FileID: "uploaded-file-id", FilePath: "stickers/sticker.png"})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	file, err := b.UploadStickerFile(context.Background(), &types.UploadStickerFileOptions{
		UserID:        1,
		Sticker:       "attach://sticker.png",
		StickerFormat: "static",
	})
	if err != nil {
		t.Fatalf("UploadStickerFile error: %v", err)
	}
	if file.FileID != "uploaded-file-id" {
		t.Errorf("unexpected file id: %s", file.FileID)
	}
}

func TestStickers_CreateNewStickerSet(t *testing.T) {
	srv := stickerServer(t, "createNewStickerSet", map[string]any{
		"user_id": 1,
		"name":    "TestSet_by_bot",
		"title":   "Test Set",
		"stickers": []any{map[string]any{
			"sticker":    "sticker-file-id",
			"format":     "static",
			"emoji_list": []string{"😀"},
		}},
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.CreateNewStickerSet(context.Background(), &types.CreateNewStickerSetOptions{
		UserID:   1,
		Name:     "TestSet_by_bot",
		Title:    "Test Set",
		Stickers: []types.InputSticker{{Sticker: "sticker-file-id", Format: "static", EmojiList: []string{"😀"}}},
	})
	if err != nil {
		t.Fatalf("CreateNewStickerSet error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_AddStickerToSet(t *testing.T) {
	srv := stickerServer(t, "addStickerToSet", map[string]any{
		"user_id": 1,
		"name":    "TestSet_by_bot",
		"sticker": map[string]any{
			"sticker":    "sticker-file-id",
			"format":     "static",
			"emoji_list": []string{"😀"},
		},
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.AddStickerToSet(context.Background(), &types.AddStickerToSetOptions{
		UserID:  1,
		Name:    "TestSet_by_bot",
		Sticker: types.InputSticker{Sticker: "sticker-file-id", Format: "static", EmojiList: []string{"😀"}},
	})
	if err != nil {
		t.Fatalf("AddStickerToSet error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_SetStickerPositionInSet(t *testing.T) {
	srv := stickerServer(t, "setStickerPositionInSet", map[string]any{
		"sticker":  "s1",
		"position": 2,
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SetStickerPositionInSet(context.Background(), &types.SetStickerPositionInSetOptions{
		Sticker:  "s1",
		Position: 2,
	})
	if err != nil {
		t.Fatalf("SetStickerPositionInSet error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_DeleteStickerFromSet(t *testing.T) {
	srv := stickerServer(t, "deleteStickerFromSet", map[string]any{"sticker": "s1"}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.DeleteStickerFromSet(context.Background(), &types.DeleteStickerFromSetOptions{Sticker: "s1"})
	if err != nil {
		t.Fatalf("DeleteStickerFromSet error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_ReplaceStickerInSet(t *testing.T) {
	srv := stickerServer(t, "replaceStickerInSet", map[string]any{
		"user_id":     1,
		"name":        "TestSet_by_bot",
		"old_sticker": "old-file-id",
		"sticker": map[string]any{
			"sticker":    "new-file-id",
			"format":     "static",
			"emoji_list": []string{"😀"},
		},
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.ReplaceStickerInSet(context.Background(), &types.ReplaceStickerInSetOptions{
		UserID:     1,
		Name:       "TestSet_by_bot",
		OldSticker: "old-file-id",
		Sticker:    types.InputSticker{Sticker: "new-file-id", Format: "static", EmojiList: []string{"😀"}},
	})
	if err != nil {
		t.Fatalf("ReplaceStickerInSet error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_SetStickerEmojiList(t *testing.T) {
	srv := stickerServer(t, "setStickerEmojiList", map[string]any{
		"sticker":    "s1",
		"emoji_list": []string{"😀", "😁"},
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SetStickerEmojiList(context.Background(), &types.SetStickerEmojiListOptions{
		Sticker:   "s1",
		EmojiList: []string{"😀", "😁"},
	})
	if err != nil {
		t.Fatalf("SetStickerEmojiList error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_SetStickerKeywords(t *testing.T) {
	srv := stickerServer(t, "setStickerKeywords", map[string]any{
		"sticker":  "s1",
		"keywords": []string{"hello", "wave"},
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SetStickerKeywords(context.Background(), &types.SetStickerKeywordsOptions{
		Sticker:  "s1",
		Keywords: []string{"hello", "wave"},
	})
	if err != nil {
		t.Fatalf("SetStickerKeywords error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_SetStickerMaskPosition(t *testing.T) {
	srv := stickerServer(t, "setStickerMaskPosition", map[string]any{
		"sticker":       "s1",
		"mask_position": map[string]any{"point": "eyes", "x_shift": 0.1, "y_shift": 0.2, "scale": 1.5},
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SetStickerMaskPosition(context.Background(), &types.SetStickerMaskPositionOptions{
		Sticker:      "s1",
		MaskPosition: &types.MaskPosition{Point: "eyes", XShift: 0.1, YShift: 0.2, Scale: 1.5},
	})
	if err != nil {
		t.Fatalf("SetStickerMaskPosition error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_DeleteStickerSet(t *testing.T) {
	srv := stickerServer(t, "deleteStickerSet", map[string]any{"name": "TestSet_by_bot"}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.DeleteStickerSet(context.Background(), &types.DeleteStickerSetOptions{Name: "TestSet_by_bot"})
	if err != nil {
		t.Fatalf("DeleteStickerSet error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_SetCustomEmojiStickerSetThumbnail(t *testing.T) {
	srv := stickerServer(t, "setCustomEmojiStickerSetThumbnail", map[string]any{
		"name":            "TestSet_by_bot",
		"custom_emoji_id": "emoji-1",
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SetCustomEmojiStickerSetThumbnail(context.Background(), "TestSet_by_bot", "emoji-1")
	if err != nil {
		t.Fatalf("SetCustomEmojiStickerSetThumbnail error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_SetCustomEmojiStickerSetThumbnail_OmitsEmptyEmojiID(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var got map[string]any
		if err := json.NewDecoder(r.Body).Decode(&got); err != nil {
			t.Fatalf("decode body: %v", err)
		}
		if _, present := got["custom_emoji_id"]; present {
			t.Error("custom_emoji_id should be omitted when empty")
		}
		if got["name"] != "TestSet_by_bot" {
			t.Errorf("unexpected name: %v", got["name"])
		}
		_ = json.NewEncoder(w).Encode(types.Response[any]{Ok: true, Result: true})
	}))
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SetCustomEmojiStickerSetThumbnail(context.Background(), "TestSet_by_bot", "")
	if err != nil {
		t.Fatalf("SetCustomEmojiStickerSetThumbnail error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_SetStickerSetThumbnail(t *testing.T) {
	srv := stickerServer(t, "setStickerSetThumbnail", map[string]any{
		"name":      "TestSet_by_bot",
		"user_id":   1,
		"format":    "static",
		"thumbnail": "thumb-file-id",
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SetStickerSetThumbnail(context.Background(), &types.SetStickerSetThumbnailOptions{
		Name:      "TestSet_by_bot",
		UserID:    1,
		Format:    "static",
		Thumbnail: "thumb-file-id",
	})
	if err != nil {
		t.Fatalf("SetStickerSetThumbnail error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_SetStickerSetTitle(t *testing.T) {
	srv := stickerServer(t, "setStickerSetTitle", map[string]any{
		"name":  "TestSet_by_bot",
		"title": "New Title",
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.SetStickerSetTitle(context.Background(), &types.SetStickerSetTitleOptions{
		Name:  "TestSet_by_bot",
		Title: "New Title",
	})
	if err != nil {
		t.Fatalf("SetStickerSetTitle error: %v", err)
	}
	if !ok {
		t.Error("expected true")
	}
}

func TestStickers_GetForumTopicIconStickers(t *testing.T) {
	srv := stickerServer(t, "getForumTopicIconStickers", nil, []types.Sticker{{FileID: "icon-1"}})
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	stickers, err := b.GetForumTopicIconStickers(context.Background())
	if err != nil {
		t.Fatalf("GetForumTopicIconStickers error: %v", err)
	}
	if len(stickers) != 1 || stickers[0].FileID != "icon-1" {
		t.Errorf("unexpected stickers: %+v", stickers)
	}
}
