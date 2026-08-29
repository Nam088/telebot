package filters

import (
	"strings"

	"github.com/Nam088/telebot-go/pkg/types"
)

// Predicate is a filter function that tests incoming updates.
type Predicate func(u *types.Update) bool

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

// And combines multiple predicates with logical AND.
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

// Or combines multiple predicates with logical OR.
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
