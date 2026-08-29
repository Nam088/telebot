package storage_test

import (
	"context"
	"os"
	"path/filepath"
	"testing"

	"github.com/Nam088/telebot-go/pkg/storage"
)

func TestMemoryStorage(t *testing.T) {
	ctx := context.Background()
	store := storage.NewMemoryStorage()

	err := store.SetUserData(ctx, 123, map[string]any{"counter": 42})
	if err != nil {
		t.Fatalf("failed to set user data: %v", err)
	}

	data, err := store.GetUserData(ctx, 123)
	if err != nil {
		t.Fatalf("failed to get user data: %v", err)
	}

	if data["counter"] != 42 {
		t.Errorf("expected counter=42, got %v", data["counter"])
	}
}

func TestJSONStorage(t *testing.T) {
	ctx := context.Background()
	tmpFile := filepath.Join(t.TempDir(), "storage.json")

	store, err := storage.NewJSONStorage(tmpFile)
	if err != nil {
		t.Fatalf("failed to create JSON storage: %v", err)
	}

	err = store.SetChatData(ctx, 456, map[string]any{"welcome_msg": true})
	if err != nil {
		t.Fatalf("failed to set chat data: %v", err)
	}

	// Reload from file to ensure persistence
	reloaded, err := storage.NewJSONStorage(tmpFile)
	if err != nil {
		t.Fatalf("failed to reload JSON storage: %v", err)
	}

	data, err := reloaded.GetChatData(ctx, 456)
	if err != nil {
		t.Fatalf("failed to get chat data: %v", err)
	}

	if data["welcome_msg"] != true {
		t.Errorf("expected welcome_msg=true, got %v", data["welcome_msg"])
	}

	_ = os.Remove(tmpFile)
}
