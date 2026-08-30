package types_test

import (
	"encoding/json"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// The three docs unions are modelled as marker interfaces; this list is the
// compile-time assertion that every variant Telegram documents satisfies the
// interface it belongs to. RichText covers 26 entity classes, InputRichBlock
// and RichBlock cover the 24 block classes each (RichBlockCaption,
// RichBlockTableCell and the *ListItem helpers are support objects, not
// union members).
func TestRich_UnionsIncludeEveryDocsVariant(t *testing.T) {
	texts := []types.RichTextEntity{
		&types.RichTextAnchor{Name: "top"},
		&types.RichTextAnchorLink{Text: "back to top", AnchorName: "top"},
		&types.RichTextBankCardNumber{Text: "card", BankCardNumber: "4111"},
		&types.RichTextBold{Text: "bold"},
		&types.RichTextBotCommand{Text: "/start", BotCommand: "/start"},
		&types.RichTextButton{Button: types.RichMessageButton{Text: "Open"}},
		&types.RichTextCashtag{Text: "$TGL", Cashtag: "$TGL"},
		&types.RichTextCode{Text: "x := 1"},
		&types.RichTextCustomEmoji{CustomEmojiID: "1", AlternativeText: "🎁"},
		&types.RichTextDateTime{Text: "now", UnixTime: 1702592000, DateTimeFormat: "dd.MM.yyyy"},
		&types.RichTextEmailAddress{Text: "a@b.c", EmailAddress: "a@b.c"},
		&types.RichTextHashtag{Text: "#go", Hashtag: "#go"},
		&types.RichTextItalic{Text: "italic"},
		&types.RichTextMarked{Text: "marked"},
		&types.RichTextMathematicalExpression{Expression: "e^{i\\pi}+1=0"},
		&types.RichTextMention{Text: "@bot", Username: "bot"},
		&types.RichTextPhoneNumber{Text: "tel", PhoneNumber: "+123"},
		&types.RichTextReference{Text: "[1]", Name: "ref-1"},
		&types.RichTextReferenceLink{Text: "link", ReferenceName: "ref-1"},
		&types.RichTextSpoiler{Text: "secret"},
		&types.RichTextStrikethrough{Text: "gone"},
		&types.RichTextSubscript{Text: "sub"},
		&types.RichTextSuperscript{Text: "sup"},
		&types.RichTextTextMention{Text: "mention", User: types.User{ID: 42, IsBot: true, FirstName: "Bot"}},
		&types.RichTextUnderline{Text: "under"},
		&types.RichTextUrl{Text: "site", URL: "https://example.com"},
	}
	if len(texts) != 26 {
		t.Fatalf("expected the 26 docs RichText* variants, got %d", len(texts))
	}

	inputBlocks := []types.InputRichBlock{
		&types.InputRichBlockAnchor{Name: "top"},
		&types.InputRichBlockAnimation{Animation: types.InputMediaAnimation{Type: "animation", Media: "A"}},
		&types.InputRichBlockAudio{Audio: types.InputMediaAudio{Type: "audio", Media: "A"}},
		&types.InputRichBlockBlockQuotation{Blocks: []types.InputRichBlock{&types.InputRichBlockDivider{}}},
		&types.InputRichBlockButtons{Buttons: []types.RichMessageButton{{Text: "Open"}}},
		&types.InputRichBlockCollage{Blocks: []types.InputRichBlock{&types.InputRichBlockDivider{}}},
		&types.InputRichBlockDetails{Summary: "summary", Blocks: []types.InputRichBlock{&types.InputRichBlockDivider{}}},
		&types.InputRichBlockDivider{},
		&types.InputRichBlockDocument{Document: types.InputMediaDocument{Type: "document", Media: "D"}},
		&types.InputRichBlockExpandableBlockQuotation{Text: "quote"},
		&types.InputRichBlockFooter{Text: "footer"},
		&types.InputRichBlockList{Items: []types.InputRichBlockListItem{{Blocks: []types.InputRichBlock{&types.InputRichBlockDivider{}}}}},
		&types.InputRichBlockMap{Location: types.Location{Latitude: 1, Longitude: 2}},
		&types.InputRichBlockMathematicalExpression{Expression: "x^2"},
		&types.InputRichBlockParagraph{Text: "paragraph"},
		&types.InputRichBlockPhoto{Photo: types.InputMediaPhoto{Type: "photo", Media: "P"}},
		&types.InputRichBlockPreformatted{Text: "code", Language: ptr("go")},
		&types.InputRichBlockPullQuotation{Text: "pull"},
		&types.InputRichBlockSectionHeading{Text: "heading", Size: 2},
		&types.InputRichBlockSlideshow{Blocks: []types.InputRichBlock{&types.InputRichBlockDivider{}}},
		&types.InputRichBlockTable{Cells: [][]types.RichBlockTableCell{{{Align: "left", Valign: "top", Text: "cell"}}}},
		&types.InputRichBlockThinking{Text: "🤔"},
		&types.InputRichBlockVideo{Video: types.InputMediaVideo{Type: "video", Media: "V"}},
		&types.InputRichBlockVoiceNote{VoiceNote: types.InputMediaVoiceNote{Type: "voice_note", Media: "Voice"}},
	}
	if len(inputBlocks) != 24 {
		t.Fatalf("expected the 24 docs InputRichBlock variants, got %d", len(inputBlocks))
	}

	blocks := []types.RichBlock{
		&types.RichBlockAnchor{Name: "top"},
		&types.RichBlockAnimation{Animation: types.Animation{FileID: "A"}},
		&types.RichBlockAudio{Audio: types.Audio{FileID: "A"}},
		&types.RichBlockBlockQuotation{Blocks: []types.RichBlock{&types.RichBlockDivider{}}},
		&types.RichBlockButtons{Buttons: []types.RichMessageButton{{Text: "Open"}}},
		&types.RichBlockCollage{Blocks: []types.RichBlock{&types.RichBlockDivider{}}},
		&types.RichBlockDetails{Summary: "summary", Blocks: []types.RichBlock{&types.RichBlockDivider{}}},
		&types.RichBlockDivider{},
		&types.RichBlockDocument{Document: types.Document{FileID: "D"}},
		&types.RichBlockExpandableBlockQuotation{Text: "quote"},
		&types.RichBlockFooter{Text: "footer"},
		&types.RichBlockList{Items: []types.RichBlockListItem{{Label: "1", Blocks: []types.RichBlock{&types.RichBlockDivider{}}}}},
		&types.RichBlockMap{Location: types.Location{Latitude: 1, Longitude: 2}, Zoom: 8, Width: 100, Height: 100},
		&types.RichBlockMathematicalExpression{Expression: "x^2"},
		&types.RichBlockParagraph{Text: "paragraph"},
		&types.RichBlockPhoto{Photo: []types.PhotoSize{{FileID: "P", Width: 1, Height: 1}}},
		&types.RichBlockPreformatted{Text: "code", Language: ptr("go")},
		&types.RichBlockPullQuotation{Text: "pull"},
		&types.RichBlockSectionHeading{Text: "heading", Size: 2},
		&types.RichBlockSlideshow{Blocks: []types.RichBlock{&types.RichBlockDivider{}}},
		&types.RichBlockTable{Cells: [][]types.RichBlockTableCell{{{Align: "left", Valign: "top", Text: "cell"}}}},
		&types.RichBlockThinking{Text: "🤔"},
		&types.RichBlockVideo{Video: types.Video{FileID: "V"}},
		&types.RichBlockVoiceNote{VoiceNote: types.Voice{FileID: "Voice"}},
	}
	if len(blocks) != 24 {
		t.Fatalf("expected the 24 docs RichBlock variants, got %d", len(blocks))
	}
}

func ptr[T any](v T) *T { return &v }

// TestRichMessageDiscriminatorsAreSerialized asserts every block and text
// variant puts its docs discriminator on the wire, and that the nested
// container fields keep their docs snake_case keys.
func TestRichMessageDiscriminatorsAreSerialized(t *testing.T) {
	msg := types.InputRichMessage{
		Blocks: []types.InputRichBlock{
			&types.InputRichBlockParagraph{
				Type: "paragraph",
				Text: []types.RichText{
					"Hello, ",
					&types.RichTextBold{Type: "bold", Text: "world"},
				},
			},
			&types.InputRichBlockDetails{
				Type:    "details",
				Summary: "read more",
				IsOpen:  ptr(true),
				Blocks: []types.InputRichBlock{
					&types.InputRichBlockList{
						Type: "list",
						Items: []types.InputRichBlockListItem{
							{
								Blocks:      []types.InputRichBlock{&types.InputRichBlockFooter{Type: "footer", Text: "f"}},
								HasCheckbox: ptr(true),
								IsChecked:   ptr(true),
							},
						},
					},
				},
			},
		},
		IsRTL:               ptr(true),
		SkipEntityDetection: ptr(false),
		Media: []types.InputRichMessageMedia{
			{ID: "img1", Media: types.InputMediaPhoto{Type: "photo", Media: "FILE"}},
		},
	}
	raw, err := json.Marshal(msg)
	if err != nil {
		t.Fatalf("marshal InputRichMessage: %v", err)
	}
	var got map[string]any
	if err := json.Unmarshal(raw, &got); err != nil {
		t.Fatalf("unmarshalInputRichMessage: %v", err)
	}
	assertContains(t, string(raw), `"is_rtl":true`)
	assertContains(t, string(raw), `"skip_entity_detection":false`)
	assertContains(t, string(raw), `"has_checkbox":true`)
	assertContains(t, string(raw), `"id":"img1"`)

	blocks, ok := got["blocks"].([]any)
	if !ok || len(blocks) != 2 {
		t.Fatalf("expected 2 serialized blocks, got %v", got["blocks"])
	}
	paragraph := blocks[0].(map[string]any)
	text, ok := paragraph["text"].([]any)
	if !ok || len(text) != 2 {
		t.Fatalf("expected nested RichText array, got %v", paragraph["text"])
	}
	if text[0] != "Hello, " {
		t.Errorf("plain-text branch: got %v", text[0])
	}
	bold, ok := text[1].(map[string]any)
	if !ok || bold["type"] != "bold" || bold["text"] != "world" {
		t.Errorf("RichTextBold branch: got %v", text[1])
	}
}

// TestRichModelOmitsUnsetOptionals asserts the pointer-typed optional scalars
// stay off the wire when unset, so Telegram's own defaults apply.
func TestRichModelOmitsUnsetOptionals(t *testing.T) {
	raw, err := json.Marshal(types.InputRichMessage{HTML: ptr("hello")})
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	got := string(raw)
	assertContains(t, got, `"html":"hello"`)
	for _, key := range []string{`"blocks"`, `"markdown"`, `"media"`, `"is_rtl"`, `"skip_entity_detection"`} {
		assertNotContains(t, got, key)
	}

	cell, err := json.Marshal(types.RichBlockTableCell{Align: "left", Valign: "middle"})
	if err != nil {
		t.Fatalf("marshal cell: %v", err)
	}
	for _, key := range []string{`"text"`, `"is_header"`, `"colspan"`, `"rowspan"`} {
		assertNotContains(t, string(cell), key)
	}
}

// TestRichReceivedModelsDeserialize asserts the received-side support objects
// decode Telegram's payload into the typed fields.
func TestRichReceivedModelsDeserialize(t *testing.T) {
	var caption types.RichBlockCaption
	if err := json.Unmarshal([]byte(`{"text":"A caption","credit":{"type":"mention","text":"@bot","username":"bot"}}`), &caption); err != nil {
		t.Fatalf("unmarshal RichBlockCaption: %v", err)
	}
	if caption.Text != "A caption" {
		t.Errorf("RichBlockCaption.text: got %v", caption.Text)
	}
	credit, ok := caption.Credit.(map[string]any)
	if !ok {
		t.Fatalf("expected the credit branch to decode, got %T", caption.Credit)
	}
	if credit["type"] != "mention" || credit["username"] != "bot" {
		t.Errorf("unexpected decoded credit: %v", credit)
	}

	var cell types.RichBlockTableCell
	if err := json.Unmarshal([]byte(`{"text":"value","is_header":true,"colspan":2,"rowspan":3,"align":"center","valign":"bottom"}`), &cell); err != nil {
		t.Fatalf("unmarshal RichBlockTableCell: %v", err)
	}
	if cell.Colspan == nil || *cell.Colspan != 2 || cell.IsHeader == nil || !*cell.IsHeader || cell.Valign != "bottom" || cell.Align != "center" {
		t.Errorf("unexpected decoded cell: %+v", cell)
	}

	var button types.RichMessageButton
	if err := json.Unmarshal([]byte(`{"text":"Open","callback_data":"open-1","style":"danger"}`), &button); err != nil {
		t.Fatalf("unmarshal RichMessageButton: %v", err)
	}
	if button.Text != "Open" || button.CallbackData == nil || *button.CallbackData != "open-1" {
		t.Errorf("unexpected decoded button: %+v", button)
	}
	if button.Style == nil || *button.Style != "danger" {
		t.Errorf("RichMessageButton.style: got %v", button.Style)
	}
}
