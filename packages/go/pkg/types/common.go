package types

import "fmt"

// Response represents a standard Telegram Bot API response envelope.
type Response[T any] struct {
	Ok          bool        `json:"ok"`
	Result      T           `json:"result,omitempty"`
	ErrorCode   int         `json:"error_code,omitempty"`
	Description string      `json:"description,omitempty"`
	Parameters  *Parameters `json:"parameters,omitempty"`
}

// Parameters contains information about why a request failed.
type Parameters struct {
	MigrateToChatID int64 `json:"migrate_to_chat_id,omitempty"`
	RetryAfter      int   `json:"retry_after,omitempty"`
}

// TelegramError represents an API error returned by Telegram.
type TelegramError struct {
	ErrorCode   int         `json:"error_code"`
	Description string      `json:"description"`
	Parameters  *Parameters `json:"parameters,omitempty"`
}

// Error implements the error interface, returning the error code and description.
func (e *TelegramError) Error() string {
	return fmt.Sprintf("telegram api error: [%d] %s", e.ErrorCode, e.Description)
}

// User represents a Telegram user or bot.
//
// Telegram API: https://core.telegram.org/bots/api#user
type User struct {
	ID                         int64  `json:"id"`
	IsBot                      bool   `json:"is_bot"`
	FirstName                  string `json:"first_name"`
	LastName                   string `json:"last_name,omitempty"`
	Username                   string `json:"username,omitempty"`
	LanguageCode               string `json:"language_code,omitempty"`
	IsPremium                  bool   `json:"is_premium,omitempty"`
	AddedToAttachmentMenu      bool   `json:"added_to_attachment_menu,omitempty"`
	CanJoinGroups              bool   `json:"can_join_groups,omitempty"`
	CanReadAllGroupMessages    bool   `json:"can_read_all_group_messages,omitempty"`
	SupportsInlineQueries      bool   `json:"supports_inline_queries,omitempty"`
	CanConnectToBusiness       bool   `json:"can_connect_to_business,omitempty"`
	HasMainWebApp              bool   `json:"has_main_web_app,omitempty"`
	AllowsUsersToCreateTopics  bool   `json:"allows_users_to_create_topics,omitempty"`
	CanManageBots              bool   `json:"can_manage_bots,omitempty"`
	HasTopicsEnabled           bool   `json:"has_topics_enabled,omitempty"`
	SupportsGuestQueries       bool   `json:"supports_guest_queries,omitempty"`
	SupportsJoinRequestQueries bool   `json:"supports_join_request_queries,omitempty"`
}

// Chat represents a Telegram chat.
//
// Telegram API: https://core.telegram.org/bots/api#chat
type Chat struct {
	ID               int64  `json:"id"`
	Type             string `json:"type"`
	Title            string `json:"title,omitempty"`
	Username         string `json:"username,omitempty"`
	FirstName        string `json:"first_name,omitempty"`
	LastName         string `json:"last_name,omitempty"`
	IsForum          bool   `json:"is_forum,omitempty"`
	IsDirectMessages bool   `json:"is_direct_messages,omitempty"`
}

// File represents a file ready to be downloaded.
//
// Telegram API: https://core.telegram.org/bots/api#file
type File struct {
	FileID       string `json:"file_id"`
	FileUniqueID string `json:"file_unique_id"`
	FileSize     int64  `json:"file_size,omitempty"`
	FilePath     string `json:"file_path,omitempty"`
}

// WebhookInfo contains information about the current status of a webhook.
//
// Telegram API: https://core.telegram.org/bots/api#webhookinfo
type WebhookInfo struct {
	URL                          string   `json:"url"`
	HasCustomCertificate         bool     `json:"has_custom_certificate"`
	PendingUpdateCount           int      `json:"pending_update_count"`
	IPAddress                    string   `json:"ip_address,omitempty"`
	LastErrorDate                int64    `json:"last_error_date,omitempty"`
	LastErrorMessage             string   `json:"last_error_message,omitempty"`
	LastSynchronizationErrorDate int64    `json:"last_synchronization_error_date,omitempty"`
	MaxConnections               int      `json:"max_connections,omitempty"`
	AllowedUpdates               []string `json:"allowed_updates,omitempty"`
}
