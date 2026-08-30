package types

// MenuButton is the union of all supported bot menu button types.
type MenuButton interface {
	menuButton()
}

// MenuButtonDefault represents the default menu button.
type MenuButtonDefault struct {
	Type string `json:"type"`
}

func (MenuButtonDefault) menuButton() {}

// MenuButtonCommands represents a menu button that opens the bot's commands.
type MenuButtonCommands struct {
	Type string `json:"type"`
}

func (MenuButtonCommands) menuButton() {}

// MenuButtonWebApp represents a menu button that launches a Web App.
type MenuButtonWebApp struct {
	Type   string     `json:"type"`
	Text   string     `json:"text"`
	WebApp WebAppInfo `json:"web_app"`
}

func (MenuButtonWebApp) menuButton() {}

// SetChatTitleOptions represents parameters for the setChatTitle method.
type SetChatTitleOptions struct {
	ChatID any    `json:"chat_id"`
	Title  string `json:"title"`
}

// SetChatDescriptionOptions represents parameters for the setChatDescription method.
type SetChatDescriptionOptions struct {
	ChatID      any    `json:"chat_id"`
	Description string `json:"description,omitempty"`
}

// SetChatPhotoOptions represents parameters for the setChatPhoto method.
type SetChatPhotoOptions struct {
	ChatID any `json:"chat_id"`
	Photo  any `json:"photo"`
}

// DeleteChatPhotoOptions represents parameters for the deleteChatPhoto method.
type DeleteChatPhotoOptions struct {
	ChatID any `json:"chat_id"`
}

// PinChatMessageOptions represents parameters for the pinChatMessage method.
type PinChatMessageOptions struct {
	ChatID              any   `json:"chat_id"`
	MessageID           int64 `json:"message_id"`
	DisableNotification bool  `json:"disable_notification,omitempty"`
}

// UnpinChatMessageOptions represents parameters for the unpinChatMessage method.
type UnpinChatMessageOptions struct {
	ChatID    any   `json:"chat_id"`
	MessageID int64 `json:"message_id,omitempty"`
}

// SetChatPermissionsOptions represents parameters for the setChatPermissions method.
type SetChatPermissionsOptions struct {
	ChatID                        any             `json:"chat_id"`
	Permissions                   ChatPermissions `json:"permissions"`
	UseIndependentChatPermissions bool            `json:"use_independent_chat_permissions,omitempty"`
}

// ExportChatInviteLinkOptions represents parameters for the exportChatInviteLink method.
type ExportChatInviteLinkOptions struct {
	ChatID any `json:"chat_id"`
}

// SetChatMenuButtonOptions represents parameters for the setChatMenuButton method.
type SetChatMenuButtonOptions struct {
	ChatID     any        `json:"chat_id,omitempty"`
	MenuButton MenuButton `json:"menu_button,omitempty"`
}

// GetChatMenuButtonOptions represents parameters for the getChatMenuButton method.
type GetChatMenuButtonOptions struct {
	ChatID any `json:"chat_id,omitempty"`
}

// SetMyDefaultAdministratorRightsOptions represents parameters for the setMyDefaultAdministratorRights method.
type SetMyDefaultAdministratorRightsOptions struct {
	Rights      *ChatAdministratorRights `json:"rights,omitempty"`
	ForChannels bool                     `json:"for_channels,omitempty"`
}

// GetMyDefaultAdministratorRightsOptions represents parameters for the getMyDefaultAdministratorRights method.
type GetMyDefaultAdministratorRightsOptions struct {
	ForChannels bool `json:"for_channels,omitempty"`
}

// UnpinAllChatMessagesOptions represents parameters for the unpinAllChatMessages method.
type UnpinAllChatMessagesOptions struct {
	ChatID any `json:"chat_id"`
}

// CreateChatInviteLinkOptions represents parameters for the createChatInviteLink method.
type CreateChatInviteLinkOptions struct {
	ChatID             any    `json:"chat_id"`
	Name               string `json:"name,omitempty"`
	ExpireDate         int64  `json:"expire_date,omitempty"`
	MemberLimit        int    `json:"member_limit,omitempty"`
	CreatesJoinRequest bool   `json:"creates_join_request,omitempty"`
}

// EditChatInviteLinkOptions represents parameters for the editChatInviteLink method.
type EditChatInviteLinkOptions struct {
	ChatID             any    `json:"chat_id"`
	InviteLink         string `json:"invite_link"`
	Name               string `json:"name,omitempty"`
	ExpireDate         int64  `json:"expire_date,omitempty"`
	MemberLimit        int    `json:"member_limit,omitempty"`
	CreatesJoinRequest bool   `json:"creates_join_request,omitempty"`
}

// RevokeChatInviteLinkOptions represents parameters for the revokeChatInviteLink method.
type RevokeChatInviteLinkOptions struct {
	ChatID     any    `json:"chat_id"`
	InviteLink string `json:"invite_link"`
}

// CreateChatSubscriptionInviteLinkOptions represents parameters for the
// createChatSubscriptionInviteLink method.
type CreateChatSubscriptionInviteLinkOptions struct {
	ChatID             any    `json:"chat_id"`
	Name               string `json:"name,omitempty"`
	SubscriptionPeriod int    `json:"subscription_period"`
	SubscriptionPrice  int    `json:"subscription_price"`
}

// EditChatSubscriptionInviteLinkOptions represents parameters for the
// editChatSubscriptionInviteLink method. The subscription period and price of
// an existing subscription link are immutable, so only the name can be edited.
type EditChatSubscriptionInviteLinkOptions struct {
	ChatID     any    `json:"chat_id"`
	InviteLink string `json:"invite_link"`
	Name       string `json:"name,omitempty"`
}

// PromoteChatMemberOptions represents parameters for the promoteChatMember method.
type PromoteChatMemberOptions struct {
	ChatID                  any   `json:"chat_id"`
	UserID                  int64 `json:"user_id"`
	IsAnonymous             bool  `json:"is_anonymous,omitempty"`
	CanManageChat           bool  `json:"can_manage_chat,omitempty"`
	CanPostMessages         bool  `json:"can_post_messages,omitempty"`
	CanEditMessages         bool  `json:"can_edit_messages,omitempty"`
	CanDeleteMessages       bool  `json:"can_delete_messages,omitempty"`
	CanPostStories          bool  `json:"can_post_stories,omitempty"`
	CanEditStories          bool  `json:"can_edit_stories,omitempty"`
	CanDeleteStories        bool  `json:"can_delete_stories,omitempty"`
	CanManageVideoChats     bool  `json:"can_manage_video_chats,omitempty"`
	CanRestrictMembers      bool  `json:"can_restrict_members,omitempty"`
	CanPromoteMembers       bool  `json:"can_promote_members,omitempty"`
	CanChangeInfo           bool  `json:"can_change_info,omitempty"`
	CanInviteUsers          bool  `json:"can_invite_users,omitempty"`
	CanPinMessages          bool  `json:"can_pin_messages,omitempty"`
	CanManageTopics         bool  `json:"can_manage_topics,omitempty"`
	CanManageDirectMessages bool  `json:"can_manage_direct_messages,omitempty"`
	CanManageTags           bool  `json:"can_manage_tags,omitempty"`
	CanSendWelcomeMessages  bool  `json:"can_send_welcome_messages,omitempty"`
}

// RestrictChatMemberOptions represents parameters for the restrictChatMember method.
type RestrictChatMemberOptions struct {
	ChatID                        any             `json:"chat_id"`
	UserID                        int64           `json:"user_id"`
	Permissions                   ChatPermissions `json:"permissions"`
	UseIndependentChatPermissions bool            `json:"use_independent_chat_permissions,omitempty"`
	UntilDate                     int64           `json:"until_date,omitempty"`
}
