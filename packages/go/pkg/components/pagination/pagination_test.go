package pagination_test

import (
	"testing"

	"github.com/Nam088/telebot/packages/go/pkg/components/pagination"
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

func TestPagination_Clamping(t *testing.T) {
	p := pagination.New(0, 0, "items")
	if p.TotalPages != 1 {
		t.Errorf("expected total pages clamped to 1, got %d", p.TotalPages)
	}
	if p.CurrentPage != 1 {
		t.Errorf("expected current page clamped to 1, got %d", p.CurrentPage)
	}

	p2 := pagination.New(-3, 99, "items")
	if p2.TotalPages != 1 || p2.CurrentPage != 1 {
		t.Errorf("expected (1, 1) after clamping, got (%d, %d)", p2.TotalPages, p2.CurrentPage)
	}

	p3 := pagination.New(4, 10, "items")
	if p3.CurrentPage != 4 {
		t.Errorf("expected current page clamped to total 4, got %d", p3.CurrentPage)
	}
}

func TestPagination_LastAndSinglePage(t *testing.T) {
	last := pagination.New(5, 5, "items")
	row := last.BuildRow()
	if len(row) != 2 {
		t.Fatalf("expected 2 buttons on last page (prev + indicator), got %d", len(row))
	}
	if row[0].CallbackData != "items:page:4" {
		t.Errorf("expected prev callback data %q, got %q", "items:page:4", row[0].CallbackData)
	}
	if row[1].CallbackData != "items:current:5" {
		t.Errorf("expected indicator callback data %q, got %q", "items:current:5", row[1].CallbackData)
	}

	single := pagination.New(1, 1, "items")
	singleRow := single.BuildRow()
	if len(singleRow) != 1 {
		t.Fatalf("expected only the indicator on a single page, got %d buttons", len(singleRow))
	}
}
