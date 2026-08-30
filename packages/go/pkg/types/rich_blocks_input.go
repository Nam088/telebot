package types

// InputRichBlock is the union of the 24 block classes that can appear in an
// outgoing rich message (InputRichMessage.Blocks and the nested blocks of the
// container variants).
//
// Each variant is a struct in this file whose Type field carries the wire
// discriminator Telegram documents for it ("paragraph", "heading", ...).
//
// Example:
//
//	msg := types.InputRichMessage{Blocks: []types.InputRichBlock{
//		&types.InputRichBlockParagraph{Type: "paragraph", Text: "Hello"},
//		&types.InputRichBlockTable{Type: "table", Cells: [][]types.RichBlockTableCell{
//			{{Align: "left", Valign: "top", Text: "A"}, {Align: "left", Valign: "top", Text: "B"}},
//		}},
//	}}
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblock
type InputRichBlock interface {
	inputRichBlock()
}

// InputRichBlockAnchor represents a block with an anchor, corresponding to the HTML tag <a> with the attribute name.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockanchor
type InputRichBlockAnchor struct {
	// Type of the block, always "anchor".
	Type string `json:"type"`
	// The name of the anchor.
	Name string `json:"name"`
}

func (InputRichBlockAnchor) inputRichBlock() {}

// InputRichBlockAnimation represents a block with an animation, corresponding to the HTML tag <video>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockanimation
type InputRichBlockAnimation struct {
	// Type of the block, always "animation".
	Type string `json:"type"`
	// The animation. Caption is ignored.
	Animation InputMediaAnimation `json:"animation"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (InputRichBlockAnimation) inputRichBlock() {}

// InputRichBlockAudio represents a block with a music file, corresponding to the HTML tag <audio>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockaudio
type InputRichBlockAudio struct {
	// Type of the block, always "audio".
	Type string `json:"type"`
	// The audio. Caption is ignored.
	Audio InputMediaAudio `json:"audio"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (InputRichBlockAudio) inputRichBlock() {}

// InputRichBlockBlockQuotation represents a block quotation, corresponding to the HTML tag <blockquote>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockblockquotation
type InputRichBlockBlockQuotation struct {
	// Type of the block, always "blockquote".
	Type string `json:"type"`
	// Content of the block.
	Blocks []InputRichBlock `json:"blocks"`
	// Credit of the block.
	Credit RichText `json:"credit,omitempty"`
}

func (InputRichBlockBlockQuotation) inputRichBlock() {}

// InputRichBlockButtons represents a block containing a list of buttons that are shown in one row, corresponding to the custom HTML tag <tg-button-row>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockbuttons
type InputRichBlockButtons struct {
	// Type of the block, always "buttons".
	Type string `json:"type"`
	// List of 1-8 buttons to send.
	Buttons []RichMessageButton `json:"buttons"`
	// Horizontal alignment of the buttons. Currently, must be one of "left", "center", or "right".
	Align *string `json:"align,omitempty"`
}

func (InputRichBlockButtons) inputRichBlock() {}

// InputRichBlockCollage represents a collage, corresponding to the custom HTML tag <tg-collage>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockcollage
type InputRichBlockCollage struct {
	// Type of the block, always "collage".
	Type string `json:"type"`
	// Elements of the collage.
	Blocks []InputRichBlock `json:"blocks"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (InputRichBlockCollage) inputRichBlock() {}

// InputRichBlockDetails represents an expandable block for details disclosure, corresponding to the HTML tag <details>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockdetails
type InputRichBlockDetails struct {
	// Type of the block, always "details".
	Type string `json:"type"`
	// Always shown summary of the block.
	Summary RichText `json:"summary"`
	// Content of the block.
	Blocks []InputRichBlock `json:"blocks"`
	// Pass True if the content of the block is visible by default.
	IsOpen *bool `json:"is_open,omitempty"`
}

func (InputRichBlockDetails) inputRichBlock() {}

// InputRichBlockDivider represents a divider, corresponding to the HTML tag <hr/>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockdivider
type InputRichBlockDivider struct {
	// Type of the block, always "divider".
	Type string `json:"type"`
}

func (InputRichBlockDivider) inputRichBlock() {}

// InputRichBlockDocument represents a block with a general file, corresponding to the custom HTML tag <tg-document>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockdocument
type InputRichBlockDocument struct {
	// Type of the block, always "document".
	Type string `json:"type"`
	// The document. Caption is ignored.
	Document InputMediaDocument `json:"document"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (InputRichBlockDocument) inputRichBlock() {}

// InputRichBlockExpandableBlockQuotation represents a block quotation, corresponding to the HTML tag <blockquote> with custom attribute "expandable".
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockexpandableblockquotation
type InputRichBlockExpandableBlockQuotation struct {
	// Type of the block, always "expandable_blockquote".
	Type string `json:"type"`
	// Content of the block.
	Text RichText `json:"text"`
	// Credit of the block.
	Credit RichText `json:"credit,omitempty"`
}

func (InputRichBlockExpandableBlockQuotation) inputRichBlock() {}

// InputRichBlockFooter represents a footer, corresponding to the HTML tag <footer>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockfooter
type InputRichBlockFooter struct {
	// Type of the block, always "footer".
	Type string `json:"type"`
	// Text of the block.
	Text RichText `json:"text"`
}

func (InputRichBlockFooter) inputRichBlock() {}

// InputRichBlockList represents a list of blocks, corresponding to the HTML tag <ul> or <ol> with multiple nested tags <li>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblocklist
type InputRichBlockList struct {
	// Type of the block, always "list".
	Type string `json:"type"`
	// Items of the list.
	Items []InputRichBlockListItem `json:"items"`
}

func (InputRichBlockList) inputRichBlock() {}

// InputRichBlockListItem represents an item of a list to be sent.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblocklistitem
type InputRichBlockListItem struct {
	// The content of the item.
	Blocks []InputRichBlock `json:"blocks"`
	// Pass True if the item has a checkbox.
	HasCheckbox *bool `json:"has_checkbox,omitempty"`
	// Pass True if the item has a checked checkbox.
	IsChecked *bool `json:"is_checked,omitempty"`
	// For ordered lists, the numeric value of the item label.
	Value *int64 `json:"value,omitempty"`
	// For ordered lists, the type of the item label; must be one of "a" for lowercase letters, "A" for uppercase letters, "i" for lowercase Roman numerals, "I" for uppercase Roman numerals, or "1" for decimal numbers.
	Type *string `json:"type,omitempty"`
}

// InputRichBlockMap represents a block with a map, corresponding to the custom HTML tag <tg-map>. The map's width and height must not exceed 10000 in total. The width and height ratio must be at most 20.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockmap
type InputRichBlockMap struct {
	// Type of the block, always "map".
	Type string `json:"type"`
	// Location of the center of the map.
	Location Location `json:"location"`
	// Map zoom level; 0-24.
	Zoom *int64 `json:"zoom,omitempty"`
	// Map width; 0-10000.
	Width *int64 `json:"width,omitempty"`
	// Map height; 0-10000.
	Height *int64 `json:"height,omitempty"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (InputRichBlockMap) inputRichBlock() {}

// InputRichBlockMathematicalExpression represents a block with a mathematical expression in LaTeX format, corresponding to the custom HTML tag <tg-math-block>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockmathematicalexpression
type InputRichBlockMathematicalExpression struct {
	// Type of the block, always "mathematical_expression".
	Type string `json:"type"`
	// The mathematical expression in LaTeX format.
	Expression string `json:"expression"`
}

func (InputRichBlockMathematicalExpression) inputRichBlock() {}

// InputRichBlockParagraph represents a text paragraph, corresponding to the HTML tag <p>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockparagraph
type InputRichBlockParagraph struct {
	// Type of the block, always "paragraph".
	Type string `json:"type"`
	// Text of the block.
	Text RichText `json:"text"`
}

func (InputRichBlockParagraph) inputRichBlock() {}

// InputRichBlockPhoto represents a block with a photo, corresponding to the HTML tag <img>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockphoto
type InputRichBlockPhoto struct {
	// Type of the block, always "photo".
	Type string `json:"type"`
	// The photo. Caption is ignored.
	Photo InputMediaPhoto `json:"photo"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (InputRichBlockPhoto) inputRichBlock() {}

// InputRichBlockPreformatted represents a preformatted text block, corresponding to the nested HTML tags <pre> and <code>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockpreformatted
type InputRichBlockPreformatted struct {
	// Type of the block, always "pre".
	Type string `json:"type"`
	// Text of the block.
	Text RichText `json:"text"`
	// The programming language of the text.
	Language *string `json:"language,omitempty"`
}

func (InputRichBlockPreformatted) inputRichBlock() {}

// InputRichBlockPullQuotation represents a quotation with centered text, loosely corresponding to the HTML tag <aside>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockpullquotation
type InputRichBlockPullQuotation struct {
	// Type of the block, always "pullquote".
	Type string `json:"type"`
	// Text of the block.
	Text RichText `json:"text"`
	// Credit of the block.
	Credit RichText `json:"credit,omitempty"`
}

func (InputRichBlockPullQuotation) inputRichBlock() {}

// InputRichBlockSectionHeading represents a section heading, corresponding to the HTML tags <h1>, <h2>, <h3>, <h4>, <h5>, or <h6>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblocksectionheading
type InputRichBlockSectionHeading struct {
	// Type of the block, always "heading".
	Type string `json:"type"`
	// Text of the block.
	Text RichText `json:"text"`
	// Relative size of the text font; 1-6, 1 is the largest, 6 is the smallest.
	Size int64 `json:"size"`
}

func (InputRichBlockSectionHeading) inputRichBlock() {}

// InputRichBlockSlideshow represents a slideshow, corresponding to the custom HTML tag <tg-slideshow>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockslideshow
type InputRichBlockSlideshow struct {
	// Type of the block, always "slideshow".
	Type string `json:"type"`
	// Elements of the slideshow.
	Blocks []InputRichBlock `json:"blocks"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (InputRichBlockSlideshow) inputRichBlock() {}

// InputRichBlockTable represents a table, corresponding to the HTML tag <table>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblocktable
type InputRichBlockTable struct {
	// Type of the block, always "table".
	Type string `json:"type"`
	// Cells of the table.
	Cells [][]RichBlockTableCell `json:"cells"`
	// Pass True if the table has borders.
	IsBordered *bool `json:"is_bordered,omitempty"`
	// Pass True if the table is striped.
	IsStriped *bool `json:"is_striped,omitempty"`
	// Pass True if table cells must have smaller indents.
	IsCompact *bool `json:"is_compact,omitempty"`
	// Caption of the table.
	Caption RichText `json:"caption,omitempty"`
}

func (InputRichBlockTable) inputRichBlock() {}

// InputRichBlockThinking represents a block with a "Thinking…" placeholder, corresponding to the custom HTML tag <tg-thinking>. The block may be used only in sendRichMessageDraft, therefore it can't be received in messages. See the official docs for the full note.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockthinking
type InputRichBlockThinking struct {
	// Type of the block, always "thinking".
	Type string `json:"type"`
	// Text of the block. See https://t.me/addemoji/AIActions for examples of custom emoji that are recommended for usage in the block.
	Text RichText `json:"text"`
}

func (InputRichBlockThinking) inputRichBlock() {}

// InputRichBlockVideo represents a block with a video, corresponding to the HTML tag <video>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockvideo
type InputRichBlockVideo struct {
	// Type of the block, always "video".
	Type string `json:"type"`
	// The video. Caption is ignored.
	Video InputMediaVideo `json:"video"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (InputRichBlockVideo) inputRichBlock() {}

// InputRichBlockVoiceNote represents a block with a voice note, corresponding to the HTML tag <audio>.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichblockvoicenote
type InputRichBlockVoiceNote struct {
	// Type of the block, always "voice_note".
	Type string `json:"type"`
	// The voice note. Caption is ignored.
	VoiceNote InputMediaVoiceNote `json:"voice_note"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (InputRichBlockVoiceNote) inputRichBlock() {}

// InputRichMessage describes a rich message to be sent. Exactly one of the fields html, markdown, or blocks must be used.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichmessage
type InputRichMessage struct {
	// Content of the rich message to send described as a list of blocks.
	Blocks []InputRichBlock `json:"blocks,omitempty"`
	// Content of the rich message to send described using HTML formatting. See rich message formatting options for more details. Use media field to specify the media used in the message.
	HTML *string `json:"html,omitempty"`
	// Content of the rich message to send described using Markdown formatting. See rich message formatting options for more details. Use media field to specify the media used in the message.
	Markdown *string `json:"markdown,omitempty"`
	// List of media that are specified in the markdown or html fields using tg://photo?id=, tg://video?id=, tg://document?id=, and tg://audio?id= links.
	Media []InputRichMessageMedia `json:"media,omitempty"`
	// Pass True if the rich message must be shown right-to-left.
	IsRTL *bool `json:"is_rtl,omitempty"`
	// Pass True to skip automatic detection of entities (e.g., URLs, email addresses, username mentions, hashtags, cashtags, bot commands, or phone numbers) in the text.
	SkipEntityDetection *bool `json:"skip_entity_detection,omitempty"`
}

// InputRichMessageMedia describes a media element embedded in an outgoing rich message.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichmessagemedia
type InputRichMessageMedia struct {
	// Unique identifier of the media used in a tg://photo?id=, tg://video?id=, tg://document?id=, or tg://audio?id= link. 1-64 characters, only A-Z, a-z, 0-9, _ and - are allowed.
	ID string `json:"id"`
	// The media to be sent. Everything except the media itself and its properties is ignored. Telegram types this field as InputMediaAnimation or InputMediaAudio or InputMediaDocument or InputMediaPhoto or InputMediaVideo or InputMediaVoiceNote; pass a union of InputMediaAnimation, InputMediaAudio, InputMediaDocument, InputMediaPhoto, InputMediaVideo, InputMediaVoiceNote value.
	Media InputMedia `json:"media"`
}

// InputRichMessageContent represents the content of a rich message to be sent as the result of an inline query.
//
// Telegram API: https://core.telegram.org/bots/api#inputrichmessagecontent
type InputRichMessageContent struct {
	// The message to be sent. Only previously uploaded files may be used in the message.
	RichMessage InputRichMessage `json:"rich_message"`
}
