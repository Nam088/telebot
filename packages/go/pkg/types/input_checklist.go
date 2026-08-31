package types

// InputChecklistTask describes a task to add to a checklist.
//
// Telegram API: https://core.telegram.org/bots/api#inputchecklisttask
type InputChecklistTask struct {
	// Unique identifier of the task; must be positive and unique among all task
	// identifiers currently present in the checklist.
	ID int64 `json:"id"`
	// Text of the task; 1-100 characters after entities parsing.
	Text string `json:"text"`
	// Mode for parsing entities in the text.
	ParseMode string `json:"parse_mode,omitempty"`
	// List of special entities that appear in the text, which can be specified
	// instead of parse_mode. Currently, only bold, italic, underline,
	// strikethrough, spoiler, custom_emoji, and date_time entities are allowed.
	TextEntities []MessageEntity `json:"text_entities,omitempty"`
}

// InputChecklist describes a checklist to create.
//
// Telegram API: https://core.telegram.org/bots/api#inputchecklist
type InputChecklist struct {
	// Title of the checklist; 1-255 characters after entities parsing.
	Title string `json:"title"`
	// Mode for parsing entities in the title.
	ParseMode string `json:"parse_mode,omitempty"`
	// List of special entities that appear in the title, which can be specified
	// instead of parse_mode. Currently, only bold, italic, underline,
	// strikethrough, spoiler, custom_emoji, and date_time entities are allowed.
	TitleEntities []MessageEntity `json:"title_entities,omitempty"`
	// List of 1-30 tasks in the checklist.
	Tasks []InputChecklistTask `json:"tasks"`
	// Pass True if other users can add tasks to the checklist.
	OthersCanAddTasks bool `json:"others_can_add_tasks,omitempty"`
	// Pass True if other users can mark tasks as done or not done in the
	// checklist.
	OthersCanMarkTasksAsDone bool `json:"others_can_mark_tasks_as_done,omitempty"`
}
