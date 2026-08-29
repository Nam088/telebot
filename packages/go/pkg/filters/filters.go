// Package filters provides predicates for routing incoming Telegram updates,
// mirroring the Node framework's filters module.
//
// Every filter is a plain Predicate function that tests an incoming
// *types.Update, so filters compose with the And, Or and Not combinators:
//
//	photoInPrivate := filters.And(filters.Photo, filters.Private)
//	notCommand := filters.Not(filters.Command)
package filters

import (
	"regexp"
	"strings"

	"github.com/Nam088/telebot-go/pkg/types"
)

// Predicate is a filter function that tests incoming updates.
type Predicate func(u *types.Update) bool

// messagePredicate lifts a message-level test into a Predicate. Updates
// without an effective message never match, mirroring the Node MessageFilter.
func messagePredicate(test func(msg *types.Message) bool) Predicate {
	return func(u *types.Update) bool {
		msg := u.EffectiveMessage()
		return msg != nil && test(msg)
	}
}

// All matches any update that carries a message, including edited messages,
// channel posts and messages attached to callback queries.
func All(u *types.Update) bool {
	return u.EffectiveMessage() != nil
}

// Text matches any update with a non-empty message text.
func Text(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Text != ""
}

// Command matches updates starting with a slash command.
func Command(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && strings.HasPrefix(msg.Text, "/")
}

// CallbackQuery matches incoming callback queries.
func CallbackQuery(u *types.Update) bool {
	return u.CallbackQuery != nil
}

// Regex returns a Predicate that matches the message text, or the caption
// when the message has no text, against the compiled regular expression re.
// It panics if re is nil.
func Regex(re *regexp.Regexp) Predicate {
	if re == nil {
		panic("filters.Regex: pattern must not be nil")
	}
	return func(u *types.Update) bool {
		msg := u.EffectiveMessage()
		if msg == nil {
			return false
		}
		text := msg.Text
		if text == "" {
			text = msg.Caption
		}
		return re.MatchString(text)
	}
}

// Private matches updates from private (1-on-1) chats.
func Private(u *types.Update) bool {
	chat := u.EffectiveChat()
	return chat != nil && chat.Type == "private"
}

// Group matches updates from group or supergroup chats.
func Group(u *types.Update) bool {
	chat := u.EffectiveChat()
	return chat != nil && (chat.Type == "group" || chat.Type == "supergroup")
}

// And combines multiple predicates with logical AND. With no predicates it
// matches every update.
func And(predicates ...Predicate) Predicate {
	return func(u *types.Update) bool {
		for _, p := range predicates {
			if !p(u) {
				return false
			}
		}
		return true
	}
}

// Or combines multiple predicates with logical OR. With no predicates it
// matches no update.
func Or(predicates ...Predicate) Predicate {
	return func(u *types.Update) bool {
		for _, p := range predicates {
			if p(u) {
				return true
			}
		}
		return false
	}
}

// Not negates a predicate.
func Not(p Predicate) Predicate {
	return func(u *types.Update) bool {
		return !p(u)
	}
}
