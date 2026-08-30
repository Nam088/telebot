package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// GetBusinessConnection returns information about the connection of the bot
// with a business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//
// Returns:
//   - *types.BusinessConnection: The BusinessConnection object on success.
//   - error: TelegramError if the connection is not found or the API returns an error.
//
// Example:
//
//	conn, err := b.GetBusinessConnection(ctx, "423778511293324225")
func (b *Bot) GetBusinessConnection(ctx context.Context, businessConnectionID string) (*types.BusinessConnection, error) {
	payload := map[string]any{"business_connection_id": businessConnectionID}
	var conn types.BusinessConnection
	if err := b.Request(ctx, "getBusinessConnection", payload, &conn); err != nil {
		return nil, err
	}
	return &conn, nil
}

// ReadBusinessMessage marks incoming messages in a business account as read.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - messageID: Identifier of the message to mark as read.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.ReadBusinessMessage(ctx, "423778511293324225", 42)
func (b *Bot) ReadBusinessMessage(ctx context.Context, businessConnectionID string, messageID int64) (bool, error) {
	payload := map[string]any{
		"business_connection_id": businessConnectionID,
		"message_id":             messageID,
	}
	var ok bool
	if err := b.Request(ctx, "readBusinessMessage", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// DeleteBusinessMessages deletes previously sent messages on behalf of a
// connected business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - messageIDs: Identifiers of 1-100 messages to delete.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.DeleteBusinessMessages(ctx, "423778511293324225", []int64{41, 42})
func (b *Bot) DeleteBusinessMessages(ctx context.Context, businessConnectionID string, messageIDs []int64) (bool, error) {
	payload := map[string]any{
		"business_connection_id": businessConnectionID,
		"message_ids":            messageIDs,
	}
	var ok bool
	if err := b.Request(ctx, "deleteBusinessMessages", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetBusinessAccountGifts returns gifts received by a connected business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//
// Returns:
//   - map[string]any: The raw SavedGifts-style object returned by Telegram.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	gifts, err := b.GetBusinessAccountGifts(ctx, "423778511293324225")
//	fmt.Println(gifts["total_count"])
func (b *Bot) GetBusinessAccountGifts(ctx context.Context, businessConnectionID string) (map[string]any, error) {
	payload := map[string]any{"business_connection_id": businessConnectionID}
	var gifts map[string]any
	if err := b.Request(ctx, "getBusinessAccountGifts", payload, &gifts); err != nil {
		return nil, err
	}
	return gifts, nil
}

// GetBusinessAccountStarBalance returns the number of Telegram Stars that are
// available on the balance of the connected business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//
// Returns:
//   - *types.StarAmount: The star balance on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	balance, err := b.GetBusinessAccountStarBalance(ctx, "423778511293324225")
//	fmt.Println(balance.Amount)
func (b *Bot) GetBusinessAccountStarBalance(ctx context.Context, businessConnectionID string) (*types.StarAmount, error) {
	payload := map[string]any{"business_connection_id": businessConnectionID}
	var amount types.StarAmount
	if err := b.Request(ctx, "getBusinessAccountStarBalance", payload, &amount); err != nil {
		return nil, err
	}
	return &amount, nil
}

// TransferBusinessAccountStars transfers Telegram Stars from the balance of a
// connected business account to the bot's balance.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - starCount: Number of Telegram Stars to transfer.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.TransferBusinessAccountStars(ctx, "423778511293324225", 100)
func (b *Bot) TransferBusinessAccountStars(ctx context.Context, businessConnectionID string, starCount int) (bool, error) {
	payload := map[string]any{
		"business_connection_id": businessConnectionID,
		"star_count":             starCount,
	}
	var ok bool
	if err := b.Request(ctx, "transferBusinessAccountStars", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetBusinessAccountName changes the business name of a connected business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - name: New business name; 1-128 characters after entity parsing.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SetBusinessAccountName(ctx, "423778511293324225", "Acme Support")
func (b *Bot) SetBusinessAccountName(ctx context.Context, businessConnectionID, name string) (bool, error) {
	payload := map[string]any{
		"business_connection_id": businessConnectionID,
		"name":                   name,
	}
	var ok bool
	if err := b.Request(ctx, "setBusinessAccountName", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetBusinessAccountUsername changes the username of a connected business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - username: New username; pass an empty string to omit the field, exactly
//     like node's optional setBusinessAccountUsername(id) call.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SetBusinessAccountUsername(ctx, "423778511293324225", "acme_support")
func (b *Bot) SetBusinessAccountUsername(ctx context.Context, businessConnectionID, username string) (bool, error) {
	payload := map[string]any{"business_connection_id": businessConnectionID}
	if username != "" {
		payload["username"] = username
	}
	var ok bool
	if err := b.Request(ctx, "setBusinessAccountUsername", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetBusinessAccountBio changes the bio description of a connected business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - bio: New bio text; pass an empty string to omit the field, mirroring
//     node's optional setBusinessAccountBio(id) call.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SetBusinessAccountBio(ctx, "423778511293324225", "We reply in 5 minutes")
func (b *Bot) SetBusinessAccountBio(ctx context.Context, businessConnectionID, bio string) (bool, error) {
	payload := map[string]any{"business_connection_id": businessConnectionID}
	if bio != "" {
		payload["bio"] = bio
	}
	var ok bool
	if err := b.Request(ctx, "setBusinessAccountBio", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetBusinessAccountGiftSettings configures which gifts a connected business
// account accepts and displays.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - options: Additional gift settings serialized as-is, mirroring node's
//     Record<string, unknown> options argument (e.g. "is_storable_gifts_allowed").
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SetBusinessAccountGiftSettings(ctx, "423778511293324225", map[string]any{
//		"is_storable_gifts_allowed": true,
//	})
func (b *Bot) SetBusinessAccountGiftSettings(ctx context.Context, businessConnectionID string, options map[string]any) (bool, error) {
	payload := mergePayload(map[string]any{"business_connection_id": businessConnectionID}, options)
	var ok bool
	if err := b.Request(ctx, "setBusinessAccountGiftSettings", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// SetBusinessAccountProfilePhoto sets the profile photo for a connected
// business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - photo: New profile photo, serialized as-is (a file_id, an https URL or an
//     input object), mirroring node's unknown photo argument.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SetBusinessAccountProfilePhoto(ctx, "423778511293324225", "BAACAgIAAxkBAAI")
func (b *Bot) SetBusinessAccountProfilePhoto(ctx context.Context, businessConnectionID string, photo any) (bool, error) {
	payload := map[string]any{
		"business_connection_id": businessConnectionID,
		"photo":                  photo,
	}
	var ok bool
	if err := b.Request(ctx, "setBusinessAccountProfilePhoto", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// RemoveBusinessAccountProfilePhoto removes the profile photo of a connected
// business account.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.RemoveBusinessAccountProfilePhoto(ctx, "423778511293324225")
func (b *Bot) RemoveBusinessAccountProfilePhoto(ctx context.Context, businessConnectionID string) (bool, error) {
	payload := map[string]any{"business_connection_id": businessConnectionID}
	var ok bool
	if err := b.Request(ctx, "removeBusinessAccountProfilePhoto", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// mergePayload copies every key from extra into base and returns base, which is
// the Go equivalent of node's `{ ...fixedFields, ...options }` spread.
func mergePayload(base, extra map[string]any) map[string]any {
	for k, v := range extra {
		base[k] = v
	}
	return base
}
