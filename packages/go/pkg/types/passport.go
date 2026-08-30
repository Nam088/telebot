package types

// PassportElementError describes an error in one of the Telegram Passport
// elements a user submitted.
//
// Node models the whole set of passport error variants as this single shape
// (source, type, message); the Go port mirrors it field-for-field so both
// frameworks serialize the same payload.
//
// See https://core.telegram.org/bots/api#passportelementerror
type PassportElementError struct {
	// Source of the error, as indicated by the specific error type.
	Source string `json:"source"`
	// Type of element of the user's Telegram Passport which has the issue.
	Type string `json:"type"`
	// Error message.
	Message string `json:"message"`
}
