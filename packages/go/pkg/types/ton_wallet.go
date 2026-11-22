package types

// TonNftAttribute describes an attribute of a TON NFT.
//
// Telegram API: https://core.telegram.org/bots/api#tonnftattribute
type TonNftAttribute struct {
	// Type of the attribute.
	TraitType string `json:"trait_type"`
	// Value of the attribute.
	Value string `json:"value"`
}

// TonNft describes an NFT on the TON blockchain.
//
// Telegram API: https://core.telegram.org/bots/api#tonnft
type TonNft struct {
	// Address of the NFT on the TON blockchain.
	Address string `json:"address"`
	// Address of the NFT collection on the TON blockchain, if any.
	CollectionAddress string `json:"collection_address,omitempty"`
	// Index of the NFT in the collection.
	Index string `json:"index"`
	// Name of the NFT.
	Name string `json:"name"`
	// Description of the NFT.
	Description string `json:"description"`
	// Attributes of the NFT.
	Attributes []TonNftAttribute `json:"attributes,omitempty"`
	// Information about the Telegram gift represented by the NFT, if any.
	Gift *UniqueGift `json:"gift,omitempty"`
}

// TonWalletCardSticker describes a sticker placed on a TON wallet card.
//
// Telegram API: https://core.telegram.org/bots/api#tonwalletcardsticker
type TonWalletCardSticker struct {
	// Position of the sticker on the card.
	Position AreaPosition `json:"position"`
	// NFT corresponding to the sticker.
	Nft TonNft `json:"nft"`
}

// TonWalletCard describes a TON wallet card.
//
// Telegram API: https://core.telegram.org/bots/api#tonwalletcard
type TonWalletCard struct {
	// Address of the TON wallet.
	Address string `json:"address"`
	// Balance of the wallet in nanoton.
	Amount string `json:"amount"`
	// List of stickers placed on the wallet card.
	Stickers []TonWalletCardSticker `json:"stickers"`
	// Address of the NFT used as the card background, if any.
	BackgroundNftAddress string `json:"background_nft_address,omitempty"`
}

// TonWalletTransfer describes a service message about a transfer with a TON wallet.
//
// Telegram API: https://core.telegram.org/bots/api#tonwallettransfer
type TonWalletTransfer struct {
	// Unique identifier of the transaction.
	TransactionID string `json:"transaction_id"`
	// Address of the peer TON wallet.
	PeerAddress string `json:"peer_address"`
	// Transferred amount in nanoton.
	Amount string `json:"amount"`
	// Optional comment attached to the transfer.
	Comment string `json:"comment,omitempty"`
}
