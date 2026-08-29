package keyboard

// KeyboardButton represents one button of a custom reply keyboard.
//
// If none of the optional request flags are set, the button text is sent to
// the bot as a plain message when the button is pressed.
type KeyboardButton struct {
	// Text is the label shown on the button.
	Text string `json:"text"`
	// RequestContact, when true, sends the user's phone number as a contact
	// when the button is pressed. Available in private chats only.
	RequestContact bool `json:"request_contact,omitempty"`
	// RequestLocation, when true, sends the user's current location when the
	// button is pressed. Available in private chats only.
	RequestLocation bool `json:"request_location,omitempty"`
}

// ReplyKeyboardMarkup represents a custom keyboard with reply options that is
// displayed in place of the user's on-screen keyboard.
type ReplyKeyboardMarkup struct {
	// Keyboard is the array of button rows, each represented as a slice of
	// KeyboardButton objects.
	Keyboard [][]KeyboardButton `json:"keyboard"`
	// ResizeKeyboard requests clients to resize the keyboard vertically for
	// optimal fit instead of just making it smaller.
	ResizeKeyboard bool `json:"resize_keyboard,omitempty"`
	// OneTimeKeyboard requests clients to hide the keyboard as soon as it has
	// been used.
	OneTimeKeyboard bool `json:"one_time_keyboard,omitempty"`
	// InputFieldPlaceholder is the placeholder shown in the input field when
	// the keyboard is active; 1-64 characters.
	InputFieldPlaceholder string `json:"input_field_placeholder,omitempty"`
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
