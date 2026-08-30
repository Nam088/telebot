package bot_test

import (
	"context"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// ephemeralEditCase describes one of the four editEphemeralMessage* methods: the
// wire method name, the payload node sends for it, and the Go invocation.
type ephemeralEditCase struct {
	name    string
	wire    string
	payload map[string]any
	invoke  func(b *bot.Bot) (*types.Message, bool, error)
}

func ephemeralEditCases() []ephemeralEditCase {
	const (
		connChat = -1001234567890
	)
	return []ephemeralEditCase{
		{
			name: "EditEphemeralMessageText",
			wire: "editEphemeralMessageText",
			payload: map[string]any{
				"chat_id":              connChat,
				"receiver_user_id":     123456,
				"ephemeral_message_id": 7,
				"text":                 "Corrected text",
				"parse_mode":           "MarkdownV2",
			},
			invoke: func(b *bot.Bot) (*types.Message, bool, error) {
				return b.EditEphemeralMessageText(context.Background(), &types.EditEphemeralMessageTextOptions{
					ChatID:             int64(connChat),
					ReceiverUserID:     123456,
					EphemeralMessageID: 7,
					Text:               "Corrected text",
					ParseMode:          "MarkdownV2",
				})
			},
		},
		{
			name: "EditEphemeralMessageMedia",
			wire: "editEphemeralMessageMedia",
			payload: map[string]any{
				"chat_id":              connChat,
				"receiver_user_id":     123456,
				"ephemeral_message_id": 7,
				"media":                map[string]any{"type": "photo", "media": "BAACAgIAAxkBAAI"},
			},
			invoke: func(b *bot.Bot) (*types.Message, bool, error) {
				return b.EditEphemeralMessageMedia(context.Background(), &types.EditEphemeralMessageMediaOptions{
					ChatID:             int64(connChat),
					ReceiverUserID:     123456,
					EphemeralMessageID: 7,
					Media:              &types.InputMediaPhoto{Type: "photo", Media: "BAACAgIAAxkBAAI"},
				})
			},
		},
		{
			name: "EditEphemeralMessageCaption",
			wire: "editEphemeralMessageCaption",
			payload: map[string]any{
				"chat_id":                  connChat,
				"receiver_user_id":         123456,
				"ephemeral_message_id":     7,
				"caption":                  "New caption",
				"show_caption_above_media": true,
			},
			invoke: func(b *bot.Bot) (*types.Message, bool, error) {
				return b.EditEphemeralMessageCaption(context.Background(), &types.EditEphemeralMessageCaptionOptions{
					ChatID:                int64(connChat),
					ReceiverUserID:        123456,
					EphemeralMessageID:    7,
					Caption:               "New caption",
					ShowCaptionAboveMedia: true,
				})
			},
		},
		{
			name: "EditEphemeralMessageReplyMarkup",
			wire: "editEphemeralMessageReplyMarkup",
			payload: map[string]any{
				"chat_id":              connChat,
				"receiver_user_id":     123456,
				"ephemeral_message_id": 7,
				"reply_markup": map[string]any{
					"inline_keyboard": [][]map[string]any{
						{{"text": "Open", "url": "https://example.com"}},
					},
				},
			},
			invoke: func(b *bot.Bot) (*types.Message, bool, error) {
				return b.EditEphemeralMessageReplyMarkup(context.Background(), &types.EditEphemeralMessageReplyMarkupOptions{
					ChatID:             int64(connChat),
					ReceiverUserID:     123456,
					EphemeralMessageID: 7,
					ReplyMarkup: &types.InlineKeyboardMarkup{
						InlineKeyboard: [][]types.InlineKeyboardButton{
							{{Text: "Open", URL: "https://example.com"}},
						},
					},
				})
			},
		},
	}
}

// TestEphemeral_EditMethodsReturnMessage covers the Message branch of node's
// `Message | boolean` return union.
func TestEphemeral_EditMethodsReturnMessage(t *testing.T) {
	result := types.Message{
		MessageID: 7,
		Date:      1702592000,
		Chat:      &types.Chat{ID: int64(-1001234567890), Type: "supergroup"},
		Text:      "Corrected text",
	}

	for _, tc := range ephemeralEditCases() {
		t.Run(tc.name, func(t *testing.T) {
			srv := profileServer(t, tc.wire, tc.payload, result)
			defer srv.Close()

			b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
			msg, ok, err := tc.invoke(b)
			if err != nil {
				t.Fatalf("%s error: %v", tc.name, err)
			}
			if ok {
				t.Errorf("%s: expected the boolean branch to be false", tc.name)
			}
			if msg == nil {
				t.Fatalf("%s: expected a decoded Message", tc.name)
			}
			if msg.MessageID != 7 || msg.Text != "Corrected text" {
				t.Errorf("%s: unexpected message: %+v", tc.name, msg)
			}
		})
	}
}

// TestEphemeral_EditMethodsReturnTrue covers the boolean branch of node's
// `Message | boolean` union, which Telegram returns when the bot cannot see the
// edited message.
func TestEphemeral_EditMethodsReturnTrue(t *testing.T) {
	for _, tc := range ephemeralEditCases() {
		t.Run(tc.name, func(t *testing.T) {
			srv := profileServer(t, tc.wire, tc.payload, true)
			defer srv.Close()

			b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
			msg, ok, err := tc.invoke(b)
			if err != nil {
				t.Fatalf("%s error: %v", tc.name, err)
			}
			if !ok {
				t.Errorf("%s: expected the boolean branch to be true", tc.name)
			}
			if msg != nil {
				t.Errorf("%s: expected nil Message for a bare true result, got %+v", tc.name, msg)
			}
		})
	}
}

// TestEphemeral_EditMethodsOmitOptionalFields asserts reply_markup, parse_mode and
// caption stay off the wire when unset, matching node's optional keys.
func TestEphemeral_EditMethodsOmitOptionalFields(t *testing.T) {
	srv := omittingServer(t, "editEphemeralMessageCaption",
		[]string{"caption", "parse_mode", "caption_entities", "show_caption_above_media", "reply_markup"},
		map[string]any{
			"chat_id":              int64(-1001234567890),
			"receiver_user_id":     123456,
			"ephemeral_message_id": 7,
		}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	if _, _, err := b.EditEphemeralMessageCaption(context.Background(), &types.EditEphemeralMessageCaptionOptions{
		ChatID:             int64(-1001234567890),
		ReceiverUserID:     123456,
		EphemeralMessageID: 7,
	}); err != nil {
		t.Fatalf("EditEphemeralMessageCaption error: %v", err)
	}
}

// TestEphemeral_DeleteEphemeralMessage covers deleteEphemeralMessage, which node
// also exposes as positional arguments; Go uses the single options-object form.
func TestEphemeral_DeleteEphemeralMessage(t *testing.T) {
	srv := profileServer(t, "deleteEphemeralMessage", map[string]any{
		"chat_id":              int64(-1001234567890),
		"receiver_user_id":     123456,
		"ephemeral_message_id": 7,
	}, true)
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	ok, err := b.DeleteEphemeralMessage(context.Background(), &types.DeleteEphemeralMessageOptions{
		ChatID:             int64(-1001234567890),
		ReceiverUserID:     123456,
		EphemeralMessageID: 7,
	})
	if err != nil || !ok {
		t.Fatalf("DeleteEphemeralMessage = (%v, %v)", ok, err)
	}
}

// TestEphemeral_TelegramError asserts ephemeral edits reject with a typed error
// on both return branches.
func TestEphemeral_TelegramError(t *testing.T) {
	srv := telegramErrorServer(400, "Bad Request: EPHEMERAL_MESSAGE_ID_INVALID")
	defer srv.Close()

	b := bot.NewBot("tok", bot.WithBaseURL(srv.URL))
	msg, ok, err := b.EditEphemeralMessageText(context.Background(), &types.EditEphemeralMessageTextOptions{
		ChatID:             int64(-1001234567890),
		ReceiverUserID:     123456,
		EphemeralMessageID: 7,
		Text:               "x",
	})
	if msg != nil || ok {
		t.Errorf("expected zero values on error, got (%v, %v)", msg, ok)
	}
	requireTelegramError(t, err, 400)

	if _, err := b.DeleteEphemeralMessage(context.Background(), &types.DeleteEphemeralMessageOptions{
		ChatID:             int64(-1001234567890),
		ReceiverUserID:     123456,
		EphemeralMessageID: 7,
	}); err == nil {
		t.Errorf("expected deleteEphemeralMessage to reject")
	}
}
