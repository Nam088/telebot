package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// SendWidget sends a message with an HTML widget.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Widget sending options including ChatID and HTML.
//
// Returns:
//   - *types.Message: The sent message.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#sendwidget
func (b *Bot) SendWidget(ctx context.Context, opts *types.SendWidgetOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendWidget", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// SendSharedWidget sends again a shared widget created by the bot.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Shared widget options including ChatID and WidgetID.
//
// Returns:
//   - *types.Message: The sent message.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#sendsharedwidget
func (b *Bot) SendSharedWidget(ctx context.Context, opts *types.SendSharedWidgetOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendSharedWidget", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// AnswerWidgetQuery sends an answer to a query from a widget.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Query answer options including WidgetQueryID.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#answerwidgetquery
func (b *Bot) AnswerWidgetQuery(ctx context.Context, opts *types.AnswerWidgetQueryOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "answerWidgetQuery", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// EditMessageWidgetData edits data of a widget in a message sent by or via the bot.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Widget data edit options.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#editmessagewidgetdata
func (b *Bot) EditMessageWidgetData(ctx context.Context, opts *types.EditMessageWidgetDataOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "editMessageWidgetData", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// EditSharedWidgetData edits public data of a shared widget created by the bot.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Shared widget data edit options including WidgetID and PublicData.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#editsharedwidgetdata
func (b *Bot) EditSharedWidgetData(ctx context.Context, opts *types.EditSharedWidgetDataOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "editSharedWidgetData", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
