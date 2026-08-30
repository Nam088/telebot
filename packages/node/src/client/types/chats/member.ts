import type { ChatMemberStatus } from "../../constants.js";
import type { User, Chat, Location } from "../common/index.js";
import type { ChatBoost } from "../business/index.js";

/**
 * Represents a physical location to which a supergroup is connected.
 *
 * @see {@link https://core.telegram.org/bots/api#chatlocation Telegram Bot API: ChatLocation}
 */
export interface ChatLocation {
  /** The physical location to which the supergroup is connected. */
  location: Location;
  /** Location address; 1-64 characters, as defined by the chat owner. */
  address: string;
}

/**
 * Represents an invite link for a chat.
 *
 * @see {@link https://core.telegram.org/bots/api#chatinvitelink Telegram Bot API: ChatInviteLink}
 */
export interface ChatInviteLink {
  /** The invite link as a string. */
  invite_link: string;
  /** Creator of the link. */
  creator: User;
  /** True, if users joining the chat via the link need to be approved by chat administrators. */
  creates_join_request: boolean;
  /** True, if the link is primary. */
  is_primary: boolean;
  /** True, if the link is revoked. */
  is_revoked: boolean;
  /** Invite link name. */
  name?: string;
  /** Point in time (Unix timestamp) when the link will expire or has expired. */
  expire_date?: number;
  /** The maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999. */
  member_limit?: number;
  /** Number of pending join requests created using this link. */
  pending_join_request_count?: number;
  /** The number of seconds the subscription will be active for. */
  subscription_period?: number;
  /** The amount of Telegram Stars a user must pay initially and after each subscription period to remain in the chat. */
  subscription_price?: number;
}

/**
 * Represents changes in the status of a chat member.
 *
 * @see {@link https://core.telegram.org/bots/api#chatmemberupdated Telegram Bot API: ChatMemberUpdated}
 */
export interface ChatMemberUpdated {
  /** Chat, which member status was updated. */
  chat: Chat;
  /** Performer of the action, which resulted in the change. */
  from: User;
  /** Date the change was done in Unix time. */
  date: number;
  /** Previous information about the chat member. */
  old_chat_member: ChatMember;
  /** New information about the chat member. */
  new_chat_member: ChatMember;
  /** Chat invite link, which was used by the user to join the chat. */
  invite_link?: ChatInviteLink;
  /** True, if the user joined the chat after sending a direct join request and being approved. */
  via_join_request?: boolean;
  /** True, if the user joined the chat via a chat folder invite link. */
  via_chat_folder_invite_link?: boolean;
}

/**
 * Contains information about one member of a chat.
 *
 * @see {@link https://core.telegram.org/bots/api#chatmember Telegram Bot API: ChatMember}
 */
export interface ChatMember {
  /** The member's status in the chat ('creator', 'administrator', 'member', 'restricted', 'left', or 'kicked'). */
  status: ChatMemberStatus;
  /** Information about the user. */
  user: User;
  /** Custom title for this user (administrators only). */
  custom_title?: string;
  /** True, if the user's presence in the chat is hidden (administrators only). */
  is_anonymous?: boolean;
  /** True, if the bot is allowed to edit administrator privileges of that user. */
  can_be_edited?: boolean;
  /** True, if the administrator can access the chat event log, get boost list, etc. */
  can_manage_chat?: boolean;
  /** True, if the administrator can delete messages of other users. */
  can_delete_messages?: boolean;
  /** True, if the administrator can manage video chats. */
  can_manage_video_chats?: boolean;
  /** True, if the administrator can restrict, ban or unban chat members. */
  can_restrict_members?: boolean;
  /** True, if the administrator can add new administrators. */
  can_promote_members?: boolean;
  /** True, if the user is allowed to change the chat title, photo and other settings. */
  can_change_info?: boolean;
  /** True, if the user is allowed to invite new users to the chat. */
  can_invite_users?: boolean;
  /** True, if the administrator can post stories to the chat. */
  can_post_stories?: boolean;
  /** True, if the administrator can edit stories posted by other users. */
  can_edit_stories?: boolean;
  /** True, if the administrator can delete stories posted by other users. */
  can_delete_stories?: boolean;
  /** True, if the administrator can post messages in the channel. */
  can_post_messages?: boolean;
  /** True, if the administrator can edit messages of other users. */
  can_edit_messages?: boolean;
  /** True, if the user is allowed to pin messages. */
  can_pin_messages?: boolean;
  /** True, if the user is allowed to create, rename, close, and reopen forum topics. */
  can_manage_topics?: boolean;
  /** True, if the administrator can manage chat welcome messages or directly send them in the case of bots (Bot API 10.3+). */
  can_send_welcome_messages?: boolean;
  /** Date when restrictions will be lifted for this user; Unix time. */
  until_date?: number;
}

/**
 * Represents a chat member that has some additional privileges.
 *
 * @see {@link https://core.telegram.org/bots/api#chatmemberadministrator Telegram Bot API: ChatMemberAdministrator}
 */
export interface ChatMemberAdministrator {
  /** The member's status in the chat, always 'administrator'. */
  status: "administrator";
  /** Information about the user. */
  user: User;
  /** True, if the bot is allowed to edit administrator privileges of that user. */
  can_be_edited: boolean;
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
  /** True, if the administrator can post messages in the channel. */
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
  /** Custom title for this user. */
  custom_title?: string;
}

/**
 * Represents a join request sent to a chat.
 *
 * @see {@link https://core.telegram.org/bots/api#chatjoinrequest Telegram Bot API: ChatJoinRequest}
 */
export interface ChatJoinRequest {
  /** Chat to which the request was sent. */
  chat: Chat;
  /** User that sent the join request. */
  from: User;
  /** Identifier of a private chat with the user who sent the join request. */
  user_chat_id: number;
  /** Date the request was sent in Unix time. */
  date: number;
  /** Bio of the user. */
  bio?: string;
  /** Chat invite link that was used by the user to send the join request. */
  invite_link?: ChatInviteLink;
}

/**
 * Represents a list of boosts added to a chat by a user.
 *
 * @see {@link https://core.telegram.org/bots/api#userchatboosts Telegram Bot API: UserChatBoosts}
 */
export interface UserChatBoosts {
  /** The list of boosts added to the chat by the user. */
  boosts: ChatBoost[];
}
