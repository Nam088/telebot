package utils

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

// ErrInvalidToken is returned by ValidateToken when a bot token is empty or
// does not match the Telegram bot token format.
var ErrInvalidToken = errors.New("invalid bot token")

// tokenPattern matches the Telegram bot token format "<bot_id>:<secret>".
var tokenPattern = regexp.MustCompile(`^\d+:[A-Za-z0-9_-]+$`)

// defaultMaxAgeSeconds is the default maximum age accepted for Mini App
// initData authentication timestamps (24 hours).
const defaultMaxAgeSeconds = 86400

// maxClockSkewSeconds is how far in the future an auth_date may lie before
// it is rejected (5 minutes), to tolerate client clock skew.
const maxClockSkewSeconds = 300

// ValidateToken checks that token looks like a Telegram bot token of the
// form "<bot_id>:<secret>" (e.g. "123456:ABC-DEF..."). The literal
// "TEST_TOKEN" is always accepted for use in tests and examples. It returns
// an error wrapping ErrInvalidToken when the token is empty, blank, or
// malformed.
func ValidateToken(token string) error {
	if strings.TrimSpace(token) == "" {
		return fmt.Errorf("%w: token must be a non-empty string", ErrInvalidToken)
	}
	if token == "TEST_TOKEN" {
		return nil
	}
	if !tokenPattern.MatchString(token) {
		return fmt.Errorf(
			`%w: token must match the Telegram bot token format "<bot_id>:<secret>" (e.g. "123456:ABC-DEF...")`,
			ErrInvalidToken,
		)
	}
	return nil
}

// WebAppUser is a Telegram user as embedded in Mini App initData.
type WebAppUser struct {
	ID              int64  `json:"id"`
	IsBot           bool   `json:"is_bot,omitempty"`
	FirstName       string `json:"first_name"`
	LastName        string `json:"last_name,omitempty"`
	Username        string `json:"username,omitempty"`
	LanguageCode    string `json:"language_code,omitempty"`
	IsPremium       bool   `json:"is_premium,omitempty"`
	AllowsWriteToPM bool   `json:"allows_write_to_pm,omitempty"`
	PhotoURL        string `json:"photo_url,omitempty"`
}

// WebAppChat is a Telegram chat as embedded in Mini App initData.
type WebAppChat struct {
	ID       int64  `json:"id"`
	Type     string `json:"type"`
	Title    string `json:"title"`
	Username string `json:"username,omitempty"`
	PhotoURL string `json:"photo_url,omitempty"`
}

// WebAppData is the parsed representation of a Telegram Mini App initData
// query string.
//
// This is a framework helper for validated initData, not the Bot API object of
// the same name (Message.WebAppData in package types carries the payload a Web
// App button sent to the bot).
type WebAppData struct {
	// QueryID is the unique identifier of the Web App session.
	QueryID string
	// User is the current user, or nil when absent or unparseable.
	User *WebAppUser
	// Receiver is the user or bot the Web App was opened with in a direct
	// chat, or nil when absent or unparseable.
	Receiver *WebAppUser
	// Chat is the chat from which the Web App was opened, or nil when
	// absent or unparseable.
	Chat *WebAppChat
	// ChatType is the type of the chat from which the Web App was opened.
	ChatType string
	// ChatInstance is the global identifier of the chat instance.
	ChatInstance string
	// StartParam is the start parameter passed in the deep link.
	StartParam string
	// CanSendAfter is the number of seconds after which a message can be
	// sent via answerWebAppQuery; zero when absent.
	CanSendAfter int64
	// AuthDate is the Unix timestamp when the initData was generated.
	AuthDate int64
	// Hash is the signature used for integrity verification.
	Hash string
	// Raw holds every decoded key-value pair of the query string.
	Raw map[string]string
}

// ParseWebAppData parses a raw Telegram Mini App initData query string into
// a structured WebAppData object. JSON-encoded fields (user, receiver, chat)
// that fail to decode are left nil instead of failing the whole parse. It
// returns an error only when initData is not a valid URL-encoded query
// string.
func ParseWebAppData(initData string) (*WebAppData, error) {
	values, err := url.ParseQuery(initData)
	if err != nil {
		return nil, fmt.Errorf("invalid initData query string: %w", err)
	}

	data := &WebAppData{
		QueryID:      values.Get("query_id"),
		ChatType:     values.Get("chat_type"),
		ChatInstance: values.Get("chat_instance"),
		StartParam:   values.Get("start_param"),
		Hash:         values.Get("hash"),
		Raw:          make(map[string]string, len(values)),
	}
	for key, vals := range values {
		if len(vals) > 0 {
			data.Raw[key] = vals[len(vals)-1]
		}
	}

	if raw := values.Get("user"); raw != "" {
		var user WebAppUser
		if json.Unmarshal([]byte(raw), &user) == nil {
			data.User = &user
		}
	}
	if raw := values.Get("receiver"); raw != "" {
		var receiver WebAppUser
		if json.Unmarshal([]byte(raw), &receiver) == nil {
			data.Receiver = &receiver
		}
	}
	if raw := values.Get("chat"); raw != "" {
		var chat WebAppChat
		if json.Unmarshal([]byte(raw), &chat) == nil {
			data.Chat = &chat
		}
	}

	if raw := values.Get("auth_date"); raw != "" {
		if v, err := strconv.ParseInt(raw, 10, 64); err == nil {
			data.AuthDate = v
		}
	}
	if raw := values.Get("can_send_after"); raw != "" {
		if v, err := strconv.ParseInt(raw, 10, 64); err == nil {
			data.CanSendAfter = v
		}
	}

	return data, nil
}

// VerifyOption configures VerifyWebAppData.
type VerifyOption func(*verifyConfig)

type verifyConfig struct {
	maxAgeSeconds int64
}

// WithMaxAge sets the maximum allowed age of the initData auth_date in
// seconds. A value of zero or less disables the age check entirely.
// Defaults to 86400 (24 hours).
func WithMaxAge(seconds int64) VerifyOption {
	return func(c *verifyConfig) {
		c.maxAgeSeconds = seconds
	}
}

// VerifyWebAppData validates a Telegram Mini App initData signature using
// HMAC-SHA256 according to the official Telegram specification: the secret
// key is HMAC_SHA256("WebAppData", bot_token), and the expected hash is the
// hex-encoded HMAC_SHA256 of the alphabetically sorted, newline-joined
// key=value pairs (excluding the hash itself). It also rejects auth_date
// values older than maxAge (default 24 hours, see WithMaxAge) or more than
// 5 minutes in the future. It reports whether the data is authentic and
// fresh; any parse failure reports false.
func VerifyWebAppData(initData, botToken string, opts ...VerifyOption) bool {
	if initData == "" || botToken == "" {
		return false
	}

	cfg := verifyConfig{maxAgeSeconds: defaultMaxAgeSeconds}
	for _, opt := range opts {
		opt(&cfg)
	}

	values, err := url.ParseQuery(initData)
	if err != nil {
		return false
	}

	hash := values.Get("hash")
	if hash == "" {
		return false
	}

	authDateStr := values.Get("auth_date")
	if authDateStr == "" {
		return false
	}
	authDate, err := strconv.ParseInt(authDateStr, 10, 64)
	if err != nil {
		return false
	}

	if cfg.maxAgeSeconds > 0 {
		now := time.Now().Unix()
		// Disallow timestamps from too far in the future or too old.
		if authDate > now+maxClockSkewSeconds || now-authDate > cfg.maxAgeSeconds {
			return false
		}
	}

	// Sort parameter pairs alphabetically (excluding "hash").
	pairs := make([]string, 0, len(values))
	for key, vals := range values {
		if key == "hash" {
			continue
		}
		for _, val := range vals {
			pairs = append(pairs, key+"="+val)
		}
	}
	sort.Strings(pairs)
	dataCheckString := strings.Join(pairs, "\n")

	// secret_key = HMAC_SHA256("WebAppData", bot_token)
	secretKey := hmacSHA256([]byte("WebAppData"), []byte(botToken))
	calculatedHash := hex.EncodeToString(hmacSHA256(secretKey, []byte(dataCheckString)))

	if len(calculatedHash) != len(hash) {
		return false
	}
	got, err := hex.DecodeString(hash)
	if err != nil {
		return false
	}
	want, err := hex.DecodeString(calculatedHash)
	if err != nil {
		return false
	}
	return hmac.Equal(got, want)
}

// hmacSHA256 computes the HMAC-SHA256 of data under the given key.
func hmacSHA256(key, data []byte) []byte {
	mac := hmac.New(sha256.New, key)
	mac.Write(data)
	return mac.Sum(nil)
}
