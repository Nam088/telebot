package bot_test

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// resultServer serves {"ok":true,"result":<resultJSON>} where resultJSON is
// swapped per call via the returned setter.
func resultServer(t *testing.T) (*httptest.Server, func(string)) {
	t.Helper()
	var current atomic.Value
	current.Store(`true`)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `{"ok":true,"result":%s}`, current.Load().(string))
	}))
	t.Cleanup(server.Close)
	return server, func(resultJSON string) { current.Store(resultJSON) }
}

// errorServer serves a single Telegram API error envelope for every request.
func errorServer(t *testing.T) *httptest.Server {
	t.Helper()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"ok":false,"error_code":400,"description":"Bad Request"}`)
	}))
	t.Cleanup(server.Close)
	return server
}

func TestBot_ChatMethods_Success(t *testing.T) {
	server, setResult := resultServer(t)
	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	ctx := context.Background()

	setResult(`{"id":-100,"type":"supergroup","title":"Dev"}`)
	chat, err := b.GetChat(ctx, int64(-100))
	if err != nil || chat.Title != "Dev" {
		t.Fatalf("GetChat = (%+v, %v)", chat, err)
	}

	setResult(`[{"user":{"id":1,"first_name":"Admin"},"status":"creator"}]`)
	admins, err := b.GetChatAdministrators(ctx, int64(-100))
	if err != nil || len(admins) != 1 || admins[0].Status != "creator" {
		t.Fatalf("GetChatAdministrators = (%+v, %v)", admins, err)
	}

	setResult(`42`)
	count, err := b.GetChatMemberCount(ctx, int64(-100))
	if err != nil || count != 42 {
		t.Fatalf("GetChatMemberCount = (%d, %v)", count, err)
	}

	setResult(`true`)
	if ok, err := b.LeaveChat(ctx, int64(-100)); err != nil || !ok {
		t.Fatalf("LeaveChat = (%v, %v)", ok, err)
	}
	if ok, err := b.BanChatMember(ctx, int64(-100), 5, 0, false); err != nil || !ok {
		t.Fatalf("BanChatMember = (%v, %v)", ok, err)
	}
	if ok, err := b.BanChatMember(ctx, int64(-100), 5, 1700000000, true); err != nil || !ok {
		t.Fatalf("BanChatMember with until_date = (%v, %v)", ok, err)
	}
	if ok, err := b.UnbanChatMember(ctx, int64(-100), 5, true); err != nil || !ok {
		t.Fatalf("UnbanChatMember = (%v, %v)", ok, err)
	}
}

func TestBot_MessageMethods_Success(t *testing.T) {
	server, setResult := resultServer(t)
	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	ctx := context.Background()

	setResult(`{"message_id":11,"text":"photo caption"}`)
	msg, err := b.SendPhoto(ctx, int64(1), "https://example.com/cat.jpg", "photo caption", &types.InlineKeyboardMarkup{
		InlineKeyboard: [][]types.InlineKeyboardButton{{{Text: "btn", CallbackData: "d"}}},
	})
	if err != nil || msg.MessageID != 11 {
		t.Fatalf("SendPhoto = (%+v, %v)", msg, err)
	}

	// Branch without caption/markup.
	if _, err := b.SendPhoto(ctx, "@channel", "file_id", "", nil); err != nil {
		t.Fatalf("SendPhoto minimal = %v", err)
	}

	setResult(`{"message_id":12}`)
	if _, err := b.SendDocument(ctx, int64(1), "doc_id", ""); err != nil {
		t.Fatalf("SendDocument minimal = %v", err)
	}
	if _, err := b.SendDocument(ctx, int64(1), "doc_id", "caption"); err != nil {
		t.Fatalf("SendDocument with caption = %v", err)
	}

	setResult(`{"message_id":13,"text":"edited"}`)
	if _, err := b.EditMessageText(ctx, &types.EditMessageTextOptions{ChatID: 1, MessageID: 13, Text: "edited"}); err != nil {
		t.Fatalf("EditMessageText = %v", err)
	}
	if _, err := b.EditMessageReplyMarkup(ctx, &types.EditMessageReplyMarkupOptions{ChatID: 1, MessageID: 13}); err != nil {
		t.Fatalf("EditMessageReplyMarkup = %v", err)
	}

	setResult(`{"message_id":14}`)
	if _, err := b.ForwardMessage(ctx, int64(1), int64(2), 14); err != nil {
		t.Fatalf("ForwardMessage = %v", err)
	}

	setResult(`{"message_id":15}`)
	mid, err := b.CopyMessage(ctx, int64(1), int64(2), 14)
	if err != nil || mid.MessageID != 15 {
		t.Fatalf("CopyMessage = (%+v, %v)", mid, err)
	}

	setResult(`true`)
	if ok, err := b.SendChatAction(ctx, int64(1), "typing"); err != nil || !ok {
		t.Fatalf("SendChatAction = (%v, %v)", ok, err)
	}
}

func TestBot_TopicMethods_Success(t *testing.T) {
	server, setResult := resultServer(t)
	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	ctx := context.Background()

	setResult(`{"message_thread_id":4,"name":"General"}`)
	topic, err := b.CreateForumTopic(ctx, int64(-100), "General", 0x3FB549, "emoji-1")
	if err != nil || topic.Name != "General" || topic.MessageThreadID != 4 {
		t.Fatalf("CreateForumTopic = (%+v, %v)", topic, err)
	}
	// Branch omitting optional icon fields.
	if _, err := b.CreateForumTopic(ctx, int64(-100), "Plain", 0, ""); err != nil {
		t.Fatalf("CreateForumTopic minimal = %v", err)
	}

	setResult(`true`)
	if ok, err := b.CloseForumTopic(ctx, int64(-100), 4); err != nil || !ok {
		t.Fatalf("CloseForumTopic = (%v, %v)", ok, err)
	}
}

// TestBot_Methods_ApiError drives every option-struct based method against an
// error envelope so each method's error branch is exercised.
func TestBot_Methods_ApiError(t *testing.T) {
	server := errorServer(t)
	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	ctx := context.Background()

	if _, err := b.GetMe(ctx); err == nil {
		t.Error("GetMe: expected error")
	}
	if _, err := b.SendMessage(ctx, &types.SendMessageOptions{ChatID: 1, Text: "x"}); err == nil {
		t.Error("SendMessage: expected error")
	}
	if _, err := b.GetUpdates(ctx, &types.GetUpdatesOptions{}); err == nil {
		t.Error("GetUpdates: expected error")
	}
	if _, err := b.AnswerCallbackQuery(ctx, &types.AnswerCallbackQueryOptions{CallbackQueryID: "c"}); err == nil {
		t.Error("AnswerCallbackQuery: expected error")
	}
	if _, err := b.DeleteMessage(ctx, 1, 2); err == nil {
		t.Error("DeleteMessage: expected error")
	}
	if _, err := b.GetChat(ctx, 1); err == nil {
		t.Error("GetChat: expected error")
	}
	if _, err := b.GetChatAdministrators(ctx, 1); err == nil {
		t.Error("GetChatAdministrators: expected error")
	}
	if _, err := b.GetChatMemberCount(ctx, 1); err == nil {
		t.Error("GetChatMemberCount: expected error")
	}
	if _, err := b.LeaveChat(ctx, 1); err == nil {
		t.Error("LeaveChat: expected error")
	}
	if _, err := b.BanChatMember(ctx, 1, 2, 0, false); err == nil {
		t.Error("BanChatMember: expected error")
	}
	if _, err := b.UnbanChatMember(ctx, 1, 2, false); err == nil {
		t.Error("UnbanChatMember: expected error")
	}
	if _, err := b.SendPhoto(ctx, 1, "p", "", nil); err == nil {
		t.Error("SendPhoto: expected error")
	}
	if _, err := b.SendDocument(ctx, 1, "d", ""); err == nil {
		t.Error("SendDocument: expected error")
	}
	if _, err := b.EditMessageText(ctx, &types.EditMessageTextOptions{}); err == nil {
		t.Error("EditMessageText: expected error")
	}
	if _, err := b.EditMessageReplyMarkup(ctx, &types.EditMessageReplyMarkupOptions{}); err == nil {
		t.Error("EditMessageReplyMarkup: expected error")
	}
	if _, err := b.ForwardMessage(ctx, 1, 2, 3); err == nil {
		t.Error("ForwardMessage: expected error")
	}
	if _, err := b.CopyMessage(ctx, 1, 2, 3); err == nil {
		t.Error("CopyMessage: expected error")
	}
	if _, err := b.SendChatAction(ctx, 1, "typing"); err == nil {
		t.Error("SendChatAction: expected error")
	}
	if _, err := b.CreateForumTopic(ctx, 1, "n", 0, ""); err == nil {
		t.Error("CreateForumTopic: expected error")
	}
	if _, err := b.CloseForumTopic(ctx, 1, 2); err == nil {
		t.Error("CloseForumTopic: expected error")
	}
	if _, err := b.SetWebhook(ctx, "https://x", "", 0); err == nil {
		t.Error("SetWebhook: expected error")
	}
	if _, err := b.DeleteWebhook(ctx, false); err == nil {
		t.Error("DeleteWebhook: expected error")
	}
	if _, err := b.GetWebhookInfo(ctx); err == nil {
		t.Error("GetWebhookInfo: expected error")
	}

	// Chat management / profile / invite / inline / files option methods.
	if _, err := b.SetChatTitle(ctx, &types.SetChatTitleOptions{}); err == nil {
		t.Error("SetChatTitle: expected error")
	}
	if _, err := b.SetChatDescription(ctx, &types.SetChatDescriptionOptions{}); err == nil {
		t.Error("SetChatDescription: expected error")
	}
	if _, err := b.SetChatPhoto(ctx, &types.SetChatPhotoOptions{}); err == nil {
		t.Error("SetChatPhoto: expected error")
	}
	if _, err := b.DeleteChatPhoto(ctx, &types.DeleteChatPhotoOptions{}); err == nil {
		t.Error("DeleteChatPhoto: expected error")
	}
	if _, err := b.PinChatMessage(ctx, &types.PinChatMessageOptions{}); err == nil {
		t.Error("PinChatMessage: expected error")
	}
	if _, err := b.UnpinChatMessage(ctx, &types.UnpinChatMessageOptions{}); err == nil {
		t.Error("UnpinChatMessage: expected error")
	}
	if _, err := b.UnpinAllChatMessages(ctx, &types.UnpinAllChatMessagesOptions{}); err == nil {
		t.Error("UnpinAllChatMessages: expected error")
	}
	if _, err := b.SetChatPermissions(ctx, &types.SetChatPermissionsOptions{}); err == nil {
		t.Error("SetChatPermissions: expected error")
	}
	if _, err := b.ExportChatInviteLink(ctx, &types.ExportChatInviteLinkOptions{}); err == nil {
		t.Error("ExportChatInviteLink: expected error")
	}
	if _, err := b.SetChatMenuButton(ctx, &types.SetChatMenuButtonOptions{}); err == nil {
		t.Error("SetChatMenuButton: expected error")
	}
	if _, err := b.GetChatMenuButton(ctx, &types.GetChatMenuButtonOptions{}); err == nil {
		t.Error("GetChatMenuButton: expected error")
	}
	if _, err := b.SetMyDefaultAdministratorRights(ctx, &types.SetMyDefaultAdministratorRightsOptions{}); err == nil {
		t.Error("SetMyDefaultAdministratorRights: expected error")
	}
	if _, err := b.GetMyDefaultAdministratorRights(ctx, &types.GetMyDefaultAdministratorRightsOptions{}); err == nil {
		t.Error("GetMyDefaultAdministratorRights: expected error")
	}
	if _, err := b.CreateChatInviteLink(ctx, &types.CreateChatInviteLinkOptions{}); err == nil {
		t.Error("CreateChatInviteLink: expected error")
	}
	if _, err := b.EditChatInviteLink(ctx, &types.EditChatInviteLinkOptions{}); err == nil {
		t.Error("EditChatInviteLink: expected error")
	}
	if _, err := b.RevokeChatInviteLink(ctx, &types.RevokeChatInviteLinkOptions{}); err == nil {
		t.Error("RevokeChatInviteLink: expected error")
	}
	if _, err := b.LogOut(ctx); err == nil {
		t.Error("LogOut: expected error")
	}
	if _, err := b.Close(ctx); err == nil {
		t.Error("Close: expected error")
	}
	if _, err := b.SetMyName(ctx, &types.SetMyNameOptions{}); err == nil {
		t.Error("SetMyName: expected error")
	}
	if _, err := b.GetMyName(ctx, &types.GetMyNameOptions{}); err == nil {
		t.Error("GetMyName: expected error")
	}
	if _, err := b.SetMyDescription(ctx, &types.SetMyDescriptionOptions{}); err == nil {
		t.Error("SetMyDescription: expected error")
	}
	if _, err := b.GetMyDescription(ctx, &types.GetMyDescriptionOptions{}); err == nil {
		t.Error("GetMyDescription: expected error")
	}
	if _, err := b.SetMyShortDescription(ctx, &types.SetMyShortDescriptionOptions{}); err == nil {
		t.Error("SetMyShortDescription: expected error")
	}
	if _, err := b.GetMyShortDescription(ctx, &types.GetMyShortDescriptionOptions{}); err == nil {
		t.Error("GetMyShortDescription: expected error")
	}
	if _, err := b.SetMyCommands(ctx, &types.SetMyCommandsOptions{}); err == nil {
		t.Error("SetMyCommands: expected error")
	}
	if _, err := b.GetMyCommands(ctx, &types.GetMyCommandsOptions{}); err == nil {
		t.Error("GetMyCommands: expected error")
	}
	if _, err := b.DeleteMyCommands(ctx, &types.DeleteMyCommandsOptions{}); err == nil {
		t.Error("DeleteMyCommands: expected error")
	}
	if _, err := b.GetUserProfilePhotos(ctx, &types.GetUserProfilePhotosOptions{}); err == nil {
		t.Error("GetUserProfilePhotos: expected error")
	}
	if _, err := b.AnswerWebAppQuery(ctx, &types.AnswerWebAppQueryOptions{}); err == nil {
		t.Error("AnswerWebAppQuery: expected error")
	}
	if _, err := b.SavePreparedInlineMessage(ctx, &types.SavePreparedInlineMessageOptions{}); err == nil {
		t.Error("SavePreparedInlineMessage: expected error")
	}
}

func TestBot_GetChatMenuButton_Variants(t *testing.T) {
	server, setResult := resultServer(t)
	b := bot.NewBot("token", bot.WithBaseURL(server.URL))
	ctx := context.Background()

	setResult(`{"type":"commands"}`)
	btn, err := b.GetChatMenuButton(ctx, &types.GetChatMenuButtonOptions{})
	if err != nil {
		t.Fatalf("commands variant failed: %v", err)
	}
	if _, ok := btn.(types.MenuButtonCommands); !ok {
		t.Errorf("expected MenuButtonCommands, got %T", btn)
	}

	setResult(`{"type":"web_app","text":"Open","web_app":{"url":"https://app"}}`)
	btn, err = b.GetChatMenuButton(ctx, &types.GetChatMenuButtonOptions{})
	if err != nil {
		t.Fatalf("web_app variant failed: %v", err)
	}
	if _, ok := btn.(types.MenuButtonWebApp); !ok {
		t.Errorf("expected MenuButtonWebApp, got %T", btn)
	}

	setResult(`{"type":"default"}`)
	btn, err = b.GetChatMenuButton(ctx, &types.GetChatMenuButtonOptions{})
	if err != nil {
		t.Fatalf("default variant failed: %v", err)
	}
	if _, ok := btn.(types.MenuButtonDefault); !ok {
		t.Errorf("expected MenuButtonDefault, got %T", btn)
	}

	setResult(`{"type":"hologram"}`)
	if _, err = b.GetChatMenuButton(ctx, &types.GetChatMenuButtonOptions{}); err == nil {
		t.Error("expected error for unsupported menu button type")
	}

	setResult(`not-an-object`)
	if _, err = b.GetChatMenuButton(ctx, &types.GetChatMenuButtonOptions{}); err == nil {
		t.Error("expected error for malformed menu button JSON")
	}
}
