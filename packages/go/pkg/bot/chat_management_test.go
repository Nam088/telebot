package bot_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/types"
)

func TestBot_SetChatTitle(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/bottest_token/setChatTitle" {
			t.Errorf("unexpected path: %s", r.URL.Path)
		}
		var payload types.SetChatTitleOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		cid, ok := payload.ChatID.(float64)
		if !ok || cid != 1 || payload.Title != "New Title" {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ok, err := b.SetChatTitle(context.Background(), &types.SetChatTitleOptions{
		ChatID: int64(1),
		Title:  "New Title",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestBot_SetChatDescription(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload types.SetChatDescriptionOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		if payload.ChatID != "@channel" || payload.Description != "desc" {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ok, err := b.SetChatDescription(context.Background(), &types.SetChatDescriptionOptions{
		ChatID:      "@channel",
		Description: "desc",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestBot_SetChatPhoto(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload types.SetChatPhotoOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		cid, ok := payload.ChatID.(float64)
		if !ok || cid != 1 || payload.Photo != "photo_id" {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ok, err := b.SetChatPhoto(context.Background(), &types.SetChatPhotoOptions{
		ChatID: int64(1),
		Photo:  "photo_id",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestBot_DeleteChatPhoto(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload types.DeleteChatPhotoOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		cid, ok := payload.ChatID.(float64)
		if !ok || cid != 1 {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ok, err := b.DeleteChatPhoto(context.Background(), &types.DeleteChatPhotoOptions{ChatID: int64(1)})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestBot_PinChatMessage(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload types.PinChatMessageOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		cid, ok := payload.ChatID.(float64)
		if !ok || cid != 1 || payload.MessageID != 42 || !payload.DisableNotification {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ok, err := b.PinChatMessage(context.Background(), &types.PinChatMessageOptions{
		ChatID:              int64(1),
		MessageID:           42,
		DisableNotification: true,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestBot_UnpinChatMessage(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload types.UnpinChatMessageOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		cid, ok := payload.ChatID.(float64)
		if !ok || cid != 1 || payload.MessageID != 42 {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ok, err := b.UnpinChatMessage(context.Background(), &types.UnpinChatMessageOptions{
		ChatID:    int64(1),
		MessageID: 42,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestBot_UnpinAllChatMessages(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload types.UnpinAllChatMessagesOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		cid, ok := payload.ChatID.(float64)
		if !ok || cid != 1 {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ok, err := b.UnpinAllChatMessages(context.Background(), &types.UnpinAllChatMessagesOptions{ChatID: int64(1)})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestBot_SetChatPermissions(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload types.SetChatPermissionsOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		cid, ok := payload.ChatID.(float64)
		if !ok || cid != 1 || !payload.Permissions.CanSendMessages || !payload.UseIndependentChatPermissions {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ok, err := b.SetChatPermissions(context.Background(), &types.SetChatPermissionsOptions{
		ChatID: int64(1),
		Permissions: types.ChatPermissions{
			CanSendMessages: true,
		},
		UseIndependentChatPermissions: true,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestBot_ExportChatInviteLink(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload types.ExportChatInviteLinkOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		cid, ok := payload.ChatID.(float64)
		if !ok || cid != 1 {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[string]{Ok: true, Result: "https://t.me/join/test"})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	link, err := b.ExportChatInviteLink(context.Background(), &types.ExportChatInviteLinkOptions{ChatID: int64(1)})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if link != "https://t.me/join/test" {
		t.Errorf("unexpected link: %s", link)
	}
}

func TestBot_SetChatMenuButton(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload map[string]json.RawMessage
		_ = json.NewDecoder(r.Body).Decode(&payload)
		if string(payload["chat_id"]) != "1" {
			t.Errorf("unexpected chat_id: %s", payload["chat_id"])
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ok, err := b.SetChatMenuButton(context.Background(), &types.SetChatMenuButtonOptions{
		ChatID:     int64(1),
		MenuButton: types.MenuButtonCommands{Type: "commands"},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestBot_GetChatMenuButton(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[types.MenuButtonWebApp]{
			Ok: true,
			Result: types.MenuButtonWebApp{
				Type:   "web_app",
				Text:   "Open",
				WebApp: types.WebAppInfo{URL: "https://example.com"},
			},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	btn, err := b.GetChatMenuButton(context.Background(), &types.GetChatMenuButtonOptions{ChatID: int64(1)})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	webApp, ok := btn.(types.MenuButtonWebApp)
	if !ok {
		t.Fatalf("expected MenuButtonWebApp, got %T", btn)
	}
	if webApp.Text != "Open" {
		t.Errorf("unexpected text: %s", webApp.Text)
	}
}

func TestBot_GetChatMenuButton_Default(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[types.MenuButtonDefault]{
			Ok:     true,
			Result: types.MenuButtonDefault{Type: "default"},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	btn, err := b.GetChatMenuButton(context.Background(), nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := btn.(types.MenuButtonDefault); !ok {
		t.Fatalf("expected MenuButtonDefault, got %T", btn)
	}
}

func TestBot_GetChatMenuButton_Unsupported(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[map[string]string]{
			Ok:     true,
			Result: map[string]string{"type": "unknown"},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	_, err := b.GetChatMenuButton(context.Background(), nil)
	if err == nil {
		t.Fatalf("expected error for unsupported menu button type")
	}
}

func TestBot_SetMyDefaultAdministratorRights(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var payload types.SetMyDefaultAdministratorRightsOptions
		_ = json.NewDecoder(r.Body).Decode(&payload)
		if payload.Rights == nil || !payload.Rights.CanManageChat || !payload.ForChannels {
			t.Errorf("unexpected payload: %+v", payload)
		}
		_ = json.NewEncoder(w).Encode(types.Response[bool]{Ok: true, Result: true})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	ok, err := b.SetMyDefaultAdministratorRights(context.Background(), &types.SetMyDefaultAdministratorRightsOptions{
		Rights: &types.ChatAdministratorRights{
			CanManageChat: true,
		},
		ForChannels: true,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ok {
		t.Errorf("expected true")
	}
}

func TestBot_GetMyDefaultAdministratorRights(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(types.Response[types.ChatAdministratorRights]{
			Ok: true,
			Result: types.ChatAdministratorRights{
				CanManageChat: true,
			},
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	rights, err := b.GetMyDefaultAdministratorRights(context.Background(), &types.GetMyDefaultAdministratorRightsOptions{ForChannels: true})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !rights.CanManageChat {
		t.Errorf("expected CanManageChat true")
	}
}

func TestBot_ChatManagement_TelegramError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(types.Response[any]{
			Ok:          false,
			ErrorCode:   400,
			Description: "Bad Request: chat not found",
		})
	}))
	defer server.Close()

	b := bot.NewBot("test_token", bot.WithBaseURL(server.URL))
	_, err := b.SetChatTitle(context.Background(), &types.SetChatTitleOptions{ChatID: int64(1), Title: "x"})
	if err == nil {
		t.Fatalf("expected TelegramError")
	}
	telegramErr, ok := err.(*types.TelegramError)
	if !ok {
		t.Fatalf("expected *types.TelegramError, got %T", err)
	}
	if telegramErr.ErrorCode != 400 {
		t.Errorf("unexpected error code: %d", telegramErr.ErrorCode)
	}
}
