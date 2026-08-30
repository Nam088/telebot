package types

// StoryAreaPosition describes the rectangular position of a story area,
// expressed as percentages of the story dimensions.
//
// Field-for-field port of the StoryAreaPosition interface in
// packages/node/src/client/types/business/models.ts.
//
// See https://core.telegram.org/bots/api#storyareaposition
type StoryAreaPosition struct {
	// The abscissa of the rectangle's center, as a percentage of the story width.
	XPercentage float64 `json:"x_percentage"`
	// The ordinate of the rectangle's center, as a percentage of the story height.
	YPercentage float64 `json:"y_percentage"`
	// The width of the rectangle, as a percentage of the story width.
	WidthPercentage float64 `json:"width_percentage"`
	// The height of the rectangle, as a percentage of the story height.
	HeightPercentage float64 `json:"height_percentage"`
	// Clockwise rotation angle of the rectangle, in degrees; 0-360.
	RotationAngle float64 `json:"rotation_angle"`
	// The radius of the rectangle corner rounding, as a percentage of the story width.
	CornerRadiusPercentage float64 `json:"corner_radius_percentage"`
}

// StoryAreaType is the union of story area types that can be added to a story.
//
// Node models this as a discriminated union of object literals
// (packages/node/src/client/types/business/models.ts, "StoryAreaType"); Go
// expresses the same union as an interface implemented by
// StoryAreaTypeLocation, StoryAreaTypeSuggestedReaction, StoryAreaTypeLink and
// StoryAreaTypeWeather. The concrete type's Type field carries the wire
// discriminator.
//
// Telegram API: https://core.telegram.org/bots/api#storyareatype
type StoryAreaType interface {
	storyAreaType()
}

// StoryAreaTypeLocation tags a location on a story.
//
// See https://core.telegram.org/bots/api#storyareatypelocation
type StoryAreaTypeLocation struct {
	// Type of the area, always "location".
	Type string `json:"type"`
	// The location that is tagged by the area.
	Location Location `json:"location"`
	// Address of the location; node types it as unknown, so Go passes the raw
	// LocationAddress object through. Requires a story privacy context that
	// allows addresses.
	Address   any     `json:"address,omitempty"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func (StoryAreaTypeLocation) storyAreaType() {}

// StoryAreaTypeSuggestedReaction suggests a reaction on a story.
//
// See https://core.telegram.org/bots/api#storyareatypesuggestedreaction
type StoryAreaTypeSuggestedReaction struct {
	// Type of the area, always "suggested_reaction".
	Type string `json:"type"`
	// The suggested reaction type.
	ReactionType ReactionType `json:"reaction_type"`
	// True, if the suggested reaction should be shown on a dark background.
	IsDark bool `json:"is_dark,omitempty"`
	// True, if the suggested reaction should be shown with flipped colors.
	IsFlipped bool `json:"is_flipped,omitempty"`
}

func (StoryAreaTypeSuggestedReaction) storyAreaType() {}

// StoryAreaTypeLink attaches a clickable URL to a story.
//
// See https://core.telegram.org/bots/api#storyareatypelink
type StoryAreaTypeLink struct {
	// Type of the area, always "link".
	Type string `json:"type"`
	// HTTP URL to be opened by a click on the area.
	URL string `json:"url"`
}

func (StoryAreaTypeLink) storyAreaType() {}

// StoryAreaTypeWeather displays the current weather in a story area.
//
// See https://core.telegram.org/bots/api#storyareatypeweather
type StoryAreaTypeWeather struct {
	// Type of the area, always "weather".
	Type string `json:"type"`
	// Temperature in degrees Celsius; may be negative.
	TemperatureC float64 `json:"temperature_c"`
	// Emoji describing the weather.
	Emoji string `json:"emoji"`
	// Background color of the displayed weather info in RGB format.
	BackgroundColor int     `json:"background_color"`
	Temperature     float64 `json:"temperature"`
}

func (StoryAreaTypeWeather) storyAreaType() {}

// StoryArea describes an interactive area added to a story.
//
// See https://core.telegram.org/bots/api#storyarea
type StoryArea struct {
	// Position of the story area.
	Position StoryAreaPosition `json:"position"`
	// Type of the story area.
	Type StoryAreaType `json:"type"`
}

// InputStoryContent is the union of content types that can be posted or edited
// as a story.
//
// Node declares "type InputStoryContent = InputStoryContentPhoto |
// InputStoryContentVideo"; Go uses an interface implemented by both structs so
// a story content value stays type-checked at the call site.
//
// Telegram API: https://core.telegram.org/bots/api#inputstorycontent
type InputStoryContent interface {
	inputStoryContent()
}

// InputStoryContentPhoto describes a photo passed as the content of a story.
//
// See https://core.telegram.org/bots/api#inputstorycontentphoto
type InputStoryContentPhoto struct {
	// Type of the content, always "photo".
	Type string `json:"type"`
	// File to send: a file_id, an HTTP URL, or an InputFile for an upload.
	Photo any `json:"photo"`
}

func (InputStoryContentPhoto) inputStoryContent() {}

// InputStoryContentVideo describes a video passed as the content of a story.
//
// See https://core.telegram.org/bots/api#inputstorycontentvideo
type InputStoryContentVideo struct {
	// Type of the content, always "video".
	Type string `json:"type"`
	// File to send: a file_id, an HTTP URL, or an InputFile for an upload.
	Video any `json:"video"`
	// Precise duration of the video in seconds; pass 0 to omit.
	Duration float64 `json:"duration,omitempty"`
	// Cover image for the video; node types it as string | InputFile.
	Cover any `json:"cover,omitempty"`
	// Timestamp in seconds from which the video will play in the story; pass 0
	// to omit.
	Timestamp float64 `json:"timestamp,omitempty"`
	// True, if the video has no sound and should be looped and displayed at a
	// faster speed.
	IsAnimation         bool    `json:"is_animation,omitempty"`
	CoverFrameTimestamp float64 `json:"cover_frame_timestamp,omitempty"`
}

func (InputStoryContentVideo) inputStoryContent() {}

// PostStoryOptions represents parameters for the postStory method.
//
// Telegram API: https://core.telegram.org/bots/api#poststory
type PostStoryOptions struct {
	// Unique identifier of the business connection on behalf of which the
	// story will be posted.
	BusinessConnectionID string `json:"business_connection_id"`
	// Story media to send: an InputStoryContentPhoto, an
	// InputStoryContentVideo, or an equivalent raw object literal.
	Content any `json:"content"`
	// Period after which the story is moved to the archive, in seconds; must
	// be one of 6 * 3600, 12 * 3600, 24 * 3600, or 48 * 3600.
	ActivePeriod int `json:"active_period"`
	// Story caption, 0-1024 characters after entities parsing.
	Caption string `json:"caption,omitempty"`
	// Mode for parsing entities in the story caption.
	ParseMode string `json:"parse_mode,omitempty"`
	// A JSON-serialized list of special entities that appear in the story
	// caption; it can be specified instead of parse_mode.
	CaptionEntities []MessageEntity `json:"caption_entities,omitempty"`
	// A JSON-serialized list of story areas to add.
	Areas []StoryArea `json:"areas,omitempty"`
	// Pass True if the story will also be posted to the chat of the business
	// account owning the connection.
	PostToChatPage bool `json:"post_to_chat_page,omitempty"`
	// Pass True if the content of the story must be protected from forwarding
	// and saving.
	ProtectContent bool `json:"protect_content,omitempty"`
}

// RepostStoryOptions represents parameters for the repostStory method.
//
// Telegram API: https://core.telegram.org/bots/api#repoststory
type RepostStoryOptions struct {
	// Unique identifier of the business connection on behalf of which the
	// story will be reposted.
	BusinessConnectionID string `json:"business_connection_id"`
	// Unique identifier of the other chat which posted the story to repost.
	FromChatID any `json:"from_chat_id"`
	// Identifier of the story to repost.
	FromStoryID int `json:"from_story_id"`
	// Period after which the story is moved to the archive, in seconds.
	ActivePeriod int `json:"active_period"`
	// Pass True if the story will also be posted to the chat of the business
	// account owning the connection.
	PostToChatPage bool `json:"post_to_chat_page,omitempty"`
	// Pass True if the content of the story must be protected from forwarding
	// and saving.
	ProtectContent bool `json:"protect_content,omitempty"`
}
