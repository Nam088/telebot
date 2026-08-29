package routing

import (
	"context"
	"fmt"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/types"
)

// Context encapsulates information about the incoming update and helper methods.
type Context struct {
	ctx      context.Context
	bot      *bot.Bot
	update   *types.Update
	userData map[string]any
	chatData map[string]any
}

// NewContext constructs a new Context instance.
func NewContext(ctx context.Context, b *bot.Bot, u *types.Update) *Context {
	return &Context{
		ctx:      ctx,
		bot:      b,
		update:   u,
		userData: make(map[string]any),
		chatData: make(map[string]any),
	}
}

// Ctx returns the context.Context.
func (c *Context) Ctx() context.Context {
	if c.ctx == nil {
		return context.Background()
	}
	return c.ctx
}

// Bot returns the Bot client.
func (c *Context) Bot() *bot.Bot {
	return c.bot
}

// Update returns the incoming Update.
func (c *Context) Update() *types.Update {
	return c.update
}

// Message returns the effective message or nil.
func (c *Context) Message() *types.Message {
	return c.update.EffectiveMessage()
}

// User returns the effective sender User or nil.
func (c *Context) User() *types.User {
	return c.update.EffectiveUser()
}

// Chat returns the effective target Chat or nil.
func (c *Context) Chat() *types.Chat {
	return c.update.EffectiveChat()
}

// CallbackQuery returns the CallbackQuery if present.
func (c *Context) CallbackQuery() *types.CallbackQuery {
	return c.update.CallbackQuery
}

// Reply sends a text reply to the current chat.
func (c *Context) Reply(text string, opts ...func(*types.SendMessageOptions)) (*types.Message, error) {
	chat := c.Chat()
	if chat == nil {
		return nil, fmt.Errorf("cannot reply: effective chat is nil")
	}

	sendOpts := types.SendMessageOptions{
		ChatID: chat.ID,
		Text:   text,
	}
	for _, opt := range opts {
		opt(&sendOpts)
	}

	return c.bot.SendMessage(c.Ctx(), &sendOpts)
}

// AnswerCallbackQuery answers an inline button callback query.
func (c *Context) AnswerCallbackQuery(text string, showAlert bool) (bool, error) {
	cb := c.CallbackQuery()
	if cb == nil {
		return false, fmt.Errorf("no callback query in context")
	}

	return c.bot.AnswerCallbackQuery(c.Ctx(), &types.AnswerCallbackQueryOptions{
		CallbackQueryID: cb.ID,
		Text:            text,
		ShowAlert:       showAlert,
	})
}
