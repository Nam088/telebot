package routing_test

import (
	"context"
	"testing"

	"github.com/Nam088/telebot-go/pkg/bot"
	"github.com/Nam088/telebot-go/pkg/routing"
	"github.com/Nam088/telebot-go/pkg/types"
)

const (
	StateAskName = 1
	StateAskAge  = 2
)

func TestConversationHandler_FSM(t *testing.T) {
	conv := routing.NewConversationHandler("onboarding")

	conv.AddEntryPoint(func(u *types.Update) bool {
		msg := u.EffectiveMessage()
		return msg != nil && msg.Text == "/start_survey"
	}, func(c *routing.Context) (int, error) {
		return StateAskName, nil
	})

	conv.AddState(StateAskName, func(u *types.Update) bool {
		return u.EffectiveMessage() != nil
	}, func(c *routing.Context) (int, error) {
		return StateAskAge, nil
	})

	conv.AddState(StateAskAge, func(u *types.Update) bool {
		return u.EffectiveMessage() != nil
	}, func(c *routing.Context) (int, error) {
		return routing.ConversationEnd, nil
	})

	b := bot.NewBot("fake_token")
	router := routing.NewRouter(b)
	conv.Register(router)

	user := &types.User{ID: 999, FirstName: "Bob"}
	chat := &types.Chat{ID: 888, Type: "private"}

	// Step 1: /start_survey
	u1 := &types.Update{
		UpdateID: 1,
		Message:  &types.Message{Text: "/start_survey", From: user, Chat: chat},
	}
	if err := router.ProcessUpdate(context.Background(), u1); err != nil {
		t.Fatalf("step 1 failed: %v", err)
	}

	// Step 2: Send Name
	u2 := &types.Update{
		UpdateID: 2,
		Message:  &types.Message{Text: "Bob Smith", From: user, Chat: chat},
	}
	if err := router.ProcessUpdate(context.Background(), u2); err != nil {
		t.Fatalf("step 2 failed: %v", err)
	}

	// Step 3: Send Age (Ends conversation)
	u3 := &types.Update{
		UpdateID: 3,
		Message:  &types.Message{Text: "25", From: user, Chat: chat},
	}
	if err := router.ProcessUpdate(context.Background(), u3); err != nil {
		t.Fatalf("step 3 failed: %v", err)
	}
}
