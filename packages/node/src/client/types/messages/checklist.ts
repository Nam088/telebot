import type { User, Chat } from "../common/index.js";
import type { MessageEntity, Message } from "./core.js";

/**
 * Describes a task in a checklist.
 *
 * @see {@link https://core.telegram.org/bots/api#checklisttask Telegram Bot API: ChecklistTask}
 */
export interface ChecklistTask {
  /** Unique identifier of the task. */
  id: number;
  /** Text of the task. */
  text: string;
  /** Special entities that appear in the task text. */
  text_entities?: MessageEntity[];
  /** User that completed the task; omitted if the task wasn't completed by a user. */
  completed_by_user?: User;
  /** Chat that completed the task; omitted if the task wasn't completed by a chat. */
  completed_by_chat?: Chat;
  /** Point in time (Unix timestamp) when the task was completed; 0 if the task wasn't completed. */
  completion_date?: number;
}

/**
 * Describes a checklist.
 *
 * @see {@link https://core.telegram.org/bots/api#checklist Telegram Bot API: Checklist}
 */
export interface Checklist {
  /** Title of the checklist. */
  title: string;
  /** Special entities that appear in the checklist title. */
  title_entities?: MessageEntity[];
  /** List of tasks in the checklist. */
  tasks: ChecklistTask[];
  /** True, if users other than the creator of the list can add tasks to the list. */
  others_can_add_tasks?: boolean;
  /** True, if users other than the creator of the list can mark tasks as done or not done. */
  others_can_mark_tasks_as_done?: boolean;
}

/**
 * Describes a service message about tasks added to a checklist.
 *
 * @see {@link https://core.telegram.org/bots/api#checklisttasksadded Telegram Bot API: ChecklistTasksAdded}
 */
export interface ChecklistTasksAdded {
  /**
   * Message containing the checklist to which the tasks were added.
   *
   * @remarks
   * The {@link Message} object in this field will not contain the `reply_to_message` field even if it
   * itself is a reply.
   */
  checklist_message?: Message;
  /** List of tasks added to the checklist. */
  tasks: ChecklistTask[];
}

/**
 * Describes a service message about checklist tasks marked as done or not done.
 *
 * @see {@link https://core.telegram.org/bots/api#checklisttasksdone Telegram Bot API: ChecklistTasksDone}
 */
export interface ChecklistTasksDone {
  /**
   * Message containing the checklist whose tasks were marked as done or not done.
   *
   * @remarks
   * The {@link Message} object in this field will not contain the `reply_to_message` field even if it
   * itself is a reply.
   */
  checklist_message?: Message;
  /** Identifiers of the tasks that were marked as done. */
  marked_as_done_task_ids?: number[];
  /** Identifiers of the tasks that were marked as not done. */
  marked_as_not_done_task_ids?: number[];
}
