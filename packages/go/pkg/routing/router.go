package routing

import (
	"context"
	"strings"
	"sync"
	"time"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// HandlerFunc defines the signature for route handling functions.
type HandlerFunc func(c *Context) error

// MiddlewareFunc defines middleware interceptors.
type MiddlewareFunc func(next HandlerFunc) HandlerFunc

// Route defines an update matching rule and its handler.
type Route struct {
	Filter  func(u *types.Update) bool
	Handler HandlerFunc
}

// Router orchestrates update dispatching, middlewares, and long polling.
type Router struct {
	bot         *bot.Bot
	middlewares []MiddlewareFunc
	routes      []Route
	mu          sync.RWMutex
}

// NewRouter creates a new update Router.
func NewRouter(b *bot.Bot) *Router {
	return &Router{
		bot: b,
	}
}

// Use adds global middlewares.
func (r *Router) Use(m ...MiddlewareFunc) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.middlewares = append(r.middlewares, m...)
}

// Handle registers a handler with a custom filter predicate.
func (r *Router) Handle(filter func(u *types.Update) bool, handler HandlerFunc) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.routes = append(r.routes, Route{
		Filter:  filter,
		Handler: handler,
	})
}

// Command registers a command handler (e.g. "/start", "help").
func (r *Router) Command(command string, handler HandlerFunc) {
	cleanCmd := "/" + strings.TrimPrefix(command, "/")
	r.Handle(func(u *types.Update) bool {
		msg := u.EffectiveMessage()
		if msg == nil || msg.Text == "" {
			return false
		}
		fields := strings.Fields(msg.Text)
		if len(fields) == 0 {
			return false
		}
		cmdPart := strings.Split(fields[0], "@")[0]
		return strings.EqualFold(cmdPart, cleanCmd)
	}, handler)
}

// Text registers a text message handler.
func (r *Router) Text(pattern string, handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		msg := u.EffectiveMessage()
		if msg == nil || msg.Text == "" {
			return false
		}
		if pattern == "" {
			return true
		}
		return strings.Contains(msg.Text, pattern)
	}, handler)
}

// CallbackQuery registers a handler matching callback query data.
func (r *Router) CallbackQuery(data string, handler HandlerFunc) {
	r.Handle(func(u *types.Update) bool {
		if u.CallbackQuery == nil {
			return false
		}
		if data == "" {
			return true
		}
		return u.CallbackQuery.Data == data
	}, handler)
}

// ProcessUpdate routes a single update through the middleware and matched handler.
func (r *Router) ProcessUpdate(ctx context.Context, u *types.Update) error {
	c := NewContext(ctx, r.bot, u)

	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, route := range r.routes {
		if route.Filter(u) {
			handler := route.Handler
			for i := len(r.middlewares) - 1; i >= 0; i-- {
				handler = r.middlewares[i](handler)
			}
			return handler(c)
		}
	}
	return nil
}

// RunPolling starts a long-polling update loop.
func (r *Router) RunPolling(ctx context.Context) error {
	var offset int64 = 0

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		updates, err := r.bot.GetUpdates(ctx, &types.GetUpdatesOptions{
			Offset:  offset,
			Timeout: 30,
		})
		if err != nil {
			time.Sleep(1 * time.Second)
			continue
		}

		for _, u := range updates {
			if u.UpdateID >= offset {
				offset = u.UpdateID + 1
			}

			go func(up types.Update) {
				_ = r.ProcessUpdate(ctx, &up)
			}(u)
		}
	}
}
