package routing

import (
	"context"
	"testing"
)

func TestContextSetGet(t *testing.T) {
	c := NewContext(context.Background(), nil, nil)

	if _, ok := c.Get("missing"); ok {
		t.Fatal("Get on empty store should return ok=false")
	}

	c.Set("locale", "vi")
	got, ok := c.Get("locale")
	if !ok || got != "vi" {
		t.Fatalf("Get(locale) = %v, %v; want vi, true", got, ok)
	}

	c.Set("locale", "en")
	got, ok = c.Get("locale")
	if !ok || got != "en" {
		t.Fatalf("Get(locale) after overwrite = %v, %v; want en, true", got, ok)
	}

	c.Set("nil-value", nil)
	if _, ok := c.Get("nil-value"); !ok {
		t.Fatal("Get should distinguish a stored nil from a missing key")
	}
}

func TestContextSetGetTyped(t *testing.T) {
	c := NewContext(context.Background(), nil, nil)

	type stats struct{ Hits int }
	c.Set("stats", &stats{Hits: 3})

	v, ok := c.Get("stats")
	if !ok {
		t.Fatal("expected stats key to exist")
	}
	s, isStats := v.(*stats)
	if !isStats || s.Hits != 3 {
		t.Fatalf("typed Get = %#v; want *stats{Hits:3}", v)
	}
}
