package routing

import (
	"fmt"
	"sync"

	"github.com/Nam088/telebot-go/pkg/types"
)

const (
	ConversationEnd = -1
)

// StateHandlerFunc handles updates within a conversation state and returns the next state.
type StateHandlerFunc func(c *Context) (int, error)

// StateRoute defines a filter and handler pair returning the next conversation state.
type StateRoute struct {
	Filter  func(u *types.Update) bool
	Handler StateHandlerFunc
}

// ConversationHandler implements a finite-state machine (FSM) for multi-step dialogues.
type ConversationHandler struct {
	Name        string
	EntryPoints []StateRoute
	States      map[int][]StateRoute
	Fallbacks   []StateRoute
	userStates  map[int64]int
	mu          sync.RWMutex
}

// NewConversationHandler creates a new FSM conversation handler.
func NewConversationHandler(name string) *ConversationHandler {
	return &ConversationHandler{
		Name:        name,
		EntryPoints: make([]StateRoute, 0),
		States:      make(map[int][]StateRoute),
		Fallbacks:   make([]StateRoute, 0),
		userStates:  make(map[int64]int),
	}
}

// AddEntryPoint registers routes that trigger the conversation start.
func (h *ConversationHandler) AddEntryPoint(filter func(u *types.Update) bool, handler StateHandlerFunc) *ConversationHandler {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.EntryPoints = append(h.EntryPoints, StateRoute{Filter: filter, Handler: handler})
	return h
}

// AddState registers routes for a specific conversation state.
func (h *ConversationHandler) AddState(state int, filter func(u *types.Update) bool, handler StateHandlerFunc) *ConversationHandler {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.States[state] = append(h.States[state], StateRoute{Filter: filter, Handler: handler})
	return h
}

// AddFallback registers routes that run when no state handler matches or to cancel.
func (h *ConversationHandler) AddFallback(filter func(u *types.Update) bool, handler StateHandlerFunc) *ConversationHandler {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.Fallbacks = append(h.Fallbacks, StateRoute{Filter: filter, Handler: handler})
	return h
}

// HandleUpdate evaluates the incoming update against the user's active conversation state.
func (h *ConversationHandler) HandleUpdate(c *Context) (bool, error) {
	user := c.User()
	if user == nil {
		return false, nil
	}

	h.mu.Lock()
	currentState, active := h.userStates[user.ID]
	h.mu.Unlock()

	u := c.Update()

	// 1. If user is in an active state, check that state's routes
	if active {
		h.mu.RLock()
		routes, hasState := h.States[currentState]
		h.mu.RUnlock()

		if hasState {
			for _, route := range routes {
				if route.Filter(u) {
					nextState, err := route.Handler(c)
					if err != nil {
						return true, err
					}
					h.transition(user.ID, nextState)
					return true, nil
				}
			}
		}

		// Fallbacks when in state
		for _, fb := range h.Fallbacks {
			if fb.Filter(u) {
				nextState, err := fb.Handler(c)
				if err != nil {
					return true, err
				}
				h.transition(user.ID, nextState)
				return true, nil
			}
		}
		return false, nil
	}

	// 2. If not active, test entry points
	for _, entry := range h.EntryPoints {
		if entry.Filter(u) {
			nextState, err := entry.Handler(c)
			if err != nil {
				return true, err
			}
			h.transition(user.ID, nextState)
			return true, nil
		}
	}

	return false, nil
}

func (h *ConversationHandler) transition(userID int64, nextState int) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if nextState == ConversationEnd {
		delete(h.userStates, userID)
	} else {
		h.userStates[userID] = nextState
	}
}

// Register attaches the conversation handler to the Router.
func (h *ConversationHandler) Register(r *Router) {
	r.Handle(func(u *types.Update) bool {
		user := u.EffectiveUser()
		if user == nil {
			return false
		}
		h.mu.RLock()
		_, active := h.userStates[user.ID]
		h.mu.RUnlock()

		if active {
			return true
		}
		for _, entry := range h.EntryPoints {
			if entry.Filter(u) {
				return true
			}
		}
		return false
	}, func(c *Context) error {
		handled, err := h.HandleUpdate(c)
		if err != nil {
			return err
		}
		if !handled {
			return fmt.Errorf("unhandled update in conversation %s", h.Name)
		}
		return nil
	})
}
