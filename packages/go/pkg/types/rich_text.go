package types

// RichText models Telegram's RichText union: either a plain string for
// unformatted text, a single rich text entity (any of the RichText* structs in
// this file), or a []RichText of those two shapes.
//
// Docs spell it out as "either a String for plain text, an Array of RichText,
// or any of the following types", so no single Go type covers all three
// shapes; RichText is the escape hatch that keeps the wire format exact. Use
// RichTextEntity below to accept only the entity branch.
//
// Example:
//
//	var plain types.RichText = "Hello"
//	var entity types.RichText = types.RichTextBold{Type: "bold", Text: "world"}
//	var mixed types.RichText = []types.RichText{plain, entity}
//
// Telegram API: https://core.telegram.org/bots/api#richtext
type RichText any

// RichTextEntity is the interface implemented by every concrete RichText*
// variant in this file, so a handler can accept any entity regardless of
// format and still be type-checked, e.g.
//
//	var bold types.RichTextEntity = types.RichTextBold{Type: "bold", Text: "hi"}
//
// The concrete struct's Type field carries the wire discriminator documented
// on each variant.
//
// Telegram API: https://core.telegram.org/bots/api#richtext
type RichTextEntity interface {
	richTextEntity()
}

// RichTextAnchor represents an anchor.
//
// Telegram API: https://core.telegram.org/bots/api#richtextanchor
type RichTextAnchor struct {
	// Type of the rich text, always "anchor".
	Type string `json:"type"`
	// The name of the anchor.
	Name string `json:"name"`
}

func (RichTextAnchor) richTextEntity() {}

// RichTextAnchorLink represents a link to an anchor.
//
// Telegram API: https://core.telegram.org/bots/api#richtextanchorlink
type RichTextAnchorLink struct {
	// Type of the rich text, always "anchor_link".
	Type string `json:"type"`
	// The link text.
	Text RichText `json:"text"`
	// The name of the anchor. If the name is empty, then the link brings back to the top of the message.
	AnchorName string `json:"anchor_name"`
}

func (RichTextAnchorLink) richTextEntity() {}

// RichTextBankCardNumber represents a text with a bank card number.
//
// Telegram API: https://core.telegram.org/bots/api#richtextbankcardnumber
type RichTextBankCardNumber struct {
	// Type of the rich text, always "bank_card_number".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
	// The bank card number.
	BankCardNumber string `json:"bank_card_number"`
}

func (RichTextBankCardNumber) richTextEntity() {}

// RichTextBold represents a bold text.
//
// Telegram API: https://core.telegram.org/bots/api#richtextbold
type RichTextBold struct {
	// Type of the rich text, always "bold".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
}

func (RichTextBold) richTextEntity() {}

// RichTextBotCommand represents a bot command.
//
// Telegram API: https://core.telegram.org/bots/api#richtextbotcommand
type RichTextBotCommand struct {
	// Type of the rich text, always "bot_command".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
	// The bot command.
	BotCommand string `json:"bot_command"`
}

func (RichTextBotCommand) richTextEntity() {}

// RichTextButton represents a button.
//
// Telegram API: https://core.telegram.org/bots/api#richtextbutton
type RichTextButton struct {
	// Type of the rich text, always "button".
	Type string `json:"type"`
	// The button.
	Button RichMessageButton `json:"button"`
}

func (RichTextButton) richTextEntity() {}

// RichTextCashtag represents a cashtag.
//
// Telegram API: https://core.telegram.org/bots/api#richtextcashtag
type RichTextCashtag struct {
	// Type of the rich text, always "cashtag".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
	// The cashtag.
	Cashtag string `json:"cashtag"`
}

func (RichTextCashtag) richTextEntity() {}

// RichTextCode represents a monowidth text.
//
// Telegram API: https://core.telegram.org/bots/api#richtextcode
type RichTextCode struct {
	// Type of the rich text, always "code".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
}

func (RichTextCode) richTextEntity() {}

// RichTextCustomEmoji represents a custom emoji.
//
// Telegram API: https://core.telegram.org/bots/api#richtextcustomemoji
type RichTextCustomEmoji struct {
	// Type of the rich text, always "custom_emoji".
	Type string `json:"type"`
	// Unique identifier of the custom emoji. Use getCustomEmojiStickers to get full information about the sticker.
	CustomEmojiID string `json:"custom_emoji_id"`
	// Alternative emoji for the custom emoji.
	AlternativeText string `json:"alternative_text"`
}

func (RichTextCustomEmoji) richTextEntity() {}

// RichTextDateTime represents formatted date and time.
//
// Telegram API: https://core.telegram.org/bots/api#richtextdatetime
type RichTextDateTime struct {
	// Type of the rich text, always "date_time".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
	// The Unix time associated with the entity.
	UnixTime int64 `json:"unix_time"`
	// The string that defines the formatting of the date and time. See date-time entity formatting for more details.
	DateTimeFormat string `json:"date_time_format"`
}

func (RichTextDateTime) richTextEntity() {}

// RichTextEmailAddress represents a text with an email address.
//
// Telegram API: https://core.telegram.org/bots/api#richtextemailaddress
type RichTextEmailAddress struct {
	// Type of the rich text, always "email_address".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
	// The email address.
	EmailAddress string `json:"email_address"`
}

func (RichTextEmailAddress) richTextEntity() {}

// RichTextHashtag represents a hashtag.
//
// Telegram API: https://core.telegram.org/bots/api#richtexthashtag
type RichTextHashtag struct {
	// Type of the rich text, always "hashtag".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
	// The hashtag.
	Hashtag string `json:"hashtag"`
}

func (RichTextHashtag) richTextEntity() {}

// RichTextItalic represents an italicized text.
//
// Telegram API: https://core.telegram.org/bots/api#richtextitalic
type RichTextItalic struct {
	// Type of the rich text, always "italic".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
}

func (RichTextItalic) richTextEntity() {}

// RichTextMarked represents a marked text.
//
// Telegram API: https://core.telegram.org/bots/api#richtextmarked
type RichTextMarked struct {
	// Type of the rich text, always "marked".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
}

func (RichTextMarked) richTextEntity() {}

// RichTextMathematicalExpression represents a mathematical expression.
//
// Telegram API: https://core.telegram.org/bots/api#richtextmathematicalexpression
type RichTextMathematicalExpression struct {
	// Type of the rich text, always "mathematical_expression".
	Type string `json:"type"`
	// The expression in LaTeX format.
	Expression string `json:"expression"`
}

func (RichTextMathematicalExpression) richTextEntity() {}

// RichTextMention represents a mention by a username.
//
// Telegram API: https://core.telegram.org/bots/api#richtextmention
type RichTextMention struct {
	// Type of the rich text, always "mention".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
	// The username.
	Username string `json:"username"`
}

func (RichTextMention) richTextEntity() {}

// RichTextPhoneNumber represents a text with a phone number.
//
// Telegram API: https://core.telegram.org/bots/api#richtextphonenumber
type RichTextPhoneNumber struct {
	// Type of the rich text, always "phone_number".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
	// The phone number.
	PhoneNumber string `json:"phone_number"`
}

func (RichTextPhoneNumber) richTextEntity() {}

// RichTextReference represents a reference.
//
// Telegram API: https://core.telegram.org/bots/api#richtextreference
type RichTextReference struct {
	// Type of the rich text, always "reference".
	Type string `json:"type"`
	// Text of the reference.
	Text RichText `json:"text"`
	// The name of the reference.
	Name string `json:"name"`
}

func (RichTextReference) richTextEntity() {}

// RichTextReferenceLink represents a link to a reference.
//
// Telegram API: https://core.telegram.org/bots/api#richtextreferencelink
type RichTextReferenceLink struct {
	// Type of the rich text, always "reference_link".
	Type string `json:"type"`
	// The link text.
	Text RichText `json:"text"`
	// The name of the reference.
	ReferenceName string `json:"reference_name"`
}

func (RichTextReferenceLink) richTextEntity() {}

// RichTextSpoiler represents a text covered by a spoiler.
//
// Telegram API: https://core.telegram.org/bots/api#richtextspoiler
type RichTextSpoiler struct {
	// Type of the rich text, always "spoiler".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
}

func (RichTextSpoiler) richTextEntity() {}

// RichTextStrikethrough represents a strikethrough text.
//
// Telegram API: https://core.telegram.org/bots/api#richtextstrikethrough
type RichTextStrikethrough struct {
	// Type of the rich text, always "strikethrough".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
}

func (RichTextStrikethrough) richTextEntity() {}

// RichTextSubscript represents a subscript text.
//
// Telegram API: https://core.telegram.org/bots/api#richtextsubscript
type RichTextSubscript struct {
	// Type of the rich text, always "subscript".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
}

func (RichTextSubscript) richTextEntity() {}

// RichTextSuperscript represents a superscript text.
//
// Telegram API: https://core.telegram.org/bots/api#richtextsuperscript
type RichTextSuperscript struct {
	// Type of the rich text, always "superscript".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
}

func (RichTextSuperscript) richTextEntity() {}

// RichTextTextMention represents a mention of a Telegram user by their identifier.
//
// Telegram API: https://core.telegram.org/bots/api#richtexttextmention
type RichTextTextMention struct {
	// Type of the rich text, always "text_mention".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
	// The mentioned user.
	User User `json:"user"`
}

func (RichTextTextMention) richTextEntity() {}

// RichTextUnderline represents an underlined text.
//
// Telegram API: https://core.telegram.org/bots/api#richtextunderline
type RichTextUnderline struct {
	// Type of the rich text, always "underline".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
}

func (RichTextUnderline) richTextEntity() {}

// RichTextUrl represents a text with a link.
//
// Telegram API: https://core.telegram.org/bots/api#richtexturl
type RichTextUrl struct {
	// Type of the rich text, always "url".
	Type string `json:"type"`
	// The text.
	Text RichText `json:"text"`
	// URL of the link.
	URL string `json:"url"`
}

func (RichTextUrl) richTextEntity() {}

// RichMessageButton represents a button in a RichMessage. Exactly one of the fields other than text and style must be used to specify the type of the button.
//
// Telegram API: https://core.telegram.org/bots/api#richmessagebutton
type RichMessageButton struct {
	// Text of the button. May contain only plain text, RichTextCustomEmoji and RichTextDateTime entities.
	Text RichText `json:"text"`
	// Style of the button. Must be one of "danger", "success", "primary", or "link" (the button is shown as a regular link without borders). Apps may use theme-specific colors for the button background and text based on the style. See the official docs for the full note.
	Style *string `json:"style,omitempty"`
	// HTTP or tg:// URL to be opened when the button is pressed. Links tg://user?id=<user_id> can be used to mention a user by their identifier without using a username, if this is allowed by their privacy settings.
	URL *string `json:"url,omitempty"`
	// Data to be sent in a callback query to the bot when the button is pressed, 1-64 bytes.
	CallbackData *string `json:"callback_data,omitempty"`
	// Description of the Web App that will be launched when the user presses the button. The Web App will be able to send an arbitrary message on behalf of the user using the method answerWebAppQuery. See the official docs for the full note.
	WebApp *WebAppInfo `json:"web_app,omitempty"`
	// An HTTPS URL used to automatically authorize the user. Can be used as a replacement for the Telegram Login Widget. Not supported for ephemeral messages. Telegram types this field as LoginUrl; pass a LoginUrl value. Go leaves this untyped because the LoginUrl model is not part of the rich-message types in this package.
	LoginURL any `json:"login_url,omitempty"`
	// If set, pressing the button will prompt the user to select one of their chats, open that chat and insert the bot's username and the specified inline query in the input field. See the official docs for the full note.
	SwitchInlineQuery *string `json:"switch_inline_query,omitempty"`
	// If set, pressing the button will insert the bot's username and the specified inline query in the current chat's input field. May be empty, in which case only the bot's username will be inserted. See the official docs for the full note.
	SwitchInlineQueryCurrentChat *string `json:"switch_inline_query_current_chat,omitempty"`
	// If set, pressing the button will prompt the user to select one of their chats of the specified type, open that chat and insert the bot's username and the specified inline query in the input field. See the official docs for the full note. Telegram types this field as SwitchInlineQueryChosenChat; pass a SwitchInlineQueryChosenChat value. Go leaves this untyped because the SwitchInlineQueryChosenChat model is not part of the rich-message types in this package.
	SwitchInlineQueryChosenChat any `json:"switch_inline_query_chosen_chat,omitempty"`
	// A button that copies the specified text to the clipboard. Telegram types this field as CopyTextButton; pass a CopyTextButton value. Go leaves this untyped because the CopyTextButton model is not part of the rich-message types in this package.
	CopyText any `json:"copy_text,omitempty"`
	// If set, then the button is disabled and does nothing. Telegram types this field as DisabledButton; pass a DisabledButton value. Go leaves this untyped because the DisabledButton model is not part of the rich-message types in this package.
	Disabled any `json:"disabled,omitempty"`
}
