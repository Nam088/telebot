import type { User } from "../common/index.js";

/**
 * This object represents a service message about a video chat scheduled in the chat.
 *
 * @see {@link https://core.telegram.org/bots/api#videochatscheduled Telegram Bot API: VideoChatScheduled}
 */
export interface VideoChatScheduled {
  /** Point in time (Unix timestamp) when the video chat is supposed to be started by a chat administrator. */
  start_date: number;
}

/**
 * This object represents a service message about a video chat started in the chat.
 *
 * @remarks
 * Currently holds no information.
 *
 * @see {@link https://core.telegram.org/bots/api#videochatstarted Telegram Bot API: VideoChatStarted}
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VideoChatStarted {}

/**
 * This object represents a service message about a video chat ended in the chat.
 *
 * @see {@link https://core.telegram.org/bots/api#videochatended Telegram Bot API: VideoChatEnded}
 */
export interface VideoChatEnded {
  /** Video chat duration in seconds. */
  duration: number;
}

/**
 * This object represents a service message about new members invited to a video chat.
 *
 * @see {@link https://core.telegram.org/bots/api#videochatparticipantsinvited Telegram Bot API: VideoChatParticipantsInvited}
 */
export interface VideoChatParticipantsInvited {
  /** New members that were invited to the video chat. */
  users: User[];
}
