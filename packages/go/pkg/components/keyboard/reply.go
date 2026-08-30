package keyboard

import "github.com/Nam088/telebot/packages/go/pkg/types"

// KeyboardButton represents one button of a custom reply keyboard.
//
// If none of the optional request flags are set, the button text is sent to
// the bot as a plain message when the button is pressed. At most one field
// other than Text, IconCustomEmojiID and Style may be set.
//
// Telegram API: https://core.telegram.org/bots/api#keyboardbutton
type KeyboardButton struct {
	// Text is the label shown on the button.
	Text string `json:"text"`
	// IconCustomEmojiID is the unique identifier of the custom emoji shown
	// before the button text.
	IconCustomEmojiID string `json:"icon_custom_emoji_id,omitempty"`
	// Style is the visual style of the button: "danger", "success" or
	// "primary". When empty, an app-specific style is used.
	Style string `json:"style,omitempty"`
	// RequestUsers, when set, opens a list of suitable users whose identifiers
	// are sent to the bot in a "users_shared" service message. Available in
	// private chats only.
	RequestUsers *types.KeyboardButtonRequestUsers `json:"request_users,omitempty"`
	// RequestChat, when set, opens a list of suitable chats whose identifier is
	// sent to the bot in a "chat_shared" service message. Available in private
	// chats only.
	RequestChat *types.KeyboardButtonRequestChat `json:"request_chat,omitempty"`
	// RequestManagedBot, when set, asks the user to create and share a bot
	// managed by the current bot. Available in private chats only to bots that
	// enabled bot management in the @BotFather Mini App.
	RequestManagedBot *types.KeyboardButtonRequestManagedBot `json:"request_managed_bot,omitempty"`
	// RequestContact, when true, sends the user's phone number as a contact
	// when the button is pressed. Available in private chats only.
	RequestContact bool `json:"request_contact,omitempty"`
	// RequestLocation, when true, sends the user's current location when the
	// button is pressed. Available in private chats only.
	RequestLocation bool `json:"request_location,omitempty"`
	// RequestPoll, when set, asks the user to create a poll and send it to the
	// bot when the button is pressed. Available in private chats only.
	RequestPoll *types.KeyboardButtonPollType `json:"request_poll,omitempty"`
	// WebApp, when set, launches the described Web App when the button is
	// pressed. Available in private chats only.
	WebApp *types.WebAppInfo `json:"web_app,omitempty"`
}

// ReplyKeyboardMarkup represents a custom keyboard with reply options that is
// displayed in place of the user's on-screen keyboard. Not supported in
// channels and for messages sent on behalf of a business account.
//
// Telegram API: https://core.telegram.org/bots/api#replykeyboardmarkup
type ReplyKeyboardMarkup struct {
	// Keyboard is the array of button rows, each represented as a slice of
	// KeyboardButton objects.
	Keyboard [][]KeyboardButton `json:"keyboard"`
	// IsPersistent requests clients to always show the keyboard when the
	// regular keyboard is hidden.
	IsPersistent bool `json:"is_persistent,omitempty"`
	// ResizeKeyboard requests clients to resize the keyboard vertically for
	// optimal fit instead of just making it smaller.
	ResizeKeyboard bool `json:"resize_keyboard,omitempty"`
	// OneTimeKeyboard requests clients to hide the keyboard as soon as it has
	// been used.
	OneTimeKeyboard bool `json:"one_time_keyboard,omitempty"`
	// InputFieldPlaceholder is the placeholder shown in the input field when
	// the keyboard is active; 1-64 characters.
	InputFieldPlaceholder string `json:"input_field_placeholder,omitempty"`
	// Selective limits the keyboard to users @mentioned in the message and to
	// the sender of the replied-to message.
	Selective bool `json:"selective,omitempty"`
	// ForceReply requests clients to show the reply interface to the user, as
	// if they had selected the bot's message and tapped "Reply".
	ForceReply bool `json:"force_reply,omitempty"`
}

// ReplyKeyboardRemove requests clients to remove the current custom keyboard
// and display the default letter-keyboard.
//
// Telegram API: https://core.telegram.org/bots/api#replykeyboardremove
type ReplyKeyboardRemove struct {
	// RemoveKeyboard must be true; the user will not be able to summon this
	// keyboard again.
	RemoveKeyboard bool `json:"remove_keyboard"`
	// Selective limits the removal to users @mentioned in the message and to
	// the sender of the replied-to message.
	Selective bool `json:"selective,omitempty"`
}

// ForceReply requests clients to display a reply interface to the user, as if
// they had selected the bot's message and tapped "Reply".
//
// Telegram API: https://core.telegram.org/bots/api#forcereply
type ForceReply struct {
	// ForceReply must be true to show the reply interface.
	ForceReply bool `json:"force_reply"`
	// InputFieldPlaceholder is the placeholder shown in the input field when
	// the reply is active; 1-64 characters.
	InputFieldPlaceholder string `json:"input_field_placeholder,omitempty"`
	// Selective limits the reply interface to users @mentioned in the message
	// and to the sender of the replied-to message.
	Selective bool `json:"selective,omitempty"`
}

// ReplyKeyboardOption mutates a ReplyKeyboard builder to configure how the
// resulting markup is presented to the client.
type ReplyKeyboardOption func(*ReplyKeyboard)

// WithResizeKeyboard requests clients to resize the keyboard vertically for
// optimal fit.
func WithResizeKeyboard() ReplyKeyboardOption {
	return func(k *ReplyKeyboard) {
		k.resizeKeyboard = true
	}
}

// WithOneTimeKeyboard requests clients to hide the keyboard as soon as it has
// been used.
func WithOneTimeKeyboard() ReplyKeyboardOption {
	return func(k *ReplyKeyboard) {
		k.oneTimeKeyboard = true
	}
}

// WithInputFieldPlaceholder sets the placeholder shown in the input field when
// the keyboard is active; 1-64 characters.
func WithInputFieldPlaceholder(placeholder string) ReplyKeyboardOption {
	return func(k *ReplyKeyboard) {
		k.inputFieldPlaceholder = placeholder
	}
}

// ReplyKeyboard is a fluent builder for constructing ReplyKeyboardMarkup values.
type ReplyKeyboard struct {
	rows                  [][]KeyboardButton
	resizeKeyboard        bool
	oneTimeKeyboard       bool
	inputFieldPlaceholder string
}

// NewReplyKeyboard creates a new empty reply keyboard builder.
//
// Example:
//
//	kb := keyboard.NewReplyKeyboard(
//	    keyboard.WithResizeKeyboard(),
//	    keyboard.WithOneTimeKeyboard(),
//	    keyboard.WithInputFieldPlaceholder("Pick one..."),
//	).
//	    AddButton("Option A").
//	    AddButton("Option B").
//	    AddRow().
//	    AddButton("Help").
//	    Build()
func NewReplyKeyboard(opts ...ReplyKeyboardOption) *ReplyKeyboard {
	k := &ReplyKeyboard{
		rows: make([][]KeyboardButton, 0),
	}
	for _, opt := range opts {
		opt(k)
	}
	return k
}

// AddRow starts a new row of buttons. Subsequent AddButton calls append to this
// row. Pre-built buttons may be passed to populate the row immediately.
func (k *ReplyKeyboard) AddRow(buttons ...KeyboardButton) *ReplyKeyboard {
	if len(buttons) > 0 {
		k.rows = append(k.rows, buttons)
	} else {
		k.rows = append(k.rows, []KeyboardButton{})
	}
	return k
}

// AddButton appends a plain text button to the current row. If no row exists
// yet, a first row is created implicitly.
//
// Parameters:
//   - text: Label shown on the button, sent to the bot as a message when pressed.
func (k *ReplyKeyboard) AddButton(text string) *ReplyKeyboard {
	btn := KeyboardButton{Text: text}
	if len(k.rows) == 0 {
		k.rows = append(k.rows, []KeyboardButton{btn})
	} else {
		lastIdx := len(k.rows) - 1
		k.rows[lastIdx] = append(k.rows[lastIdx], btn)
	}
	return k
}

// Build compiles the configured layout into a *ReplyKeyboardMarkup. Empty rows
// are dropped from the final keyboard.
func (k *ReplyKeyboard) Build() *ReplyKeyboardMarkup {
	rows := make([][]KeyboardButton, 0, len(k.rows))
	for _, row := range k.rows {
		if len(row) > 0 {
			rows = append(rows, row)
		}
	}
	return &ReplyKeyboardMarkup{
		Keyboard:              rows,
		ResizeKeyboard:        k.resizeKeyboard,
		OneTimeKeyboard:       k.oneTimeKeyboard,
		InputFieldPlaceholder: k.inputFieldPlaceholder,
	}
}
