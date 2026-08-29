package pagination_test

import (
	"testing"

	"github.com/Nam088/telebot-go/pkg/components/pagination"
)

func TestPagination(t *testing.T) {
	p := pagination.New(5, 1, "items")
	row := p.BuildRow()

	if len(row) != 2 {
		t.Fatalf("expected 2 buttons on page 1 (indicator + next), got %d", len(row))
	}

	p2 := pagination.New(5, 3, "items")
	row2 := p2.BuildRow()

	if len(row2) != 3 {
		t.Fatalf("expected 3 buttons on page 3 (prev + indicator + next), got %d", len(row2))
	}
}
