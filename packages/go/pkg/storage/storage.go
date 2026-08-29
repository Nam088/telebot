package storage

import (
	"context"
	"sync"
)

// Persistence defines the contract for session, context, and conversation storage backends.
type Persistence interface {
	// GetUserData retrieves the stored custom data map for a specific Telegram user ID.
	GetUserData(ctx context.Context, userID int64) (map[string]any, error)

	// SetUserData persists custom data for a specific Telegram user ID.
	SetUserData(ctx context.Context, userID int64, data map[string]any) error

	// GetChatData retrieves the stored custom data map for a specific Telegram chat ID.
	GetChatData(ctx context.Context, chatID int64) (map[string]any, error)

	// SetChatData persists custom data for a specific Telegram chat ID.
	SetChatData(ctx context.Context, chatID int64, data map[string]any) error
}

// MemoryStorage is a thread-safe in-memory storage implementation backed by sync.RWMutex.
type MemoryStorage struct {
	userData map[int64]map[string]any
	chatData map[int64]map[string]any
	mu       sync.RWMutex
}

// NewMemoryStorage creates a new MemoryStorage instance.
func NewMemoryStorage() *MemoryStorage {
	return &MemoryStorage{
		userData: make(map[int64]map[string]any),
		chatData: make(map[int64]map[string]any),
	}
}

// GetUserData retrieves a copy of the user data map from memory.
func (s *MemoryStorage) GetUserData(ctx context.Context, userID int64) (map[string]any, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	data, exists := s.userData[userID]
	if !exists {
		return make(map[string]any), nil
	}
	clone := make(map[string]any, len(data))
	for k, v := range data {
		clone[k] = v
	}
	return clone, nil
}

// SetUserData stores the user data map into memory.
func (s *MemoryStorage) SetUserData(ctx context.Context, userID int64, data map[string]any) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.userData[userID] = data
	return nil
}

// GetChatData retrieves a copy of the chat data map from memory.
func (s *MemoryStorage) GetChatData(ctx context.Context, chatID int64) (map[string]any, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	data, exists := s.chatData[chatID]
	if !exists {
		return make(map[string]any), nil
	}
	clone := make(map[string]any, len(data))
	for k, v := range data {
		clone[k] = v
	}
	return clone, nil
}

// SetChatData stores the chat data map into memory.
func (s *MemoryStorage) SetChatData(ctx context.Context, chatID int64, data map[string]any) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.chatData[chatID] = data
	return nil
}
