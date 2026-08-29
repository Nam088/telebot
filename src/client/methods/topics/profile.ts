/**
 * Bot profile, commands, and menu button methods for Bot API.
 *
 * @packageDocumentation
 */

import { PaymentMethods } from "../payments.js";
import type {
  ChatAdministratorRights,
  MenuButton,
  BotName,
  BotDescription,
  BotShortDescription,
  BotCommand,
  BotCommandScope,
} from "../../types/index.js";

/**
 * Mixin providing bot profile, command list, and menu button management.
 */
export abstract class BotProfileMethods extends PaymentMethods {
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
}
