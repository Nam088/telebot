package storage_test

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
	"testing"

	"github.com/Nam088/telebot-go/pkg/storage"
)

func TestMemoryStorage_ChatData(t *testing.T) {
	ctx := context.Background()
	store := storage.NewMemoryStorage()

	// Missing chat returns an empty map, not an error.
	empty, err := store.GetChatData(ctx, 999)
	if err != nil {
		t.Fatalf("unexpected error for missing chat: %v", err)
	}
	if len(empty) != 0 {
		t.Errorf("expected empty map for missing chat, got %v", empty)
	}

	if err := store.SetChatData(ctx, 42, map[string]any{"stage": "done"}); err != nil {
		t.Fatalf("SetChatData failed: %v", err)
	}

	got, err := store.GetChatData(ctx, 42)
	if err != nil {
		t.Fatalf("GetChatData failed: %v", err)
	}
	if got["stage"] != "done" {
		t.Errorf("expected stage=done, got %v", got["stage"])
	}
}

func TestMemoryStorage_ReturnsDefensiveCopy(t *testing.T) {
	ctx := context.Background()
	store := storage.NewMemoryStorage()

	if err := store.SetUserData(ctx, 1, map[string]any{"count": 1}); err != nil {
		t.Fatalf("SetUserData failed: %v", err)
	}

	got, _ := store.GetUserData(ctx, 1)
	got["count"] = 999 // mutate the returned copy

	fresh, _ := store.GetUserData(ctx, 1)
	if fresh["count"] != 1 {
		t.Errorf("stored data must not be affected by caller mutation, got %v", fresh["count"])
	}
}

func TestMemoryStorage_ConcurrentAccess(t *testing.T) {
	ctx := context.Background()
	store := storage.NewMemoryStorage()

	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			uid := int64(id)
			_ = store.SetUserData(ctx, uid, map[string]any{"id": id})
			_, _ = store.GetUserData(ctx, uid)
			_ = store.SetChatData(ctx, uid, map[string]any{"id": id})
			_, _ = store.GetChatData(ctx, uid)
		}(i)
	}
	wg.Wait()
}

func TestJSONStorage_UserData(t *testing.T) {
	ctx := context.Background()
	tmpFile := filepath.Join(t.TempDir(), "data.json")

	store, err := storage.NewJSONStorage(tmpFile)
	if err != nil {
		t.Fatalf("NewJSONStorage failed: %v", err)
	}

	if err := store.SetUserData(ctx, 7, map[string]any{"lang": "vi"}); err != nil {
		t.Fatalf("SetUserData failed: %v", err)
	}

	got, err := store.GetUserData(ctx, 7)
	if err != nil {
		t.Fatalf("GetUserData failed: %v", err)
	}
	if got["lang"] != "vi" {
		t.Errorf("expected lang=vi, got %v", got["lang"])
	}

	// Missing user returns empty map.
	empty, err := store.GetUserData(ctx, 12345)
	if err != nil {
		t.Fatalf("GetUserData for missing user failed: %v", err)
	}
	if len(empty) != 0 {
		t.Errorf("expected empty map, got %v", empty)
	}
}

func TestJSONStorage_PersistenceRoundTrip(t *testing.T) {
	ctx := context.Background()
	tmpFile := filepath.Join(t.TempDir(), "persist.json")

	store, err := storage.NewJSONStorage(tmpFile)
	if err != nil {
		t.Fatalf("NewJSONStorage failed: %v", err)
	}
	_ = store.SetUserData(ctx, 1, map[string]any{"user_key": "user_val"})
	_ = store.SetChatData(ctx, 2, map[string]any{"chat_key": "chat_val"})

	// Reopen a fresh instance over the same file.
	store2, err := storage.NewJSONStorage(tmpFile)
	if err != nil {
		t.Fatalf("reopen failed: %v", err)
	}

	u, _ := store2.GetUserData(ctx, 1)
	if u["user_key"] != "user_val" {
		t.Errorf("user data not persisted, got %v", u)
	}
	c, _ := store2.GetChatData(ctx, 2)
	if c["chat_key"] != "chat_val" {
		t.Errorf("chat data not persisted, got %v", c)
	}
}

func TestJSONStorage_CorruptFileIsIgnored(t *testing.T) {
	tmpFile := filepath.Join(t.TempDir(), "corrupt.json")
	if err := os.WriteFile(tmpFile, []byte("{not valid json"), 0644); err != nil {
		t.Fatalf("failed to seed corrupt file: %v", err)
	}

	store, err := storage.NewJSONStorage(tmpFile)
	if err != nil {
		t.Fatalf("NewJSONStorage should tolerate corrupt file, got: %v", err)
	}

	got, err := store.GetUserData(context.Background(), 1)
	if err != nil {
		t.Fatalf("GetUserData failed: %v", err)
	}
	if len(got) != 0 {
		t.Errorf("corrupt file should start empty, got %v", got)
	}
}

func TestJSONStorage_EmptyFileIsIgnored(t *testing.T) {
	tmpFile := filepath.Join(t.TempDir(), "empty.json")
	if err := os.WriteFile(tmpFile, []byte(""), 0644); err != nil {
		t.Fatalf("failed to seed empty file: %v", err)
	}

	store, err := storage.NewJSONStorage(tmpFile)
	if err != nil {
		t.Fatalf("NewJSONStorage should tolerate empty file, got: %v", err)
	}
	if store == nil {
		t.Fatal("expected non-nil storage")
	}
}

func TestJSONStorage_WritesValidJSON(t *testing.T) {
	tmpFile := filepath.Join(t.TempDir(), "valid.json")
	store, err := storage.NewJSONStorage(tmpFile)
	if err != nil {
		t.Fatalf("NewJSONStorage failed: %v", err)
	}
	_ = store.SetUserData(context.Background(), 1, map[string]any{"a": 1})

	content, err := os.ReadFile(tmpFile)
	if err != nil {
		t.Fatalf("failed to read written file: %v", err)
	}
	var parsed map[string]any
	if err := json.Unmarshal(content, &parsed); err != nil {
		t.Errorf("persisted content is not valid JSON: %v", err)
	}
}

func TestJSONStorage_MarshalError(t *testing.T) {
	tmpFile := filepath.Join(t.TempDir(), "marshal.json")
	store, err := storage.NewJSONStorage(tmpFile)
	if err != nil {
		t.Fatalf("NewJSONStorage failed: %v", err)
	}

	// A channel cannot be marshalled to JSON, so flush must surface an error.
	err = store.SetUserData(context.Background(), 1, map[string]any{"bad": make(chan int)})
	if err == nil {
		t.Error("expected marshal error for un-marshalable value, got nil")
	}
}

func TestJSONStorage_WriteError(t *testing.T) {
	dir := t.TempDir()
	// Point the storage at a path that is itself a directory so WriteFile fails.
	store, err := storage.NewJSONStorage(dir)
	if err != nil {
		t.Fatalf("NewJSONStorage failed: %v", err)
	}

	err = store.SetChatData(context.Background(), 1, map[string]any{"k": "v"})
	if err == nil {
		t.Error("expected write error when target is a directory, got nil")
	}
}
