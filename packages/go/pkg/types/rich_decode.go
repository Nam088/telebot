package types

import (
	"encoding/json"
	"fmt"
)

// RichBlocks is a list of received rich message blocks that decodes every
// element into the concrete variant named by its "type" discriminator.
//
// RichBlock is a non-empty interface, so encoding/json cannot populate a plain
// []RichBlock — it fails on any payload Telegram actually delivers. Assignment
// from an unnamed slice literal still works (Blocks: []RichBlock{...}), so
// builders and range loops are unchanged.
type RichBlocks []RichBlock

// UnmarshalJSON decodes the block envelope variant by variant, recursing
// through container blocks whose own Blocks field is a RichBlocks.
//
// Parameters:
//   - data: Raw JSON array of block objects from Telegram.
//
// Returns:
//   - error: *json.SyntaxError for malformed JSON; an unknown "type" is not an
//     error and decodes to RichBlockUnknown instead.
func (l *RichBlocks) UnmarshalJSON(data []byte) error {
	var raw []json.RawMessage
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	blocks := make(RichBlocks, 0, len(raw))
	for i, item := range raw {
		block, err := unmarshalRichBlock(item)
		if err != nil {
			return fmt.Errorf("types: rich block %d: %w", i, err)
		}
		blocks = append(blocks, block)
	}
	*l = blocks
	return nil
}

// RichBlockUnknown holds a block whose "type" this build of the framework does
// not model, which happens whenever Telegram adds a rich block variant ahead of
// a Bot API revision this package has ported. Keeping the raw JSON means a
// newer payload still decodes instead of failing the whole update.
//
// Example:
//
//	switch block := msg.RichMessage.Blocks[0].(type) {
//	case *types.RichBlockUnknown:
//	    log.Printf("unported block %q: %s", block.Type, block.Raw)
//	}
type RichBlockUnknown struct {
	// Type is Telegram's discriminator value for this block.
	Type string `json:"type"`
	// Raw is the undecoded block object.
	Raw json.RawMessage `json:"-"`
}

func (RichBlockUnknown) richBlock() {}

// UnmarshalJSON records the discriminator and keeps the object verbatim.
//
// Parameters:
//   - data: Raw JSON object of the unrecognized block.
//
// Returns:
//   - error: *json.SyntaxError for malformed JSON.
func (b *RichBlockUnknown) UnmarshalJSON(data []byte) error {
	var disc struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &disc); err != nil {
		return err
	}
	b.Type = disc.Type
	b.Raw = append(json.RawMessage(nil), data...)
	return nil
}

// MarshalJSON re-emits the preserved object so a decoded rich message survives
// a round trip through the type unchanged.
//
// Returns:
//   - []byte: The raw block object, or the re-encoded discriminator when none
//     was captured.
//   - error: The error from encoding the fallback object.
func (b *RichBlockUnknown) MarshalJSON() ([]byte, error) {
	if len(b.Raw) > 0 {
		return b.Raw, nil
	}
	type fallback RichBlockUnknown
	return json.Marshal((*fallback)(b))
}

// richBlockFactories maps Telegram's "type" value to the concrete variant of the
// 24-member RichBlock union. RichBlockListItem is absent on purpose: docs list
// it as the item type of RichBlockList.Items, and its optional "type" field
// carries the ordered-list label style ("a", "A", "i", "I", "1"), not a
// discriminator.
var richBlockFactories = map[string]func() RichBlock{
	"anchor":                  func() RichBlock { return &RichBlockAnchor{} },
	"animation":               func() RichBlock { return &RichBlockAnimation{} },
	"audio":                   func() RichBlock { return &RichBlockAudio{} },
	"blockquote":              func() RichBlock { return &RichBlockBlockQuotation{} },
	"buttons":                 func() RichBlock { return &RichBlockButtons{} },
	"collage":                 func() RichBlock { return &RichBlockCollage{} },
	"details":                 func() RichBlock { return &RichBlockDetails{} },
	"divider":                 func() RichBlock { return &RichBlockDivider{} },
	"document":                func() RichBlock { return &RichBlockDocument{} },
	"expandable_blockquote":   func() RichBlock { return &RichBlockExpandableBlockQuotation{} },
	"footer":                  func() RichBlock { return &RichBlockFooter{} },
	"heading":                 func() RichBlock { return &RichBlockSectionHeading{} },
	"list":                    func() RichBlock { return &RichBlockList{} },
	"map":                     func() RichBlock { return &RichBlockMap{} },
	"mathematical_expression": func() RichBlock { return &RichBlockMathematicalExpression{} },
	"paragraph":               func() RichBlock { return &RichBlockParagraph{} },
	"photo":                   func() RichBlock { return &RichBlockPhoto{} },
	"pre":                     func() RichBlock { return &RichBlockPreformatted{} },
	"pullquote":               func() RichBlock { return &RichBlockPullQuotation{} },
	"slideshow":               func() RichBlock { return &RichBlockSlideshow{} },
	"table":                   func() RichBlock { return &RichBlockTable{} },
	"thinking":                func() RichBlock { return &RichBlockThinking{} },
	"video":                   func() RichBlock { return &RichBlockVideo{} },
	"voice_note":              func() RichBlock { return &RichBlockVoiceNote{} },
}

// unmarshalRichBlock decodes one block object into its documented variant.
//
// Parameters:
//   - data: Raw JSON object carrying a "type" discriminator.
//
// Returns:
//   - RichBlock: Pointer to the concrete variant, or *RichBlockUnknown for a
//     type this build does not model.
//   - error: *json.SyntaxError, or the error from decoding the chosen variant.
func unmarshalRichBlock(data []byte) (RichBlock, error) {
	var disc struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(data, &disc); err != nil {
		return nil, err
	}
	factory, ok := richBlockFactories[disc.Type]
	if !ok {
		unknown := &RichBlockUnknown{}
		if err := json.Unmarshal(data, unknown); err != nil {
			return nil, err
		}
		return unknown, nil
	}
	block := factory()
	if err := json.Unmarshal(data, block); err != nil {
		return nil, err
	}
	return block, nil
}
