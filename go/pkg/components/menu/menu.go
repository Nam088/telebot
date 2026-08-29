package menu

import (
	"fmt"
	"sync"

	"github.com/Nam088/telebot-go/pkg/routing"
	"github.com/Nam088/telebot-go/pkg/types"
)

// ButtonHandler is the callback for a menu button.
type ButtonHandler = routing.HandlerFunc

// MenuButton represents a single button within a Menu layout.
type MenuButton struct {
	Text    string
	Data    string
	Handler ButtonHandler
}

// Menu represents an interactive inline navigation menu.
type Menu struct {
	ID       string
	Text     string
	rows     [][]MenuButton
	parent   *Menu
	submenus map[string]*Menu
	mu       sync.RWMutex
}

// New creates a new Menu.
func New(id, text string) *Menu {
	return &Menu{
		ID:       id,
		Text:     text,
		rows:     make([][]MenuButton, 0),
		submenus: make(map[string]*Menu),
	}
}

// Row starts a new button row.
func (m *Menu) Row() *Menu {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.rows = append(m.rows, []MenuButton{})
	return m
}

// TextButton adds an interactive button with a handler.
func (m *Menu) TextButton(text, action string, handler ButtonHandler) *Menu {
	m.mu.Lock()
	defer m.mu.Unlock()

	data := fmt.Sprintf("m:%s:%s", m.ID, action)
	btn := MenuButton{
		Text:    text,
		Data:    data,
		Handler: handler,
	}

	if len(m.rows) == 0 {
		m.rows = append(m.rows, []MenuButton{btn})
	} else {
		lastIdx := len(m.rows) - 1
		m.rows[lastIdx] = append(m.rows[lastIdx], btn)
	}
	return m
}

// Submenu registers a nested submenu.
func (m *Menu) Submenu(text string, sub *Menu) *Menu {
	m.mu.Lock()
	defer m.mu.Unlock()

	sub.parent = m
	m.submenus[sub.ID] = sub

	btnData := fmt.Sprintf("m:nav:%s", sub.ID)
	btn := MenuButton{
		Text: text,
		Data: btnData,
		Handler: func(c *routing.Context) error {
			_, err := c.AnswerCallbackQuery("", false)
			if err != nil {
				return err
			}
			msg := c.Message()
			if msg == nil {
				return nil
			}
			_, err = c.Bot().EditMessageText(c.Ctx(), &types.EditMessageTextOptions{
				ChatID:      c.Chat().ID,
				MessageID:   msg.MessageID,
				Text:        sub.Text,
				ReplyMarkup: sub.BuildKeyboard(),
			})
			return err
		},
	}

	if len(m.rows) == 0 {
		m.rows = append(m.rows, []MenuButton{btn})
	} else {
		lastIdx := len(m.rows) - 1
		m.rows[lastIdx] = append(m.rows[lastIdx], btn)
	}
	return m
}

// BuildKeyboard compiles the menu layout into Telegram InlineKeyboardMarkup.
func (m *Menu) BuildKeyboard() *types.InlineKeyboardMarkup {
	m.mu.RLock()
	defer m.mu.RUnlock()

	kbRows := make([][]types.InlineKeyboardButton, len(m.rows))
	for rIdx, row := range m.rows {
		kbRows[rIdx] = make([]types.InlineKeyboardButton, len(row))
		for bIdx, btn := range row {
			kbRows[rIdx][bIdx] = types.InlineKeyboardButton{
				Text:         btn.Text,
				CallbackData: btn.Data,
			}
		}
	}

	// If it has a parent, add Back button
	if m.parent != nil {
		backData := fmt.Sprintf("m:nav:%s", m.parent.ID)
		kbRows = append(kbRows, []types.InlineKeyboardButton{
			{Text: "🔙 Back", CallbackData: backData},
		})
	}

	return &types.InlineKeyboardMarkup{InlineKeyboard: kbRows}
}

// Register attaches all button handlers in the menu tree to a Router.
func (m *Menu) Register(r *routing.Router) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	for _, row := range m.rows {
		for _, btn := range row {
			if btn.Handler != nil {
				r.CallbackQuery(btn.Data, btn.Handler)
			}
		}
	}

	for _, sub := range m.submenus {
		sub.Register(r)
	}
}
