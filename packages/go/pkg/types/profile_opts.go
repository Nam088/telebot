package types

// BotShortDescription represents the bot's short description.
type BotShortDescription struct {
	ShortDescription string `json:"short_description"`
}

// BotCommandScope is the union of all supported bot command scope types.
type BotCommandScope interface {
	botCommandScope()
}

// BotCommandScopeDefault represents the default bot command scope.
type BotCommandScopeDefault struct {
	Type string `json:"type"`
}

func (BotCommandScopeDefault) botCommandScope() {}

// BotCommandScopeAllPrivateChats represents a bot command scope for all private chats.
type BotCommandScopeAllPrivateChats struct {
	Type string `json:"type"`
}

func (BotCommandScopeAllPrivateChats) botCommandScope() {}

// BotCommandScopeAllGroupChats represents a bot command scope for all group chats.
type BotCommandScopeAllGroupChats struct {
	Type string `json:"type"`
}

func (BotCommandScopeAllGroupChats) botCommandScope() {}

// BotCommandScopeAllChatAdministrators represents a bot command scope for all chat administrators.
type BotCommandScopeAllChatAdministrators struct {
	Type string `json:"type"`
}

func (BotCommandScopeAllChatAdministrators) botCommandScope() {}

// BotCommandScopeChat represents a bot command scope for a specific chat.
type BotCommandScopeChat struct {
	Type   string `json:"type"`
	ChatID any    `json:"chat_id"`
}

func (BotCommandScopeChat) botCommandScope() {}

// BotCommandScopeChatAdministrators represents a bot command scope for all administrators of a specific chat.
type BotCommandScopeChatAdministrators struct {
	Type   string `json:"type"`
	ChatID any    `json:"chat_id"`
}

func (BotCommandScopeChatAdministrators) botCommandScope() {}

// BotCommandScopeChatMember represents a bot command scope for a specific member of a specific chat.
type BotCommandScopeChatMember struct {
	Type   string `json:"type"`
	ChatID any    `json:"chat_id"`
	UserID int64  `json:"user_id"`
}

func (BotCommandScopeChatMember) botCommandScope() {}

// SetMyNameOptions represents parameters for the setMyName method.
type SetMyNameOptions struct {
	Name         string `json:"name,omitempty"`
	LanguageCode string `json:"language_code,omitempty"`
}

// GetMyNameOptions represents parameters for the getMyName method.
type GetMyNameOptions struct {
	LanguageCode string `json:"language_code,omitempty"`
}

// SetMyDescriptionOptions represents parameters for the setMyDescription method.
type SetMyDescriptionOptions struct {
	Description  string `json:"description,omitempty"`
	LanguageCode string `json:"language_code,omitempty"`
}

// GetMyDescriptionOptions represents parameters for the getMyDescription method.
type GetMyDescriptionOptions struct {
	LanguageCode string `json:"language_code,omitempty"`
}

// SetMyShortDescriptionOptions represents parameters for the setMyShortDescription method.
type SetMyShortDescriptionOptions struct {
	ShortDescription string `json:"short_description,omitempty"`
	LanguageCode     string `json:"language_code,omitempty"`
}

// GetMyShortDescriptionOptions represents parameters for the getMyShortDescription method.
type GetMyShortDescriptionOptions struct {
	LanguageCode string `json:"language_code,omitempty"`
}

// DeleteMyCommandsOptions represents parameters for the deleteMyCommands method.
type DeleteMyCommandsOptions struct {
	Scope        BotCommandScope `json:"scope,omitempty"`
	LanguageCode string          `json:"language_code,omitempty"`
}

// SetMyCommandsOptions represents parameters for the setMyCommands method.
type SetMyCommandsOptions struct {
	Commands     []BotCommand    `json:"commands"`
	Scope        BotCommandScope `json:"scope,omitempty"`
	LanguageCode string          `json:"language_code,omitempty"`
}

// GetMyCommandsOptions represents parameters for the getMyCommands method.
type GetMyCommandsOptions struct {
	Scope        BotCommandScope `json:"scope,omitempty"`
	LanguageCode string          `json:"language_code,omitempty"`
}
