import type { User } from "../common/index.js";
import type {
  DisabledButton,
  WebAppInfo,
  LoginUrl,
  SwitchInlineQueryChosenChat,
  CopyTextButton,
} from "../messages/index.js";

/**
 * Represents a button in a RichMessage.
 *
 * @see {@link https://core.telegram.org/bots/api#richmessagebutton Telegram Bot API: RichMessageButton}
 */
export interface RichMessageButton {
  /** Text of the button. May contain only plain text, RichTextCustomEmoji and RichTextDateTime entities. */
  text: RichText;
  /**
   * Style of the button. Must be one of 'danger', 'success', 'primary', or 'link' (the docs type this
   * field as a plain String, so unknown future styles stay assignable).
   */
  style?: string;
  /** HTTP or tg:// URL to be opened when the button is pressed. */
  url?: string;
  /** Data to be sent in a callback query to the bot when the button is pressed, 1-64 bytes. */
  callback_data?: string;
  /** Description of the Web App that will be launched when the user presses the button. */
  web_app?: WebAppInfo;
  /** An HTTPS URL used to automatically authorize the user. */
  login_url?: LoginUrl;
  /** If set, pressing the button will prompt the user to select one of their chats. */
  switch_inline_query?: string;
  /** If set, pressing the button will insert the bot's username and the specified inline query in the current chat. */
  switch_inline_query_current_chat?: string;
  /** If set, pressing the button will prompt the user to select one of their chats of the specified type. */
  switch_inline_query_chosen_chat?: SwitchInlineQueryChosenChat;
  /** A button that copies the specified text to the clipboard. */
  copy_text?: CopyTextButton;
  /** If set, then the button is disabled and does nothing. */
  disabled?: DisabledButton;
}

/**
 * A rich formatted text button.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextbutton Telegram Bot API: RichTextButton}
 */
export interface RichTextButton {
  /** Type of the rich text, always 'button'. */
  type: "button";
  /** The button. */
  button: RichMessageButton;
}

/**
 * A bold formatted text entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextbold Telegram Bot API: RichTextBold}
 */
export interface RichTextBold {
  /** Type of the rich text, always 'bold'. */
  type: "bold";
  /** The text. */
  text: RichText;
}

/**
 * An italicized formatted text entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextitalic Telegram Bot API: RichTextItalic}
 */
export interface RichTextItalic {
  /** Type of the rich text, always 'italic'. */
  type: "italic";
  /** The text. */
  text: RichText;
}

/**
 * An underlined formatted text entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextunderline Telegram Bot API: RichTextUnderline}
 */
export interface RichTextUnderline {
  /** Type of the rich text, always 'underline'. */
  type: "underline";
  /** The text. */
  text: RichText;
}

/**
 * A strikethrough formatted text entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextstrikethrough Telegram Bot API: RichTextStrikethrough}
 */
export interface RichTextStrikethrough {
  /** Type of the rich text, always 'strikethrough'. */
  type: "strikethrough";
  /** The text. */
  text: RichText;
}

/**
 * A text covered by a spoiler.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextspoiler Telegram Bot API: RichTextSpoiler}
 */
export interface RichTextSpoiler {
  /** Type of the rich text, always 'spoiler'. */
  type: "spoiler";
  /** The text. */
  text: RichText;
}

/**
 * Formatted date and time.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextdatetime Telegram Bot API: RichTextDateTime}
 */
export interface RichTextDateTime {
  /** Type of the rich text, always 'date_time'. */
  type: "date_time";
  /** The text. */
  text: RichText;
  /** The Unix time associated with the entity. */
  unix_time: number;
  /** The string that defines the formatting of the date and time. */
  date_time_format: string;
}

/**
 * A mention of a user by their identifier.
 *
 * @see {@link https://core.telegram.org/bots/api#richtexttextmention Telegram Bot API: RichTextTextMention}
 */
export interface RichTextTextMention {
  /** Type of the rich text, always 'text_mention'. */
  type: "text_mention";
  /** The text. */
  text: RichText;
  /** The mentioned user. */
  user: User;
}

/**
 * A subscript formatted text entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextsubscript Telegram Bot API: RichTextSubscript}
 */
export interface RichTextSubscript {
  /** Type of the rich text, always 'subscript'. */
  type: "subscript";
  /** The text. */
  text: RichText;
}

/**
 * A superscript formatted text entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextsuperscript Telegram Bot API: RichTextSuperscript}
 */
export interface RichTextSuperscript {
  /** Type of the rich text, always 'superscript'. */
  type: "superscript";
  /** The text. */
  text: RichText;
}

/**
 * A marked formatted text entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextmarked Telegram Bot API: RichTextMarked}
 */
export interface RichTextMarked {
  /** Type of the rich text, always 'marked'. */
  type: "marked";
  /** The text. */
  text: RichText;
}

/**
 * A monowidth code formatted text entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextcode Telegram Bot API: RichTextCode}
 */
export interface RichTextCode {
  /** Type of the rich text, always 'code'. */
  type: "code";
  /** The text. */
  text: RichText;
}

/**
 * A custom emoji entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextcustomemoji Telegram Bot API: RichTextCustomEmoji}
 */
export interface RichTextCustomEmoji {
  /** Type of the rich text, always 'custom_emoji'. */
  type: "custom_emoji";
  /** Unique identifier of the custom emoji. */
  custom_emoji_id: string;
  /** Alternative emoji for the custom emoji. */
  alternative_text: string;
}

/**
 * A mathematical expression in LaTeX format.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextmathematicalexpression Telegram Bot API: RichTextMathematicalExpression}
 */
export interface RichTextMathematicalExpression {
  /** Type of the rich text, always 'mathematical_expression'. */
  type: "mathematical_expression";
  /** The expression in LaTeX format. */
  expression: string;
}

/**
 * A text with a URL link.
 *
 * @see {@link https://core.telegram.org/bots/api#richtexturl Telegram Bot API: RichTextUrl}
 */
export interface RichTextUrl {
  /** Type of the rich text, always 'url'. */
  type: "url";
  /** The text. */
  text: RichText;
  /** URL of the link. */
  url: string;
}

/**
 * A text with an email address.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextemailaddress Telegram Bot API: RichTextEmailAddress}
 */
export interface RichTextEmailAddress {
  /** Type of the rich text, always 'email_address'. */
  type: "email_address";
  /** The text. */
  text: RichText;
  /** The email address. */
  email_address: string;
}

/**
 * A text with a phone number.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextphonenumber Telegram Bot API: RichTextPhoneNumber}
 */
export interface RichTextPhoneNumber {
  /** Type of the rich text, always 'phone_number'. */
  type: "phone_number";
  /** The text. */
  text: RichText;
  /** The phone number. */
  phone_number: string;
}

/**
 * A text with a bank card number.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextbankcardnumber Telegram Bot API: RichTextBankCardNumber}
 */
export interface RichTextBankCardNumber {
  /** Type of the rich text, always 'bank_card_number'. */
  type: "bank_card_number";
  /** The text. */
  text: RichText;
  /** The bank card number. */
  bank_card_number: string;
}

/**
 * A mention by a username.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextmention Telegram Bot API: RichTextMention}
 */
export interface RichTextMention {
  /** Type of the rich text, always 'mention'. */
  type: "mention";
  /** The text. */
  text: RichText;
  /** The username. */
  username: string;
}

/**
 * A hashtag entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtexthashtag Telegram Bot API: RichTextHashtag}
 */
export interface RichTextHashtag {
  /** Type of the rich text, always 'hashtag'. */
  type: "hashtag";
  /** The text. */
  text: RichText;
  /** The hashtag. */
  hashtag: string;
}

/**
 * A cashtag entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextcashtag Telegram Bot API: RichTextCashtag}
 */
export interface RichTextCashtag {
  /** Type of the rich text, always 'cashtag'. */
  type: "cashtag";
  /** The text. */
  text: RichText;
  /** The cashtag. */
  cashtag: string;
}

/**
 * A bot command entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextbotcommand Telegram Bot API: RichTextBotCommand}
 */
export interface RichTextBotCommand {
  /** Type of the rich text, always 'bot_command'. */
  type: "bot_command";
  /** The text. */
  text: RichText;
  /** The bot command. */
  bot_command: string;
}

/**
 * An anchor entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextanchor Telegram Bot API: RichTextAnchor}
 */
export interface RichTextAnchor {
  /** Type of the rich text, always 'anchor'. */
  type: "anchor";
  /** The name of the anchor. */
  name: string;
}

/**
 * A link to an anchor.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextanchorlink Telegram Bot API: RichTextAnchorLink}
 */
export interface RichTextAnchorLink {
  /** Type of the rich text, always 'anchor_link'. */
  type: "anchor_link";
  /** The link text. */
  text: RichText;
  /** The name of the anchor. */
  anchor_name: string;
}

/**
 * A reference entity.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextreference Telegram Bot API: RichTextReference}
 */
export interface RichTextReference {
  /** Type of the rich text, always 'reference'. */
  type: "reference";
  /** Text of the reference. */
  text: RichText;
  /** The name of the reference. */
  name: string;
}

/**
 * A link to a reference.
 *
 * @see {@link https://core.telegram.org/bots/api#richtextreferencelink Telegram Bot API: RichTextReferenceLink}
 */
export interface RichTextReferenceLink {
  /** Type of the rich text, always 'reference_link'. */
  type: "reference_link";
  /** The link text. */
  text: RichText;
  /** The name of the reference. */
  reference_name: string;
}

/**
 * Union of rich text entity objects.
 */
export type RichTextEntity =
  | RichTextBold
  | RichTextItalic
  | RichTextUnderline
  | RichTextStrikethrough
  | RichTextSpoiler
  | RichTextDateTime
  | RichTextTextMention
  | RichTextSubscript
  | RichTextSuperscript
  | RichTextMarked
  | RichTextCode
  | RichTextCustomEmoji
  | RichTextMathematicalExpression
  | RichTextUrl
  | RichTextEmailAddress
  | RichTextPhoneNumber
  | RichTextBankCardNumber
  | RichTextMention
  | RichTextHashtag
  | RichTextCashtag
  | RichTextBotCommand
  | RichTextButton
  | RichTextAnchor
  | RichTextAnchorLink
  | RichTextReference
  | RichTextReferenceLink;

/**
 * Represents rich formatted text (string, rich text entity, or array of rich text).
 *
 * @see {@link https://core.telegram.org/bots/api#richtext Telegram Bot API: RichText}
 */
export type RichText = string | RichTextEntity | RichText[];
