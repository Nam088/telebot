package types

// Checklist describes a checklist.
//
// Telegram API: https://core.telegram.org/bots/api#checklist
type Checklist struct {
	Title                    string          `json:"title"`
	TitleEntities            []MessageEntity `json:"title_entities,omitempty"`
	Tasks                    []ChecklistTask `json:"tasks"`
	OthersCanAddTasks        bool            `json:"others_can_add_tasks,omitempty"`
	OthersCanMarkTasksAsDone bool            `json:"others_can_mark_tasks_as_done,omitempty"`
}

// ChecklistTask describes a task in a checklist.
//
// Telegram API: https://core.telegram.org/bots/api#checklisttask
type ChecklistTask struct {
	ID              int64           `json:"id"`
	Text            string          `json:"text"`
	TextEntities    []MessageEntity `json:"text_entities,omitempty"`
	CompletedByUser *User           `json:"completed_by_user,omitempty"`
	CompletedByChat *Chat           `json:"completed_by_chat,omitempty"`
	CompletionDate  int64           `json:"completion_date,omitempty"`
}

// ChecklistTasksAdded describes a service message about tasks added to a
// checklist.
//
// Telegram API: https://core.telegram.org/bots/api#checklisttasksadded
type ChecklistTasksAdded struct {
	ChecklistMessage *Message        `json:"checklist_message,omitempty"`
	Tasks            []ChecklistTask `json:"tasks"`
}

// ChecklistTasksDone describes a service message about checklist tasks
// marked as done or not done.
//
// Telegram API: https://core.telegram.org/bots/api#checklisttasksdone
type ChecklistTasksDone struct {
	ChecklistMessage       *Message `json:"checklist_message,omitempty"`
	MarkedAsDoneTaskIDs    []int64  `json:"marked_as_done_task_ids,omitempty"`
	MarkedAsNotDoneTaskIDs []int64  `json:"marked_as_not_done_task_ids,omitempty"`
}

// GiftInfo describes a service message about a regular gift that was sent or
// received.
//
// Telegram API: https://core.telegram.org/bots/api#giftinfo
type GiftInfo struct {
	Gift                    *Gift           `json:"gift"`
	OwnedGiftID             string          `json:"owned_gift_id,omitempty"`
	ConvertStarCount        int64           `json:"convert_star_count,omitempty"`
	PrepaidUpgradeStarCount int64           `json:"prepaid_upgrade_star_count,omitempty"`
	IsUpgradeSeparate       bool            `json:"is_upgrade_separate,omitempty"`
	CanBeUpgraded           bool            `json:"can_be_upgraded,omitempty"`
	Text                    string          `json:"text,omitempty"`
	Entities                []MessageEntity `json:"entities,omitempty"`
	IsPrivate               bool            `json:"is_private,omitempty"`
	UniqueGiftNumber        int64           `json:"unique_gift_number,omitempty"`
}
