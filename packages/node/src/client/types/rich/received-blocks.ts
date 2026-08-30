import type { Location } from "../common/index.js";
import type { PhotoSize, Animation, Audio, Document, Video, Voice } from "../messages/index.js";
import type { RichText, RichMessageButton } from "./text.js";

/**
 * Caption of a rich formatted block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockcaption Telegram Bot API: RichBlockCaption}
 */
export interface RichBlockCaption {
  /** Block caption. */
  text: RichText;
  /** Block credit which corresponds to the HTML tag <cite>. */
  credit?: RichText;
}

/**
 * Cell in a table.
 *
 * @see {@link https://core.telegram.org/bots/api#richblocktablecell Telegram Bot API: RichBlockTableCell}
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
 *
 * @see {@link https://core.telegram.org/bots/api#richblocklistitem Telegram Bot API: RichBlockListItem}
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
 * A text paragraph block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockparagraph Telegram Bot API: RichBlockParagraph}
 */
export interface RichBlockParagraph {
  /** Type of the block, always 'paragraph'. */
  type: "paragraph";
  /** Text of the block. */
  text: RichText;
}

/**
 * A section heading block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblocksectionheading Telegram Bot API: RichBlockSectionHeading}
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
 * A preformatted text block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockpreformatted Telegram Bot API: RichBlockPreformatted}
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
 * A footer block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockfooter Telegram Bot API: RichBlockFooter}
 */
export interface RichBlockFooter {
  /** Type of the block, always 'footer'. */
  type: "footer";
  /** Text of the block. */
  text: RichText;
}

/**
 * A divider block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockdivider Telegram Bot API: RichBlockDivider}
 */
export interface RichBlockDivider {
  /** Type of the block, always 'divider'. */
  type: "divider";
}

/**
 * A mathematical expression block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockmathematicalexpression Telegram Bot API: RichBlockMathematicalExpression}
 */
export interface RichBlockMathematicalExpression {
  /** Type of the block, always 'mathematical_expression'. */
  type: "mathematical_expression";
  /** The mathematical expression in LaTeX format. */
  expression: string;
}

/**
 * An anchor block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockanchor Telegram Bot API: RichBlockAnchor}
 */
export interface RichBlockAnchor {
  /** Type of the block, always 'anchor'. */
  type: "anchor";
  /** The name of the anchor. */
  name: string;
}

/**
 * A list of blocks.
 *
 * @see {@link https://core.telegram.org/bots/api#richblocklist Telegram Bot API: RichBlockList}
 */
export interface RichBlockList {
  /** Type of the block, always 'list'. */
  type: "list";
  /** Items of the list. */
  items: RichBlockListItem[];
}

/**
 * A block quotation.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockblockquotation Telegram Bot API: RichBlockBlockQuotation}
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
 * An expandable block quotation (Bot API 10.3+).
 *
 * @see {@link https://core.telegram.org/bots/api#richblockexpandableblockquotation Telegram Bot API: RichBlockExpandableBlockQuotation}
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
 * A pull quotation block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockpullquotation Telegram Bot API: RichBlockPullQuotation}
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
 * A collage block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockcollage Telegram Bot API: RichBlockCollage}
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
 * A slideshow block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockslideshow Telegram Bot API: RichBlockSlideshow}
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
 * A table block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblocktable Telegram Bot API: RichBlockTable}
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
 * An expandable details block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockdetails Telegram Bot API: RichBlockDetails}
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
 * A map block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockmap Telegram Bot API: RichBlockMap}
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
 * A block containing buttons in one row (Bot API 10.3+).
 *
 * @see {@link https://core.telegram.org/bots/api#richblockbuttons Telegram Bot API: RichBlockButtons}
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
 * An animation media block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockanimation Telegram Bot API: RichBlockAnimation}
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
 * An audio media block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockaudio Telegram Bot API: RichBlockAudio}
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
 * A document file block (Bot API 10.3+).
 *
 * @see {@link https://core.telegram.org/bots/api#richblockdocument Telegram Bot API: RichBlockDocument}
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
 * A photo media block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockphoto Telegram Bot API: RichBlockPhoto}
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
 * A video media block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockvideo Telegram Bot API: RichBlockVideo}
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
 * A voice note media block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockvoicenote Telegram Bot API: RichBlockVoiceNote}
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
 * A thinking placeholder block.
 *
 * @see {@link https://core.telegram.org/bots/api#richblockthinking Telegram Bot API: RichBlockThinking}
 */
export interface RichBlockThinking {
  /** Type of the block, always 'thinking'. */
  type: "thinking";
  /** Text of the block. */
  text: RichText;
}

/**
 * Union of rich block types.
 *
 * @see {@link https://core.telegram.org/bots/api#richblock Telegram Bot API: RichBlock}
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
