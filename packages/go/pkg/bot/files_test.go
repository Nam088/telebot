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

func fileServer(t *testing.T, wantMethod string, wantPayload map[string]any, result any) *httptest.Server {
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
		_ = json.NewEncoder(w).Encode(types.Response[any]{Ok: true, Result: result})
	}))
}

func TestFiles_GetFile(t *testing.T) {
	srv := fileServer(t, "getFile", map[string]any{"file_id": "file_123"}, types.File{
		FileID:       "file_123",
		FileUniqueID: "unique_123",
		FileSize:     1024,
		FilePath:     "path/file.txt",
	})
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	file, err := b.GetFile(context.Background(), &types.GetFileOptions{FileID: "file_123"})
	if err != nil {
		t.Fatalf("GetFile error: %v", err)
	}
	if file.FileID != "file_123" || file.FilePath != "path/file.txt" {
		t.Errorf("unexpected file: %+v", file)
	}
}

func TestFiles_GetUserProfilePhotos(t *testing.T) {
	result := types.UserProfilePhotos{
		TotalCount: 1,
		Photos: [][]types.PhotoSize{
			{{FileID: "photo_1", FileUniqueID: "uniq_1", Width: 100, Height: 100}},
		},
	}
	want := map[string]any{
		"user_id": float64(42),
		"offset":  float64(1),
		"limit":   float64(10),
	}
	srv := fileServer(t, "getUserProfilePhotos", want, result)
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	photos, err := b.GetUserProfilePhotos(context.Background(), &types.GetUserProfilePhotosOptions{
		UserID: 42,
		Offset: 1,
		Limit:  10,
	})
	if err != nil {
		t.Fatalf("GetUserProfilePhotos error: %v", err)
	}
	if photos.TotalCount != 1 || len(photos.Photos) != 1 {
		t.Errorf("unexpected photos: %+v", photos)
	}
}

func TestFiles_Error(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   404,
			Description: "Not Found",
		})
	}))
	defer srv.Close()
	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))

	_, err := b.GetFile(context.Background(), &types.GetFileOptions{FileID: "missing"})
	if err == nil {
		t.Fatal("expected error")
	}
	var tgErr *types.TelegramError
	if !errors.As(err, &tgErr) {
		t.Fatalf("expected TelegramError, got %T", err)
	}
	if tgErr.ErrorCode != 404 {
		t.Errorf("expected error code 404, got %d", tgErr.ErrorCode)
	}
}
