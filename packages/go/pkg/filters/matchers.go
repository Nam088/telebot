package filters

import (
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

// Photo matches messages carrying a photo.
func Photo(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && len(msg.Photo) > 0
}

// Video matches messages carrying a video file.
func Video(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Video != nil
}

// Audio matches messages carrying an audio file.
func Audio(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Audio != nil
}

// Document matches messages carrying a general file.
func Document(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Document != nil
}

// Voice matches messages carrying a voice note.
func Voice(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Voice != nil
}

// VideoNote matches messages carrying a round video note.
func VideoNote(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.VideoNote != nil
}

// Animation matches messages carrying an animation (GIF or H.264 video).
func Animation(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Animation != nil
}

// Sticker matches messages carrying a sticker.
func Sticker(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Sticker != nil
}

// Contact matches messages carrying a shared phone contact.
func Contact(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Contact != nil
}

// Location matches messages carrying a shared location.
func Location(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Location != nil
}

// Venue matches messages carrying a venue.
func Venue(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Venue != nil
}

// Poll matches messages carrying a native poll.
func Poll(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Poll != nil
}

// Dice matches messages carrying a dice roll.
func Dice(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Dice != nil
}

// Game matches messages carrying a game.
func Game(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Game != nil
}

// Invoice matches messages carrying a payment invoice.
func Invoice(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Invoice != nil
}

// SuccessfulPayment matches service messages about a successful payment.
func SuccessfulPayment(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.SuccessfulPayment != nil
}

// Forwarded matches messages that were forwarded into the current chat,
// i.e. messages carrying a non-nil forward origin.
func Forwarded(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.ForwardOrigin != nil
}

// Reply matches messages that are replies to another message.
func Reply(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.ReplyToMessage != nil
}

// Caption matches messages with a non-empty caption.
func Caption(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && msg.Caption != ""
}

// Attachment matches messages carrying any common media attachment: a photo,
// document, audio file, video, voice note or animation.
var Attachment = Or(Photo, Document, Audio, Video, Voice, Animation)

// hasEntity reports whether msg carries a text entity of the given type.
// Only text entities are inspected, not caption entities, matching the Node
// implementation.
func hasEntity(msg *types.Message, entityType string) bool {
	for _, e := range msg.Entities {
		if e.Type == entityType {
			return true
		}
	}
	return false
}

// URL matches messages containing a "url" entity.
func URL(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && hasEntity(msg, "url")
}

// Email matches messages containing an "email" entity.
func Email(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && hasEntity(msg, "email")
}

// PhoneNumber matches messages containing a "phone_number" entity.
func PhoneNumber(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && hasEntity(msg, "phone_number")
}

// Hashtag matches messages containing a "hashtag" entity.
func Hashtag(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && hasEntity(msg, "hashtag")
}

// Cashtag matches messages containing a "cashtag" entity.
func Cashtag(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && hasEntity(msg, "cashtag")
}

// Mention matches messages containing a "mention" entity.
func Mention(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && hasEntity(msg, "mention")
}

// BotCommand matches messages containing a "bot_command" entity.
func BotCommand(u *types.Update) bool {
	msg := u.EffectiveMessage()
	return msg != nil && hasEntity(msg, "bot_command")
}

// chatTypeIs builds a Predicate that matches messages sent in a chat of the
// given Telegram chat type.
func chatTypeIs(chatType string) Predicate {
	return func(u *types.Update) bool {
		msg := u.EffectiveMessage()
		return msg != nil && msg.Chat != nil && msg.Chat.Type == chatType
	}
}

// ChatTypeFilters is the set of filters that match messages by Telegram chat
// type.
type ChatTypeFilters struct {
	// Private matches messages sent in private (one-on-one) chats.
	Private Predicate
	// Group matches messages sent in basic groups.
	Group Predicate
	// Supergroup matches messages sent in supergroups.
	Supergroup Predicate
	// Channel matches messages sent in broadcast channels.
	Channel Predicate
	// Groups matches messages sent in either basic groups or supergroups.
	Groups Predicate
}

// ChatType groups the chat-type filters: Private, Group, Supergroup, Channel
// and the combined Groups filter.
var ChatType = ChatTypeFilters{
	Private:    chatTypeIs("private"),
	Group:      chatTypeIs("group"),
	Supergroup: chatTypeIs("supergroup"),
	Channel:    chatTypeIs("channel"),
	Groups:     Or(chatTypeIs("group"), chatTypeIs("supergroup")),
}

// StatusUpdateFilters is the set of filters that match chat service messages
// such as member joins, title changes and chat migrations.
type StatusUpdateFilters struct {
	// NewChatMembers matches messages where new members joined or were added.
	NewChatMembers Predicate
	// LeftChatMember matches messages where a member left or was removed.
	LeftChatMember Predicate
	// NewChatTitle matches messages where the chat title was changed.
	NewChatTitle Predicate
	// NewChatPhoto matches messages where the chat photo was changed.
	NewChatPhoto Predicate
	// DeleteChatPhoto matches messages where the chat photo was deleted.
	DeleteChatPhoto Predicate
	// GroupChatCreated matches messages announcing a basic group was created.
	GroupChatCreated Predicate
	// SupergroupChatCreated matches messages announcing a supergroup was created.
	SupergroupChatCreated Predicate
	// ChannelChatCreated matches messages announcing a channel was created.
	ChannelChatCreated Predicate
	// MigrateToChatID matches migration service messages with a target chat ID.
	MigrateToChatID Predicate
	// MigrateFromChatID matches migration service messages with a source chat ID.
	MigrateFromChatID Predicate
	// PinnedMessage matches messages announcing a pinned message.
	PinnedMessage Predicate
	// All matches any chat status update.
	All Predicate
}

// StatusUpdate groups the filters for chat service (status update) messages.
var StatusUpdate = newStatusUpdateFilters()

func newStatusUpdateFilters() StatusUpdateFilters {
	s := StatusUpdateFilters{
		NewChatMembers: messagePredicate(func(msg *types.Message) bool {
			return len(msg.NewChatMembers) > 0
		}),
		LeftChatMember: messagePredicate(func(msg *types.Message) bool {
			return msg.LeftChatMember != nil
		}),
		NewChatTitle: messagePredicate(func(msg *types.Message) bool {
			return msg.NewChatTitle != ""
		}),
		NewChatPhoto: messagePredicate(func(msg *types.Message) bool {
			return len(msg.NewChatPhoto) > 0
		}),
		DeleteChatPhoto: messagePredicate(func(msg *types.Message) bool {
			return msg.DeleteChatPhoto
		}),
		GroupChatCreated: messagePredicate(func(msg *types.Message) bool {
			return msg.GroupChatCreated
		}),
		SupergroupChatCreated: messagePredicate(func(msg *types.Message) bool {
			return msg.SupergroupChatCreated
		}),
		ChannelChatCreated: messagePredicate(func(msg *types.Message) bool {
			return msg.ChannelChatCreated
		}),
		MigrateToChatID: messagePredicate(func(msg *types.Message) bool {
			return msg.MigrateToChatID != 0
		}),
		MigrateFromChatID: messagePredicate(func(msg *types.Message) bool {
			return msg.MigrateFromChatID != 0
		}),
		PinnedMessage: messagePredicate(func(msg *types.Message) bool {
			return msg.PinnedMessage != nil
		}),
	}
	s.All = Or(s.NewChatMembers, s.LeftChatMember, s.NewChatTitle, s.NewChatPhoto,
		s.DeleteChatPhoto, s.GroupChatCreated, s.SupergroupChatCreated,
		s.ChannelChatCreated, s.MigrateToChatID, s.MigrateFromChatID,
		s.PinnedMessage)
	return s
}
