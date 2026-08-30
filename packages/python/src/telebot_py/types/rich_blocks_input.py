"""Outgoing rich message blocks that carry text or structure.

Field names, required-ness and ``type`` literals follow the official Telegram
Bot API docs for the ``InputRichBlock*`` classes, ``InputRichMessage`` and
``InputRichMessageContent`` (Bot API 10.3). As in
:mod:`telebot_py.types.rich_blocks`, each block defaults its ``type`` field to
the literal the docs give.

Remarks:
    The ``InputRichBlock`` union lists the 24 block types Telegram documents as
    possible members; ``InputRichBlockListItem`` is a helper with no place in
    the union and its optional ``type`` is a list-label style, not a
    discriminator. Table cells reuse the received :class:`RichBlockTableCell`,
    which is what Telegram's docs specify for outgoing tables too.
"""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.rich_blocks_input_media import (
    InputRichBlockAnimation,
    InputRichBlockAudio,
    InputRichBlockDocument,
    InputRichBlockMap,
    InputRichBlockPhoto,
    InputRichBlockVideo,
    InputRichBlockVoiceNote,
    InputRichMessageMedia,
)
from telebot_py.types.rich_blocks_media import RichBlockCaption, RichBlockTableCell
from telebot_py.types.rich_text import RichMessageButton, RichText


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockParagraph(TelegramObject):
    """A text paragraph to send; ``type`` is always 'paragraph'.

    Attributes:
        text: Text of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockparagraph
    """

    text: RichText
    type: str = "paragraph"
    _DISCRIMINATOR = ("type", "paragraph")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockSectionHeading(TelegramObject):
    """A section heading to send; ``type`` is always 'heading'.

    Attributes:
        text: Text of the block.
        size: Relative size of the text font; 1-6, 1 is the largest.

    Telegram API: https://core.telegram.org/bots/api#inputrichblocksectionheading
    """

    text: RichText
    size: int
    type: str = "heading"
    _DISCRIMINATOR = ("type", "heading")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockPreformatted(TelegramObject):
    """A preformatted text block to send; ``type`` is always 'pre'.

    Attributes:
        text: Text of the block.
        language: The programming language of the text.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockpreformatted
    """

    text: RichText
    type: str = "pre"
    language: str | None = None
    _DISCRIMINATOR = ("type", "pre")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockFooter(TelegramObject):
    """A footer to send; ``type`` is always 'footer'.

    Attributes:
        text: Text of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockfooter
    """

    text: RichText
    type: str = "footer"
    _DISCRIMINATOR = ("type", "footer")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockDivider(TelegramObject):
    """A divider to send; ``type`` is always 'divider'.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockdivider
    """

    type: str = "divider"
    _DISCRIMINATOR = ("type", "divider")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockMathematicalExpression(TelegramObject):
    """A LaTeX mathematical expression block to send; ``type`` is always
    'mathematical_expression'.

    Attributes:
        expression: The mathematical expression in LaTeX format.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockmathematicalexpression
    """

    expression: str
    type: str = "mathematical_expression"
    _DISCRIMINATOR = ("type", "mathematical_expression")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockAnchor(TelegramObject):
    """An anchor block to send; ``type`` is always 'anchor'.

    Attributes:
        name: The name of the anchor.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockanchor
    """

    name: str
    type: str = "anchor"
    _DISCRIMINATOR = ("type", "anchor")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockListItem(TelegramObject):
    """An item of a list to be sent.

    Attributes:
        blocks: The content of the item.
        has_checkbox: Pass True if the item has a checkbox.
        is_checked: Pass True if the item has a checked checkbox.
        value: For ordered lists, the numeric value of the item label.
        type: For ordered lists, the type of the item label; 'a', 'A', 'i', 'I'
            or '1'. Unlike on other blocks, Telegram leaves this optional and
            it does not identify the block type.

    Telegram API: https://core.telegram.org/bots/api#inputrichblocklistitem
    """

    blocks: list[InputRichBlock]
    has_checkbox: bool | None = None
    is_checked: bool | None = None
    value: int | None = None
    type: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockList(TelegramObject):
    """A list of blocks to send; ``type`` is always 'list'.

    Attributes:
        items: Items of the list.

    Telegram API: https://core.telegram.org/bots/api#inputrichblocklist
    """

    items: list[InputRichBlockListItem]
    type: str = "list"
    _DISCRIMINATOR = ("type", "list")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockBlockQuotation(TelegramObject):
    """A block quotation to send; ``type`` is always 'blockquote'.

    Attributes:
        blocks: Content of the block.
        credit: Credit of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockblockquotation
    """

    blocks: list[InputRichBlock]
    type: str = "blockquote"
    credit: RichText | None = None
    _DISCRIMINATOR = ("type", "blockquote")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockExpandableBlockQuotation(TelegramObject):
    """An expandable block quotation to send; ``type`` is always
    'expandable_blockquote'.

    Attributes:
        text: Content of the block.
        credit: Credit of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockexpandableblockquotation
    """

    text: RichText
    type: str = "expandable_blockquote"
    credit: RichText | None = None
    _DISCRIMINATOR = ("type", "expandable_blockquote")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockPullQuotation(TelegramObject):
    """A centered quotation to send; ``type`` is always 'pullquote'.

    Attributes:
        text: Text of the block.
        credit: Credit of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockpullquotation
    """

    text: RichText
    type: str = "pullquote"
    credit: RichText | None = None
    _DISCRIMINATOR = ("type", "pullquote")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockCollage(TelegramObject):
    """A collage to send; ``type`` is always 'collage'.

    Attributes:
        blocks: Elements of the collage.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockcollage
    """

    blocks: list[InputRichBlock]
    type: str = "collage"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "collage")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockSlideshow(TelegramObject):
    """A slideshow to send; ``type`` is always 'slideshow'.

    Attributes:
        blocks: Elements of the slideshow.
        caption: Caption of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockslideshow
    """

    blocks: list[InputRichBlock]
    type: str = "slideshow"
    caption: RichBlockCaption | None = None
    _DISCRIMINATOR = ("type", "slideshow")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockTable(TelegramObject):
    """A table to send; ``type`` is always 'table'.

    Attributes:
        cells: Cells of the table, one list per row.
        is_bordered: Pass True if the table has borders.
        is_striped: Pass True if the table is striped.
        is_compact: Pass True if table cells must have smaller indents.
        caption: Caption of the table.

    Telegram API: https://core.telegram.org/bots/api#inputrichblocktable
    """

    cells: list[list[RichBlockTableCell]]
    type: str = "table"
    is_bordered: bool | None = None
    is_striped: bool | None = None
    is_compact: bool | None = None
    caption: RichText | None = None
    _DISCRIMINATOR = ("type", "table")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockDetails(TelegramObject):
    """An expandable details block to send; ``type`` is always 'details'.

    Attributes:
        summary: Always shown summary of the block.
        blocks: Content of the block.
        is_open: Pass True if the content is visible by default.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockdetails
    """

    summary: RichText
    blocks: list[InputRichBlock]
    type: str = "details"
    is_open: bool | None = None
    _DISCRIMINATOR = ("type", "details")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockButtons(TelegramObject):
    """A row of buttons to send; ``type`` is always 'buttons'.

    Attributes:
        buttons: List of 1-8 buttons to send.
        align: Horizontal alignment of the buttons; 'left', 'center' or 'right'.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockbuttons
    """

    buttons: list[RichMessageButton]
    type: str = "buttons"
    align: str | None = None
    _DISCRIMINATOR = ("type", "buttons")


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichBlockThinking(TelegramObject):
    """A "Thinking..." placeholder block; ``type`` is always 'thinking'.

    Usable only in sendRichMessageDraft.

    Attributes:
        text: Text of the block.

    Telegram API: https://core.telegram.org/bots/api#inputrichblockthinking
    """

    text: RichText
    type: str = "thinking"
    _DISCRIMINATOR = ("type", "thinking")


#: A block in a rich formatted message to be sent.
InputRichBlock = (
    InputRichBlockParagraph
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
    | InputRichBlockThinking
)


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichMessage(TelegramObject):
    """A rich message to be sent; exactly one of ``html``, ``markdown`` or
    ``blocks`` must be used.

    Attributes:
        blocks: Content described as a list of blocks.
        html: Content described using HTML formatting; link media through the
            ``media`` field with tg://photo?id=, tg://video?id=,
            tg://document?id= and tg://audio?id= links.
        markdown: Content described using Markdown formatting; link media
            through the ``media`` field the same way.
        media: Media referenced from ``markdown`` or ``html`` by identifier.
        is_rtl: Pass True if the rich message must be shown right-to-left.
        skip_entity_detection: Pass True to skip automatic detection of
            entities such as URLs, mentions, hashtags and phone numbers.

    Telegram API: https://core.telegram.org/bots/api#inputrichmessage
    """

    blocks: list[InputRichBlock] | None = None
    html: str | None = None
    markdown: str | None = None
    media: list[InputRichMessageMedia] | None = None
    is_rtl: bool | None = None
    skip_entity_detection: bool | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class InputRichMessageContent(TelegramObject):
    """The content of a rich message sent as the result of an inline query.

    Attributes:
        rich_message: The message to be sent; only previously uploaded files
            may be used in it.

    Telegram API: https://core.telegram.org/bots/api#inputrichmessagecontent
    """

    rich_message: InputRichMessage
