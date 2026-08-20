import type {
  ChatType,
  ParseMode,
  MessageEntityType,
  PollType,
  ChatMemberStatus,
  ChatAction,
} from "../constants.js";
import type { InputFile } from "../../utils/http.js";
import type { User, Chat, Location } from "./common.js";

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

export interface ChatLocation {
  /** The physical location to which the supergroup is connected. */
  location: Location;
  /** Location address; 1-64 characters, as defined by the chat owner. */
  address: string;
}

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
  /** Date when restrictions will be lifted for this user; Unix time. */
  until_date?: number;
}

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
}

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
}
