package i18n

import (
	"context"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/routing"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func testOptions() Options {
	return Options{
		DefaultLocale: "en",
		Locales: map[string]map[string]string{
			"en": {"hello": "Hello, {name}!", "bye": "Goodbye"},
			"vi": {"hello": "Xin chào, {name}!"},
		},
	}
}

func newContextWithLocale(locale string) *routing.Context {
	u := &types.Update{
		Message: &types.Message{Text: "hi"},
	}
	if locale != "" {
		u.Message.From = &types.User{ID: 1, LanguageCode: locale}
	}
	return routing.NewContext(context.Background(), nil, u)
}

func runMiddleware(t *testing.T, opts Options, locale string, handler routing.HandlerFunc) *routing.Context {
	t.Helper()
	c := newContextWithLocale(locale)
	wrapped := New(opts)(handler)
	if err := wrapped(c); err != nil {
		t.Fatalf("middleware returned error: %v", err)
	}
	return c
}

func TestLocaleResolvedFromLanguageCode(t *testing.T) {
	var got string
	runMiddleware(t, testOptions(), "vi", func(c *routing.Context) error {
		session, ok := For(c)
		if !ok {
			t.Fatal("expected session to be attached")
		}
		got = session.Locale
		return nil
	})
	if got != "vi" {
		t.Fatalf("expected locale vi, got %q", got)
	}
}

func TestLocaleFallsBackToDefault(t *testing.T) {
	var got string
	runMiddleware(t, testOptions(), "fr", func(c *routing.Context) error {
		session, _ := For(c)
		got = session.Locale
		return nil
	})
	if got != "en" {
		t.Fatalf("expected locale en, got %q", got)
	}
}

func TestLocaleFallsBackWhenUserMissing(t *testing.T) {
	var got string
	runMiddleware(t, testOptions(), "", func(c *routing.Context) error {
		session, _ := For(c)
		got = session.Locale
		return nil
	})
	if got != "en" {
		t.Fatalf("expected locale en, got %q", got)
	}
}

func TestTranslateFallsBackAcrossTables(t *testing.T) {
	runMiddleware(t, testOptions(), "vi", func(c *routing.Context) error {
		session, _ := For(c)
		if got := session.T("bye", nil); got != "Goodbye" {
			t.Fatalf("expected default-table fallback, got %q", got)
		}
		if got := session.T("missing", nil); got != "missing" {
			t.Fatalf("expected key itself, got %q", got)
		}
		return nil
	})
}

func TestTranslateInterpolatesParams(t *testing.T) {
	runMiddleware(t, testOptions(), "vi", func(c *routing.Context) error {
		session, _ := For(c)
		got := session.T("hello", map[string]string{"name": "Nam"})
		if got != "Xin chào, Nam!" {
			t.Fatalf("unexpected translation: %q", got)
		}
		return nil
	})
}

func TestSetLocaleSwitchesTable(t *testing.T) {
	runMiddleware(t, testOptions(), "en", func(c *routing.Context) error {
		session, _ := For(c)
		if !session.SetLocale("vi") {
			t.Fatal("expected SetLocale(vi) to succeed")
		}
		if got := session.T("hello", map[string]string{"name": "Nam"}); got != "Xin chào, Nam!" {
			t.Fatalf("unexpected translation after switch: %q", got)
		}
		if session.SetLocale("de") {
			t.Fatal("expected SetLocale(de) to fail for unknown locale")
		}
		if session.Locale != "vi" {
			t.Fatalf("locale should stay vi after failed switch, got %q", session.Locale)
		}
		return nil
	})
}

func TestForWithoutMiddleware(t *testing.T) {
	c := newContextWithLocale("vi")
	if _, ok := For(c); ok {
		t.Fatal("expected ok=false when middleware is not installed")
	}
}
