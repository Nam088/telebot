import type { Location } from "../common/index.js";
import type { PhotoSize, Animation, Audio, Document, Video, Voice } from "../messages/index.js";
import type { RichText, RichMessageButton } from "./text.js";

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
 * A text paragraph block.
 */
export interface RichBlockParagraph {
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
 * A footer block.
 */
export interface RichBlockFooter {
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
 * A mathematical expression block.
 */
export interface RichBlockMathematicalExpression {
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
 * A list of blocks.
 */
export interface RichBlockList {
  /** Type of the block, always 'list'. */
  type: "list";
  /** Items of the list. */
  items: RichBlockListItem[];
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
 * A thinking placeholder block.
 */
export interface RichBlockThinking {
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
