/**
 * Forum topics, bot profile, and menu button methods for Bot API.
 *
 * @packageDocumentation
 */

import { PaymentMethods } from "./payments.js";
import type {
  ChatAdministratorRights,
  MenuButton,
  BotName,
  BotDescription,
  BotShortDescription,
  BotCommand,
  BotCommandScope,
  ForumTopic,
} from "../types.js";

/**
 * Mixin providing forum topics, profile management, and menu button operations.
 */
export abstract class TopicAndProfileMethods extends PaymentMethods {
  /**
   * Changes the list of the bot's commands for the given scope and user language.
   *
   * @param options - Options including `commands` array, and optional `scope` and `language_code`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When setting commands fails.
   *
   * @example
   * ```ts
   * await bot.setMyCommands({
   *   commands: [{ command: "start", description: "Start the bot" }],
   * });
   * ```
   */
  public async setMyCommands(options: {
    commands: BotCommand[];
    scope?: BotCommandScope;
    language_code?: string;
  }): Promise<boolean> {
    return this.request<boolean>("setMyCommands", options as unknown as Record<string, unknown>);
  }

  /**
   * Retrieves the current list of the bot's commands for the given scope and user language.
   *
   * @param options - Optional `scope` and `language_code`.
   * @returns Array of {@link BotCommand} objects.
   * @throws {@link TelegramApiError} When retrieving commands fails.
   *
   * @example
   * ```ts
   * const commands = await bot.getMyCommands();
   * console.log(commands);
   * ```
   */
  public async getMyCommands(
    options: {
      scope?: BotCommandScope;
      language_code?: string;
    } = {},
  ): Promise<BotCommand[]> {
    return this.request<BotCommand[]>(
      "getMyCommands",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Deletes the list of the bot's commands for the given scope and user language.
   *
   * @param options - Optional `scope` and `language_code`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting commands fails.
   *
   * @example
   * ```ts
   * await bot.deleteMyCommands();
   * ```
   */
  public async deleteMyCommands(
    options: {
      scope?: BotCommandScope;
      language_code?: string;
    } = {},
  ): Promise<boolean> {
    return this.request<boolean>("deleteMyCommands", options as unknown as Record<string, unknown>);
  }

  /**
   * Changes the bot's name.
   *
   * @param name - New bot name (0-64 characters). Pass empty or undefined to remove the name.
   * @param languageCode - Two-letter ISO 639-1 language code.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When changing bot name fails.
   *
   * @example
   * ```ts
   * await bot.setMyName("CoolBot", "en");
   * ```
   */
  public async setMyName(name?: string, languageCode?: string): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (name !== undefined) payload["name"] = name;
    if (languageCode !== undefined) payload["language_code"] = languageCode;
    return this.request<boolean>("setMyName", payload);
  }

  /**
   * Retrieves the current bot name for the given user language.
   *
   * @param languageCode - Two-letter ISO 639-1 language code.
   * @returns A {@link BotName} object.
   * @throws {@link TelegramApiError} When retrieving bot name fails.
   *
   * @example
   * ```ts
   * const { name } = await bot.getMyName("en");
   * console.log(`Bot Name: ${name}`);
   * ```
   */
  public async getMyName(languageCode?: string): Promise<BotName> {
    const payload: Record<string, unknown> = {};
    if (languageCode !== undefined) payload["language_code"] = languageCode;
    return this.request<BotName>("getMyName", payload);
  }

  /**
   * Changes the bot's description, which is shown on the chat with the bot when empty.
   *
   * @param description - New bot description (0-512 characters). Pass undefined to remove description.
   * @param languageCode - Two-letter ISO 639-1 language code.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When changing description fails.
   *
   * @example
   * ```ts
   * await bot.setMyDescription("An awesome assistant bot.", "en");
   * ```
   */
  public async setMyDescription(description?: string, languageCode?: string): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (description !== undefined) payload["description"] = description;
    if (languageCode !== undefined) payload["language_code"] = languageCode;
    return this.request<boolean>("setMyDescription", payload);
  }

  /**
   * Retrieves the current bot description for the given user language.
   *
   * @param languageCode - Two-letter ISO 639-1 language code.
   * @returns A {@link BotDescription} object.
   * @throws {@link TelegramApiError} When retrieving description fails.
   *
   * @example
   * ```ts
   * const { description } = await bot.getMyDescription("en");
   * console.log(description);
   * ```
   */
  public async getMyDescription(languageCode?: string): Promise<BotDescription> {
    const payload: Record<string, unknown> = {};
    if (languageCode !== undefined) payload["language_code"] = languageCode;
    return this.request<BotDescription>("getMyDescription", payload);
  }

  /**
   * Changes the bot's short description, which is shown on the bot's profile page and sent with links.
   *
   * @param shortDescription - New short description (0-120 characters). Pass undefined to remove.
   * @param languageCode - Two-letter ISO 639-1 language code.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When changing short description fails.
   *
   * @example
   * ```ts
   * await bot.setMyShortDescription("Fast and powerful Telegram Bot", "en");
   * ```
   */
  public async setMyShortDescription(
    shortDescription?: string,
    languageCode?: string,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (shortDescription !== undefined) payload["short_description"] = shortDescription;
    if (languageCode !== undefined) payload["language_code"] = languageCode;
    return this.request<boolean>("setMyShortDescription", payload);
  }

  /**
   * Retrieves the current bot short description for the given user language.
   *
   * @param languageCode - Two-letter ISO 639-1 language code.
   * @returns A {@link BotShortDescription} object.
   * @throws {@link TelegramApiError} When retrieving short description fails.
   *
   * @example
   * ```ts
   * const { short_description } = await bot.getMyShortDescription("en");
   * console.log(short_description);
   * ```
   */
  public async getMyShortDescription(languageCode?: string): Promise<BotShortDescription> {
    const payload: Record<string, unknown> = {};
    if (languageCode !== undefined) payload["language_code"] = languageCode;
    return this.request<BotShortDescription>("getMyShortDescription", payload);
  }

  /**
   * Changes the default administrator rights requested by the bot when added as administrator.
   *
   * @param rights - An object describing new default administrator rights.
   * @param forChannels - Pass `true` to change default rights for channels, or `false` for groups/supergroups.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When changing administrator rights fails.
   *
   * @example
   * ```ts
   * await bot.setMyDefaultAdministratorRights({
   *   is_anonymous: false,
   *   can_manage_chat: true,
   *   can_delete_messages: true,
   *   can_manage_video_chats: false,
   *   can_restrict_members: true,
   *   can_promote_members: false,
   *   can_change_info: true,
   *   can_invite_users: true,
   * });
   * ```
   */
  public async setMyDefaultAdministratorRights(
    rights?: ChatAdministratorRights,
    forChannels?: boolean,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (rights !== undefined) payload["rights"] = rights;
    if (forChannels !== undefined) payload["for_channels"] = forChannels;
    return this.request<boolean>("setMyDefaultAdministratorRights", payload);
  }

  /**
   * Retrieves the current default administrator rights of the bot.
   *
   * @param forChannels - Pass `true` to get default rights for channels, or `false` for groups/supergroups.
   * @returns A {@link ChatAdministratorRights} object.
   * @throws {@link TelegramApiError} When retrieving administrator rights fails.
   *
   * @example
   * ```ts
   * const rights = await bot.getMyDefaultAdministratorRights();
   * console.log(rights);
   * ```
   */
  public async getMyDefaultAdministratorRights(
    forChannels?: boolean,
  ): Promise<ChatAdministratorRights> {
    const payload: Record<string, unknown> = {};
    if (forChannels !== undefined) payload["for_channels"] = forChannels;
    return this.request<ChatAdministratorRights>("getMyDefaultAdministratorRights", payload);
  }

  /**
   * Changes the bot's menu button in a private chat, or the default menu button.
   *
   * @param chatId - Unique identifier for the target private chat. If not specified, default menu button is changed.
   * @param menuButton - An object for the new bot menu button.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When changing menu button fails.
   *
   * @example
   * ```ts
   * await bot.setChatMenuButton(123456, {
   *   type: "web_app",
   *   text: "Open App",
   *   web_app: { url: "https://example.com/app" },
   * });
   * ```
   */
  public async setChatMenuButton(
    chatId?: number | string,
    menuButton?: MenuButton,
  ): Promise<boolean> {
    const payload: Record<string, unknown> = {};
    if (chatId !== undefined) payload["chat_id"] = chatId;
    if (menuButton !== undefined) payload["menu_button"] = menuButton;
    return this.request<boolean>("setChatMenuButton", payload);
  }

  /**
   * Retrieves the current value of the bot's menu button in a private chat, or the default menu button.
   *
   * @param chatId - Unique identifier for the target private chat. If not specified, default menu button is returned.
   * @returns A {@link MenuButton} object.
   * @throws {@link TelegramApiError} When retrieving menu button fails.
   *
   * @example
   * ```ts
   * const menu = await bot.getChatMenuButton(123456);
   * console.log(menu.type);
   * ```
   */
  public async getChatMenuButton(chatId?: number | string): Promise<MenuButton> {
    const payload: Record<string, unknown> = {};
    if (chatId !== undefined) payload["chat_id"] = chatId;
    return this.request<MenuButton>("getChatMenuButton", payload);
  }

  /**
   * Creates a topic in a forum supergroup chat.
   *
   * @param options - Options including target `chat_id`, `name`, and optional `icon_color` or `icon_custom_emoji_id`.
   * @returns The created {@link ForumTopic} object on success.
   * @throws {@link TelegramApiError} When creating topic fails.
   *
   * @example
   * ```ts
   * const topic = await bot.createForumTopic({
   *   chat_id: -1001234567890,
   *   name: "Announcements",
   *   icon_color: 0x6FB9F0,
   * });
   * console.log(`Created thread ID: ${topic.message_thread_id}`);
   * ```
   */
  public async createForumTopic(options: {
    chat_id: number | string;
    name: string;
    icon_color?: number;
    icon_custom_emoji_id?: string;
  }): Promise<ForumTopic> {
    return this.request<ForumTopic>(
      "createForumTopic",
      options as unknown as Record<string, unknown>,
    );
  }

  /**
   * Edits the name and icon of a topic in a forum supergroup chat.
   *
   * @param options - Options including `chat_id`, `message_thread_id`, and updated `name` or `icon_custom_emoji_id`.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When editing topic fails.
   *
   * @example
   * ```ts
   * await bot.editForumTopic({
   *   chat_id: -1001234567890,
   *   message_thread_id: 42,
   *   name: "Updated Announcements",
   * });
   * ```
   */
  public async editForumTopic(options: {
    chat_id: number | string;
    message_thread_id: number;
    name?: string;
    icon_custom_emoji_id?: string;
  }): Promise<boolean> {
    return this.request<boolean>("editForumTopic", options as unknown as Record<string, unknown>);
  }

  /**
   * Closes an open topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageThreadId - Unique identifier for the target message thread of the forum topic.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When closing topic fails.
   *
   * @example
   * ```ts
   * await bot.closeForumTopic(-1001234567890, 42);
   * ```
   */
  public async closeForumTopic(chatId: number | string, messageThreadId: number): Promise<boolean> {
    return this.request<boolean>("closeForumTopic", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Reopens a closed topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageThreadId - Unique identifier for the target message thread of the forum topic.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When reopening topic fails.
   *
   * @example
   * ```ts
   * await bot.reopenForumTopic(-1001234567890, 42);
   * ```
   */
  public async reopenForumTopic(
    chatId: number | string,
    messageThreadId: number,
  ): Promise<boolean> {
    return this.request<boolean>("reopenForumTopic", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Deletes a forum topic along with all its messages in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageThreadId - Unique identifier for the target message thread of the forum topic.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When deleting topic fails.
   *
   * @example
   * ```ts
   * await bot.deleteForumTopic(-1001234567890, 42);
   * ```
   */
  public async deleteForumTopic(
    chatId: number | string,
    messageThreadId: number,
  ): Promise<boolean> {
    return this.request<boolean>("deleteForumTopic", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Clears the list of pinned messages in a forum topic.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param messageThreadId - Unique identifier for the target message thread of the forum topic.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When unpinning messages fails.
   *
   * @example
   * ```ts
   * await bot.unpinAllForumTopicMessages(-1001234567890, 42);
   * ```
   */
  public async unpinAllForumTopicMessages(
    chatId: number | string,
    messageThreadId: number,
  ): Promise<boolean> {
    return this.request<boolean>("unpinAllForumTopicMessages", {
      chat_id: chatId,
      message_thread_id: messageThreadId,
    });
  }

  /**
   * Edits the name of the 'General' topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @param name - New name of the topic (1-128 characters).
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When editing General topic fails.
   *
   * @example
   * ```ts
   * await bot.editGeneralForumTopic(-1001234567890, "General Chat");
   * ```
   */
  public async editGeneralForumTopic(chatId: number | string, name: string): Promise<boolean> {
    return this.request<boolean>("editGeneralForumTopic", { chat_id: chatId, name });
  }

  /**
   * Closes an open 'General' topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When closing General topic fails.
   *
   * @example
   * ```ts
   * await bot.closeGeneralForumTopic(-1001234567890);
   * ```
   */
  public async closeGeneralForumTopic(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("closeGeneralForumTopic", { chat_id: chatId });
  }

  /**
   * Reopens a closed 'General' topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When reopening General topic fails.
   *
   * @example
   * ```ts
   * await bot.reopenGeneralForumTopic(-1001234567890);
   * ```
   */
  public async reopenGeneralForumTopic(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("reopenGeneralForumTopic", { chat_id: chatId });
  }

  /**
   * Hides the 'General' topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When hiding General topic fails.
   *
   * @example
   * ```ts
   * await bot.hideGeneralForumTopic(-1001234567890);
   * ```
   */
  public async hideGeneralForumTopic(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("hideGeneralForumTopic", { chat_id: chatId });
  }

  /**
   * Unhides the 'General' topic in a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When unhiding General topic fails.
   *
   * @example
   * ```ts
   * await bot.unhideGeneralForumTopic(-1001234567890);
   * ```
   */
  public async unhideGeneralForumTopic(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("unhideGeneralForumTopic", { chat_id: chatId });
  }

  /**
   * Clears the list of pinned messages in the 'General' topic of a forum supergroup chat.
   *
   * @param chatId - Unique identifier for the target chat.
   * @returns `true` on success.
   * @throws {@link TelegramApiError} When unpinning General topic messages fails.
   *
   * @example
   * ```ts
   * await bot.unpinAllGeneralForumTopicMessages(-1001234567890);
   * ```
   */
  public async unpinAllGeneralForumTopicMessages(chatId: number | string): Promise<boolean> {
    return this.request<boolean>("unpinAllGeneralForumTopicMessages", { chat_id: chatId });
  }
}
