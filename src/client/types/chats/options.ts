/**
 * Options for promoting or demoting a user in a supergroup or channel.
 */
export interface PromoteChatMemberOptions {
  /** Pass True if the administrator's presence in the chat is hidden. */
  is_anonymous?: boolean;
  /** Pass True if the administrator can access the chat event log, get boost list, see hidden members, etc. */
  can_manage_chat?: boolean;
  /** Pass True if the administrator can post messages in the channel, or access channel statistics; for channels only. */
  can_post_messages?: boolean;
  /** Pass True if the administrator can edit messages of other users and can pin messages; for channels only. */
  can_edit_messages?: boolean;
  /** Pass True if the administrator can delete messages of other users. */
  can_delete_messages?: boolean;
  /** Pass True if the administrator can post stories to the chat. */
  can_post_stories?: boolean;
  /** Pass True if the administrator can edit stories posted by other users. */
  can_edit_stories?: boolean;
  /** Pass True if the administrator can delete stories posted by other users. */
  can_delete_stories?: boolean;
  /** Pass True if the administrator can manage video chats. */
  can_manage_video_chats?: boolean;
  /** Pass True if the administrator can restrict, ban or unban chat members. */
  can_restrict_members?: boolean;
  /** Pass True if the administrator can add new administrators with a subset of their own privileges. */
  can_promote_members?: boolean;
  /** Pass True if the administrator can change chat title, photo and other settings. */
  can_change_info?: boolean;
  /** Pass True if the administrator can invite new users to the chat. */
  can_invite_users?: boolean;
  /** Pass True if the administrator can pin messages; for supergroups only. */
  can_pin_messages?: boolean;
  /** Pass True if the administrator can create, rename, close, and reopen forum topics; for supergroups only. */
  can_manage_topics?: boolean;
  /** Pass True if the administrator can manage direct messages within the channel; for channels only. */
  can_manage_direct_messages?: boolean;
  /** Pass True if the administrator can edit the tags of regular members; for groups and supergroups only. */
  can_manage_tags?: boolean;
  /** Pass True if the administrator can manage chat welcome messages or directly send them in the case of bots (Bot API 10.3+). */
  can_send_welcome_messages?: boolean;
}

/**
 * Options for creating an additional invite link for a chat.
 */
export interface CreateChatInviteLinkOptions {
  /** Invite link name; 0-32 characters. */
  name?: string;
  /** Point in time (Unix timestamp) when the link will expire. */
  expire_date?: number;
  /** The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999. */
  member_limit?: number;
  /** True, if users joining the chat via the link need to be approved by chat administrators. */
  creates_join_request?: boolean;
}

/**
 * Options for editing a non-primary invite link created by the bot.
 */
export interface EditChatInviteLinkOptions {
  /** Invite link name; 0-32 characters. */
  name?: string;
  /** Point in time (Unix timestamp) when the link will expire. */
  expire_date?: number;
  /** The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999. */
  member_limit?: number;
  /** True, if users joining the chat via the link need to be approved by chat administrators. */
  creates_join_request?: boolean;
}
