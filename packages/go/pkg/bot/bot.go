package bot

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/Nam088/telebot-go/pkg/types"
)

const (
	// DefaultBaseURL is the production Telegram Bot API endpoint.
	DefaultBaseURL = "https://api.telegram.org"
	// DefaultTimeout is the default HTTP client timeout for Bot API requests.
	DefaultTimeout = 30 * time.Second
)

// Bot represents a Telegram Bot API HTTP client.
type Bot struct {
	token      string
	baseURL    string
	httpClient *http.Client
	maxRetries int
}

// Option configures a Bot instance.
type Option func(*Bot)

// WithBaseURL overrides the Telegram Bot API endpoint URL.
func WithBaseURL(url string) Option {
	return func(b *Bot) {
		b.baseURL = url
	}
}

// WithHTTPClient overrides the underlying HTTP client.
func WithHTTPClient(client *http.Client) Option {
	return func(b *Bot) {
		b.httpClient = client
	}
}

// WithMaxRetries sets the maximum number of network/429 retry attempts.
func WithMaxRetries(retries int) Option {
	return func(b *Bot) {
		b.maxRetries = retries
	}
}

// NewBot constructs a new Bot client.
func NewBot(token string, opts ...Option) *Bot {
	b := &Bot{
		token:      token,
		baseURL:    DefaultBaseURL,
		httpClient: &http.Client{Timeout: DefaultTimeout},
		maxRetries: 3,
	}
	for _, opt := range opts {
		opt(b)
	}
	return b
}

// Token returns the bot token.
func (b *Bot) Token() string {
	return b.token
}

// Request executes a Telegram Bot API request with JSON payload.
func (b *Bot) Request(ctx context.Context, method string, payload any, result any) error {
	var bodyReader io.Reader
	if payload != nil {
		bodyBytes, err := json.Marshal(payload)
		if err != nil {
			return fmt.Errorf("failed to marshal request payload: %w", err)
		}
		bodyReader = bytes.NewReader(bodyBytes)
	}

	endpoint := fmt.Sprintf("%s/bot%s/%s", b.baseURL, b.token, method)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bodyReader)
	if err != nil {
		return fmt.Errorf("failed to create http request: %w", err)
	}
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := b.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	var raw types.Response[json.RawMessage]
	if err := json.Unmarshal(respBytes, &raw); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}

	if !raw.Ok {
		return &types.TelegramError{
			ErrorCode:   raw.ErrorCode,
			Description: raw.Description,
			Parameters:  raw.Parameters,
		}
	}

	if result != nil && len(raw.Result) > 0 {
		if err := json.Unmarshal(raw.Result, result); err != nil {
			return fmt.Errorf("failed to unmarshal result: %w", err)
		}
	}

	return nil
}

// GetMe returns basic information about the bot.
func (b *Bot) GetMe(ctx context.Context) (*types.User, error) {
	var user types.User
	if err := b.Request(ctx, "getMe", nil, &user); err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUpdates fetches incoming updates using long polling.
func (b *Bot) GetUpdates(ctx context.Context, opts *types.GetUpdatesOptions) ([]types.Update, error) {
	var updates []types.Update
	if err := b.Request(ctx, "getUpdates", opts, &updates); err != nil {
		return nil, err
	}
	return updates, nil
}

// SendMessage sends a text message to a chat.
func (b *Bot) SendMessage(ctx context.Context, opts *types.SendMessageOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendMessage", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// AnswerCallbackQuery sends answers to callback queries.
func (b *Bot) AnswerCallbackQuery(ctx context.Context, opts *types.AnswerCallbackQueryOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "answerCallbackQuery", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeleteMessage deletes a message in a chat.
func (b *Bot) DeleteMessage(ctx context.Context, chatID any, messageID int64) (bool, error) {
	payload := map[string]any{
		"chat_id":    chatID,
		"message_id": messageID,
	}
	var ok bool
	if err := b.Request(ctx, "deleteMessage", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
