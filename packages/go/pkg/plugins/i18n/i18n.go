// Package i18n provides a built-in internationalization plugin for the
// telebot-go routing layer, demonstrating how third-party plugins extend the
// framework through middleware and the per-request context store.
package i18n

import (
	"strings"

	"github.com/Nam088/telebot/packages/go/pkg/routing"
)

// StoreKey is the per-request context store key under which the i18n Session
// is attached by the middleware.
const StoreKey = "telebot.i18n.session"

// Options configures the i18n plugin.
type Options struct {
	// DefaultLocale is the locale used when the user's preferred locale has
	// no translation table.
	DefaultLocale string

	// Locales holds translation tables keyed by locale code, then by message
	// key. Message templates may contain {placeholder} tokens that are
	// replaced by Session.T parameters.
	Locales map[string]map[string]string
}

// Session is the per-update translation session attached to the routing
// Context by the i18n middleware. Retrieve it with For.
type Session struct {
	// Locale is the locale code resolved for the current update.
	Locale string

	opts Options
}

// T translates a message key for the resolved locale, falling back to the
// default locale table, then to the key itself. {placeholder} tokens in the
// template are replaced by the corresponding params values.
//
// Parameters:
//   - key: Message key in the translation tables.
//   - params: Optional placeholder values; may be nil.
//
// Returns:
//   - string: The translated, interpolated message.
//
// Example:
//
//	text := session.T("hello", map[string]string{"name": "Nam"})
func (s *Session) T(key string, params map[string]string) string {
	text := key
	found := false

	if table, ok := s.opts.Locales[s.Locale]; ok {
		if v, ok := table[key]; ok {
			text, found = v, true
		}
	}
	if !found {
		if table, ok := s.opts.Locales[s.opts.DefaultLocale]; ok {
			if v, ok := table[key]; ok {
				text, found = v, true
			}
		}
	}

	for name, value := range params {
		text = strings.ReplaceAll(text, "{"+name+"}", value)
	}
	return text
}

// SetLocale switches the session to another locale for the remainder of the
// current update.
//
// Parameters:
//   - locale: Locale code to switch to.
//
// Returns:
//   - bool: True if the locale has a translation table and was applied.
//
// Example:
//
//	if session.SetLocale("vi") {
//	    reply = session.T("hello", nil)
//	}
func (s *Session) SetLocale(locale string) bool {
	if _, ok := s.opts.Locales[locale]; !ok {
		return false
	}
	s.Locale = locale
	return true
}

// New creates the i18n middleware plugin. For every update it resolves a
// locale (the sender's Telegram language_code when a matching table exists,
// otherwise Options.DefaultLocale), attaches a *Session to the per-request
// context store, and hands control to the next handler.
//
// Parameters:
//   - opts: Translation tables and locale configuration.
//
// Returns:
//   - routing.MiddlewareFunc: Middleware to register with Router.Use.
//
// Example:
//
//	router.Use(i18n.New(i18n.Options{
//	    DefaultLocale: "en",
//	    Locales: map[string]map[string]string{
//	        "en": {"hello": "Hello, {name}!"},
//	        "vi": {"hello": "Xin chào, {name}!"},
//	    },
//	}))
func New(opts Options) routing.MiddlewareFunc {
	return func(next routing.HandlerFunc) routing.HandlerFunc {
		return func(c *routing.Context) error {
			locale := opts.DefaultLocale
			if u := c.User(); u != nil && u.LanguageCode != "" {
				if _, ok := opts.Locales[u.LanguageCode]; ok {
					locale = u.LanguageCode
				}
			}
			c.Set(StoreKey, &Session{Locale: locale, opts: opts})
			return next(c)
		}
	}
}

// For retrieves the i18n session attached to a context by the New middleware.
//
// Parameters:
//   - c: Routing context of the current update.
//
// Returns:
//   - *Session: The translation session.
//   - bool: False if the i18n middleware is not installed on the router.
//
// Example:
//
//	if session, ok := i18n.For(c); ok {
//	    _, _ = c.Reply(session.T("hello", nil))
//	}
func For(c *routing.Context) (*Session, bool) {
	value, ok := c.Get(StoreKey)
	if !ok {
		return nil, false
	}
	s, ok := value.(*Session)
	return s, ok
}
