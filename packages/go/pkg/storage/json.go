package storage

import (
	"context"
	"encoding/json"
	"os"
	"sync"
)

// JSONStorage implements file-based JSON persistence.
type JSONStorage struct {
	filepath string
	data     *storageData
	mu       sync.RWMutex
}

type storageData struct {
	UserData map[int64]map[string]any `json:"user_data"`
	ChatData map[int64]map[string]any `json:"chat_data"`
}

// NewJSONStorage creates or loads a JSON storage file.
func NewJSONStorage(filepath string) (*JSONStorage, error) {
	s := &JSONStorage{
		filepath: filepath,
		data: &storageData{
			UserData: make(map[int64]map[string]any),
			ChatData: make(map[int64]map[string]any),
		},
	}

	if _, err := os.Stat(filepath); err == nil {
		content, err := os.ReadFile(filepath)
		if err == nil && len(content) > 0 {
			_ = json.Unmarshal(content, s.data)
		}
	}

	return s, nil
}

func (s *JSONStorage) flush() error {
	bytes, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.filepath, bytes, 0644)
}

func (s *JSONStorage) GetUserData(ctx context.Context, userID int64) (map[string]any, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	data, exists := s.data.UserData[userID]
	if !exists {
		return make(map[string]any), nil
	}
	clone := make(map[string]any, len(data))
	for k, v := range data {
		clone[k] = v
	}
	return clone, nil
}

func (s *JSONStorage) SetUserData(ctx context.Context, userID int64, data map[string]any) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.data.UserData[userID] = data
	return s.flush()
}

func (s *JSONStorage) GetChatData(ctx context.Context, chatID int64) (map[string]any, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	data, exists := s.data.ChatData[chatID]
	if !exists {
		return make(map[string]any), nil
	}
	clone := make(map[string]any, len(data))
	for k, v := range data {
		clone[k] = v
	}
	return clone, nil
}

func (s *JSONStorage) SetChatData(ctx context.Context, chatID int64, data map[string]any) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.data.ChatData[chatID] = data
	return s.flush()
}
