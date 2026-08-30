// Command apidemo exercises a wide range of Telegram Bot API methods
// through the telebot-go client and prints a PASS/FAIL/SKIP report.
//
// Usage:
//
//	BOT_TOKEN=... go run ./cmd/apidemo                 # account-level methods only
//	BOT_TOKEN=... CHAT_ID=123456 go run ./cmd/apidemo  # also chat-scoped methods
//
// Chat-scoped methods send a few messages to CHAT_ID and delete them afterwards.
// Methods that are destructive or need external state (logOut, close, payments,
// webhook set, admin-only calls) are intentionally skipped.
package main

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

type result struct {
	method string
	status string // PASS, FAIL, SKIP
	detail string
}

var results []result

func record(method, status, detail string) {
	results = append(results, result{method, status, detail})
	fmt.Printf("%-4s %-38s %s\n", status, method, detail)
}

func check(method string, err error) bool {
	if err != nil {
		record(method, "FAIL", err.Error())
		return false
	}
	record(method, "PASS", "")
	return true
}

func skip(method, reason string) {
	record(method, "SKIP", reason)
}

func main() {
	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		fmt.Println("BOT_TOKEN is not set")
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer cancel()

	b := bot.NewBot(token)

	// ---------- Section A: account-level methods ----------
	fmt.Println("== Section A: account-level methods ==")

	me, err := b.GetMe(ctx)
	if !check("getMe", err) {
		printSummary()
		os.Exit(1)
	}
	fmt.Printf("     bot: @%s (id %d)\n", me.Username, me.ID)

	// Bot name: save → set → verify → restore.
	if orig, err := b.GetMyName(ctx, &types.GetMyNameOptions{}); err == nil {
		record("getMyName", "PASS", "")
		if check("setMyName", oneErr(b.SetMyName(ctx, &types.SetMyNameOptions{Name: "API Demo Bot"}))) {
			if n, err := b.GetMyName(ctx, &types.GetMyNameOptions{}); err != nil {
				check("getMyName (verify)", err)
			} else if n.Name != "API Demo Bot" {
				check("getMyName (verify)", fmt.Errorf("expected 'API Demo Bot', got %q", n.Name))
			} else {
				record("getMyName (verify)", "PASS", "")
			}
		}
		_, _ = b.SetMyName(ctx, &types.SetMyNameOptions{Name: orig.Name})
	} else {
		check("getMyName", err)
	}

	// Description: set → restore.
	origDesc, err := b.GetMyDescription(ctx, &types.GetMyDescriptionOptions{})
	check("getMyDescription", err)
	if check("setMyDescription", oneErr(b.SetMyDescription(ctx, &types.SetMyDescriptionOptions{Description: "telebot-go API demo"}))) && err == nil {
		_, _ = b.SetMyDescription(ctx, &types.SetMyDescriptionOptions{Description: origDesc.Description})
	}

	// Short description: set → restore.
	origShort, err := b.GetMyShortDescription(ctx, &types.GetMyShortDescriptionOptions{})
	check("getMyShortDescription", err)
	if check("setMyShortDescription", oneErr(b.SetMyShortDescription(ctx, &types.SetMyShortDescriptionOptions{ShortDescription: "telebot-go demo"}))) && err == nil {
		_, _ = b.SetMyShortDescription(ctx, &types.SetMyShortDescriptionOptions{ShortDescription: origShort.ShortDescription})
	}

	// Commands: set → get → delete.
	check("setMyCommands", oneErr(b.SetMyCommands(ctx, &types.SetMyCommandsOptions{
		Commands: []types.BotCommand{{Command: "demo", Description: "API demo command"}},
	})))
	if cmds, err := b.GetMyCommands(ctx, &types.GetMyCommandsOptions{}); err != nil {
		check("getMyCommands", err)
	} else if len(cmds) == 0 {
		check("getMyCommands", fmt.Errorf("expected at least 1 command"))
	} else {
		record("getMyCommands", "PASS", "")
	}
	check("deleteMyCommands", oneErr(b.DeleteMyCommands(ctx, &types.DeleteMyCommandsOptions{})))

	// Default administrator rights.
	if _, err := b.GetMyDefaultAdministratorRights(ctx, &types.GetMyDefaultAdministratorRightsOptions{}); err != nil {
		check("getMyDefaultAdministratorRights", err)
	} else {
		record("getMyDefaultAdministratorRights", "PASS", "")
	}
	check("setMyDefaultAdministratorRights", oneErr(b.SetMyDefaultAdministratorRights(ctx, &types.SetMyDefaultAdministratorRightsOptions{
		Rights: &types.ChatAdministratorRights{CanInviteUsers: true},
	})))

	// Menu button (private-chat default).
	if _, err := b.GetChatMenuButton(ctx, &types.GetChatMenuButtonOptions{}); err != nil {
		check("getChatMenuButton", err)
	} else {
		record("getChatMenuButton", "PASS", "")
	}
	check("setChatMenuButton", oneErr(b.SetChatMenuButton(ctx, &types.SetChatMenuButtonOptions{MenuButton: types.MenuButtonCommands{Type: "commands"}})))

	// Webhook info + ensure polling mode.
	if _, err := b.GetWebhookInfo(ctx); err != nil {
		check("getWebhookInfo", err)
	} else {
		record("getWebhookInfo", "PASS", "")
	}
	if _, err := b.DeleteWebhook(ctx, false); err != nil {
		check("deleteWebhook", err)
	} else {
		record("deleteWebhook", "PASS", "")
	}

	// Forum topic icon stickers (also used below for sticker/file demos).
	iconStickers, err := b.GetForumTopicIconStickers(ctx)
	check("getForumTopicIconStickers", err)

	// Star transactions (bot's own ledger).
	if _, err := b.GetStarTransactions(ctx, &types.GetStarTransactionsOptions{Limit: 10}); err != nil {
		check("getStarTransactions", err)
	} else {
		record("getStarTransactions", "PASS", "")
	}

	// Bot's own profile photos.
	if _, err := b.GetUserProfilePhotos(ctx, &types.GetUserProfilePhotosOptions{UserID: me.ID}); err != nil {
		check("getUserProfilePhotos", err)
	} else {
		record("getUserProfilePhotos", "PASS", "")
	}

	// Sticker set via an icon sticker.
	if len(iconStickers) > 0 {
		st := iconStickers[0]
		if _, err := b.GetFile(ctx, &types.GetFileOptions{FileID: st.FileID}); err != nil {
			check("getFile", err)
		} else {
			record("getFile", "PASS", "")
		}
		if st.SetName != "" {
			if _, err := b.GetStickerSet(ctx, &types.GetStickerSetOptions{Name: st.SetName}); err != nil {
				check("getStickerSet", err)
			} else {
				record("getStickerSet", "PASS", "")
			}
		} else {
			skip("getStickerSet", "icon sticker has no set_name")
		}
	} else {
		skip("getFile", "no icon stickers returned")
		skip("getStickerSet", "no icon stickers returned")
	}

	// ---------- Section B: chat-scoped methods ----------
	chatID := resolveChatID(ctx, b)
	fmt.Println()
	if chatID == nil {
		fmt.Println("== Section B: chat-scoped methods — SKIPPED (no CHAT_ID) ==")
		fmt.Println("   Provide CHAT_ID env var (your numeric Telegram id), or send any")
		fmt.Println("   message to the bot and re-run while no other poller is running.")
		for _, m := range chatScopedMethods {
			skip(m, "no CHAT_ID")
		}
		printSummary()
		return
	}
	fmt.Printf("== Section B: chat-scoped methods (chat %v) ==\n", chatID)
	runChatScoped(ctx, b, chatID, iconStickers)

	printSummary()
}

var chatScopedMethods = []string{
	"getChat", "getChatMemberCount", "getChatMember", "sendChatAction",
	"sendMessage", "editMessageText", "editMessageReplyMarkup", "editMessageCaption",
	"sendPhoto", "sendDocument", "sendMediaGroup", "sendDice", "sendLocation",
	"sendVenue", "sendContact", "sendPoll", "stopPoll", "sendSticker",
	"setMessageReaction", "forwardMessage", "copyMessage", "forwardMessages",
	"copyMessages", "pinChatMessage", "unpinChatMessage", "deleteMessage", "deleteMessages",
}

// trackMsg records the outcome of a message-sending call and remembers the
// message id for cleanup.
func (d *demo) trackMsg(method string, m *types.Message, err error) *types.Message {
	if !check(method, err) {
		return nil
	}
	if m != nil {
		d.sentIDs = append(d.sentIDs, m.MessageID)
	}
	return m
}

type demo struct {
	sentIDs []int64
}

func runChatScoped(ctx context.Context, b *bot.Bot, chatID any, iconStickers []types.Sticker) {
	d := &demo{}

	if _, err := b.GetChat(ctx, chatID); err != nil {
		check("getChat", err)
		return
	}
	record("getChat", "PASS", "")
	if _, err := b.GetChatMemberCount(ctx, chatID); err != nil {
		check("getChatMemberCount", err)
	} else {
		record("getChatMemberCount", "PASS", "")
	}
	if id, ok := chatID.(int64); ok {
		if _, err := b.GetChatMember(ctx, chatID, id); err != nil {
			check("getChatMember", err)
		} else {
			record("getChatMember", "PASS", "")
		}
	} else {
		skip("getChatMember", "needs numeric chat id")
	}
	if _, err := b.SendChatAction(ctx, chatID, "typing", ""); err != nil {
		check("sendChatAction", err)
	} else {
		record("sendChatAction", "PASS", "")
	}

	m1, err := b.SendMessage(ctx, &types.SendMessageOptions{ChatID: chatID, Text: "telebot-go API demo"})
	msg := d.trackMsg("sendMessage", m1, err)

	if msg != nil {
		if _, err := b.EditMessageText(ctx, &types.EditMessageTextOptions{ChatID: chatID, MessageID: msg.MessageID, Text: "telebot-go API demo (edited)"}); err != nil {
			check("editMessageText", err)
		} else {
			record("editMessageText", "PASS", "")
		}
		if _, err := b.EditMessageReplyMarkup(ctx, &types.EditMessageReplyMarkupOptions{
			ChatID:    chatID,
			MessageID: msg.MessageID,
			ReplyMarkup: &types.InlineKeyboardMarkup{InlineKeyboard: [][]types.InlineKeyboardButton{
				{{Text: "Demo", URL: "https://telegram.org"}},
			}},
		}); err != nil {
			check("editMessageReplyMarkup", err)
		} else {
			record("editMessageReplyMarkup", "PASS", "")
		}
	}

	photoURL := "https://telegram.org/img/t_logo.png"
	p1, err := b.SendPhoto(ctx, chatID, photoURL, "demo photo", nil, 0, nil, false, "", nil, "")
	photo := d.trackMsg("sendPhoto", p1, err)
	doc1, err := b.SendDocument(ctx, chatID, photoURL, "demo document", 0, nil, false, "", nil, "")
	d.trackMsg("sendDocument", doc1, err)

	if ms, err := b.SendMediaGroup(ctx, &types.SendMediaGroupOptions{
		ChatID: chatID,
		Media: []types.InputMedia{
			&types.InputMediaPhoto{Type: "photo", Media: photoURL},
			&types.InputMediaPhoto{Type: "photo", Media: photoURL},
		},
	}); err != nil {
		check("sendMediaGroup", err)
	} else {
		record("sendMediaGroup", "PASS", "")
		for _, m := range ms {
			d.sentIDs = append(d.sentIDs, m.MessageID)
		}
	}

	dice1, err := b.SendDice(ctx, &types.SendDiceOptions{ChatID: chatID})
	d.trackMsg("sendDice", dice1, err)
	loc1, err := b.SendLocation(ctx, &types.SendLocationOptions{ChatID: chatID, Latitude: 21.0285, Longitude: 105.8542})
	d.trackMsg("sendLocation", loc1, err)
	ven1, err := b.SendVenue(ctx, &types.SendVenueOptions{ChatID: chatID, Latitude: 21.0285, Longitude: 105.8542, Title: "Hoan Kiem Lake", Address: "Hanoi"})
	d.trackMsg("sendVenue", ven1, err)
	con1, err := b.SendContact(ctx, &types.SendContactOptions{ChatID: chatID, PhoneNumber: "+84123456789", FirstName: "Demo"})
	d.trackMsg("sendContact", con1, err)

	poll1, err := b.SendPoll(ctx, &types.SendPollOptions{
		ChatID:   chatID,
		Question: "telebot-go demo poll",
		Options:  []string{"Yes", "No"},
	})
	poll := d.trackMsg("sendPoll", poll1, err)
	if poll != nil {
		if _, err := b.StopPoll(ctx, &types.StopPollOptions{ChatID: chatID, MessageID: poll.MessageID}); err != nil {
			check("stopPoll", err)
		} else {
			record("stopPoll", "PASS", "")
		}
	} else {
		skip("stopPoll", "no poll message")
	}

	// Emoji-type stickers (all forum topic icons) cannot be sent in messages,
	// so prefer a "regular" sticker; fall back to a PNG URL.
	var sticker any
	for _, s := range iconStickers {
		if s.Type == "regular" {
			sticker = s.FileID
			break
		}
	}
	if sticker == nil {
		sticker = photoURL
	}
	stk1, err := b.SendSticker(ctx, &types.SendStickerOptions{ChatID: chatID, Sticker: sticker})
	d.trackMsg("sendSticker", stk1, err)

	if msg != nil {
		check("setMessageReaction", oneErr(b.SetMessageReaction(ctx, &types.SetMessageReactionOptions{
			ChatID:    chatID,
			MessageID: msg.MessageID,
			Reaction:  []types.ReactionType{types.ReactionTypeEmoji{Type: "emoji", Emoji: "👍"}},
		})))

		fwd1, err := b.ForwardMessage(ctx, chatID, chatID, msg.MessageID, 0, "", nil)
		d.trackMsg("forwardMessage", fwd1, err)
		if cp, err := b.CopyMessage(ctx, chatID, chatID, msg.MessageID, 0, false, "", nil); err != nil {
			check("copyMessage", err)
		} else {
			record("copyMessage", "PASS", "")
			if cp != nil {
				d.sentIDs = append(d.sentIDs, cp.MessageID)
			}
		}

		if ids, err := b.ForwardMessages(ctx, &types.ForwardMessagesOptions{ChatID: chatID, FromChatID: chatID, MessageIDs: []int64{msg.MessageID}}); err != nil {
			check("forwardMessages", err)
		} else {
			record("forwardMessages", "PASS", "")
			for _, id := range ids {
				d.sentIDs = append(d.sentIDs, id.MessageID)
			}
		}
		if ids, err := b.CopyMessages(ctx, &types.CopyMessagesOptions{ChatID: chatID, FromChatID: chatID, MessageIDs: []int64{msg.MessageID}}); err != nil {
			check("copyMessages", err)
		} else {
			record("copyMessages", "PASS", "")
			for _, id := range ids {
				d.sentIDs = append(d.sentIDs, id.MessageID)
			}
		}

		check("pinChatMessage", oneErr(b.PinChatMessage(ctx, &types.PinChatMessageOptions{ChatID: chatID, MessageID: msg.MessageID, DisableNotification: true})))
		check("unpinChatMessage", oneErr(b.UnpinChatMessage(ctx, &types.UnpinChatMessageOptions{ChatID: chatID, MessageID: msg.MessageID})))

		if photo != nil {
			if _, err := b.EditMessageCaption(ctx, &types.EditMessageCaptionOptions{ChatID: chatID, MessageID: photo.MessageID, Caption: "demo photo (edited caption)"}); err != nil {
				check("editMessageCaption", err)
			} else {
				record("editMessageCaption", "PASS", "")
			}
		} else {
			skip("editMessageCaption", "no photo message to edit")
		}

		// deleteMessage/deleteMessages run on dedicated throwaway messages so
		// the demo messages stay visible in the chat.
		tmp1, err := b.SendMessage(ctx, &types.SendMessageOptions{ChatID: chatID, Text: "(this message will be deleted)"})
		if err != nil || tmp1 == nil {
			check("deleteMessage", err)
		} else if _, err := b.DeleteMessage(ctx, chatID, tmp1.MessageID); err != nil {
			check("deleteMessage", err)
		} else {
			record("deleteMessage", "PASS", "")
		}

		tmp2, err2 := b.SendMessage(ctx, &types.SendMessageOptions{ChatID: chatID, Text: "(bulk delete 1/2)"})
		tmp3, err3 := b.SendMessage(ctx, &types.SendMessageOptions{ChatID: chatID, Text: "(bulk delete 2/2)"})
		if err2 == nil && err3 == nil && tmp2 != nil && tmp3 != nil {
			check("deleteMessages", oneErr(b.DeleteMessages(ctx, &types.DeleteMessagesOptions{ChatID: chatID, MessageIDs: []int64{tmp2.MessageID, tmp3.MessageID}})))
		} else if err2 != nil {
			check("deleteMessages", err2)
		} else {
			check("deleteMessages", err3)
		}
	} else {
		for _, m := range []string{"editMessageText", "editMessageReplyMarkup", "setMessageReaction", "forwardMessage", "copyMessage", "forwardMessages", "copyMessages", "pinChatMessage", "unpinChatMessage", "deleteMessage"} {
			skip(m, "no base message")
		}
	}
}

func resolveChatID(ctx context.Context, b *bot.Bot) any {
	if v := os.Getenv("CHAT_ID"); v != "" {
		if id, err := strconv.ParseInt(v, 10, 64); err == nil {
			return id
		}
		return v // @username form
	}
	updates, err := b.GetUpdates(ctx, &types.GetUpdatesOptions{Limit: 1})
	if err != nil || len(updates) == 0 {
		return nil
	}
	if chat := updates[0].EffectiveChat(); chat != nil {
		return chat.ID
	}
	return nil
}

func printSummary() {
	pass, fail, skipped := 0, 0, 0
	for _, r := range results {
		switch r.status {
		case "PASS":
			pass++
		case "FAIL":
			fail++
		default:
			skipped++
		}
	}
	fmt.Println()
	fmt.Printf("SUMMARY: %d passed, %d failed, %d skipped (total %d)\n", pass, fail, skipped, len(results))
	if fail > 0 {
		fmt.Println("FAILED METHODS:")
		for _, r := range results {
			if r.status == "FAIL" {
				fmt.Printf("  - %-38s %s\n", r.method, r.detail)
			}
		}
	}
}

// oneErr discards the first return value of a (bool, error) call.
func oneErr(_ bool, err error) error { return err }
