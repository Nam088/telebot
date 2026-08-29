package filters_test

import (
	"regexp"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/filters"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestFilters(t *testing.T) {
	msgUpdate := &types.Update{
		Message: &types.Message{
			Text: "/help",
			Chat: &types.Chat{Type: "private"},
		},
	}

	if !filters.Text(msgUpdate) {
		t.Errorf("expected filters.Text to match")
	}

	if !filters.Command(msgUpdate) {
		t.Errorf("expected filters.Command to match")
	}

	if !filters.Private(msgUpdate) {
		t.Errorf("expected filters.Private to match")
	}

	combined := filters.And(filters.Text, filters.Private)
	if !combined(msgUpdate) {
		t.Errorf("expected combined AND filter to match")
	}

	notGroup := filters.Not(filters.Group)
	if !notGroup(msgUpdate) {
		t.Errorf("expected Not(Group) to match private chat")
	}
}

func TestAll(t *testing.T) {
	messageUpdate := &types.Update{Message: &types.Message{Text: "hi"}}
	if !filters.All(messageUpdate) {
		t.Error("expected All to match a plain message update")
	}

	edited := &types.Update{EditedMessage: &types.Message{Text: "edited"}}
	if !filters.All(edited) {
		t.Error("expected All to match an edited message update")
	}

	channelPost := &types.Update{ChannelPost: &types.Message{Text: "post"}}
	if !filters.All(channelPost) {
		t.Error("expected All to match a channel post update")
	}

	callback := &types.Update{CallbackQuery: &types.CallbackQuery{
		ID: "cb1", Message: &types.Message{Text: "via callback"},
	}}
	if !filters.All(callback) {
		t.Error("expected All to match a callback query carrying a message")
	}

	bareCallback := &types.Update{CallbackQuery: &types.CallbackQuery{ID: "cb2"}}
	if filters.All(bareCallback) {
		t.Error("expected All not to match a callback query without a message")
	}

	if filters.All(&types.Update{}) {
		t.Error("expected All not to match an empty update")
	}
}

func TestTextAndCommandNegatives(t *testing.T) {
	empty := &types.Update{}
	if filters.Text(empty) {
		t.Error("expected Text not to match an update without a message")
	}
	if filters.Command(empty) {
		t.Error("expected Command not to match an update without a message")
	}

	plain := &types.Update{Message: &types.Message{Text: "hello"}}
	if filters.Command(plain) {
		t.Error("expected Command not to match plain text")
	}

	photo := &types.Update{Message: &types.Message{Photo: []types.PhotoSize{{FileID: "p"}}}}
	if filters.Text(photo) {
		t.Error("expected Text not to match a photo message without text")
	}
}

func TestCallbackQuery(t *testing.T) {
	callback := &types.Update{CallbackQuery: &types.CallbackQuery{ID: "cb", Data: "x"}}
	if !filters.CallbackQuery(callback) {
		t.Error("expected CallbackQuery to match a callback query update")
	}
	if filters.CallbackQuery(&types.Update{Message: &types.Message{Text: "hi"}}) {
		t.Error("expected CallbackQuery not to match a message update")
	}
}

func TestPrivateAndGroup(t *testing.T) {
	cases := []struct {
		chatType    string
		wantPrivate bool
		wantGroup   bool
	}{
		{"private", true, false},
		{"group", false, true},
		{"supergroup", false, true},
		{"channel", false, false},
	}
	for _, tc := range cases {
		u := &types.Update{Message: &types.Message{Text: "hi", Chat: &types.Chat{Type: tc.chatType}}}
		if got := filters.Private(u); got != tc.wantPrivate {
			t.Errorf("Private(%q) = %v, want %v", tc.chatType, got, tc.wantPrivate)
		}
		if got := filters.Group(u); got != tc.wantGroup {
			t.Errorf("Group(%q) = %v, want %v", tc.chatType, got, tc.wantGroup)
		}
	}

	noChat := &types.Update{CallbackQuery: &types.CallbackQuery{ID: "cb"}}
	if filters.Private(noChat) || filters.Group(noChat) {
		t.Error("expected Private and Group not to match an update without a chat")
	}
}

func TestRegex(t *testing.T) {
	order := filters.Regex(regexp.MustCompile(`^order_(\d+)$`))

	textUpdate := &types.Update{Message: &types.Message{Text: "order_42"}}
	if !order(textUpdate) {
		t.Error("expected Regex to match the message text")
	}

	captionUpdate := &types.Update{Message: &types.Message{
		Caption: "order_7",
		Photo:   []types.PhotoSize{{FileID: "p"}},
	}}
	if !order(captionUpdate) {
		t.Error("expected Regex to fall back to the caption when text is empty")
	}

	noMatch := &types.Update{Message: &types.Message{Text: "refund_42"}}
	if order(noMatch) {
		t.Error("expected Regex not to match unrelated text")
	}

	if order(&types.Update{}) {
		t.Error("expected Regex not to match an update without a message")
	}
}

func TestRegexTextTakesPrecedenceOverCaption(t *testing.T) {
	f := filters.Regex(regexp.MustCompile(`^yes$`))
	u := &types.Update{Message: &types.Message{Text: "no", Caption: "yes"}}
	if f(u) {
		t.Error("expected Regex to test the text, not the caption, when text is present")
	}
}

func TestRegexNilPatternPanics(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Error("expected Regex(nil) to panic")
		}
	}()
	filters.Regex(nil)
}

func TestAnd(t *testing.T) {
	textPrivate := filters.And(filters.Text, filters.Private)

	match := &types.Update{Message: &types.Message{Text: "hi", Chat: &types.Chat{Type: "private"}}}
	if !textPrivate(match) {
		t.Error("expected And(Text, Private) to match a private text message")
	}

	groupText := &types.Update{Message: &types.Message{Text: "hi", Chat: &types.Chat{Type: "group"}}}
	if textPrivate(groupText) {
		t.Error("expected And(Text, Private) not to match a group message")
	}

	if !filters.And()(match) {
		t.Error("expected And() with no operands to match everything")
	}
}

func TestOr(t *testing.T) {
	textOrCallback := filters.Or(filters.Text, filters.CallbackQuery)

	msg := &types.Update{Message: &types.Message{Text: "hi"}}
	cb := &types.Update{CallbackQuery: &types.CallbackQuery{ID: "cb"}}
	neither := &types.Update{}

	if !textOrCallback(msg) || !textOrCallback(cb) {
		t.Error("expected Or(Text, CallbackQuery) to match either operand")
	}
	if textOrCallback(neither) {
		t.Error("expected Or(Text, CallbackQuery) not to match when no operand matches")
	}
	if filters.Or()(msg) {
		t.Error("expected Or() with no operands to match nothing")
	}
}

func TestNot(t *testing.T) {
	notText := filters.Not(filters.Text)
	if notText(&types.Update{Message: &types.Message{Text: "hi"}}) {
		t.Error("expected Not(Text) not to match a text message")
	}
	if !notText(&types.Update{Message: &types.Message{Photo: []types.PhotoSize{{FileID: "p"}}}}) {
		t.Error("expected Not(Text) to match a non-text message")
	}
}
