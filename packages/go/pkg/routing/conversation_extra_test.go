package routing_test

import (
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/bot"
	"github.com/Nam088/telebot/packages/go/pkg/routing"
	"github.com/Nam088/telebot/packages/go/pkg/types"
)

var errBoom = errors.New("boom")

// hasText builds a filter matching message updates whose text equals s.
func hasText(s string) func(u *types.Update) bool {
	return func(u *types.Update) bool {
		msg := u.EffectiveMessage()
		return msg != nil && msg.Text == s
	}
}

func TestConversationHandler_FallbackCancels(t *testing.T) {
	conv := routing.NewConversationHandler("with_fallback")
	conv.AddEntryPoint(hasText("/begin"), func(c *routing.Context) (int, error) {
		return StateAskName, nil
	})
	conv.AddState(StateAskName, hasText("myname"), func(c *routing.Context) (int, error) {
		return routing.ConversationEnd, nil
	})
	conv.AddFallback(hasText("/cancel"), func(c *routing.Context) (int, error) {
		return routing.ConversationEnd, nil
	})

	b := bot.NewBot("fake_token")
	router := routing.NewRouter(b)
	conv.Register(router)

	user := messageUpdate(1, "/begin")
	if err := router.ProcessUpdate(context.Background(), user); err != nil {
		t.Fatalf("entry failed: %v", err)
	}

	// Now in StateAskName; an unrelated message that is not the state handler
	// nor the fallback should be unhandled and surface an error from Register.
	if err := router.ProcessUpdate(context.Background(), messageUpdate(2, "random")); err == nil {
		t.Error("expected unhandled update error inside active conversation")
	}

	// The fallback cancels the conversation.
	if err := router.ProcessUpdate(context.Background(), messageUpdate(3, "/cancel")); err != nil {
		t.Fatalf("fallback failed: %v", err)
	}

	// After cancellation, the conversation is inactive; a non-entry message
	// should pass through untouched (no route matches).
	if err := router.ProcessUpdate(context.Background(), messageUpdate(4, "myname")); err != nil {
		t.Fatalf("after cancel, update should be ignored, got: %v", err)
	}
}

func TestConversationHandler_StateHandlerError(t *testing.T) {
	conv := routing.NewConversationHandler("err_state")
	conv.AddEntryPoint(hasText("/begin"), func(c *routing.Context) (int, error) {
		return StateAskName, nil
	})
	conv.AddState(StateAskName, hasText("bad"), func(c *routing.Context) (int, error) {
		return 0, errBoom
	})

	router := routing.NewRouter(bot.NewBot("t"))
	conv.Register(router)

	if err := router.ProcessUpdate(context.Background(), messageUpdate(1, "/begin")); err != nil {
		t.Fatalf("entry failed: %v", err)
	}
	err := router.ProcessUpdate(context.Background(), messageUpdate(2, "bad"))
	if !errors.Is(err, errBoom) {
		t.Errorf("expected state handler error to propagate, got %v", err)
	}
}

func TestConversationHandler_EntryPointError(t *testing.T) {
	conv := routing.NewConversationHandler("err_entry")
	conv.AddEntryPoint(hasText("/begin"), func(c *routing.Context) (int, error) {
		return 0, errBoom
	})

	router := routing.NewRouter(bot.NewBot("t"))
	conv.Register(router)

	err := router.ProcessUpdate(context.Background(), messageUpdate(1, "/begin"))
	if !errors.Is(err, errBoom) {
		t.Errorf("expected entry point error to propagate, got %v", err)
	}
}

func TestConversationHandler_FallbackError(t *testing.T) {
	conv := routing.NewConversationHandler("err_fallback")
	conv.AddEntryPoint(hasText("/begin"), func(c *routing.Context) (int, error) {
		return StateAskName, nil
	})
	conv.AddState(StateAskName, hasText("ok"), func(c *routing.Context) (int, error) {
		return routing.ConversationEnd, nil
	})
	conv.AddFallback(hasText("/cancel"), func(c *routing.Context) (int, error) {
		return 0, errBoom
	})

	router := routing.NewRouter(bot.NewBot("t"))
	conv.Register(router)

	_ = router.ProcessUpdate(context.Background(), messageUpdate(1, "/begin"))
	err := router.ProcessUpdate(context.Background(), messageUpdate(2, "/cancel"))
	if !errors.Is(err, errBoom) {
		t.Errorf("expected fallback error to propagate, got %v", err)
	}
}

func TestConversationHandler_NoUserIsIgnored(t *testing.T) {
	conv := routing.NewConversationHandler("no_user")
	conv.AddEntryPoint(func(u *types.Update) bool { return true }, func(c *routing.Context) (int, error) {
		return StateAskName, nil
	})

	// Update with no derivable user.
	update := &types.Update{UpdateID: 1, Poll: &types.Poll{ID: "p", Question: "q"}}
	c := routing.NewContext(context.Background(), bot.NewBot("t"), update)

	handled, err := conv.HandleUpdate(c)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if handled {
		t.Error("update without a user must not be handled")
	}
}

func TestConversationHandler_ActiveStateWithNoRoutesFallsThrough(t *testing.T) {
	conv := routing.NewConversationHandler("empty_state")
	conv.AddEntryPoint(hasText("/begin"), func(c *routing.Context) (int, error) {
		// Transition to a state that has no registered routes.
		return StateAskAge, nil
	})

	b := bot.NewBot("t")
	router := routing.NewRouter(b)
	conv.Register(router)

	if err := router.ProcessUpdate(context.Background(), messageUpdate(1, "/begin")); err != nil {
		t.Fatalf("entry failed: %v", err)
	}

	// Now active in StateAskAge which has no routes and no fallbacks: the
	// Register handler should report an unhandled update.
	err := router.ProcessUpdate(context.Background(), messageUpdate(2, "anything"))
	if err == nil || !strings.Contains(err.Error(), "unhandled update") {
		t.Errorf("expected unhandled update error, got %v", err)
	}
}

func TestConversationHandler_RegisterFilterRequiresUser(t *testing.T) {
	conv := routing.NewConversationHandler("filter_user")
	conv.AddEntryPoint(func(u *types.Update) bool { return true }, func(c *routing.Context) (int, error) {
		return StateAskName, nil
	})

	router := routing.NewRouter(bot.NewBot("t"))
	conv.Register(router)

	var ran bool
	// A route registered after the conversation that matches everything; it
	// should only run when the conversation route did NOT claim the update.
	router.Handle(func(u *types.Update) bool { return true }, func(c *routing.Context) error {
		ran = true
		return nil
	})

	// No user -> conversation filter returns false -> falls to next route.
	update := &types.Update{UpdateID: 1, Poll: &types.Poll{ID: "p", Question: "q"}}
	if err := router.ProcessUpdate(context.Background(), update); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !ran {
		t.Error("expected the subsequent catch-all route to run when conversation declines")
	}
}
