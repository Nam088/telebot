/**
 * Type definitions for Rich Messages, Rich Blocks, and Rich Text formatting (Bot API 10.1+).
 *
 * @packageDocumentation
 */

import type { User, Location } from "./common.js";
import type {
  PhotoSize,
  Animation,
  Audio,
  Document,
  Video,
  Voice,
  DisabledButton,
  WebAppInfo,
  LoginUrl,
  SwitchInlineQueryChosenChat,
  CopyTextButton,
  InputMediaAnimation,
  InputMediaAudio,
  InputMediaDocument,
  InputMediaPhoto,
  InputMediaVideo,
} from "./messages.js";

/**
 * Voice note media object to be sent.
 */
export interface InputMediaVoiceNote {
  /** Type of the result, always 'voice'. */
  type: "voice";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, or an HTTP URL. */
  media: string;
  /** Caption of the voice note to be sent, 0-1024 characters. */
  caption?: string;
  /** Mode for parsing entities in the voice note caption. */
  parse_mode?: string;
  /** Special entities that appear in the caption. */
  caption_entities?: unknown[];
  /** Duration of the voice note in seconds. */
  duration?: number;
}

/**
 * Button style variants for rich message buttons.
 */
export type RichMessageButtonStyle = "danger" | "success" | "primary" | "link" | string;

/**
 * Represents a button in a {@link RichMessage}.
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

/**
 * Caption of a rich formatted block.
 */
export interface RichBlockCaption {
  /** Block caption. */
  text: RichText;
  /** Block credit which corresponds to the HTML tag <cite>. */
  credit?: RichText;
}

/**
 * Cell in a table.
 */
export interface RichBlockTableCell {
  /** Text in the cell. If omitted, then the cell is invisible. */
  text?: RichText;
  /** True, if the cell is a header cell. */
  is_header?: true | boolean;
  /** The number of columns the cell spans if it is bigger than 1. */
  colspan?: number;
  /** The number of rows the cell spans if it is bigger than 1. */
  rowspan?: number;
  /** Horizontal cell content alignment ('left', 'center', 'right'). */
  align: "left" | "center" | "right" | string;
  /** Vertical cell content alignment ('top', 'middle', 'bottom'). */
  valign: "top" | "middle" | "bottom" | string;
}

/**
 * An item of a list.
 */
export interface RichBlockListItem {
  /** Label of the item. */
  label: string;
  /** The content of the item. */
  blocks: RichBlock[];
  /** True, if the item has a checkbox. */
  has_checkbox?: true | boolean;
  /** True, if the item has a checked checkbox. */
  is_checked?: true | boolean;
  /** For ordered lists, the numeric value of the item label. */
  value?: number;
  /** For ordered lists, the type of the item label ('a', 'A', 'i', 'I', '1'). */
  type?: "a" | "A" | "i" | "I" | "1" | string;
}

/**
 * An item of a list to be sent.
 */
export interface InputRichBlockListItem {
  /** The content of the item. */
  blocks: InputRichBlock[];
  /** Pass True if the item has a checkbox. */
  has_checkbox?: boolean;
  /** Pass True if the item has a checked checkbox. */
  is_checked?: boolean;
  /** For ordered lists, the numeric value of the item label. */
  value?: number;
  /** For ordered lists, the type of the item label ('a', 'A', 'i', 'I', '1'). */
  type?: "a" | "A" | "i" | "I" | "1" | string;
}

/**
 * A text paragraph block.
 */
export interface RichBlockParagraph {
  /** Type of the block, always 'paragraph'. */
  type: "paragraph";
  /** Text of the block. */
  text: RichText;
}

/**
 * A text paragraph block to be sent.
 */
export interface InputRichBlockParagraph {
  /** Type of the block, always 'paragraph'. */
  type: "paragraph";
  /** Text of the block. */
  text: RichText;
}

/**
 * A section heading block.
 */
export interface RichBlockSectionHeading {
  /** Type of the block, always 'heading'. */
  type: "heading";
  /** Text of the block. */
  text: RichText;
  /** Relative size of the text font; 1-6. */
  size: 1 | 2 | 3 | 4 | 5 | 6 | number;
}

/**
 * A section heading block to be sent.
 */
export interface InputRichBlockSectionHeading {
  /** Type of the block, always 'heading'. */
  type: "heading";
  /** Text of the block. */
  text: RichText;
  /** Relative size of the text font; 1-6. */
  size: 1 | 2 | 3 | 4 | 5 | 6 | number;
}

/**
 * A preformatted text block.
 */
export interface RichBlockPreformatted {
  /** Type of the block, always 'pre'. */
  type: "pre";
  /** Text of the block. */
  text: RichText;
  /** The programming language of the text. */
  language?: string;
}

/**
 * A preformatted text block to be sent.
 */
export interface InputRichBlockPreformatted {
  /** Type of the block, always 'pre'. */
  type: "pre";
  /** Text of the block. */
  text: RichText;
  /** The programming language of the text. */
  language?: string;
}

/**
 * A footer block.
 */
export interface RichBlockFooter {
  /** Type of the block, always 'footer'. */
  type: "footer";
  /** Text of the block. */
  text: RichText;
}

/**
 * A footer block to be sent.
 */
export interface InputRichBlockFooter {
  /** Type of the block, always 'footer'. */
  type: "footer";
  /** Text of the block. */
  text: RichText;
}

/**
 * A divider block.
 */
export interface RichBlockDivider {
  /** Type of the block, always 'divider'. */
  type: "divider";
}

/**
 * A divider block to be sent.
 */
export interface InputRichBlockDivider {
  /** Type of the block, always 'divider'. */
  type: "divider";
}

/**
 * A mathematical expression block.
 */
export interface RichBlockMathematicalExpression {
  /** Type of the block, always 'mathematical_expression'. */
  type: "mathematical_expression";
  /** The mathematical expression in LaTeX format. */
  expression: string;
}

/**
 * A mathematical expression block to be sent.
 */
export interface InputRichBlockMathematicalExpression {
  /** Type of the block, always 'mathematical_expression'. */
  type: "mathematical_expression";
  /** The mathematical expression in LaTeX format. */
  expression: string;
}

/**
 * An anchor block.
 */
export interface RichBlockAnchor {
  /** Type of the block, always 'anchor'. */
  type: "anchor";
  /** The name of the anchor. */
  name: string;
}

/**
 * An anchor block to be sent.
 */
export interface InputRichBlockAnchor {
  /** Type of the block, always 'anchor'. */
  type: "anchor";
  /** The name of the anchor. */
  name: string;
}

/**
 * A list of blocks.
 */
export interface RichBlockList {
  /** Type of the block, always 'list'. */
  type: "list";
  /** Items of the list. */
  items: RichBlockListItem[];
}

/**
 * A list of blocks to be sent.
 */
export interface InputRichBlockList {
  /** Type of the block, always 'list'. */
  type: "list";
  /** Items of the list. */
  items: InputRichBlockListItem[];
}

/**
 * A block quotation.
 */
export interface RichBlockBlockQuotation {
  /** Type of the block, always 'blockquote'. */
  type: "blockquote";
  /** Content of the block. */
  blocks: RichBlock[];
  /** Credit of the block. */
  credit?: RichText;
}

/**
 * A block quotation to be sent.
 */
export interface InputRichBlockBlockQuotation {
  /** Type of the block, always 'blockquote'. */
  type: "blockquote";
  /** Content of the block. */
  blocks: InputRichBlock[];
  /** Credit of the block. */
  credit?: RichText;
}

/**
 * An expandable block quotation (Bot API 10.3+).
 */
export interface RichBlockExpandableBlockQuotation {
  /** Type of the block, always 'expandable_blockquote'. */
  type: "expandable_blockquote";
  /** Content of the block. */
  text: RichText;
  /** Credit of the block. */
  credit?: RichText;
}

/**
 * An expandable block quotation to be sent (Bot API 10.3+).
 */
export interface InputRichBlockExpandableBlockQuotation {
  /** Type of the block, always 'expandable_blockquote'. */
  type: "expandable_blockquote";
  /** Content of the block. */
  text: RichText;
  /** Credit of the block. */
  credit?: RichText;
}

/**
 * A pull quotation block.
 */
export interface RichBlockPullQuotation {
  /** Type of the block, always 'pullquote'. */
  type: "pullquote";
  /** Text of the block. */
  text: RichText;
  /** Credit of the block. */
  credit?: RichText;
}

/**
 * A pull quotation block to be sent.
 */
export interface InputRichBlockPullQuotation {
  /** Type of the block, always 'pullquote'. */
  type: "pullquote";
  /** Text of the block. */
  text: RichText;
  /** Credit of the block. */
  credit?: RichText;
}

/**
 * A collage block.
 */
export interface RichBlockCollage {
  /** Type of the block, always 'collage'. */
  type: "collage";
  /** Elements of the collage. */
  blocks: RichBlock[];
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A collage block to be sent.
 */
export interface InputRichBlockCollage {
  /** Type of the block, always 'collage'. */
  type: "collage";
  /** Elements of the collage. */
  blocks: InputRichBlock[];
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A slideshow block.
 */
export interface RichBlockSlideshow {
  /** Type of the block, always 'slideshow'. */
  type: "slideshow";
  /** Elements of the slideshow. */
  blocks: RichBlock[];
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A slideshow block to be sent.
 */
export interface InputRichBlockSlideshow {
  /** Type of the block, always 'slideshow'. */
  type: "slideshow";
  /** Elements of the slideshow. */
  blocks: InputRichBlock[];
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A table block.
 */
export interface RichBlockTable {
  /** Type of the block, always 'table'. */
  type: "table";
  /** Cells of the table. */
  cells: RichBlockTableCell[][];
  /** True, if the table has borders. */
  is_bordered?: true | boolean;
  /** True, if the table is striped. */
  is_striped?: true | boolean;
  /** True, if table cells have smaller indents (Bot API 10.3+). */
  is_compact?: true | boolean;
  /** Caption of the table. */
  caption?: RichText;
}

/**
 * A table block to be sent.
 */
export interface InputRichBlockTable {
  /** Type of the block, always 'table'. */
  type: "table";
  /** Cells of the table. */
  cells: RichBlockTableCell[][];
  /** Pass True if the table has borders. */
  is_bordered?: boolean;
  /** Pass True if the table is striped. */
  is_striped?: boolean;
  /** Pass True if table cells must have smaller indents (Bot API 10.3+). */
  is_compact?: boolean;
  /** Caption of the table. */
  caption?: RichText;
}

/**
 * An expandable details block.
 */
export interface RichBlockDetails {
  /** Type of the block, always 'details'. */
  type: "details";
  /** Always shown summary of the block. */
  summary: RichText;
  /** Content of the block. */
  blocks: RichBlock[];
  /** True, if the content of the block is visible by default. */
  is_open?: true | boolean;
}

/**
 * An expandable details block to be sent.
 */
export interface InputRichBlockDetails {
  /** Type of the block, always 'details'. */
  type: "details";
  /** Always shown summary of the block. */
  summary: RichText;
  /** Content of the block. */
  blocks: InputRichBlock[];
  /** Pass True if the content of the block is visible by default. */
  is_open?: boolean;
}

/**
 * A map block.
 */
export interface RichBlockMap {
  /** Type of the block, always 'map'. */
  type: "map";
  /** Location of the center of the map. */
  location: Location;
  /** Map zoom level. */
  zoom: number;
  /** Expected width of the map. */
  width: number;
  /** Expected height of the map. */
  height: number;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A map block to be sent.
 */
export interface InputRichBlockMap {
  /** Type of the block, always 'map'. */
  type: "map";
  /** Location of the center of the map. */
  location: Location;
  /** Map zoom level; 0-24. */
  zoom?: number;
  /** Map width; 0-10000. */
  width?: number;
  /** Map height; 0-10000. */
  height?: number;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A block containing buttons in one row (Bot API 10.3+).
 */
export interface RichBlockButtons {
  /** Type of the block, always 'buttons'. */
  type: "buttons";
  /** The buttons. */
  buttons: RichMessageButton[];
  /** Horizontal alignment of the buttons ('left', 'center', 'right'). */
  align?: "left" | "center" | "right" | string;
}

/**
 * A block containing buttons to send in one row (Bot API 10.3+).
 */
export interface InputRichBlockButtons {
  /** Type of the block, always 'buttons'. */
  type: "buttons";
  /** List of 1-8 buttons to send. */
  buttons: RichMessageButton[];
  /** Horizontal alignment of the buttons ('left', 'center', 'right'). */
  align?: "left" | "center" | "right" | string;
}

/**
 * An animation media block.
 */
export interface RichBlockAnimation {
  /** Type of the block, always 'animation'. */
  type: "animation";
  /** The animation. */
  animation: Animation;
  /** True, if the media preview is covered by a spoiler animation. */
  has_spoiler?: true | boolean;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * An animation media block to be sent.
 */
export interface InputRichBlockAnimation {
  /** Type of the block, always 'animation'. */
  type: "animation";
  /** The animation. Caption is ignored. */
  animation: InputMediaAnimation;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * An audio media block.
 */
export interface RichBlockAudio {
  /** Type of the block, always 'audio'. */
  type: "audio";
  /** The audio. */
  audio: Audio;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * An audio media block to be sent.
 */
export interface InputRichBlockAudio {
  /** Type of the block, always 'audio'. */
  type: "audio";
  /** The audio. Caption is ignored. */
  audio: InputMediaAudio;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A document file block (Bot API 10.3+).
 */
export interface RichBlockDocument {
  /** Type of the block, always 'document'. */
  type: "document";
  /** The document. */
  document: Document;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A document file block to be sent (Bot API 10.3+).
 */
export interface InputRichBlockDocument {
  /** Type of the block, always 'document'. */
  type: "document";
  /** The document. Caption is ignored. */
  document: InputMediaDocument | string;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A photo media block.
 */
export interface RichBlockPhoto {
  /** Type of the block, always 'photo'. */
  type: "photo";
  /** Available sizes of the photo. */
  photo: PhotoSize[];
  /** True, if the media preview is covered by a spoiler animation. */
  has_spoiler?: true | boolean;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A photo media block to be sent.
 */
export interface InputRichBlockPhoto {
  /** Type of the block, always 'photo'. */
  type: "photo";
  /** The photo. Caption is ignored. */
  photo: InputMediaPhoto;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A video media block.
 */
export interface RichBlockVideo {
  /** Type of the block, always 'video'. */
  type: "video";
  /** The video. */
  video: Video;
  /** True, if the media preview is covered by a spoiler animation. */
  has_spoiler?: true | boolean;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A video media block to be sent.
 */
export interface InputRichBlockVideo {
  /** Type of the block, always 'video'. */
  type: "video";
  /** The video. Caption is ignored. */
  video: InputMediaVideo;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A voice note media block.
 */
export interface RichBlockVoiceNote {
  /** Type of the block, always 'voice_note'. */
  type: "voice_note";
  /** The voice note. */
  voice_note: Voice;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A voice note media block to be sent.
 */
export interface InputRichBlockVoiceNote {
  /** Type of the block, always 'voice_note'. */
  type: "voice_note";
  /** The voice note. Caption is ignored. */
  voice_note: InputMediaVoiceNote;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A thinking placeholder block.
 */
export interface RichBlockThinking {
  /** Type of the block, always 'thinking'. */
  type: "thinking";
  /** Text of the block. */
  text: RichText;
}

/**
 * A thinking placeholder block to be sent in drafts.
 */
export interface InputRichBlockThinking {
  /** Type of the block, always 'thinking'. */
  type: "thinking";
  /** Text of the block. */
  text: RichText;
}

/**
 * Union of rich block types.
 */
export type RichBlock =
  | RichBlockParagraph
  | RichBlockSectionHeading
  | RichBlockPreformatted
  | RichBlockFooter
  | RichBlockDivider
  | RichBlockMathematicalExpression
  | RichBlockAnchor
  | RichBlockList
  | RichBlockBlockQuotation
  | RichBlockExpandableBlockQuotation
  | RichBlockPullQuotation
  | RichBlockCollage
  | RichBlockSlideshow
  | RichBlockTable
  | RichBlockDetails
  | RichBlockMap
  | RichBlockButtons
  | RichBlockAnimation
  | RichBlockAudio
  | RichBlockDocument
  | RichBlockPhoto
  | RichBlockVideo
  | RichBlockVoiceNote
  | RichBlockThinking;

/**
 * Union of outgoing rich block types.
 */
export type InputRichBlock =
  | InputRichBlockParagraph
  | InputRichBlockSectionHeading
  | InputRichBlockPreformatted
  | InputRichBlockFooter
  | InputRichBlockDivider
  | InputRichBlockMathematicalExpression
  | InputRichBlockAnchor
  | InputRichBlockList
  | InputRichBlockBlockQuotation
  | InputRichBlockExpandableBlockQuotation
  | InputRichBlockPullQuotation
  | InputRichBlockCollage
  | InputRichBlockSlideshow
  | InputRichBlockTable
  | InputRichBlockDetails
  | InputRichBlockMap
  | InputRichBlockButtons
  | InputRichBlockAnimation
  | InputRichBlockAudio
  | InputRichBlockDocument
  | InputRichBlockPhoto
  | InputRichBlockVideo
  | InputRichBlockVoiceNote
  | InputRichBlockThinking;

/**
 * Represents a rich formatted message received from Telegram.
 */
export interface RichMessage {
  /** Content of the message. */
  blocks: RichBlock[];
  /** True, if the rich message must be shown right-to-left. */
  is_rtl?: boolean;
}

/**
 * Media embedded in an outgoing rich message via tg:// links.
 */
export interface InputRichMessageMedia {
  /** Unique identifier of the media used in tg:// links (e.g. tg://document?id=doc1). */
  id: string;
  /** The media to be sent. */
  media:
    | InputMediaAnimation
    | InputMediaAudio
    | InputMediaDocument
    | InputMediaPhoto
    | InputMediaVideo
    | InputMediaVoiceNote;
}

/**
 * Outgoing rich message payload to send.
 */
export interface InputRichMessage {
  /** Content of the rich message to send described as a list of blocks. */
  blocks?: InputRichBlock[];
  /** Content of the rich message to send described using HTML formatting. */
  html?: string;
  /** Content of the rich message to send described using Markdown formatting. */
  markdown?: string;
  /** List of media that are specified in the markdown or html fields using tg:// links. */
  media?: InputRichMessageMedia[];
  /** Pass True if the rich message must be shown right-to-left. */
  is_rtl?: boolean;
  /** Pass True to skip automatic detection of entities in the text. */
  skip_entity_detection?: boolean;
}

/**
 * Content of a rich message to be sent as the result of an inline query.
 */
export interface InputRichMessageContent {
  /** The message to be sent. Only previously uploaded files may be used in the message. */
  rich_message: InputRichMessage;
}
