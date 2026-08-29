package filters_test

import (
	"testing"

	"github.com/Nam088/telebot-go/pkg/filters"
	"github.com/Nam088/telebot-go/pkg/types"
)

func TestFilters(t *testing.T) {
	msgUpdate := &types.Update{
		Message: &types.Message{
			Text: "/help",
			Chat: &types.Chat{Type: "private"},
		},
	}

	if !filters.Text(msgUpdate) {
		t.Errorf("expected filters.Text to match")
	}

	if !filters.Command(msgUpdate) {
		t.Errorf("expected filters.Command to match")
	}

	if !filters.Private(msgUpdate) {
		t.Errorf("expected filters.Private to match")
	}

	combined := filters.And(filters.Text, filters.Private)
	if !combined(msgUpdate) {
		t.Errorf("expected combined AND filter to match")
	}

	notGroup := filters.Not(filters.Group)
	if !notGroup(msgUpdate) {
		t.Errorf("expected Not(Group) to match private chat")
	}
}
