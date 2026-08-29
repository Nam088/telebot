package inlinequery_test

import (
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/components/inlinequery"
	"github.com/Nam088/telebot/packages/go/pkg/components/keyboard"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestArticleBuilder_Minimal(t *testing.T) {
	result := inlinequery.NewArticle("1", "Title").Build()

	if result == nil {
		t.Fatal("expected non-nil result")
	}
	if result["type"] != "article" {
		t.Errorf("expected type %q, got %v", "article", result["type"])
	}
	if result["id"] != "1" {
		t.Errorf("expected id %q, got %v", "1", result["id"])
	}
	if result["title"] != "Title" {
		t.Errorf("expected title %q, got %v", "Title", result["title"])
	}

	// Fields that were never set must be omitted.
	for _, key := range []string{
		"description", "url", "hide_url", "thumbnail_url",
		"thumbnail_width", "thumbnail_height", "reply_markup",
		"input_message_content",
	} {
		if _, ok := result[key]; ok {
			t.Errorf("expected key %q to be omitted, got %v", key, result[key])
		}
	}
}

func TestArticleBuilder_Full(t *testing.T) {
	markup := keyboard.NewInlineKeyboard().Data("Open", "open:1").Build()

	result := inlinequery.NewArticle("42", "Telegram Docs").
		Description("Official documentation").
		URL("https://core.telegram.org").
		HideURL(true).
		Thumbnail("https://example.com/thumb.jpg", 100, 50).
		ReplyMarkup(markup).
		Text("Read the docs", "HTML", true).
		Build()

	if result["type"] != "article" || result["id"] != "42" {
		t.Errorf("unexpected identifiers: %v", result)
	}
	if result["description"] != "Official documentation" {
		t.Errorf("unexpected description: %v", result["description"])
	}
	if result["url"] != "https://core.telegram.org" {
		t.Errorf("unexpected url: %v", result["url"])
	}
	if result["hide_url"] != true {
		t.Errorf("expected hide_url true, got %v", result["hide_url"])
	}
	if result["thumbnail_url"] != "https://example.com/thumb.jpg" {
		t.Errorf("unexpected thumbnail_url: %v", result["thumbnail_url"])
	}
	if result["thumbnail_width"] != float64(100) || result["thumbnail_height"] != float64(50) {
		t.Errorf("unexpected thumbnail size: %v x %v", result["thumbnail_width"], result["thumbnail_height"])
	}

	content, ok := result["input_message_content"].(map[string]any)
	if !ok {
		t.Fatalf("expected input_message_content object, got %T", result["input_message_content"])
	}
	if content["message_text"] != "Read the docs" {
		t.Errorf("unexpected message_text: %v", content["message_text"])
	}
	if content["parse_mode"] != "HTML" {
		t.Errorf("unexpected parse_mode: %v", content["parse_mode"])
	}
	if content["disable_web_page_preview"] != true {
		t.Errorf("expected disable_web_page_preview true, got %v", content["disable_web_page_preview"])
	}

	replyMarkup, ok := result["reply_markup"].(map[string]any)
	if !ok {
		t.Fatalf("expected reply_markup object, got %T", result["reply_markup"])
	}
	if _, ok := replyMarkup["inline_keyboard"]; !ok {
		t.Error("expected nested inline_keyboard in reply_markup")
	}
}

func TestPhotoBuilder_Defaults(t *testing.T) {
	result := inlinequery.NewPhoto("2", "https://example.com/image.jpg").Build()

	if result["type"] != "photo" {
		t.Errorf("expected type %q, got %v", "photo", result["type"])
	}
	if result["id"] != "2" {
		t.Errorf("expected id %q, got %v", "2", result["id"])
	}
	if result["photo_url"] != "https://example.com/image.jpg" {
		t.Errorf("unexpected photo_url: %v", result["photo_url"])
	}
	// Telegram requires a thumbnail for photo results; it defaults to the photo URL.
	if result["thumbnail_url"] != "https://example.com/image.jpg" {
		t.Errorf("expected thumbnail_url to default to photo_url, got %v", result["thumbnail_url"])
	}

	for _, key := range []string{
		"title", "description", "caption", "parse_mode",
		"show_caption_above_media", "photo_width", "photo_height", "reply_markup",
	} {
		if _, ok := result[key]; ok {
			t.Errorf("expected key %q to be omitted, got %v", key, result[key])
		}
	}
}

func TestPhotoBuilder_Full(t *testing.T) {
	result := inlinequery.NewPhoto("3", "https://example.com/image.jpg").
		Title("Nature Wallpaper").
		Description("High resolution").
		Caption("Beautiful sunset view").
		ParseMode("MarkdownV2").
		ShowCaptionAboveMedia(true).
		Thumbnail("https://example.com/thumb.jpg").
		Size(1920, 1080).
		ReplyMarkup(keyboard.NewInlineKeyboard().Data("Like", "like:3").Build()).
		Build()

	if result["title"] != "Nature Wallpaper" {
		t.Errorf("unexpected title: %v", result["title"])
	}
	if result["description"] != "High resolution" {
		t.Errorf("unexpected description: %v", result["description"])
	}
	if result["caption"] != "Beautiful sunset view" {
		t.Errorf("unexpected caption: %v", result["caption"])
	}
	if result["parse_mode"] != "MarkdownV2" {
		t.Errorf("unexpected parse_mode: %v", result["parse_mode"])
	}
	if result["show_caption_above_media"] != true {
		t.Errorf("expected show_caption_above_media true, got %v", result["show_caption_above_media"])
	}
	if result["thumbnail_url"] != "https://example.com/thumb.jpg" {
		t.Errorf("thumbnail override failed: %v", result["thumbnail_url"])
	}
	if result["photo_width"] != float64(1920) || result["photo_height"] != float64(1080) {
		t.Errorf("unexpected size: %v x %v", result["photo_width"], result["photo_height"])
	}
	if _, ok := result["reply_markup"].(map[string]any); !ok {
		t.Errorf("expected reply_markup object, got %T", result["reply_markup"])
	}
}

func TestResults_UsableWithAnswerInlineQuery(t *testing.T) {
	results := []types.InlineQueryResult{
		inlinequery.NewArticle("1", "Article").Text("hello", "", false).Build(),
		inlinequery.NewPhoto("2", "https://example.com/image.jpg").Build(),
	}

	opts := &types.AnswerInlineQueryOptions{
		InlineQueryID: "query-1",
		Results:       results,
	}

	if len(opts.Results) != 2 {
		t.Fatalf("expected 2 results wired into options, got %d", len(opts.Results))
	}
	if opts.Results[0]["type"] != "article" || opts.Results[1]["type"] != "photo" {
		t.Errorf("unexpected result types: %v and %v", opts.Results[0]["type"], opts.Results[1]["type"])
	}
}
