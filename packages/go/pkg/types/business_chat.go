package types

// BusinessIntro contains information about the start page settings of a
// Telegram Business account.
//
// Telegram API: https://core.telegram.org/bots/api#businessintro
type BusinessIntro struct {
	// Title text of the business intro.
	Title string `json:"title,omitempty"`
	// Message text of the business intro.
	Message string `json:"message,omitempty"`
	// Sticker of the business intro.
	Sticker *Sticker `json:"sticker,omitempty"`
}

// BusinessLocation contains information about the location of a Telegram
// Business account.
//
// Telegram API: https://core.telegram.org/bots/api#businesslocation
type BusinessLocation struct {
	// Address of the business.
	Address string `json:"address"`
	// Location of the business.
	Location *Location `json:"location,omitempty"`
}

// BusinessOpeningHoursInterval describes an interval of time during which a
// business is open.
//
// Telegram API: https://core.telegram.org/bots/api#businessopeninghoursinterval
type BusinessOpeningHoursInterval struct {
	// The minute's sequence number in a week, starting on Monday, marking the
	// start of the time interval during which the business is open;
	// 0 - 7 * 24 * 60.
	OpeningMinute int64 `json:"opening_minute"`
	// The minute's sequence number in a week, starting on Monday, marking the end
	// of the time interval during which the business is open; 0 - 8 * 24 * 60.
	ClosingMinute int64 `json:"closing_minute"`
}

// BusinessOpeningHours describes the opening hours of a business.
//
// Telegram API: https://core.telegram.org/bots/api#businessopeninghours
type BusinessOpeningHours struct {
	// Unique name of the time zone for which the opening hours are defined.
	TimeZoneName string `json:"time_zone_name"`
	// List of time intervals describing business opening hours.
	OpeningHours []BusinessOpeningHoursInterval `json:"opening_hours"`
}

// ApproveSuggestedPostOptions represents parameters for the approveSuggestedPost method.
//
// Telegram API: https://core.telegram.org/bots/api#approvesuggestedpost
type ApproveSuggestedPostOptions struct {
	ChatID    any   `json:"chat_id"`
	MessageID int64 `json:"message_id"`
	SendDate  int64 `json:"send_date,omitempty"`
}

// DeclineSuggestedPostOptions represents parameters for the declineSuggestedPost method.
//
// Telegram API: https://core.telegram.org/bots/api#declinesuggestedpost
type DeclineSuggestedPostOptions struct {
	ChatID    any    `json:"chat_id"`
	MessageID int64  `json:"message_id"`
	Comment   string `json:"comment,omitempty"`
}
