package routing

import (
	"context"
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/types"
)

func TestUseNamedAndRemoveMiddleware(t *testing.T) {
	router := NewRouter(nil)
	calls := []string{}

	plugin := func(next HandlerFunc) HandlerFunc {
		return func(c *Context) error {
			calls = append(calls, "plugin")
			return next(c)
		}
	}

	if err := router.UseNamed("demo", plugin); err != nil {
		t.Fatalf("UseNamed failed: %v", err)
	}
	if err := router.UseNamed("demo", plugin); err == nil {
		t.Fatal("expected duplicate registration to fail")
	}

	router.Text("", func(c *Context) error {
		calls = append(calls, "handler")
		return nil
	})

	update := &types.Update{Message: &types.Message{Text: "hi"}}
	if err := router.ProcessUpdate(context.Background(), update); err != nil {
		t.Fatalf("ProcessUpdate failed: %v", err)
	}
	if len(calls) != 2 || calls[0] != "plugin" || calls[1] != "handler" {
		t.Fatalf("expected [plugin handler], got %v", calls)
	}

	if !router.RemoveMiddleware("demo") {
		t.Fatal("expected RemoveMiddleware to find demo")
	}
	if router.RemoveMiddleware("demo") {
		t.Fatal("second removal should report false")
	}

	calls = nil
	if err := router.ProcessUpdate(context.Background(), update); err != nil {
		t.Fatalf("ProcessUpdate failed: %v", err)
	}
	if len(calls) != 1 || calls[0] != "handler" {
		t.Fatalf("expected [handler] after removal, got %v", calls)
	}
}
