import type { User } from "../common.js";
import type {
  DisabledButton,
  WebAppInfo,
  LoginUrl,
  SwitchInlineQueryChosenChat,
  CopyTextButton,
} from "../messages/index.js";

/**
 * Button style variants for rich message buttons.
 */
export type RichMessageButtonStyle = "danger" | "success" | "primary" | "link" | string;

/**
 * Represents a button in a RichMessage.
 */
export interface RichMessageButton {
  /** Text of the button. May contain only plain text, RichTextCustomEmoji and RichTextDateTime entities. */
  text: RichText;
  /** Style of the button. Must be one of 'danger', 'success', 'primary', or 'link'. */
  style?: RichMessageButtonStyle;
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
 */
export interface RichTextButton {
  /** Type of the rich text, always 'button'. */
  type: "button";
  /** The button. */
  button: RichMessageButton;
}

/**
 * A bold formatted text entity.
 */
export interface RichTextBold {
  /** Type of the rich text, always 'bold'. */
  type: "bold";
  /** The text. */
  text: RichText;
}

/**
 * An italicized formatted text entity.
 */
export interface RichTextItalic {
  /** Type of the rich text, always 'italic'. */
  type: "italic";
  /** The text. */
  text: RichText;
}

/**
 * An underlined formatted text entity.
 */
export interface RichTextUnderline {
  /** Type of the rich text, always 'underline'. */
  type: "underline";
  /** The text. */
  text: RichText;
}

/**
 * A strikethrough formatted text entity.
 */
export interface RichTextStrikethrough {
  /** Type of the rich text, always 'strikethrough'. */
  type: "strikethrough";
  /** The text. */
  text: RichText;
}

/**
 * A text covered by a spoiler.
 */
export interface RichTextSpoiler {
  /** Type of the rich text, always 'spoiler'. */
  type: "spoiler";
  /** The text. */
  text: RichText;
}

/**
 * Formatted date and time.
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
 */
export interface RichTextSubscript {
  /** Type of the rich text, always 'subscript'. */
  type: "subscript";
  /** The text. */
  text: RichText;
}

/**
 * A superscript formatted text entity.
 */
export interface RichTextSuperscript {
  /** Type of the rich text, always 'superscript'. */
  type: "superscript";
  /** The text. */
  text: RichText;
}

/**
 * A marked formatted text entity.
 */
export interface RichTextMarked {
  /** Type of the rich text, always 'marked'. */
  type: "marked";
  /** The text. */
  text: RichText;
}

/**
 * A monowidth code formatted text entity.
 */
export interface RichTextCode {
  /** Type of the rich text, always 'code'. */
  type: "code";
  /** The text. */
  text: RichText;
}

/**
 * A custom emoji entity.
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
 */
export interface RichTextMathematicalExpression {
  /** Type of the rich text, always 'mathematical_expression'. */
  type: "mathematical_expression";
  /** The expression in LaTeX format. */
  expression: string;
}

/**
 * A text with a URL link.
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
 */
export interface RichTextAnchor {
  /** Type of the rich text, always 'anchor'. */
  type: "anchor";
  /** The name of the anchor. */
  name: string;
}

/**
 * A link to an anchor.
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
 */
export type RichText = string | RichTextEntity | RichText[];
