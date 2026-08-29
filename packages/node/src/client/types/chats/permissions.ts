/**
 * Describes actions that a non-administrator user is allowed to take in a chat.
 */
export interface ChatPermissions {
  /** True, if the user is allowed to send text messages, contacts, locations and venues. */
  can_send_messages?: boolean;
  /** True, if the user is allowed to send audios. */
  can_send_audios?: boolean;
  /** True, if the user is allowed to send documents. */
  can_send_documents?: boolean;
  /** True, if the user is allowed to send photos. */
  can_send_photos?: boolean;
  /** True, if the user is allowed to send videos. */
  can_send_videos?: boolean;
  /** True, if the user is allowed to send video notes. */
  can_send_video_notes?: boolean;
  /** True, if the user is allowed to send voice notes. */
  can_send_voice_notes?: boolean;
  /** True, if the user is allowed to send polls. */
  can_send_polls?: boolean;
  /** True, if the user is allowed to send animations, games, stickers and use inline bots. */
  can_send_other_messages?: boolean;
  /** True, if the user is allowed to add web page previews to their messages. */
  can_add_web_page_previews?: boolean;
  /** True, if the user is allowed to change the chat title, photo and other settings. */
  can_change_info?: boolean;
  /** True, if the user is allowed to invite new users to the chat. */
  can_invite_users?: boolean;
  /** True, if the user is allowed to pin messages. */
  can_pin_messages?: boolean;
  /** True, if the user is allowed to create, rename, close, and reopen forum topics. */
  can_manage_topics?: boolean;
}

/**
 * Represents the rights of an administrator in a chat.
 */
export interface ChatAdministratorRights {
  /** True, if the user's presence in the chat is hidden. */
  is_anonymous: boolean;
  /** True, if the administrator can access the chat event log, get boost list, see hidden members, etc. */
  can_manage_chat: boolean;
  /** True, if the administrator can delete messages of other users. */
  can_delete_messages: boolean;
  /** True, if the administrator can manage video chats. */
  can_manage_video_chats: boolean;
  /** True, if the administrator can restrict, ban or unban chat members. */
  can_restrict_members: boolean;
  /** True, if the administrator can add new administrators with a subset of their own privileges. */
  can_promote_members: boolean;
  /** True, if the user is allowed to change the chat title, photo and other settings. */
  can_change_info: boolean;
  /** True, if the user is allowed to invite new users to the chat. */
  can_invite_users: boolean;
  /** True, if the administrator can post stories to the chat. */
  can_post_stories?: boolean;
  /** True, if the administrator can edit stories posted by other users. */
  can_edit_stories?: boolean;
  /** True, if the administrator can delete stories posted by other users. */
  can_delete_stories?: boolean;
  /** True, if the administrator can post messages in the channel, or access channel statistics. */
  can_post_messages?: boolean;
  /** True, if the administrator can edit messages of other users. */
  can_edit_messages?: boolean;
  /** True, if the user is allowed to pin messages. */
  can_pin_messages?: boolean;
  /** True, if the user is allowed to create, rename, close, and reopen forum topics. */
  can_manage_topics?: boolean;
  /** True, if the administrator can manage direct messages of the channel. */
  can_manage_direct_messages?: boolean;
  /** True, if the administrator can edit the tags of regular members. */
  can_manage_tags?: boolean;
  /** True, if the administrator can manage chat welcome messages or directly send them in the case of bots (Bot API 10.3+). */
  can_send_welcome_messages?: boolean;
}

/**
 * Represents a community (a group of chats).
 */
export interface Community {
  /** Unique identifier for this community. */
  id: number;
  /** Name of the community. */
  name: string;
}

/**
 * Describes a service message about a chat or a bot being added to a community.
 */
export interface CommunityChatAdded {
  /** The community to which the chat was added. */
  community: Community;
}

/**
 * Describes a service message about a chat or a bot being removed from a community.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CommunityChatRemoved {}
