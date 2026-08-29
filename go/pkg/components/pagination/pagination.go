package pagination

import (
	"fmt"

	"github.com/Nam088/telebot-go/pkg/types"
)

// Pagination generates navigation buttons for paginated data sets.
type Pagination struct {
	TotalPages  int
	CurrentPage int
	Prefix      string
}

// New creates a new Pagination instance.
func New(totalPages, currentPage int, prefix string) *Pagination {
	if totalPages < 1 {
		totalPages = 1
	}
	if currentPage < 1 {
		currentPage = 1
	}
	if currentPage > totalPages {
		currentPage = totalPages
	}
	return &Pagination{
		TotalPages:  totalPages,
		CurrentPage: currentPage,
		Prefix:      prefix,
	}
}

// BuildRow creates an inline keyboard row with Prev, Current Page indicator, and Next buttons.
func (p *Pagination) BuildRow() []types.InlineKeyboardButton {
	var row []types.InlineKeyboardButton

	// Prev button
	if p.CurrentPage > 1 {
		row = append(row, types.InlineKeyboardButton{
			Text:         "◀️ Prev",
			CallbackData: fmt.Sprintf("%s:page:%d", p.Prefix, p.CurrentPage-1),
		})
	}

	// Indicator
	row = append(row, types.InlineKeyboardButton{
		Text:         fmt.Sprintf("📄 %d / %d", p.CurrentPage, p.TotalPages),
		CallbackData: fmt.Sprintf("%s:current:%d", p.Prefix, p.CurrentPage),
	})

	// Next button
	if p.CurrentPage < p.TotalPages {
		row = append(row, types.InlineKeyboardButton{
			Text:         "Next ▶️",
			CallbackData: fmt.Sprintf("%s:page:%d", p.Prefix, p.CurrentPage+1),
		})
	}

	return row
}
