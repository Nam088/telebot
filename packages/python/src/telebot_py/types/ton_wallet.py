"""TON wallet and NFT types for Telegram Bot API 10.4+."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject
from telebot_py.types.gifts import UniqueGift
from telebot_py.types.stories import AreaPosition


@dataclasses.dataclass(frozen=True, slots=True)
class TonNftAttribute(TelegramObject):
    """Describes an attribute of a TON NFT.

    Attributes:
        trait_type: Type of the attribute.
        value: Value of the attribute.

    Telegram API: https://core.telegram.org/bots/api#tonnftattribute
    """

    trait_type: str
    value: str


@dataclasses.dataclass(frozen=True, slots=True)
class TonNft(TelegramObject):
    """Describes an NFT on the TON blockchain.

    Attributes:
        address: Address of the NFT on the TON blockchain.
        index: Index of the NFT in the collection.
        name: Name of the NFT.
        description: Description of the NFT.
        collection_address: Address of the NFT collection, if any.
        attributes: Attributes of the NFT.
        gift: Information about the Telegram gift represented by the NFT.

    Telegram API: https://core.telegram.org/bots/api#tonnft
    """

    address: str
    index: str
    name: str
    description: str
    collection_address: str | None = None
    attributes: list[TonNftAttribute] | None = None
    gift: UniqueGift | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class TonWalletCardSticker(TelegramObject):
    """Describes a sticker placed on a TON wallet card.

    Attributes:
        position: Position of the sticker on the card.
        nft: NFT corresponding to the sticker.

    Telegram API: https://core.telegram.org/bots/api#tonwalletcardsticker
    """

    position: AreaPosition
    nft: TonNft


@dataclasses.dataclass(frozen=True, slots=True)
class TonWalletCard(TelegramObject):
    """Describes a TON wallet card.

    Attributes:
        address: Address of the TON wallet.
        amount: Balance of the wallet in nanoton.
        stickers: List of stickers placed on the wallet card.
        background_nft_address: Address of the NFT used as background.

    Telegram API: https://core.telegram.org/bots/api#tonwalletcard
    """

    address: str
    amount: str
    stickers: list[TonWalletCardSticker]
    background_nft_address: str | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class TonWalletTransfer(TelegramObject):
    """Describes a service message about a transfer with a TON wallet.

    Attributes:
        transaction_id: Unique identifier of the transaction.
        peer_address: Address of the peer TON wallet.
        amount: Transferred amount in nanoton.
        comment: Optional comment attached to the transfer.

    Telegram API: https://core.telegram.org/bots/api#tonwallettransfer
    """

    transaction_id: str
    peer_address: str
    amount: str
    comment: str | None = None
