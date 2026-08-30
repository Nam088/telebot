import type { ChatType } from "../../constants.js";
import type { Chat, ChatPhoto, Birthdate, User } from "../common/index.js";
import type {
  AcceptedGiftTypes,
  BusinessIntro,
  BusinessLocation,
  BusinessOpeningHours,
} from "../business/index.js";
import type { Message, Audio, ReactionType } from "../messages/index.js";
import type { UniqueGiftColors } from "../payments/index.js";
import type { ChatPermissions, Community } from "./permissions.js";
import type { ChatLocation } from "./member.js";

/**
 * Represents the rating of a user in Telegram's public-profile rating system.
 *
 * Declared next to {@link ChatFullInfo} because `ChatFullInfo.rating` is the only
 * documented reference to it in Bot API 10.3.
 *
 * @see {@link https://core.telegram.org/bots/api#userrating Telegram Bot API: UserRating}
 */
export interface UserRating {
  /** Identifier of the current level of the rating. */
  level: number;
  /** The current rating of the user. */
  rating: number;
  /** The rating necessary to reach the current level. */
  current_level_rating: number;
  /** The rating necessary to reach the next level; if the user has reached the highest level, the field is omitted. */
  next_level_rating?: number;
}

/**
 * Represents full information about a chat.
 *
 * @remarks
 * The docs define `ChatFullInfo` as repeating every field of `Chat`, so this
 * interface extends {@link Chat} (node's `Chat` field set is a strict subset of
 * the documented `ChatFullInfo` field set, verified against the docs oracle) and
 * re-declares the inherited fields to pin down the documented requiredness:
 * `accent_color_id`, `max_reaction_count` and `accepted_gift_types` are always
 * present on a `ChatFullInfo` even though the narrower {@link Chat} declares them
 * optional. Extending `Chat` also keeps every `ChatFullInfo` assignable anywhere a
 * `Chat` is expected, so callers that previously consumed `getChat()` as a `Chat`
 * keep compiling.
 *
 * This is the object returned by the `getChat` Bot API method.
 *
 * @see {@link https://core.telegram.org/bots/api#chatfullinfo Telegram Bot API: ChatFullInfo}
 */
export interface ChatFullInfo extends Chat {
  /** Unique identifier for this chat (integer or channel username string). */
  id: number | string;
  /** Type of the chat, can be 'private', 'group', 'supergroup', or 'channel'. */
  type: ChatType;
  /** Title, for supergroups, channels and group chats. */
  title?: string;
  /** Username, for private chats, supergroups and channels if available. */
  username?: string;
  /** First name of the other party in a private chat. */
  first_name?: string;
  /** Last name of the other party in a private chat. */
  last_name?: string;
  /** True, if the supergroup chat is a forum (has topics enabled). */
  is_forum?: boolean;
  /** True, if the chat is the direct messages chat of a channel. */
  is_direct_messages?: boolean;
  /** Identifier of the accent color for the chat name and backgrounds of the chat photo, reply header, and link preview. */
  accent_color_id: number;
  /** The maximum number of reactions that can be set on a message in the chat. */
  max_reaction_count: number;
  /** Chat photo. */
  photo?: ChatPhoto;
  /** If non-empty, the list of all active chat usernames; for private chats, supergroups and channels. */
  active_usernames?: string[];
  /** For private chats, the date of birth of the user. */
  birthdate?: Birthdate;
  /** For private chats with business accounts, the intro of the business. */
  business_intro?: BusinessIntro;
  /** For private chats with business accounts, the location of the business. */
  business_location?: BusinessLocation;
  /** For private chats with business accounts, the opening hours of the business. */
  business_opening_hours?: BusinessOpeningHours;
  /** For private chats, the personal channel of the user. */
  personal_chat?: Chat;
  /** Information about the corresponding channel chat; for direct messages chats only. */
  parent_chat?: Chat;
  /** List of available reactions allowed in the chat. If omitted, then all emoji reactions are allowed. */
  available_reactions?: ReactionType[];
  /** Custom emoji identifier of the emoji chosen by the chat for the reply header and link preview background. */
  background_custom_emoji_id?: string;
  /** Identifier of the accent color for the chat's profile background. */
  profile_accent_color_id?: number;
  /** Custom emoji identifier of the emoji chosen by the chat for its profile background. */
  profile_background_custom_emoji_id?: string;
  /** Custom emoji identifier of the emoji status of the chat or the other party in a private chat. */
  emoji_status_custom_emoji_id?: string;
  /** Expiration date of the emoji status of the chat or the other party in a private chat, in Unix time, if any. */
  emoji_status_expiration_date?: number;
  /** Bio of the other party in a private chat. */
  bio?: string;
  /** True, if privacy settings of the other party in the private chat allows to use `tg://user?id=<user_id>` links only in chats with the user. */
  has_private_forwards?: boolean;
  /** True, if the privacy settings of the other party restrict sending voice and video note messages in the private chat. */
  has_restricted_voice_and_video_messages?: boolean;
  /** True, if users need to join the supergroup before they can send messages. */
  join_to_send_messages?: boolean;
  /** True, if all users directly joining the supergroup without using an invite link need to be approved by supergroup administrators. */
  join_by_request?: boolean;
  /** Description, for groups, supergroups and channel chats. */
  description?: string;
  /** Primary invite link, for groups, supergroups and channel chats. */
  invite_link?: string;
  /** The most recent pinned message (by sending date). */
  pinned_message?: Message;
  /** Default chat member permissions, for groups and supergroups. */
  permissions?: ChatPermissions;
  /** Information about types of gifts that are accepted by the chat or by the corresponding user for private chats. */
  accepted_gift_types: AcceptedGiftTypes;
  /** True, if paid media messages can be sent or forwarded to the channel chat. The field is available only for channel chats. */
  can_send_paid_media?: boolean;
  /** For supergroups, the minimum allowed delay between consecutive messages sent by each unprivileged user; in seconds. */
  slow_mode_delay?: number;
  /** For supergroups, the minimum number of boosts that a non-administrator user needs to add in order to ignore slow mode and chat permissions. */
  unrestrict_boost_count?: number;
  /** The time after which all messages sent to the chat will be automatically deleted; in seconds. */
  message_auto_delete_time?: number;
  /** True, if aggressive anti-spam checks are enabled in the supergroup. The field is only available to chat administrators. */
  has_aggressive_anti_spam_enabled?: boolean;
  /** True, if non-administrators can only get the list of bots and administrators in the chat. */
  has_hidden_members?: boolean;
  /** True, if messages from the chat can't be forwarded to other chats. */
  has_protected_content?: boolean;
  /** True, if new chat members will have access to old messages; available only to chat administrators. */
  has_visible_history?: boolean;
  /** For supergroups, name of the group sticker set. */
  sticker_set_name?: string;
  /** True, if the bot can change the group sticker set. */
  can_set_sticker_set?: boolean;
  /** For supergroups, the name of the group's custom emoji sticker set. */
  custom_emoji_sticker_set_name?: string;
  /** Unique identifier for the linked chat, i.e. the discussion group identifier for a channel and vice versa; for supergroups and channel chats. */
  linked_chat_id?: number;
  /** For supergroups, the location to which the supergroup is connected. */
  location?: ChatLocation;
  /** For private chats, the rating of the user if any. */
  rating?: UserRating;
  /** For private chats, the first audio added to the profile of the user. */
  first_profile_audio?: Audio;
  /** The color scheme based on a unique gift that must be used for the chat's name, message replies and link previews. */
  unique_gift_colors?: UniqueGiftColors;
  /** The number of Telegram Stars a general user has to pay to send a message to the chat. */
  paid_message_star_count?: number;
  /** The bot that processes join request queries in the chat. The field is only available to chat administrators. */
  guard_bot?: User;
  /** The community to which the chat belongs. */
  community?: Community;
}
