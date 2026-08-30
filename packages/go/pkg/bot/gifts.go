package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// GiftPremiumSubscription gifts a Telegram Premium subscription to a user.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - options: Premium gift parameters serialized as-is, mirroring node's
//     Record<string, unknown> argument (e.g. "user_id", "gift_id",
//     "upgrade_star_count", "pay_for_upgrade").
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.GiftPremiumSubscription(ctx, map[string]any{
//		"user_id": 123456,
//		"gift_id": "1234567890abcdef",
//	})
func (b *Bot) GiftPremiumSubscription(ctx context.Context, options map[string]any) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "giftPremiumSubscription", options, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// ConvertGiftToStars converts an owned regular gift to Telegram Stars.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the user that owns the gift.
//   - ownedGiftID: Identifier of the gift to convert.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.ConvertGiftToStars(ctx, 123456, "1234567890abcdef")
func (b *Bot) ConvertGiftToStars(ctx context.Context, userID int64, ownedGiftID string) (bool, error) {
	payload := map[string]any{
		"user_id":       userID,
		"owned_gift_id": ownedGiftID,
	}
	var ok bool
	if err := b.Request(ctx, "convertGiftToStars", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// UpgradeGift upgrades a regular gift owned by a user to a unique gift.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the user that owns the gift.
//   - ownedGiftID: Identifier of the gift to upgrade.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.UpgradeGift(ctx, 123456, "1234567890abcdef")
func (b *Bot) UpgradeGift(ctx context.Context, userID int64, ownedGiftID string) (bool, error) {
	payload := map[string]any{
		"user_id":       userID,
		"owned_gift_id": ownedGiftID,
	}
	var ok bool
	if err := b.Request(ctx, "upgradeGift", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// TransferGift transfers an upgraded unique gift to another user or channel.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the user that owns the gift.
//   - ownedGiftID: Identifier of the gift to transfer.
//   - newOwnerChatID: Identifier of the user or chat that will own the gift.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.TransferGift(ctx, 123456, "1234567890abcdef", int64(987654))
func (b *Bot) TransferGift(ctx context.Context, userID int64, ownedGiftID string, newOwnerChatID any) (bool, error) {
	payload := map[string]any{
		"user_id":           userID,
		"owned_gift_id":     ownedGiftID,
		"new_owner_chat_id": newOwnerChatID,
	}
	var ok bool
	if err := b.Request(ctx, "transferGift", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetUserGifts returns the list of gifts received by a user.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the target user.
//   - options: Query options serialized as-is, mirroring node's optional
//     Record<string, unknown> argument (e.g. "exclude_unlimited", "offset", "limit").
//
// Returns:
//   - map[string]any: The raw gift-list object returned by Telegram.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	gifts, err := b.GetUserGifts(ctx, 123456, map[string]any{"limit": 10})
//	fmt.Println(gifts["total_count"])
func (b *Bot) GetUserGifts(ctx context.Context, userID int64, options map[string]any) (map[string]any, error) {
	payload := mergePayload(map[string]any{"user_id": userID}, options)
	var gifts map[string]any
	if err := b.Request(ctx, "getUserGifts", payload, &gifts); err != nil {
		return nil, err
	}
	return gifts, nil
}

// GetChatGifts returns the list of gifts received by a chat.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target channel.
//   - options: Query options serialized as-is, mirroring node's optional
//     Record<string, unknown> argument (e.g. "exclude_unlimited", "offset", "limit").
//
// Returns:
//   - map[string]any: The raw gift-list object returned by Telegram.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	gifts, err := b.GetChatGifts(ctx, "@channel", nil)
//	fmt.Println(gifts["total_count"])
func (b *Bot) GetChatGifts(ctx context.Context, chatID any, options map[string]any) (map[string]any, error) {
	payload := mergePayload(map[string]any{"chat_id": chatID}, options)
	var gifts map[string]any
	if err := b.Request(ctx, "getChatGifts", payload, &gifts); err != nil {
		return nil, err
	}
	return gifts, nil
}

// GetAvailableGifts returns the list of gifts that can be sent by the bot to users.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//
// Returns:
//   - *types.Gifts: The list of available gifts on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	gifts, err := b.GetAvailableGifts(ctx)
//	fmt.Printf("Available gifts count: %d\n", len(gifts.Gifts))
func (b *Bot) GetAvailableGifts(ctx context.Context) (*types.Gifts, error) {
	var gifts types.Gifts
	if err := b.Request(ctx, "getAvailableGifts", nil, &gifts); err != nil {
		return nil, err
	}
	return &gifts, nil
}

// SendGift sends a gift to the given user.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options carrying user_id, gift_id and the optional gift text.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SendGift(ctx, &types.SendGiftOptions{
//		UserID:        123456,
//		GiftID:        "gift_abc123",
//		Text:          "Enjoy your gift!",
//		PayForUpgrade: true,
//	})
func (b *Bot) SendGift(ctx context.Context, opts *types.SendGiftOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "sendGift", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
