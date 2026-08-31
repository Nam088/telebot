"""Rich message blocks that carry text or structure, and received messages.

Field names, required-ness and ``type`` literals follow the official Telegram
Bot API docs for the ``RichBlock*`` classes and ``RichMessage`` (Bot API 10.3).
As in :mod:`telebot_py.types.rich_text`, each block defaults its ``type`` field
to the literal the docs give, so callers never repeat it while ``to_dict``
always emits it.

Remarks:
    The ``RichBlock`` union lists the 24 block types Telegram documents as
    possible members; ``RichBlockListItem``, ``RichBlockCaption`` and
    ``RichBlockTableCell`` are helpers with no place in the union, and
    ``RichBlockListItem.type`` is a list-label style rather than a block
    discriminator, so that class carries none.
"""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.rich_blocks_media import (
    RichBlockAnimation,
    RichBlockAudio,
    RichBlockCaption,
    RichBlockDocument,
    RichBlockMap,
    RichBlockPhoto,
    RichBlockTableCell,
    RichBlockVideo,
    RichBlockVoiceNote,
)
from telebot_py.types.rich_text import RichMessageButton, RichText


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockParagraph(TelegramObject):
    """A text paragraph; ``type`` is always 'paragraph'.

    Attributes:
        text: Text of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockparagraph
    """

    text: RichText
    type: str = "paragraph"
    _DISCRIMINATOR = ("type", "paragraph")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockSectionHeading(TelegramObject):
    """A section heading; ``type`` is always 'heading'.

    Attributes:
        text: Text of the block.
        size: Relative size of the text font; 1-6, 1 is the largest.

    Telegram API: https://core.telegram.org/bots/api#richblocksectionheading
    """

    text: RichText
    size: int
    type: str = "heading"
    _DISCRIMINATOR = ("type", "heading")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockPreformatted(TelegramObject):
    """A preformatted text block; ``type`` is always 'pre'.

    Attributes:
        text: Text of the block.
        language: The programming language of the text.

    Telegram API: https://core.telegram.org/bots/api#richblockpreformatted
    """

    text: RichText
    type: str = "pre"
    language: str | None = None
    _DISCRIMINATOR = ("type", "pre")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockFooter(TelegramObject):
    """A footer; ``type`` is always 'footer'.

    Attributes:
        text: Text of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockfooter
    """

    text: RichText
    type: str = "footer"
    _DISCRIMINATOR = ("type", "footer")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockDivider(TelegramObject):
    """A divider; ``type`` is always 'divider'.

    Telegram API: https://core.telegram.org/bots/api#richblockdivider
    """

    type: str = "divider"
    _DISCRIMINATOR = ("type", "divider")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockMathematicalExpression(TelegramObject):
    """A mathematical expression in LaTeX; ``type`` is always
    'mathematical_expression'.

    Attributes:
        expression: The mathematical expression in LaTeX format.

    Telegram API: https://core.telegram.org/bots/api#richblockmathematicalexpression
    """

    expression: str
    type: str = "mathematical_expression"
    _DISCRIMINATOR = ("type", "mathematical_expression")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockAnchor(TelegramObject):
    """A block with an anchor; ``type`` is always 'anchor'.

    Attributes:
        name: The name of the anchor.

    Telegram API: https://core.telegram.org/bots/api#richblockanchor
    """

    name: str
    type: str = "anchor"
    _DISCRIMINATOR = ("type", "anchor")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockListItem(TelegramObject):
    """An item of a list.

    Attributes:
        label: Label of the item.
        blocks: The content of the item.
        has_checkbox: True, if the item has a checkbox.
        is_checked: True, if the item has a checked checkbox.
        value: For ordered lists, the numeric value of the item label.
        type: For ordered lists, the type of the item label; 'a', 'A', 'i', 'I'
            or '1'. Unlike on other blocks, Telegram leaves this optional and
            it does not identify the block type.

    Telegram API: https://core.telegram.org/bots/api#richblocklistitem
    """

    label: str
    blocks: list[RichBlock]
    has_checkbox: bool | None = None
    is_checked: bool | None = None
    value: int | None = None
    type: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockList(TelegramObject):
    """A list of blocks; ``type`` is always 'list'.

    Attributes:
        items: Items of the list.

    Telegram API: https://core.telegram.org/bots/api#richblocklist
    """

    items: list[RichBlockListItem]
    type: str = "list"
    _DISCRIMINATOR = ("type", "list")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockBlockQuotation(TelegramObject):
    """A block quotation; ``type`` is always 'blockquote'.

    Attributes:
        blocks: Content of the block.
        credit: Credit of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockblockquotation
    """

    blocks: list[RichBlock]
    type: str = "blockquote"
    credit: RichText | None = None
    _DISCRIMINATOR = ("type", "blockquote")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockExpandableBlockQuotation(TelegramObject):
    """An expandable block quotation; ``type`` is always
    'expandable_blockquote'.

    Attributes:
        text: Content of the block.
        credit: Credit of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockexpandableblockquotation
    """

    text: RichText
    type: str = "expandable_blockquote"
    credit: RichText | None = None
    _DISCRIMINATOR = ("type", "expandable_blockquote")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockPullQuotation(TelegramObject):
    """A quotation with centered text; ``type`` is always 'pullquote'.

    Attributes:
        text: Text of the block.
        credit: Credit of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockpullquotation
    """

    text: RichText
    type: str = "pullquote"
    credit: RichText | None = None
    _DISCRIMINATOR = ("type", "pullquote")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockCollage(TelegramObject):
    """A collage; ``type`` is always 'collage'.

    Attributes:
        blocks: Elements of the collage.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockcollage
    """

    blocks: list[RichBlock]
    type: str = "collage"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "collage")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockSlideshow(TelegramObject):
    """A slideshow; ``type`` is always 'slideshow'.

    Attributes:
        blocks: Elements of the slideshow.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockslideshow
    """

    blocks: list[RichBlock]
    type: str = "slideshow"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "slideshow")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockTable(TelegramObject):
    """A table; ``type`` is always 'table'.

    Attributes:
        cells: Cells of the table, one list per row.
        is_bordered: True, if the table has borders.
        is_striped: True, if the table is striped.
        is_compact: True, if table cells have smaller indents.
        caption: Caption of the table.

    Telegram API: https://core.telegram.org/bots/api#richblocktable
    """

    cells: list[list[RichBlockTableCell]]
    type: str = "table"
    is_bordered: bool | None = None
    is_striped: bool | None = None
    is_compact: bool | None = None
    caption: RichText | None = None
    _DISCRIMINATOR = ("type", "table")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockDetails(TelegramObject):
    """An expandable block for details disclosure; ``type`` is always 'details'.

    Attributes:
        summary: Always shown summary of the block.
        blocks: Content of the block.
        is_open: True, if the content of the block is visible by default.

    Telegram API: https://core.telegram.org/bots/api#richblockdetails
    """

    summary: RichText
    blocks: list[RichBlock]
    type: str = "details"
    is_open: bool | None = None
    _DISCRIMINATOR = ("type", "details")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockButtons(TelegramObject):
    """A row of buttons; ``type`` is always 'buttons'.

    Attributes:
        buttons: The buttons.
        align: Horizontal alignment of the buttons; 'left', 'center' or 'right'.

    Telegram API: https://core.telegram.org/bots/api#richblockbuttons
    """

    buttons: list[RichMessageButton]
    type: str = "buttons"
    align: str | None = None
    _DISCRIMINATOR = ("type", "buttons")


@dataclasses.dataclass(frozen=True, slots=True)
class RichBlockThinking(TelegramObject):
    """A block with a "Thinking..." placeholder; ``type`` is always 'thinking'.

    Attributes:
        text: Text of the block.

    Telegram API: https://core.telegram.org/bots/api#richblockthinking
    """

    text: RichText
    type: str = "thinking"
    _DISCRIMINATOR = ("type", "thinking")


#: A block in a rich formatted message.
RichBlock = (
    RichBlockParagraph
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
    | RichBlockThinking
)


@dataclasses.dataclass(frozen=True, slots=True)
class RichMessage(TelegramObject):
    """Rich formatted message.

    Attributes:
        blocks: Content of the message.
        is_rtl: True, if the rich message must be shown right-to-left.

    Telegram API: https://core.telegram.org/bots/api#richmessage
    """

    blocks: list[RichBlock]
    is_rtl: bool | None = None
