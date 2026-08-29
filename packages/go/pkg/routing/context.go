package routing

import (
	"context"
	"fmt"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/types"
)

// Context encapsulates information about the incoming Telegram update,
// providing shortcut helpers for replying, editing, and managing user/chat sessions.
type Context struct {
	ctx      context.Context
	bot      *bot.Bot
	update   *types.Update
	userData map[string]any
	chatData map[string]any
}

// NewContext constructs a new Context instance for an incoming update.
//
// Parameters:
//   - ctx: Go context for cancellation/timeout propagation.
//   - b: Bot HTTP client instance.
//   - u: Incoming Telegram Update.
//
// Returns:
//   - *Context: Initialized context wrapper.
func NewContext(ctx context.Context, b *bot.Bot, u *types.Update) *Context {
	return &Context{
		ctx:      ctx,
		bot:      b,
		update:   u,
		userData: make(map[string]any),
		chatData: make(map[string]any),
	}
}

// Ctx returns the underlying context.Context.
func (c *Context) Ctx() context.Context {
	if c.ctx == nil {
		return context.Background()
	}
	return c.ctx
}

// Bot returns the Bot client associated with this execution context.
func (c *Context) Bot() *bot.Bot {
	return c.bot
}

// Update returns the raw incoming Telegram Update.
func (c *Context) Update() *types.Update {
	return c.update
}

// Message returns the effective Message extracted from the update (Message, EditedMessage, or CallbackQuery.Message).
func (c *Context) Message() *types.Message {
	return c.update.EffectiveMessage()
}

// User returns the effective sender User extracted from the update.
func (c *Context) User() *types.User {
	return c.update.EffectiveUser()
}

// Chat returns the effective target Chat extracted from the update.
func (c *Context) Chat() *types.Chat {
	return c.update.EffectiveChat()
}

// CallbackQuery returns the CallbackQuery object if the update is an inline button interaction.
func (c *Context) CallbackQuery() *types.CallbackQuery {
	return c.update.CallbackQuery
}

// Reply sends a text reply to the effective chat in this context.
//
// Parameters:
//   - text: Text message to send.
//   - opts: Functional option modifiers for SendMessageOptions (e.g. parse_mode, reply_markup).
//
// Returns:
//   - *types.Message: The newly created message on success.
//   - error: Error if sending failed or effective chat is nil.
//
// Example:
//
//	_, err := c.Reply("Hello!", func(o *types.SendMessageOptions) {
//	    o.ParseMode = "HTML"
//	})
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

// AnswerCallbackQuery answers an incoming inline callback query with notification or alert.
//
// Parameters:
//   - text: Notification text shown to the user (0-200 characters).
//   - showAlert: If true, shows an alert popup with an OK button instead of a top toast notification.
//
// Returns:
//   - bool: True on success.
//   - error: Error if the context does not contain a callback query or API rejected.
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
