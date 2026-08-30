import type { Location } from "../common/index.js";
import type {
  InputMediaAnimation,
  InputMediaAudio,
  InputMediaDocument,
  InputMediaPhoto,
  InputMediaVideo,
  MessageEntity,
} from "../messages/index.js";
import type { RichText, RichMessageButton } from "./text.js";
import type { RichBlockCaption, RichBlockTableCell } from "./received-blocks.js";

/**
 * Voice note media object to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputmediavoicenote Telegram Bot API: InputMediaVoiceNote}
 */
export interface InputMediaVoiceNote {
  /** Type of the media, must be 'voice_note'. */
  type: "voice_note";
  /** File to send. Pass a file_id to send a file that exists on the Telegram servers, or an HTTP URL. */
  media: string;
  /** Caption of the voice note to be sent, 0-1024 characters. */
  caption?: string;
  /** Mode for parsing entities in the voice note caption. */
  parse_mode?: string;
  /** A list of special entities that appear in the caption. */
  caption_entities?: MessageEntity[];
  /** Duration of the voice note in seconds. */
  duration?: number;
}

/**
 * An item of a list to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblocklistitem Telegram Bot API: InputRichBlockListItem}
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
 * A text paragraph block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockparagraph Telegram Bot API: InputRichBlockParagraph}
 */
export interface InputRichBlockParagraph {
  /** Type of the block, always 'paragraph'. */
  type: "paragraph";
  /** Text of the block. */
  text: RichText;
}

/**
 * A section heading block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblocksectionheading Telegram Bot API: InputRichBlockSectionHeading}
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
 * A preformatted text block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockpreformatted Telegram Bot API: InputRichBlockPreformatted}
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
 * A footer block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockfooter Telegram Bot API: InputRichBlockFooter}
 */
export interface InputRichBlockFooter {
  /** Type of the block, always 'footer'. */
  type: "footer";
  /** Text of the block. */
  text: RichText;
}

/**
 * A divider block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockdivider Telegram Bot API: InputRichBlockDivider}
 */
export interface InputRichBlockDivider {
  /** Type of the block, always 'divider'. */
  type: "divider";
}

/**
 * A mathematical expression block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockmathematicalexpression Telegram Bot API: InputRichBlockMathematicalExpression}
 */
export interface InputRichBlockMathematicalExpression {
  /** Type of the block, always 'mathematical_expression'. */
  type: "mathematical_expression";
  /** The mathematical expression in LaTeX format. */
  expression: string;
}

/**
 * An anchor block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockanchor Telegram Bot API: InputRichBlockAnchor}
 */
export interface InputRichBlockAnchor {
  /** Type of the block, always 'anchor'. */
  type: "anchor";
  /** The name of the anchor. */
  name: string;
}

/**
 * A list of blocks to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblocklist Telegram Bot API: InputRichBlockList}
 */
export interface InputRichBlockList {
  /** Type of the block, always 'list'. */
  type: "list";
  /** Items of the list. */
  items: InputRichBlockListItem[];
}

/**
 * A block quotation to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockblockquotation Telegram Bot API: InputRichBlockBlockQuotation}
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
 * An expandable block quotation to be sent (Bot API 10.3+).
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockexpandableblockquotation Telegram Bot API: InputRichBlockExpandableBlockQuotation}
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
 * A pull quotation block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockpullquotation Telegram Bot API: InputRichBlockPullQuotation}
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
 * A collage block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockcollage Telegram Bot API: InputRichBlockCollage}
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
 * A slideshow block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockslideshow Telegram Bot API: InputRichBlockSlideshow}
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
 * A table block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblocktable Telegram Bot API: InputRichBlockTable}
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
 * An expandable details block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockdetails Telegram Bot API: InputRichBlockDetails}
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
 * A map block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockmap Telegram Bot API: InputRichBlockMap}
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
 * A block containing buttons to send in one row (Bot API 10.3+).
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockbuttons Telegram Bot API: InputRichBlockButtons}
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
 * An animation media block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockanimation Telegram Bot API: InputRichBlockAnimation}
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
 * An audio media block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockaudio Telegram Bot API: InputRichBlockAudio}
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
 * A document file block to be sent (Bot API 10.3+).
 *
 * @remarks
 * The docs type `document` as `InputMediaDocument` only — a bare `file_id` string is not a
 * valid value, matching the sibling `photo`, `video`, `animation` and `audio` blocks.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockdocument Telegram Bot API: InputRichBlockDocument}
 */
export interface InputRichBlockDocument {
  /** Type of the block, always 'document'. */
  type: "document";
  /** The document. Caption is ignored. */
  document: InputMediaDocument;
  /** Caption of the block. */
  caption?: RichBlockCaption;
}

/**
 * A photo media block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockphoto Telegram Bot API: InputRichBlockPhoto}
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
 * A video media block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockvideo Telegram Bot API: InputRichBlockVideo}
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
 * A voice note media block to be sent.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockvoicenote Telegram Bot API: InputRichBlockVoiceNote}
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
 * A thinking placeholder block to be sent in drafts.
 *
 * @see {@link https://core.telegram.org/bots/api#inputrichblockthinking Telegram Bot API: InputRichBlockThinking}
 */
export interface InputRichBlockThinking {
  /** Type of the block, always 'thinking'. */
  type: "thinking";
  /** Text of the block. */
  text: RichText;
}

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
