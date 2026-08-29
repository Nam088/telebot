package storage

import (
	"context"
	"sync"
)

// Persistence defines the contract for session and context storage backends.
type Persistence interface {
	GetUserData(ctx context.Context, userID int64) (map[string]any, error)
	SetUserData(ctx context.Context, userID int64, data map[string]any) error
	GetChatData(ctx context.Context, chatID int64) (map[string]any, error)
	SetChatData(ctx context.Context, chatID int64, data map[string]any) error
}

// MemoryStorage is a thread-safe in-memory storage implementation.
type MemoryStorage struct {
	userData map[int64]map[string]any
	chatData map[int64]map[string]any
	mu       sync.RWMutex
}

// NewMemoryStorage creates a new MemoryStorage.
func NewMemoryStorage() *MemoryStorage {
	return &MemoryStorage{
		userData: make(map[int64]map[string]any),
		chatData: make(map[int64]map[string]any),
	}
}

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

func (s *MemoryStorage) SetUserData(ctx context.Context, userID int64, data map[string]any) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.userData[userID] = data
	return nil
}

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

func (s *MemoryStorage) SetChatData(ctx context.Context, chatID int64, data map[string]any) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.chatData[chatID] = data
	return nil
}
