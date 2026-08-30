package types

// ChatBackground represents a chat background.
//
// Telegram API: https://core.telegram.org/bots/api#chatbackground
type ChatBackground struct {
	Type *BackgroundType `json:"type"`
}

// BackgroundFill describes how a background is filled based on the selected
// colors.
//
// It is a flattened representation of Telegram's BackgroundFill union: Type
// discriminates the variant ("solid", "gradient" or "freeform_gradient") and
// only the fields relevant to that variant are populated.
//
// Telegram API: https://core.telegram.org/bots/api#backgroundfill
type BackgroundFill struct {
	Type          string  `json:"type"`
	Color         int64   `json:"color,omitempty"`
	TopColor      int64   `json:"top_color,omitempty"`
	BottomColor   int64   `json:"bottom_color,omitempty"`
	RotationAngle float64 `json:"rotation_angle,omitempty"`
	Colors        []int64 `json:"colors,omitempty"`
}

// BackgroundType describes the type of a background.
//
// It is a flattened representation of Telegram's BackgroundType union: Type
// discriminates the variant ("fill", "wallpaper", "pattern" or "chat_theme")
// and only the fields relevant to that variant are populated.
//
// Telegram API: https://core.telegram.org/bots/api#backgroundtype
type BackgroundType struct {
	Type             string          `json:"type"`
	Fill             *BackgroundFill `json:"fill,omitempty"`
	DarkThemeDimming int64           `json:"dark_theme_dimming,omitempty"`
	Document         *Document       `json:"document,omitempty"`
	IsBlurred        bool            `json:"is_blurred,omitempty"`
	IsMoving         bool            `json:"is_moving,omitempty"`
	Intensity        int64           `json:"intensity,omitempty"`
	IsInverted       bool            `json:"is_inverted,omitempty"`
	ThemeName        string          `json:"theme_name,omitempty"`
}
