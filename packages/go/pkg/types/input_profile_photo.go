package types

// InputProfilePhotoStatic is a static profile photo in the .JPG format.
//
// It is one member of the InputProfilePhoto union Telegram accepts for the
// profile-photo parameters of setMyProfilePhoto and
// setBusinessAccountProfilePhoto. The union base stays untyped in this package
// (those parameters are `any`), so pass one of these two structs directly.
//
// Telegram API: https://core.telegram.org/bots/api#inputprofilephotostatic
type InputProfilePhotoStatic struct {
	// Type of the profile photo, must be "static".
	Type string `json:"type"`
	// The static profile photo. Profile photos can't be reused and can only be
	// uploaded as a new file, so you can pass "attach://<file_attach_name>" if the
	// photo was uploaded using multipart/form-data under <file_attach_name>.
	Photo string `json:"photo"`
}

// InputProfilePhotoAnimated is an animated profile photo in the MPEG4 format.
//
// Telegram API: https://core.telegram.org/bots/api#inputprofilephotoanimated
type InputProfilePhotoAnimated struct {
	// Type of the profile photo, must be "animated".
	Type string `json:"type"`
	// The animated profile photo. Profile photos can't be reused and can only be
	// uploaded as a new file, so you can pass "attach://<file_attach_name>" if the
	// photo was uploaded using multipart/form-data under <file_attach_name>.
	Animation string `json:"animation"`
	// Timestamp in seconds of the frame that will be used as the static profile
	// photo. Defaults to 0.0.
	MainFrameTimestamp float64 `json:"main_frame_timestamp,omitempty"`
}
