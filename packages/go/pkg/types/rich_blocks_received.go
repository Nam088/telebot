package types

// RichBlock is the union of the 24 block classes Telegram can deliver in a
// received rich message (RichMessage.Blocks and the nested blocks of the
// container variants).
//
// It mirrors InputRichBlock on the outgoing side; the received variants differ
// where Telegram resolves input media to the uploaded file (RichBlockPhoto
// carries "Array of PhotoSize", RichBlockVoiceNote carries a Voice, and
// RichBlockListItem adds the rendered Label).
//
// Remarks: received block lists are typed RichBlocks, which decodes each
// element into the variant named by its "type" discriminator, so a bot never
// has to dispatch by hand. A type this build of the framework does not model
// decodes to *RichBlockUnknown instead of failing the update. The interface is
// what keeps builders, type assertions and switch statements type-checked.
//
// Example:
//
//	switch block := received.(type) {
//	case *types.RichBlockParagraph:
//	    fmt.Printf("paragraph: %v\n", block.Text)
//	case *types.RichBlockPhoto:
//	    fmt.Printf("photo with %d sizes\n", len(block.Photo))
//	case *types.RichBlockUnknown:
//	    fmt.Printf("unported block %q\n", block.Type)
//	}
//
// Telegram API: https://core.telegram.org/bots/api#richblock
type RichBlock interface {
	richBlock()
}

// RichBlockAnchor represents a block with an anchor, corresponding to the HTML tag <a> with the attribute name.
//
// Telegram API: https://core.telegram.org/bots/api#richblockanchor
type RichBlockAnchor struct {
	// Type of the block, always "anchor".
	Type string `json:"type"`
	// The name of the anchor.
	Name string `json:"name"`
}

func (RichBlockAnchor) richBlock() {}

// RichBlockAnimation represents a block with an animation, corresponding to the HTML tag <video>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockanimation
type RichBlockAnimation struct {
	// Type of the block, always "animation".
	Type string `json:"type"`
	// The animation.
	Animation Animation `json:"animation"`
	// True, if the media preview is covered by a spoiler animation.
	HasSpoiler *bool `json:"has_spoiler,omitempty"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (RichBlockAnimation) richBlock() {}

// RichBlockAudio represents a block with a music file, corresponding to the HTML tag <audio>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockaudio
type RichBlockAudio struct {
	// Type of the block, always "audio".
	Type string `json:"type"`
	// The audio.
	Audio Audio `json:"audio"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (RichBlockAudio) richBlock() {}

// RichBlockBlockQuotation represents a block quotation, corresponding to the HTML tag <blockquote>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockblockquotation
type RichBlockBlockQuotation struct {
	// Type of the block, always "blockquote".
	Type string `json:"type"`
	// Content of the block.
	Blocks RichBlocks `json:"blocks"`
	// Credit of the block.
	Credit RichText `json:"credit,omitempty"`
}

func (RichBlockBlockQuotation) richBlock() {}

// RichBlockButtons represents a block containing a list of buttons that are shown in one row, corresponding to the custom HTML tag <tg-button-row>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockbuttons
type RichBlockButtons struct {
	// Type of the block, always "buttons".
	Type string `json:"type"`
	// The buttons.
	Buttons []RichMessageButton `json:"buttons"`
	// Horizontal alignment of the buttons. Currently, must be one of "left", "center", or "right".
	Align *string `json:"align,omitempty"`
}

func (RichBlockButtons) richBlock() {}

// RichBlockCaption represents caption of a rich formatted block.
//
// Telegram API: https://core.telegram.org/bots/api#richblockcaption
type RichBlockCaption struct {
	// Block caption.
	Text RichText `json:"text"`
	// Block credit which corresponds to the HTML tag <cite>.
	Credit RichText `json:"credit,omitempty"`
}

// RichBlockCollage represents a collage, corresponding to the custom HTML tag <tg-collage>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockcollage
type RichBlockCollage struct {
	// Type of the block, always "collage".
	Type string `json:"type"`
	// Elements of the collage.
	Blocks RichBlocks `json:"blocks"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (RichBlockCollage) richBlock() {}

// RichBlockDetails represents an expandable block for details disclosure, corresponding to the HTML tag <details>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockdetails
type RichBlockDetails struct {
	// Type of the block, always "details".
	Type string `json:"type"`
	// Always shown summary of the block.
	Summary RichText `json:"summary"`
	// Content of the block.
	Blocks RichBlocks `json:"blocks"`
	// True, if the content of the block is visible by default.
	IsOpen *bool `json:"is_open,omitempty"`
}

func (RichBlockDetails) richBlock() {}

// RichBlockDivider represents a divider, corresponding to the HTML tag <hr/>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockdivider
type RichBlockDivider struct {
	// Type of the block, always "divider".
	Type string `json:"type"`
}

func (RichBlockDivider) richBlock() {}

// RichBlockDocument represents a block with a general file, corresponding to the custom HTML tag <tg-document>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockdocument
type RichBlockDocument struct {
	// Type of the block, always "document".
	Type string `json:"type"`
	// The document.
	Document Document `json:"document"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (RichBlockDocument) richBlock() {}

// RichBlockExpandableBlockQuotation represents a block quotation, corresponding to the HTML tag <blockquote> with custom attribute "expandable".
//
// Telegram API: https://core.telegram.org/bots/api#richblockexpandableblockquotation
type RichBlockExpandableBlockQuotation struct {
	// Type of the block, always "expandable_blockquote".
	Type string `json:"type"`
	// Content of the block.
	Text RichText `json:"text"`
	// Credit of the block.
	Credit RichText `json:"credit,omitempty"`
}

func (RichBlockExpandableBlockQuotation) richBlock() {}

// RichBlockFooter represents a footer, corresponding to the HTML tag <footer>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockfooter
type RichBlockFooter struct {
	// Type of the block, always "footer".
	Type string `json:"type"`
	// Text of the block.
	Text RichText `json:"text"`
}

func (RichBlockFooter) richBlock() {}

// RichBlockList represents a list of blocks, corresponding to the HTML tag <ul> or <ol> with multiple nested tags <li>.
//
// Telegram API: https://core.telegram.org/bots/api#richblocklist
type RichBlockList struct {
	// Type of the block, always "list".
	Type string `json:"type"`
	// Items of the list.
	Items []RichBlockListItem `json:"items"`
}

func (RichBlockList) richBlock() {}

// RichBlockListItem represents an item of a list.
//
// Remarks: this is a support object, not a member of the RichBlock union — the
// docs list it only as the item type of RichBlockList.Items, and its optional
// Type field carries the ordered-list label style, not a discriminator.
//
// Telegram API: https://core.telegram.org/bots/api#richblocklistitem
type RichBlockListItem struct {
	// Label of the item.
	Label string `json:"label"`
	// The content of the item.
	Blocks RichBlocks `json:"blocks"`
	// True, if the item has a checkbox.
	HasCheckbox *bool `json:"has_checkbox,omitempty"`
	// True, if the item has a checked checkbox.
	IsChecked *bool `json:"is_checked,omitempty"`
	// For ordered lists, the numeric value of the item label.
	Value *int64 `json:"value,omitempty"`
	// For ordered lists, the type of the item label; must be one of "a" for lowercase letters, "A" for uppercase letters, "i" for lowercase Roman numerals, "I" for uppercase Roman numerals, or "1" for decimal numbers.
	Type *string `json:"type,omitempty"`
}

// RichBlockMap represents a block with a map, corresponding to the custom HTML tag <tg-map>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockmap
type RichBlockMap struct {
	// Type of the block, always "map".
	Type string `json:"type"`
	// Location of the center of the map.
	Location Location `json:"location"`
	// Map zoom level.
	Zoom int64 `json:"zoom"`
	// Expected width of the map.
	Width int64 `json:"width"`
	// Expected height of the map.
	Height int64 `json:"height"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (RichBlockMap) richBlock() {}

// RichBlockMathematicalExpression represents a block with a mathematical expression in LaTeX format, corresponding to the custom HTML tag <tg-math-block>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockmathematicalexpression
type RichBlockMathematicalExpression struct {
	// Type of the block, always "mathematical_expression".
	Type string `json:"type"`
	// The mathematical expression in LaTeX format.
	Expression string `json:"expression"`
}

func (RichBlockMathematicalExpression) richBlock() {}

// RichBlockParagraph represents a text paragraph, corresponding to the HTML tag <p>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockparagraph
type RichBlockParagraph struct {
	// Type of the block, always "paragraph".
	Type string `json:"type"`
	// Text of the block.
	Text RichText `json:"text"`
}

func (RichBlockParagraph) richBlock() {}

// RichBlockPhoto represents a block with a photo, corresponding to the HTML tag <img>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockphoto
type RichBlockPhoto struct {
	// Type of the block, always "photo".
	Type string `json:"type"`
	// Available sizes of the photo.
	Photo []PhotoSize `json:"photo"`
	// True, if the media preview is covered by a spoiler animation.
	HasSpoiler *bool `json:"has_spoiler,omitempty"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (RichBlockPhoto) richBlock() {}

// RichBlockPreformatted represents a preformatted text block, corresponding to the nested HTML tags <pre> and <code>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockpreformatted
type RichBlockPreformatted struct {
	// Type of the block, always "pre".
	Type string `json:"type"`
	// Text of the block.
	Text RichText `json:"text"`
	// The programming language of the text.
	Language *string `json:"language,omitempty"`
}

func (RichBlockPreformatted) richBlock() {}

// RichBlockPullQuotation represents a quotation with centered text, loosely corresponding to the HTML tag <aside>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockpullquotation
type RichBlockPullQuotation struct {
	// Type of the block, always "pullquote".
	Type string `json:"type"`
	// Text of the block.
	Text RichText `json:"text"`
	// Credit of the block.
	Credit RichText `json:"credit,omitempty"`
}

func (RichBlockPullQuotation) richBlock() {}

// RichBlockSectionHeading represents a section heading, corresponding to the HTML tags <h1>, <h2>, <h3>, <h4>, <h5>, or <h6>.
//
// Telegram API: https://core.telegram.org/bots/api#richblocksectionheading
type RichBlockSectionHeading struct {
	// Type of the block, always "heading".
	Type string `json:"type"`
	// Text of the block.
	Text RichText `json:"text"`
	// Relative size of the text font; 1-6, 1 is the largest, 6 is the smallest.
	Size int64 `json:"size"`
}

func (RichBlockSectionHeading) richBlock() {}

// RichBlockSlideshow represents a slideshow, corresponding to the custom HTML tag <tg-slideshow>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockslideshow
type RichBlockSlideshow struct {
	// Type of the block, always "slideshow".
	Type string `json:"type"`
	// Elements of the slideshow.
	Blocks RichBlocks `json:"blocks"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (RichBlockSlideshow) richBlock() {}

// RichBlockTable represents a table, corresponding to the HTML tag <table>.
//
// Telegram API: https://core.telegram.org/bots/api#richblocktable
type RichBlockTable struct {
	// Type of the block, always "table".
	Type string `json:"type"`
	// Cells of the table.
	Cells [][]RichBlockTableCell `json:"cells"`
	// True, if the table has borders.
	IsBordered *bool `json:"is_bordered,omitempty"`
	// True, if the table is striped.
	IsStriped *bool `json:"is_striped,omitempty"`
	// True, if table cells have smaller indents.
	IsCompact *bool `json:"is_compact,omitempty"`
	// Caption of the table.
	Caption RichText `json:"caption,omitempty"`
}

func (RichBlockTable) richBlock() {}

// RichBlockTableCell represents cell in a table.
//
// Telegram API: https://core.telegram.org/bots/api#richblocktablecell
type RichBlockTableCell struct {
	// Text in the cell. If omitted, then the cell is invisible.
	Text RichText `json:"text,omitempty"`
	// True, if the cell is a header cell.
	IsHeader *bool `json:"is_header,omitempty"`
	// The number of columns the cell spans if it is bigger than 1.
	Colspan *int64 `json:"colspan,omitempty"`
	// The number of rows the cell spans if it is bigger than 1.
	Rowspan *int64 `json:"rowspan,omitempty"`
	// Horizontal cell content alignment. Currently, must be one of "left", "center", or "right".
	Align string `json:"align"`
	// Vertical cell content alignment. Currently, must be one of "top", "middle", or "bottom".
	Valign string `json:"valign"`
}

// RichBlockThinking represents a block with a "Thinking…" placeholder, corresponding to the custom HTML tag <tg-thinking>. The block may be used only in sendRichMessageDraft, therefore it can't be received in messages. See the official docs for the full note.
//
// Telegram API: https://core.telegram.org/bots/api#richblockthinking
type RichBlockThinking struct {
	// Type of the block, always "thinking".
	Type string `json:"type"`
	// Text of the block. See https://t.me/addemoji/AIActions for examples of custom emoji that are recommended for usage in the block.
	Text RichText `json:"text"`
}

func (RichBlockThinking) richBlock() {}

// RichBlockVideo represents a block with a video, corresponding to the HTML tag <video>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockvideo
type RichBlockVideo struct {
	// Type of the block, always "video".
	Type string `json:"type"`
	// The video.
	Video Video `json:"video"`
	// True, if the media preview is covered by a spoiler animation.
	HasSpoiler *bool `json:"has_spoiler,omitempty"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (RichBlockVideo) richBlock() {}

// RichBlockVoiceNote represents a block with a voice note, corresponding to the HTML tag <audio>.
//
// Telegram API: https://core.telegram.org/bots/api#richblockvoicenote
type RichBlockVoiceNote struct {
	// Type of the block, always "voice_note".
	Type string `json:"type"`
	// The voice note.
	VoiceNote Voice `json:"voice_note"`
	// Caption of the block.
	Caption *RichBlockCaption `json:"caption,omitempty"`
}

func (RichBlockVoiceNote) richBlock() {}

// RichMessage represents rich formatted message.
//
// Telegram API: https://core.telegram.org/bots/api#richmessage
type RichMessage struct {
	// Content of the message.
	Blocks RichBlocks `json:"blocks"`
	// True, if the rich message must be shown right-to-left.
	IsRTL *bool `json:"is_rtl,omitempty"`
}
