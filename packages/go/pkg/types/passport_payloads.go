package types

// PassportData describes Telegram Passport data shared with the bot by the
// user.
//
// Telegram API: https://core.telegram.org/bots/api#passportdata
type PassportData struct {
	Data        []EncryptedPassportElement `json:"data"`
	Credentials *EncryptedCredentials      `json:"credentials"`
}

// EncryptedPassportElement describes documents or other Telegram Passport
// elements shared with the bot by the user.
//
// Telegram API: https://core.telegram.org/bots/api#encryptedpassportelement
type EncryptedPassportElement struct {
	Type        string         `json:"type"`
	Data        string         `json:"data,omitempty"`
	PhoneNumber string         `json:"phone_number,omitempty"`
	Email       string         `json:"email,omitempty"`
	Files       []PassportFile `json:"files,omitempty"`
	FrontSide   *PassportFile  `json:"front_side,omitempty"`
	ReverseSide *PassportFile  `json:"reverse_side,omitempty"`
	Selfie      *PassportFile  `json:"selfie,omitempty"`
	Translation []PassportFile `json:"translation,omitempty"`
	Hash        string         `json:"hash"`
}

// EncryptedCredentials describes data required for decrypting and
// authenticating EncryptedPassportElement. See the Telegram Passport
// Documentation for a complete description of the data decryption and
// authentication processes.
//
// Telegram API: https://core.telegram.org/bots/api#encryptedcredentials
type EncryptedCredentials struct {
	Data   string `json:"data"`
	Hash   string `json:"hash"`
	Secret string `json:"secret"`
}

// PassportFile represents a file uploaded to Telegram Passport. Currently
// all Telegram Passport files are in JPEG format when decrypted and don't
// exceed 10MB.
//
// Telegram API: https://core.telegram.org/bots/api#passportfile
type PassportFile struct {
	FileID       string `json:"file_id"`
	FileUniqueID string `json:"file_unique_id"`
	FileSize     int64  `json:"file_size"`
	FileDate     int64  `json:"file_date"`
}

// PassportElementErrorDataField represents an issue in one of the data
// fields that was provided by the user. The error is considered resolved
// when the field's value changes.
//
// Telegram API: https://core.telegram.org/bots/api#passportelementerrordatafield
type PassportElementErrorDataField struct {
	Source    string `json:"source"`
	Type      string `json:"type"`
	FieldName string `json:"field_name"`
	DataHash  string `json:"data_hash"`
	Message   string `json:"message"`
}

// PassportElementErrorFrontSide represents an issue with the front side of a
// document. The error is considered resolved when the file with the front
// side of the document changes.
//
// Telegram API: https://core.telegram.org/bots/api#passportelementerrorfrontside
type PassportElementErrorFrontSide struct {
	Source   string `json:"source"`
	Type     string `json:"type"`
	FileHash string `json:"file_hash"`
	Message  string `json:"message"`
}

// PassportElementErrorReverseSide represents an issue with the reverse side
// of a document. The error is considered resolved when the file with reverse
// side of the document changes.
//
// Telegram API: https://core.telegram.org/bots/api#passportelementerrorreverseside
type PassportElementErrorReverseSide struct {
	Source   string `json:"source"`
	Type     string `json:"type"`
	FileHash string `json:"file_hash"`
	Message  string `json:"message"`
}

// PassportElementErrorSelfie represents an issue with the selfie with a
// document. The error is considered resolved when the file with the selfie
// changes.
//
// Telegram API: https://core.telegram.org/bots/api#passportelementerrorselfie
type PassportElementErrorSelfie struct {
	Source   string `json:"source"`
	Type     string `json:"type"`
	FileHash string `json:"file_hash"`
	Message  string `json:"message"`
}

// PassportElementErrorFile represents an issue with a document scan. The
// error is considered resolved when the file with the document scan changes.
//
// Telegram API: https://core.telegram.org/bots/api#passportelementerrorfile
type PassportElementErrorFile struct {
	Source   string `json:"source"`
	Type     string `json:"type"`
	FileHash string `json:"file_hash"`
	Message  string `json:"message"`
}

// PassportElementErrorFiles represents an issue with a list of scans. The
// error is considered resolved when the list of files containing the scans
// changes.
//
// Telegram API: https://core.telegram.org/bots/api#passportelementerrorfiles
type PassportElementErrorFiles struct {
	Source     string   `json:"source"`
	Type       string   `json:"type"`
	FileHashes []string `json:"file_hashes"`
	Message    string   `json:"message"`
}

// PassportElementErrorTranslationFile represents an issue with one of the
// files that constitute the translation of a document. The error is
// considered resolved when the file changes.
//
// Telegram API: https://core.telegram.org/bots/api#passportelementerrortranslationfile
type PassportElementErrorTranslationFile struct {
	Source   string `json:"source"`
	Type     string `json:"type"`
	FileHash string `json:"file_hash"`
	Message  string `json:"message"`
}

// PassportElementErrorTranslationFiles represents an issue with the
// translated version of a document. The error is considered resolved when a
// file with the document translation change.
//
// Telegram API: https://core.telegram.org/bots/api#passportelementerrortranslationfiles
type PassportElementErrorTranslationFiles struct {
	Source     string   `json:"source"`
	Type       string   `json:"type"`
	FileHashes []string `json:"file_hashes"`
	Message    string   `json:"message"`
}

// PassportElementErrorUnspecified represents an issue in an unspecified
// place. The error is considered resolved when new data is added.
//
// Telegram API: https://core.telegram.org/bots/api#passportelementerrorunspecified
type PassportElementErrorUnspecified struct {
	Source      string `json:"source"`
	Type        string `json:"type"`
	ElementHash string `json:"element_hash"`
	Message     string `json:"message"`
}
