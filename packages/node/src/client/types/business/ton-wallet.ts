import type { UniqueGift } from "../payments/index.js";
import type { AreaPosition } from "./models.js";

/**
 * Describes an attribute of a TON NFT.
 *
 * @see {@link https://core.telegram.org/bots/api#tonnftattribute Telegram Bot API: TonNftAttribute}
 */
export interface TonNftAttribute {
  /** Type of the attribute. */
  trait_type: string;
  /** Value of the attribute. */
  value: string;
}

/**
 * Describes an NFT on the TON blockchain.
 *
 * @see {@link https://core.telegram.org/bots/api#tonnft Telegram Bot API: TonNft}
 */
export interface TonNft {
  /** Address of the NFT on the TON blockchain. */
  address: string;
  /** Address of the NFT collection on the TON blockchain, if any. */
  collection_address?: string;
  /** Index of the NFT in the collection. */
  index: string;
  /** Name of the NFT. */
  name: string;
  /** Description of the NFT. */
  description: string;
  /** Attributes of the NFT. */
  attributes?: TonNftAttribute[];
  /** Information about the Telegram gift represented by the NFT, if any. */
  gift?: UniqueGift;
}

/**
 * Describes a sticker placed on a TON wallet card.
 *
 * @see {@link https://core.telegram.org/bots/api#tonwalletcardsticker Telegram Bot API: TonWalletCardSticker}
 */
export interface TonWalletCardSticker {
  /** Position of the sticker on the card. */
  position: AreaPosition;
  /** NFT corresponding to the sticker. */
  nft: TonNft;
}

/**
 * Describes a TON wallet card.
 *
 * @see {@link https://core.telegram.org/bots/api#tonwalletcard Telegram Bot API: TonWalletCard}
 */
export interface TonWalletCard {
  /** Address of the TON wallet. */
  address: string;
  /** Balance of the wallet in nanoton. */
  amount: string;
  /** List of stickers placed on the wallet card. */
  stickers: TonWalletCardSticker[];
  /** Address of the NFT used as the card background, if any. */
  background_nft_address?: string;
}

/**
 * Describes a service message about a transfer with a TON wallet.
 *
 * @see {@link https://core.telegram.org/bots/api#tonwallettransfer Telegram Bot API: TonWalletTransfer}
 */
export interface TonWalletTransfer {
  /** Unique identifier of the transaction. */
  transaction_id: string;
  /** Address of the peer TON wallet. */
  peer_address: string;
  /** Transferred amount in nanoton. */
  amount: string;
  /** Optional comment attached to the transfer. */
  comment?: string;
}
