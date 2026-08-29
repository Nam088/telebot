package storage_test

import (
	"context"
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
