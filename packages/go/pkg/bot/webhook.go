package bot

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/Nam088/telebot-go/pkg/types"
)

// SetWebhook specifies a URL and receive incoming updates via an outgoing webhook.
func (b *Bot) SetWebhook(ctx context.Context, url string, secretToken string, maxConnections int) (bool, error) {
	payload := map[string]any{
		"url": url,
	}
	if secretToken != "" {
		payload["secret_token"] = secretToken
	}
	if maxConnections > 0 {
		payload["max_connections"] = maxConnections
	}
	var ok bool
	if err := b.Request(ctx, "setWebhook", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeleteWebhook removes webhook integration.
func (b *Bot) DeleteWebhook(ctx context.Context, dropPendingUpdates bool) (bool, error) {
	payload := map[string]any{
		"drop_pending_updates": dropPendingUpdates,
	}
	var ok bool
	if err := b.Request(ctx, "deleteWebhook", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetWebhookInfo gets current webhook status.
func (b *Bot) GetWebhookInfo(ctx context.Context) (*types.WebhookInfo, error) {
	var info types.WebhookInfo
	if err := b.Request(ctx, "getWebhookInfo", nil, &info); err != nil {
		return nil, err
	}
	return &info, nil
}

// WebhookHandler creates a standard http.HandlerFunc to process incoming updates from Telegram webhook.
func (b *Bot) WebhookHandler(secretToken string, updateHandler func(u *types.Update)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		if secretToken != "" {
			tokenHeader := r.Header.Get("X-Telegram-Bot-Api-Secret-Token")
			if tokenHeader != secretToken {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
		}

		body, err := io.ReadAll(io.LimitReader(r.Body, 10<<20)) // 10MB limit
		if err != nil {
			http.Error(w, "Bad Request", http.StatusBadRequest)
			return
		}

		var update types.Update
		if err := json.Unmarshal(body, &update); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		if updateHandler != nil {
			go updateHandler(&update)
		}

		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("OK"))
	}
}

// RunWebhook starts an HTTP server listening for Telegram webhook updates with graceful shutdown.
func (b *Bot) RunWebhook(ctx context.Context, addr, path, secretToken string, updateHandler func(u *types.Update)) error {
	mux := http.NewServeMux()
	mux.HandleFunc(path, b.WebhookHandler(secretToken, updateHandler))

	server := &http.Server{
		Addr:         addr,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	errChan := make(chan error, 1)
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errChan <- err
		}
	}()

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		return server.Shutdown(shutdownCtx)
	case err := <-errChan:
		return fmt.Errorf("webhook server error: %w", err)
	}
}
