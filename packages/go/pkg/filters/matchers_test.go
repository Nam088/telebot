package filters_test

import (
	"testing"

	"github.com/Nam088/telebot-go/pkg/filters"
	"github.com/Nam088/telebot-go/pkg/types"
)

// messageUpdate builds an update whose message is mutated by the given setup
// function.
func messageUpdate(setup func(msg *types.Message)) *types.Update {
	msg := &types.Message{Chat: &types.Chat{Type: "private"}}
	setup(msg)
	return &types.Update{Message: msg}
}

func TestMediaFilters(t *testing.T) {
	cases := []struct {
		name   string
		filter filters.Predicate
		setup  func(msg *types.Message)
	}{
		{"Photo", filters.Photo, func(m *types.Message) { m.Photo = []types.PhotoSize{{FileID: "p"}} }},
		{"Video", filters.Video, func(m *types.Message) { m.Video = &types.Video{FileID: "v"} }},
		{"Audio", filters.Audio, func(m *types.Message) { m.Audio = &types.Audio{FileID: "a"} }},
		{"Document", filters.Document, func(m *types.Message) { m.Document = &types.Document{FileID: "d"} }},
		{"Voice", filters.Voice, func(m *types.Message) { m.Voice = &types.Voice{FileID: "vn"} }},
		{"VideoNote", filters.VideoNote, func(m *types.Message) { m.VideoNote = &types.VideoNote{FileID: "vd"} }},
		{"Animation", filters.Animation, func(m *types.Message) { m.Animation = &types.Animation{FileID: "an"} }},
		{"Sticker", filters.Sticker, func(m *types.Message) { m.Sticker = &types.Sticker{FileID: "s"} }},
		{"Contact", filters.Contact, func(m *types.Message) { m.Contact = &types.Contact{PhoneNumber: "+123"} }},
		{"Location", filters.Location, func(m *types.Message) { m.Location = &types.Location{Latitude: 1, Longitude: 2} }},
		{"Venue", filters.Venue, func(m *types.Message) { m.Venue = &types.Venue{Title: "t"} }},
		{"Poll", filters.Poll, func(m *types.Message) { m.Poll = &types.Poll{ID: "poll"} }},
		{"Dice", filters.Dice, func(m *types.Message) { m.Dice = &types.Dice{Value: 3} }},
		{"Game", filters.Game, func(m *types.Message) { m.Game = &types.Game{Title: "g"} }},
		{"Invoice", filters.Invoice, func(m *types.Message) { m.Invoice = &types.Invoice{Title: "i"} }},
		{"SuccessfulPayment", filters.SuccessfulPayment, func(m *types.Message) {
			m.SuccessfulPayment = &types.SuccessfulPayment{Currency: "USD"}
		}},
	}

	plainText := messageUpdate(func(m *types.Message) { m.Text = "hello" })

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if !tc.filter(messageUpdate(tc.setup)) {
				t.Errorf("expected %s to match its message", tc.name)
			}
			if tc.filter(plainText) {
				t.Errorf("expected %s not to match a plain text message", tc.name)
			}
			if tc.filter(&types.Update{}) {
				t.Errorf("expected %s not to match an update without a message", tc.name)
			}
		})
	}
}

func TestPhotoRequiresSizes(t *testing.T) {
	empty := messageUpdate(func(m *types.Message) { m.Photo = []types.PhotoSize{} })
	if filters.Photo(empty) {
		t.Error("expected Photo not to match a message with zero photo sizes")
	}
}

func TestForwardedReplyCaption(t *testing.T) {
	forwarded := messageUpdate(func(m *types.Message) {
		m.ForwardOrigin = &types.MessageOrigin{Type: "user", Date: 1}
	})
	if !filters.Forwarded(forwarded) {
		t.Error("expected Forwarded to match a message with a forward origin")
	}

	reply := messageUpdate(func(m *types.Message) {
		m.ReplyToMessage = &types.Message{MessageID: 1}
	})
	if !filters.Reply(reply) {
		t.Error("expected Reply to match a reply message")
	}

	caption := messageUpdate(func(m *types.Message) { m.Caption = "look at this" })
	if !filters.Caption(caption) {
		t.Error("expected Caption to match a message with a caption")
	}

	plain := messageUpdate(func(m *types.Message) { m.Text = "plain" })
	for name, f := range map[string]filters.Predicate{
		"Forwarded": filters.Forwarded,
		"Reply":     filters.Reply,
		"Caption":   filters.Caption,
	} {
		if f(plain) {
			t.Errorf("expected %s not to match a plain text message", name)
		}
		if f(&types.Update{}) {
			t.Errorf("expected %s not to match an update without a message", name)
		}
	}
}

func TestAttachment(t *testing.T) {
	attachmentSetups := []func(*types.Message){
		func(m *types.Message) { m.Photo = []types.PhotoSize{{FileID: "p"}} },
		func(m *types.Message) { m.Document = &types.Document{FileID: "d"} },
		func(m *types.Message) { m.Audio = &types.Audio{FileID: "a"} },
		func(m *types.Message) { m.Video = &types.Video{FileID: "v"} },
		func(m *types.Message) { m.Voice = &types.Voice{FileID: "vn"} },
		func(m *types.Message) { m.Animation = &types.Animation{FileID: "an"} },
	}
	for i, setup := range attachmentSetups {
		if !filters.Attachment(messageUpdate(setup)) {
			t.Errorf("expected Attachment to match attachment variant %d", i)
		}
	}

	// Media kinds outside the attachment set must not match.
	if filters.Attachment(messageUpdate(func(m *types.Message) {
		m.Sticker = &types.Sticker{FileID: "s"}
	})) {
		t.Error("expected Attachment not to match a sticker message")
	}
	if filters.Attachment(messageUpdate(func(m *types.Message) { m.Text = "hi" })) {
		t.Error("expected Attachment not to match a plain text message")
	}
}

func TestEntityFilters(t *testing.T) {
	cases := []struct {
		name       string
		filter     filters.Predicate
		entityType string
	}{
		{"URL", filters.URL, "url"},
		{"Email", filters.Email, "email"},
		{"PhoneNumber", filters.PhoneNumber, "phone_number"},
		{"Hashtag", filters.Hashtag, "hashtag"},
		{"Cashtag", filters.Cashtag, "cashtag"},
		{"Mention", filters.Mention, "mention"},
		{"BotCommand", filters.BotCommand, "bot_command"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			withEntity := messageUpdate(func(m *types.Message) {
				m.Text = "text"
				m.Entities = []types.MessageEntity{{Type: tc.entityType, Offset: 0, Length: 4}}
			})
			if !tc.filter(withEntity) {
				t.Errorf("expected %s to match a %q entity", tc.name, tc.entityType)
			}

			otherType := "url"
			if tc.entityType == "url" {
				otherType = "email"
			}
			withoutEntity := messageUpdate(func(m *types.Message) {
				m.Text = "text"
				m.Entities = []types.MessageEntity{{Type: otherType}}
			})
			if tc.filter(withoutEntity) {
				t.Errorf("expected %s not to match a %q entity", tc.name, otherType)
			}

			noEntities := messageUpdate(func(m *types.Message) { m.Text = "text" })
			if tc.filter(noEntities) {
				t.Errorf("expected %s not to match a message without entities", tc.name)
			}

			if tc.filter(&types.Update{}) {
				t.Errorf("expected %s not to match an update without a message", tc.name)
			}
		})
	}
}

func TestEntityFiltersIgnoreCaptionEntities(t *testing.T) {
	u := messageUpdate(func(m *types.Message) {
		m.Caption = "caption"
		m.CaptionEntities = []types.MessageEntity{{Type: "url"}}
	})
	if filters.URL(u) {
		t.Error("expected URL to inspect text entities only, not caption entities")
	}
}

func TestChatTypeFilters(t *testing.T) {
	chatUpdate := func(chatType string) *types.Update {
		return messageUpdate(func(m *types.Message) {
			m.Text = "hi"
			m.Chat = &types.Chat{Type: chatType}
		})
	}

	cases := []struct {
		name    string
		filter  filters.Predicate
		matches []string
	}{
		{"Private", filters.ChatType.Private, []string{"private"}},
		{"Group", filters.ChatType.Group, []string{"group"}},
		{"Supergroup", filters.ChatType.Supergroup, []string{"supergroup"}},
		{"Channel", filters.ChatType.Channel, []string{"channel"}},
		{"Groups", filters.ChatType.Groups, []string{"group", "supergroup"}},
	}
	allTypes := []string{"private", "group", "supergroup", "channel"}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			for _, chatType := range allTypes {
				want := contains(tc.matches, chatType)
				if got := tc.filter(chatUpdate(chatType)); got != want {
					t.Errorf("%s(%q) = %v, want %v", tc.name, chatType, got, want)
				}
			}
			if tc.filter(&types.Update{}) {
				t.Errorf("expected ChatType.%s not to match an update without a message", tc.name)
			}
		})
	}

	noChat := &types.Update{Message: &types.Message{Text: "hi"}}
	if filters.ChatType.Private(noChat) {
		t.Error("expected ChatType.Private not to match a message without a chat")
	}
}

func TestStatusUpdateFilters(t *testing.T) {
	cases := []struct {
		name   string
		filter filters.Predicate
		setup  func(msg *types.Message)
	}{
		{"NewChatMembers", filters.StatusUpdate.NewChatMembers, func(m *types.Message) {
			m.NewChatMembers = []types.User{{ID: 1}}
		}},
		{"LeftChatMember", filters.StatusUpdate.LeftChatMember, func(m *types.Message) {
			m.LeftChatMember = &types.User{ID: 1}
		}},
		{"NewChatTitle", filters.StatusUpdate.NewChatTitle, func(m *types.Message) {
			m.NewChatTitle = "New title"
		}},
		{"NewChatPhoto", filters.StatusUpdate.NewChatPhoto, func(m *types.Message) {
			m.NewChatPhoto = []types.PhotoSize{{FileID: "p"}}
		}},
		{"DeleteChatPhoto", filters.StatusUpdate.DeleteChatPhoto, func(m *types.Message) {
			m.DeleteChatPhoto = true
		}},
		{"GroupChatCreated", filters.StatusUpdate.GroupChatCreated, func(m *types.Message) {
			m.GroupChatCreated = true
		}},
		{"SupergroupChatCreated", filters.StatusUpdate.SupergroupChatCreated, func(m *types.Message) {
			m.SupergroupChatCreated = true
		}},
		{"ChannelChatCreated", filters.StatusUpdate.ChannelChatCreated, func(m *types.Message) {
			m.ChannelChatCreated = true
		}},
		{"MigrateToChatID", filters.StatusUpdate.MigrateToChatID, func(m *types.Message) {
			m.MigrateToChatID = -100123
		}},
		{"MigrateFromChatID", filters.StatusUpdate.MigrateFromChatID, func(m *types.Message) {
			m.MigrateFromChatID = -456
		}},
		{"PinnedMessage", filters.StatusUpdate.PinnedMessage, func(m *types.Message) {
			m.PinnedMessage = &types.Message{MessageID: 5}
		}},
	}

	plain := messageUpdate(func(m *types.Message) { m.Text = "just text" })

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if !tc.filter(messageUpdate(tc.setup)) {
				t.Errorf("expected StatusUpdate.%s to match its service message", tc.name)
			}
			if !filters.StatusUpdate.All(messageUpdate(tc.setup)) {
				t.Errorf("expected StatusUpdate.All to match the %s service message", tc.name)
			}
			if tc.filter(plain) {
				t.Errorf("expected StatusUpdate.%s not to match a plain text message", tc.name)
			}
			if tc.filter(&types.Update{}) {
				t.Errorf("expected StatusUpdate.%s not to match an update without a message", tc.name)
			}
		})
	}

	if filters.StatusUpdate.All(plain) {
		t.Error("expected StatusUpdate.All not to match a plain text message")
	}
}

func TestStatusUpdateZeroValuesDoNotMatch(t *testing.T) {
	empty := messageUpdate(func(m *types.Message) {})
	for name, f := range map[string]filters.Predicate{
		"NewChatMembers":  filters.StatusUpdate.NewChatMembers,
		"NewChatTitle":    filters.StatusUpdate.NewChatTitle,
		"NewChatPhoto":    filters.StatusUpdate.NewChatPhoto,
		"MigrateToChatID": filters.StatusUpdate.MigrateToChatID,
	} {
		if f(empty) {
			t.Errorf("expected StatusUpdate.%s not to match zero values", name)
		}
	}
}

func contains(list []string, s string) bool {
	for _, v := range list {
		if v == s {
			return true
		}
	}
	return false
}
