package bot

import (
	"context"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// GiftPremiumSubscription gifts a Telegram Premium subscription to a user.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - options: Gift parameters serialized as-is, mirroring node's
//     Record<string, unknown> argument. Per the docs the required keys are
//     "user_id", "month_count" (one of 3, 6 or 12) and "star_count" (1000,
//     1500 or 2500 respectively); optional keys are "text", "text_parse_mode"
//     and "text_entities".
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.GiftPremiumSubscription(ctx, map[string]any{
//		"user_id":     123456,
//		"month_count": 3,
//		"star_count":  1000,
//	})
//
// Telegram API: https://core.telegram.org/bots/api#giftpremiumsubscription
func (b *Bot) GiftPremiumSubscription(ctx context.Context, options map[string]any) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "giftPremiumSubscription", options, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// ConvertGiftToStars converts an owned regular gift to Telegram Stars.
//
// Requires the can_convert_gifts_to_stars business bot right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - ownedGiftID: Unique identifier of the regular gift that should be
//     converted to Telegram Stars.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.ConvertGiftToStars(ctx, "423778511293324225", "1234567890abcdef")
//
// Telegram API: https://core.telegram.org/bots/api#convertgifttostars
func (b *Bot) ConvertGiftToStars(ctx context.Context, businessConnectionID string, ownedGiftID string) (bool, error) {
	payload := map[string]any{
		"business_connection_id": businessConnectionID,
		"owned_gift_id":          ownedGiftID,
	}
	var ok bool
	if err := b.Request(ctx, "convertGiftToStars", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// UpgradeGift upgrades a regular gift owned by a business account to a unique gift.
//
// Requires the can_transfer_and_upgrade_gifts business bot right and, for a paid
// upgrade, the can_transfer_stars business bot right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - ownedGiftID: Unique identifier of the regular gift that should be upgraded
//     to a unique one.
//   - options: Optional extras serialized as-is; per the docs "keep_original_details"
//     (Boolean) and "star_count" (Integer). Pass nil when none are needed.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.UpgradeGift(ctx, "423778511293324225", "1234567890abcdef", map[string]any{
//		"keep_original_details": true,
//		"star_count":            500,
//	})
//
// Telegram API: https://core.telegram.org/bots/api#upgradegift
func (b *Bot) UpgradeGift(ctx context.Context, businessConnectionID string, ownedGiftID string, options map[string]any) (bool, error) {
	payload := mergePayload(map[string]any{
		"business_connection_id": businessConnectionID,
		"owned_gift_id":          ownedGiftID,
	}, options)
	var ok bool
	if err := b.Request(ctx, "upgradeGift", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// TransferGift transfers an owned unique gift to another chat.
//
// Requires the can_transfer_and_upgrade_gifts business bot right and, for a paid
// transfer, the can_transfer_stars business bot right.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - businessConnectionID: Unique identifier of the business connection.
//   - ownedGiftID: Unique identifier of the regular gift that should be transferred.
//   - newOwnerChatID: Unique identifier of the chat which will own the gift; the
//     chat must be active in the last 24 hours.
//   - options: Optional extras serialized as-is; per the docs "star_count"
//     (Integer). Pass nil when none are needed.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.TransferGift(ctx, "423778511293324225", "1234567890abcdef", int64(-1001234567890), nil)
//
// Telegram API: https://core.telegram.org/bots/api#transfergift
func (b *Bot) TransferGift(ctx context.Context, businessConnectionID string, ownedGiftID string, newOwnerChatID any, options map[string]any) (bool, error) {
	payload := mergePayload(map[string]any{
		"business_connection_id": businessConnectionID,
		"owned_gift_id":          ownedGiftID,
		"new_owner_chat_id":      newOwnerChatID,
	}, options)
	var ok bool
	if err := b.Request(ctx, "transferGift", payload, &ok); err != nil {
		return false, err
	}
	return ok, nil
}

// GetUserGifts returns the list of gifts owned and hosted by a user.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - userID: Unique identifier of the target user.
//   - options: Query options serialized as-is, mirroring node's optional
//     Record<string, unknown> argument. Supported keys are "exclude_unlimited",
//     "exclude_limited_upgradable", "exclude_limited_non_upgradable",
//     "exclude_from_blockchain", "exclude_unique", "sort_by_price", "offset" and
//     "limit"; unlike getChatGifts, getUserGifts accepts no "exclude_unsaved" or
//     "exclude_saved" key. Pass nil when none are needed.
//
// Returns:
//   - map[string]any: The raw OwnedGifts object returned by Telegram.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	gifts, err := b.GetUserGifts(ctx, 123456, map[string]any{"limit": 10})
//	fmt.Println(gifts["total_count"])
//
// Telegram API: https://core.telegram.org/bots/api#getusergifts
func (b *Bot) GetUserGifts(ctx context.Context, userID int64, options map[string]any) (map[string]any, error) {
	payload := mergePayload(map[string]any{"user_id": userID}, options)
	var gifts map[string]any
	if err := b.Request(ctx, "getUserGifts", payload, &gifts); err != nil {
		return nil, err
	}
	return gifts, nil
}

// GetChatGifts returns the list of gifts owned by a chat.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - chatID: Unique identifier for the target chat or username of the target
//     channel in the format @username.
//   - options: Query options serialized as-is, mirroring node's optional
//     Record<string, unknown> argument. Supported keys are "exclude_unsaved" and
//     "exclude_saved" (both honoured only with the can_post_messages
//     administrator right), "exclude_unlimited", "exclude_limited_upgradable",
//     "exclude_limited_non_upgradable", "exclude_from_blockchain",
//     "exclude_unique", "sort_by_price", "offset" and "limit". Pass nil when
//     none are needed.
//
// Returns:
//   - map[string]any: The raw OwnedGifts object returned by Telegram.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	gifts, err := b.GetChatGifts(ctx, "@channel", map[string]any{"exclude_unsaved": true})
//	fmt.Println(gifts["total_count"])
//
// Telegram API: https://core.telegram.org/bots/api#getchatgifts
func (b *Bot) GetChatGifts(ctx context.Context, chatID any, options map[string]any) (map[string]any, error) {
	payload := mergePayload(map[string]any{"chat_id": chatID}, options)
	var gifts map[string]any
	if err := b.Request(ctx, "getChatGifts", payload, &gifts); err != nil {
		return nil, err
	}
	return gifts, nil
}

// GetAvailableGifts returns the list of gifts that can be sent by the bot to
// users and channel chats.
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
//
// Telegram API: https://core.telegram.org/bots/api#getavailablegifts
func (b *Bot) GetAvailableGifts(ctx context.Context) (*types.Gifts, error) {
	var gifts types.Gifts
	if err := b.Request(ctx, "getAvailableGifts", nil, &gifts); err != nil {
		return nil, err
	}
	return &gifts, nil
}

// SendGift sends a gift to the given user or channel chat.
//
// The receiver can't convert a bot-sent gift to Telegram Stars. Exactly one of
// SendGiftOptions.UserID and SendGiftOptions.ChatID must be set, per the docs'
// "Required if chat_id is not specified" rule.
//
// Parameters:
//   - ctx: Context for cancellation and timeout.
//   - opts: Options carrying the recipient (user_id or chat_id), the required
//     gift_id and the optional upgrade payment and gift text.
//
// Returns:
//   - bool: True on success.
//   - error: TelegramError if the API returns an error.
//
// Example:
//
//	ok, err := b.SendGift(ctx, &types.SendGiftOptions{
//		UserID:        types.Ptr(int64(123456)),
//		GiftID:        "gift_abc123",
//		Text:          "Enjoy your gift!",
//		PayForUpgrade: true,
//	})
//
// Telegram API: https://core.telegram.org/bots/api#sendgift
func (b *Bot) SendGift(ctx context.Context, opts *types.SendGiftOptions) (bool, error) {
	var ok bool
	if err := b.Request(ctx, "sendGift", opts, &ok); err != nil {
		return false, err
	}
	return ok, nil
}
