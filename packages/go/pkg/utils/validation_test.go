package utils_test

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/Nam088/telebot-go/pkg/utils"
)

const testBotToken = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"

func TestValidateToken(t *testing.T) {
	valid := []string{
		"123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
		"1:a",
		"TEST_TOKEN",
	}
	for _, token := range valid {
		if err := utils.ValidateToken(token); err != nil {
			t.Errorf("ValidateToken(%q) = %v, want nil", token, err)
		}
	}

	invalid := []string{
		"",
		"   ",
		"no-colon-here",
		"abc:secret",
		":secret",
		"123:",
		"123:bad$char",
		"123 :secret",
		"123:secret extra",
	}
	for _, token := range invalid {
		err := utils.ValidateToken(token)
		if err == nil {
			t.Errorf("ValidateToken(%q) = nil, want error", token)
			continue
		}
		if !errors.Is(err, utils.ErrInvalidToken) {
			t.Errorf("ValidateToken(%q) error %v does not wrap ErrInvalidToken", token, err)
		}
	}
}

// hmacSHA256 mirrors the HMAC construction used by the utils package so
// tests can sign their own initData payloads.
func hmacSHA256(key, data []byte) []byte {
	mac := hmac.New(sha256.New, key)
	mac.Write(data)
	return mac.Sum(nil)
}

// signInitData builds a URL-encoded initData query string from fields and
// signs it with the official Telegram HMAC-SHA256 scheme.
func signInitData(t *testing.T, botToken string, fields map[string]string) string {
	t.Helper()
	pairs := make([]string, 0, len(fields))
	for k, v := range fields {
		if k != "hash" {
			pairs = append(pairs, k+"="+v)
		}
	}
	sort.Strings(pairs)
	secret := hmacSHA256([]byte("WebAppData"), []byte(botToken))
	hash := hex.EncodeToString(hmacSHA256(secret, []byte(strings.Join(pairs, "\n"))))

	values := url.Values{}
	for k, v := range fields {
		values.Set(k, v)
	}
	values.Set("hash", hash)
	return values.Encode()
}

func TestVerifyWebAppData(t *testing.T) {
	now := time.Now().Unix()

	base := func() map[string]string {
		return map[string]string{
			"query_id":    "AAFxyz",
			"user":        `{"id":42,"first_name":"Alice","username":"alice","language_code":"en"}`,
			"auth_date":   itoa(now),
			"start_param": "promo",
		}
	}

	t.Run("valid", func(t *testing.T) {
		data := signInitData(t, testBotToken, base())
		if !utils.VerifyWebAppData(data, testBotToken) {
			t.Error("VerifyWebAppData(valid data) = false, want true")
		}
	})

	t.Run("tampered value", func(t *testing.T) {
		fields := base()
		data := signInitData(t, testBotToken, fields)
		values, err := url.ParseQuery(data)
		if err != nil {
			t.Fatal(err)
		}
		values.Set("user", `{"id":1337,"first_name":"Eve"}`)
		if utils.VerifyWebAppData(values.Encode(), testBotToken) {
			t.Error("VerifyWebAppData(tampered data) = true, want false")
		}
	})

	t.Run("wrong bot token", func(t *testing.T) {
		data := signInitData(t, testBotToken, base())
		if utils.VerifyWebAppData(data, "654321:WRONG-TOKEN") {
			t.Error("VerifyWebAppData(wrong token) = true, want false")
		}
	})

	t.Run("missing hash", func(t *testing.T) {
		values := url.Values{"auth_date": {itoa(now)}}
		if utils.VerifyWebAppData(values.Encode(), testBotToken) {
			t.Error("VerifyWebAppData(missing hash) = true, want false")
		}
	})

	t.Run("missing auth_date", func(t *testing.T) {
		data := signInitData(t, testBotToken, map[string]string{"query_id": "AAFxyz"})
		values, err := url.ParseQuery(data)
		if err != nil {
			t.Fatal(err)
		}
		values.Del("auth_date")
		if utils.VerifyWebAppData(values.Encode(), testBotToken) {
			t.Error("VerifyWebAppData(missing auth_date) = true, want false")
		}
	})

	t.Run("non-numeric auth_date", func(t *testing.T) {
		fields := base()
		fields["auth_date"] = "yesterday"
		data := signInitData(t, testBotToken, fields)
		if utils.VerifyWebAppData(data, testBotToken) {
			t.Error("VerifyWebAppData(bad auth_date) = true, want false")
		}
	})

	t.Run("expired auth_date", func(t *testing.T) {
		fields := base()
		fields["auth_date"] = itoa(now - 90000) // 25 hours ago
		data := signInitData(t, testBotToken, fields)
		if utils.VerifyWebAppData(data, testBotToken) {
			t.Error("VerifyWebAppData(expired) = true, want false")
		}
	})

	t.Run("expired auth_date with age check disabled", func(t *testing.T) {
		fields := base()
		fields["auth_date"] = itoa(now - 90000)
		data := signInitData(t, testBotToken, fields)
		if !utils.VerifyWebAppData(data, testBotToken, utils.WithMaxAge(0)) {
			t.Error("VerifyWebAppData(expired, WithMaxAge(0)) = false, want true")
		}
	})

	t.Run("custom max age", func(t *testing.T) {
		fields := base()
		fields["auth_date"] = itoa(now - 5000)
		data := signInitData(t, testBotToken, fields)
		if utils.VerifyWebAppData(data, testBotToken, utils.WithMaxAge(1000)) {
			t.Error("VerifyWebAppData(age 5000s, max 1000s) = true, want false")
		}
		if !utils.VerifyWebAppData(data, testBotToken, utils.WithMaxAge(10000)) {
			t.Error("VerifyWebAppData(age 5000s, max 10000s) = false, want true")
		}
	})

	t.Run("future auth_date beyond skew", func(t *testing.T) {
		fields := base()
		fields["auth_date"] = itoa(now + 301)
		data := signInitData(t, testBotToken, fields)
		if utils.VerifyWebAppData(data, testBotToken) {
			t.Error("VerifyWebAppData(future +301s) = true, want false")
		}
	})

	t.Run("future auth_date within skew", func(t *testing.T) {
		fields := base()
		fields["auth_date"] = itoa(now + 200)
		data := signInitData(t, testBotToken, fields)
		if !utils.VerifyWebAppData(data, testBotToken) {
			t.Error("VerifyWebAppData(future +200s) = false, want true")
		}
	})

	t.Run("empty inputs", func(t *testing.T) {
		if utils.VerifyWebAppData("", testBotToken) {
			t.Error("VerifyWebAppData(empty initData) = true, want false")
		}
		if utils.VerifyWebAppData("auth_date=1&hash=abc", "") {
			t.Error("VerifyWebAppData(empty token) = true, want false")
		}
	})

	t.Run("malformed query string", func(t *testing.T) {
		if utils.VerifyWebAppData("%zz", testBotToken) {
			t.Error("VerifyWebAppData(malformed query) = true, want false")
		}
	})

	t.Run("non-hex hash of valid length", func(t *testing.T) {
		fields := base()
		data := signInitData(t, testBotToken, fields)
		values, err := url.ParseQuery(data)
		if err != nil {
			t.Fatal(err)
		}
		values.Set("hash", strings.Repeat("z", 64))
		if utils.VerifyWebAppData(values.Encode(), testBotToken) {
			t.Error("VerifyWebAppData(non-hex hash) = true, want false")
		}
	})

	t.Run("short hash", func(t *testing.T) {
		fields := base()
		data := signInitData(t, testBotToken, fields)
		values, err := url.ParseQuery(data)
		if err != nil {
			t.Fatal(err)
		}
		values.Set("hash", "abc")
		if utils.VerifyWebAppData(values.Encode(), testBotToken) {
			t.Error("VerifyWebAppData(short hash) = true, want false")
		}
	})
}

func TestParseWebAppData(t *testing.T) {
	now := time.Now().Unix()
	fields := map[string]string{
		"query_id":       "AAFxyz",
		"user":           `{"id":42,"first_name":"Alice","last_name":"Liddell","username":"alice","language_code":"en","is_premium":true,"allows_write_to_pm":true,"photo_url":"https://example.com/a.png"}`,
		"receiver":       `{"id":7,"first_name":"Bot","is_bot":true}`,
		"chat":           `{"id":-100123,"type":"supergroup","title":"Go Devs","username":"godevs","photo_url":"https://example.com/c.png"}`,
		"chat_type":      "supergroup",
		"chat_instance":  "-100",
		"start_param":    "promo",
		"can_send_after": "30",
		"auth_date":      itoa(now),
	}
	data := signInitData(t, testBotToken, fields)

	got, err := utils.ParseWebAppData(data)
	if err != nil {
		t.Fatalf("ParseWebAppData returned error: %v", err)
	}

	if got.QueryID != "AAFxyz" {
		t.Errorf("QueryID = %q, want AAFxyz", got.QueryID)
	}
	if got.User == nil || got.User.ID != 42 || got.User.FirstName != "Alice" ||
		got.User.LastName != "Liddell" || got.User.Username != "alice" ||
		got.User.LanguageCode != "en" || !got.User.IsPremium || !got.User.AllowsWriteToPM ||
		got.User.PhotoURL != "https://example.com/a.png" {
		t.Errorf("User parsed incorrectly: %+v", got.User)
	}
	if got.Receiver == nil || got.Receiver.ID != 7 || !got.Receiver.IsBot {
		t.Errorf("Receiver parsed incorrectly: %+v", got.Receiver)
	}
	if got.Chat == nil || got.Chat.ID != -100123 || got.Chat.Type != "supergroup" ||
		got.Chat.Title != "Go Devs" || got.Chat.Username != "godevs" ||
		got.Chat.PhotoURL != "https://example.com/c.png" {
		t.Errorf("Chat parsed incorrectly: %+v", got.Chat)
	}
	if got.ChatType != "supergroup" {
		t.Errorf("ChatType = %q, want supergroup", got.ChatType)
	}
	if got.ChatInstance != "-100" {
		t.Errorf("ChatInstance = %q, want -100", got.ChatInstance)
	}
	if got.StartParam != "promo" {
		t.Errorf("StartParam = %q, want promo", got.StartParam)
	}
	if got.CanSendAfter != 30 {
		t.Errorf("CanSendAfter = %d, want 30", got.CanSendAfter)
	}
	if got.AuthDate != now {
		t.Errorf("AuthDate = %d, want %d", got.AuthDate, now)
	}
	if got.Hash == "" {
		t.Error("Hash is empty, want non-empty signature")
	}
	if got.Raw["user"] != fields["user"] {
		t.Errorf("Raw[user] = %q, want %q", got.Raw["user"], fields["user"])
	}
}

func TestParseWebAppDataEdgeCases(t *testing.T) {
	t.Run("empty string", func(t *testing.T) {
		got, err := utils.ParseWebAppData("")
		if err != nil {
			t.Fatalf("ParseWebAppData(\"\") returned error: %v", err)
		}
		if got.AuthDate != 0 || got.User != nil || len(got.Raw) != 0 {
			t.Errorf("expected zero-value result, got %+v", got)
		}
	})

	t.Run("invalid json fields are nil", func(t *testing.T) {
		got, err := utils.ParseWebAppData("user=%7Bnot-json&receiver=%5B&chat=x")
		if err != nil {
			t.Fatalf("ParseWebAppData returned error: %v", err)
		}
		if got.User != nil || got.Receiver != nil || got.Chat != nil {
			t.Errorf("expected nil User/Receiver/Chat, got %+v", got)
		}
	})

	t.Run("non-numeric numbers default to zero", func(t *testing.T) {
		got, err := utils.ParseWebAppData("auth_date=abc&can_send_after=def")
		if err != nil {
			t.Fatalf("ParseWebAppData returned error: %v", err)
		}
		if got.AuthDate != 0 || got.CanSendAfter != 0 {
			t.Errorf("AuthDate = %d, CanSendAfter = %d, want both 0", got.AuthDate, got.CanSendAfter)
		}
	})

	t.Run("malformed query string", func(t *testing.T) {
		if _, err := utils.ParseWebAppData("%zz"); err == nil {
			t.Error("ParseWebAppData(malformed) = nil error, want error")
		}
	})
}

// itoa formats an int64 for building auth_date fields in test payloads.
func itoa(v int64) string {
	return strconv.FormatInt(v, 10)
}
