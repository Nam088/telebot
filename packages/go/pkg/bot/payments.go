package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// SendInvoice sends an invoice to a chat.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Invoice options including chat_id, title, prices and currency.
//
// Returns:
//   - *types.Message: The sent Message object on success.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#sendinvoice
func (b *Bot) SendInvoice(ctx context.Context, opts *types.SendInvoiceOptions) (*types.Message, error) {
	var msg types.Message
	if err := b.Request(ctx, "sendInvoice", opts, &msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

// CreateInvoiceLink creates a link for an invoice.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Invoice link options including title, description, payload, currency and prices.
//
// Returns:
//   - string: The created invoice link on success.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#createinvoicelink
func (b *Bot) CreateInvoiceLink(ctx context.Context, opts *types.CreateInvoiceLinkOptions) (string, error) {
	var link string
	if err := b.Request(ctx, "createInvoiceLink", opts, &link); err != nil {
		return "", err
	}
	return link, nil
}

// AnswerShippingQuery replies to a shipping query.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Answer options including shipping_query_id, ok flag and shipping options.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#answershippingquery
func (b *Bot) AnswerShippingQuery(ctx context.Context, opts *types.AnswerShippingQueryOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "answerShippingQuery", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// AnswerPreCheckoutQuery replies to a pre-checkout query.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Answer options including pre_checkout_query_id, ok flag and error message.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#answerprecheckoutquery
func (b *Bot) AnswerPreCheckoutQuery(ctx context.Context, opts *types.AnswerPreCheckoutQueryOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "answerPreCheckoutQuery", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetStarTransactions returns the bot's Telegram Stars transactions.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Pagination options including offset and limit.
//
// Returns:
//   - *types.StarTransactions: The list of transactions on success.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#getstartransactions
func (b *Bot) GetStarTransactions(ctx context.Context, opts *types.GetStarTransactionsOptions) (*types.StarTransactions, error) {
	var transactions types.StarTransactions
	if err := b.Request(ctx, "getStarTransactions", opts, &transactions); err != nil {
		return nil, err
	}
	return &transactions, nil
}

// RefundStarPayment refunds a successful payment in Telegram Stars.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Refund options including user_id and telegram_payment_charge_id.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#refundstarpayment
func (b *Bot) RefundStarPayment(ctx context.Context, opts *types.RefundStarPaymentOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "refundStarPayment", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// EditUserStarSubscription changes whether a user's subscription is canceled.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options including user_id, telegram_payment_charge_id and is_canceled.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Telegram API: https://core.telegram.org/bots/api#edituserstarsubscription
func (b *Bot) EditUserStarSubscription(ctx context.Context, opts *types.EditUserStarSubscriptionOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "editUserStarSubscription", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetMyStarBalance gets the bot's Telegram Stars balance.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//
// Returns:
//   - *types.StarAmount: The balance in Telegram Stars on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	balance, err := b.GetMyStarBalance(ctx)
//	fmt.Println(balance.Amount)
//
// Telegram API: https://core.telegram.org/bots/api#getmystarbalance
func (b *Bot) GetMyStarBalance(ctx context.Context) (*types.StarAmount, error) {
	var amount types.StarAmount
	if err := b.Request(ctx, "getMyStarBalance", nil, &amount); err != nil {
		return nil, err
	}
	return &amount, nil
}
