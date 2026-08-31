package types_test

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// nestedRichMessage mirrors the shape Telegram delivers: a mix of leaf blocks,
// containers holding further blocks, a list whose items each hold their own
// block list, and a variant this build has not ported yet.
const nestedRichMessage = `{
	"blocks": [
		{"type": "paragraph", "text": ["Hello, ", {"type": "bold", "text": "world"}]},
		{"type": "collage", "blocks": [{"type": "paragraph", "text": "inner"}]},
		{"type": "list", "items": [
			{"label": "one", "has_checkbox": true, "blocks": [{"type": "divider"}]}
		]},
		{"type": "blockquote", "blocks": [{"type": "footer", "text": "by bot"}],
		 "credit": {"type": "mention", "text": "@bot", "username": "bot"}},
		{"type": "table", "cells": [[{"text": "head", "is_header": true}, {"text": "value"}]]},
		{"type": "quantum_flux", "novel_field": 42}
	],
	"is_rtl": true
}`

// TestRichBlockListDecodesByDiscriminator asserts every block lands on the
// concrete variant the docs assign to its "type", including blocks nested inside
// containers and inside list items.
func TestRichBlockListDecodesByDiscriminator(t *testing.T) {
	var msg types.RichMessage
	if err := json.Unmarshal([]byte(nestedRichMessage), &msg); err != nil {
		t.Fatalf("unmarshal RichMessage: %v", err)
	}
	if msg.IsRTL == nil || !*msg.IsRTL {
		t.Fatalf("is_rtl: got %v", msg.IsRTL)
	}
	if len(msg.Blocks) != 6 {
		t.Fatalf("expected 6 decoded blocks, got %d", len(msg.Blocks))
	}

	paragraph, ok := msg.Blocks[0].(*types.RichBlockParagraph)
	if !ok {
		t.Fatalf("block 0: got %T, want *types.RichBlockParagraph", msg.Blocks[0])
	}
	text, ok := paragraph.Text.([]any)
	if !ok || len(text) != 2 {
		t.Fatalf("paragraph text: got %#v", paragraph.Text)
	}
	bold, ok := text[1].(map[string]any)
	if !ok || bold["type"] != "bold" || bold["text"] != "world" {
		t.Errorf("nested RichText branch: got %#v", text[1])
	}

	collage, ok := msg.Blocks[1].(*types.RichBlockCollage)
	if !ok {
		t.Fatalf("block 1: got %T, want *types.RichBlockCollage", msg.Blocks[1])
	}
	if len(collage.Blocks) != 1 {
		t.Fatalf("collage nested blocks: got %d", len(collage.Blocks))
	}
	inner, ok := collage.Blocks[0].(*types.RichBlockParagraph)
	if !ok || inner.Text != "inner" {
		t.Errorf("collage child: got %#v", collage.Blocks[0])
	}

	list, ok := msg.Blocks[2].(*types.RichBlockList)
	if !ok {
		t.Fatalf("block 2: got %T, want *types.RichBlockList", msg.Blocks[2])
	}
	item, ok := list.Items[0].Blocks[0].(*types.RichBlockDivider)
	if !ok {
		t.Errorf("list item child: got %#v", list.Items[0].Blocks[0])
	}
	if item == nil {
		t.Error("expected a decoded divider block inside the list item")
	}

	quote, ok := msg.Blocks[3].(*types.RichBlockBlockQuotation)
	if !ok {
		t.Fatalf("block 3: got %T, want *types.RichBlockBlockQuotation", msg.Blocks[3])
	}
	footer, ok := quote.Blocks[0].(*types.RichBlockFooter)
	if !ok || footer.Text != "by bot" {
		t.Errorf("blockquote child: got %#v", quote.Blocks[0])
	}

	table, ok := msg.Blocks[4].(*types.RichBlockTable)
	if !ok || len(table.Cells) != 1 || len(table.Cells[0]) != 2 {
		t.Fatalf("block 4: got %#v", msg.Blocks[4])
	}
	if table.Cells[0][0].IsHeader == nil || !*table.Cells[0][0].IsHeader {
		t.Errorf("table header cell: got %#v", table.Cells[0][0])
	}
}

// TestRichBlockListKeepsUnportedVariants asserts a discriminator this build does
// not model keeps its payload instead of failing the decode, which is what stops
// a newer Telegram response from breaking an update.
func TestRichBlockListKeepsUnportedVariants(t *testing.T) {
	var msg types.RichMessage
	if err := json.Unmarshal([]byte(nestedRichMessage), &msg); err != nil {
		t.Fatalf("unmarshal RichMessage: %v", err)
	}
	unknown, ok := msg.Blocks[5].(*types.RichBlockUnknown)
	if !ok {
		t.Fatalf("block 5: got %T, want *types.RichBlockUnknown", msg.Blocks[5])
	}
	if unknown.Type != "quantum_flux" {
		t.Errorf("discriminator: got %q", unknown.Type)
	}
	raw, err := json.Marshal(msg)
	if err != nil {
		t.Fatalf("re-marshal RichMessage: %v", err)
	}
	assertContains(t, string(raw), `"novel_field":42`)

	decoded := &types.RichMessage{}
	if err := json.Unmarshal(raw, decoded); err != nil {
		t.Fatalf("re-decode RichMessage: %v", err)
	}
	again, ok := decoded.Blocks[5].(*types.RichBlockUnknown)
	if !ok || !sameJSON(t, again.Raw, unknown.Raw) {
		t.Errorf("round trip lost the unported block: %#v", decoded.Blocks[5])
	}
}

// TestMessageDecodesRichMessage exercises the receive path end to end: a
// delivered Message carrying rich_message must decode instead of erroring.
func TestMessageDecodesRichMessage(t *testing.T) {
	payload := `{"message_id":5,"date":1700000000,"chat":{"id":1,"type":"private"},` +
		`"rich_message":{"blocks":[{"type":"thinking","text":"🤔"}]}}`
	var msg types.Message
	if err := json.Unmarshal([]byte(payload), &msg); err != nil {
		t.Fatalf("unmarshal Message: %v", err)
	}
	if msg.RichMessage == nil {
		t.Fatal("Message.rich_message was not decoded")
	}
	thinking, ok := msg.RichMessage.Blocks[0].(*types.RichBlockThinking)
	if !ok || thinking.Text != "🤔" {
		t.Fatalf("received block: got %#v", msg.RichMessage.Blocks[0])
	}
}

// TestRichBlockListRejectsMalformedJSON asserts a broken array still surfaces an
// error rather than yielding a half-populated message.
func TestRichBlockListRejectsMalformedJSON(t *testing.T) {
	var msg types.RichMessage
	if err := json.Unmarshal([]byte(`{"blocks":[{"type":"paragraph"}`), &msg); err == nil {
		t.Fatal("expected a syntax error for the truncated payload")
	}
	if err := json.Unmarshal([]byte(`{"blocks":"not-an-array"}`), &msg); err == nil {
		t.Fatal("expected an error when blocks is not an array")
	}
}

// sameJSON compares two JSON documents for value equality, ignoring the
// whitespace encoding/json strips when it compacts MarshalJSON output.
func sameJSON(t *testing.T, a, b json.RawMessage) bool {
	t.Helper()
	var ca, cb bytes.Buffer
	if err := json.Compact(&ca, a); err != nil {
		t.Fatalf("compact %s: %v", a, err)
	}
	if err := json.Compact(&cb, b); err != nil {
		t.Fatalf("compact %s: %v", b, err)
	}
	return ca.String() == cb.String()
}
