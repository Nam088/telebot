package bot

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

const (
	// DefaultBaseURL is the production Telegram Bot API endpoint.
	DefaultBaseURL = "https://api.telegram.org"
	// DefaultTimeout is the default HTTP client timeout for Bot API requests.
	DefaultTimeout = 30 * time.Second
)

// ResponseHook observes every successful Bot API response.
//
// The result argument is the raw JSON of the envelope's `result` field;
// decode it with encoding/json when needed. Hooks run inline on the request
// path, so they must not block for long.
type ResponseHook func(method string, result json.RawMessage)

// ErrorHook observes every failed Bot API request right before the error is
// returned to the caller.
type ErrorHook func(method string, err error)

type responseHookEntry struct{ fn ResponseHook }
type errorHookEntry struct{ fn ErrorHook }

// Bot represents a Telegram Bot API HTTP client.
type Bot struct {
	token      string
	baseURL    string
	httpClient *http.Client
	maxRetries int

	hookMu        sync.RWMutex
	responseHooks []*responseHookEntry
	errorHooks    []*errorHookEntry
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

// OnResponse registers a hook invoked with every successful Bot API
// response. Hooks run in registration order. Plugins use it for logging,
// metrics, or caching.
//
// Parameters:
//   - h: Hook receiving the method name and the raw JSON result.
//
// Returns:
//   - func(): Calling the returned function unregisters the hook.
//
// Example:
//
//	off := b.OnResponse(func(method string, result json.RawMessage) {
//	    log.Printf("%s succeeded", method)
//	})
//	defer off()
func (b *Bot) OnResponse(h ResponseHook) func() {
	entry := &responseHookEntry{fn: h}
	b.hookMu.Lock()
	b.responseHooks = append(b.responseHooks, entry)
	b.hookMu.Unlock()
	return func() {
		b.hookMu.Lock()
		defer b.hookMu.Unlock()
		for i, e := range b.responseHooks {
			if e == entry {
				b.responseHooks = append(b.responseHooks[:i], b.responseHooks[i+1:]...)
				return
			}
		}
	}
}

// OnError registers a hook invoked with every failed Bot API request,
// including Telegram API errors (ok: false) and transport failures. Hooks
// run in registration order right before the error is returned.
//
// Parameters:
//   - h: Hook receiving the method name and the final error.
//
// Returns:
//   - func(): Calling the returned function unregisters the hook.
//
// Example:
//
//	off := b.OnError(func(method string, err error) {
//	    log.Printf("%s failed: %v", method, err)
//	})
//	defer off()
func (b *Bot) OnError(h ErrorHook) func() {
	entry := &errorHookEntry{fn: h}
	b.hookMu.Lock()
	b.errorHooks = append(b.errorHooks, entry)
	b.hookMu.Unlock()
	return func() {
		b.hookMu.Lock()
		defer b.hookMu.Unlock()
		for i, e := range b.errorHooks {
			if e == entry {
				b.errorHooks = append(b.errorHooks[:i], b.errorHooks[i+1:]...)
				return
			}
		}
	}
}

// Request executes a Telegram Bot API request with JSON payload and runs the
// registered response or error hooks depending on the outcome.
//
// Parameters:
//   - ctx: Context for cancellation/timeout propagation.
//   - method: Bot API method name (e.g. "sendMessage").
//   - payload: Request payload struct or map; nil for parameterless methods.
//   - result: Pointer to decode the envelope's `result` into; may be nil.
//
// Returns:
//   - error: Non-nil on transport failures or when Telegram returns ok:false.
func (b *Bot) Request(ctx context.Context, method string, payload any, result any) error {
	rawResult, err := b.doRequest(ctx, method, payload, result)
	if err != nil {
		b.hookMu.RLock()
		hooks := make([]*errorHookEntry, len(b.errorHooks))
		copy(hooks, b.errorHooks)
		b.hookMu.RUnlock()
		for _, e := range hooks {
			e.fn(method, err)
		}
		return err
	}
	b.hookMu.RLock()
	hooks := make([]*responseHookEntry, len(b.responseHooks))
	copy(hooks, b.responseHooks)
	b.hookMu.RUnlock()
	for _, e := range hooks {
		e.fn(method, rawResult)
	}
	return nil
}

// doRequest performs the HTTP round trip and decodes the envelope.
func (b *Bot) doRequest(ctx context.Context, method string, payload any, result any) (json.RawMessage, error) {
	var bodyReader io.Reader
	if payload != nil {
		bodyBytes, err := json.Marshal(payload)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request payload: %w", err)
		}
		bodyReader = bytes.NewReader(bodyBytes)
	}

	endpoint := fmt.Sprintf("%s/bot%s/%s", b.baseURL, b.token, method)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := b.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var raw types.Response[json.RawMessage]
	if err := json.Unmarshal(respBytes, &raw); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if !raw.Ok {
		return nil, &types.TelegramError{
			ErrorCode:   raw.ErrorCode,
			Description: raw.Description,
			Parameters:  raw.Parameters,
		}
	}

	if result != nil && len(raw.Result) > 0 {
		if err := json.Unmarshal(raw.Result, result); err != nil {
			return nil, fmt.Errorf("failed to unmarshal result: %w", err)
		}
	}

	return raw.Result, nil
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
