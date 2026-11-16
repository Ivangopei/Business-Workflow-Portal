// Task service: the business-logic layer for tasks.
//
// Architecture note:
// Atlas keeps three layers apart on the frontend:
//   - Data layer:      src/data/*      (types + seed data; later replaced by API calls)
//   - Business logic:  src/services/*  (pure functions: validation, rules, filtering)
//   - UI layer:        src/pages/*     (React components that render and collect input)
//
// Everything in this file is a plain function with no React and no DOM.
// That makes the rules easy to unit test (see src/services/taskService.test.ts)
// and lets the same rules be reused when the data starts coming from the API.

import type { Task, TaskPriority, TaskStatus } from '../data/tasks'

export type TaskFilter = TaskStatus | 'all'

// What the "New task" form hands to the service, before anything is checked.
export type NewTaskInput = {
  title: string
  client: string
  project?: string
  status: TaskStatus
  priority: TaskPriority
  due?: string // "YYYY-MM-DD" from <input type="date">, or empty
  waitingOn?: string
}

export type CreateTaskResult =
  | { ok: true; task: Task }
  | { ok: false; errors: string[] }

const VALID_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'waiting', 'done']
const VALID_PRIORITIES: TaskPriority[] = ['high', 'medium', 'low']
export const MAX_TITLE_LENGTH = 200

// "2026-10-25" -> a Date at local midnight, or null if the text isn't a real date.
// new Date("2026-10-25") would be read as UTC and can land on the previous day,
// so the parts are split out and passed to the local-time constructor instead.
export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  // Reject dates JavaScript silently "rolls over", like 2026-02-31 -> Mar 3.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

// A task is overdue when its due date is before today and it isn't finished.
export function isOverdue(dueDate: Date, status: TaskStatus, today: Date = new Date()): boolean {
  const startOfToday = new Date(today)
  startOfToday.setHours(0, 0, 0, 0)
  return dueDate < startOfToday && status !== 'done'
}

// Returns a list of human-readable problems. An empty list means the input is valid.
export function validateTaskInput(input: NewTaskInput): string[] {
  const errors: string[] = []
  const title = input.title.trim()

  if (!title) {
    errors.push('Task title is required.')
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.push(`Task title must be ${MAX_TITLE_LENGTH} characters or fewer.`)
  }

  if (!input.client.trim()) {
    errors.push('Client is required.')
  }

  if (!VALID_STATUSES.includes(input.status)) {
    errors.push('Status is not valid.')
  }

  if (!VALID_PRIORITIES.includes(input.priority)) {
    errors.push('Priority is not valid.')
  }

  if (input.due && parseDateInput(input.due) === null) {
    errors.push('Due date is not a valid date.')
  }

  // Mirrors the database rule "waiting_needs_contact" in server/db/schema.sql.
  if (input.status === 'waiting' && !input.waitingOn?.trim()) {
    errors.push('A waiting task needs to say who it is waiting on.')
  }

  return errors
}

// Next free id. Math.max() of an empty list is -Infinity, so an empty list starts at 1.
export function nextTaskId(tasks: Task[]): number {
  if (tasks.length === 0) return 1
  return Math.max(...tasks.map((task) => task.id)) + 1
}

// Validates the input and, if it is valid, builds the Task object the UI will display.
export function createTask(
  input: NewTaskInput,
  existingTasks: Task[],
  today: Date = new Date(),
): CreateTaskResult {
  const errors = validateTaskInput(input)
  if (errors.length > 0) {
    return { ok: false, errors }
  }

  let due = 'No due date'
  let overdue = false

  const dueDate = input.due ? parseDateInput(input.due) : null
  if (dueDate) {
    due = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    overdue = isOverdue(dueDate, input.status, today)
  }

  const project = input.project?.trim()

  const task: Task = {
    id: nextTaskId(existingTasks),
    title: input.title.trim(),
    client: input.client.trim(),
    project: project || undefined,
    status: input.status,
    priority: input.priority,
    due,
    overdue,
    // Only waiting tasks keep a "waiting on" name.
    waitingOn: input.status === 'waiting' ? input.waitingOn?.trim() : undefined,
  }

  return { ok: true, task }
}

// Status tab + search box. Search matches title, client, project, or who it's waiting on,
// ignoring upper/lower case and extra spaces.
export function filterTasks(tasks: Task[], status: TaskFilter, search: string): Task[] {
  const term = search.trim().toLowerCase()

  return tasks.filter((task) => {
    if (status !== 'all' && task.status !== status) return false
    if (!term) return true

    const haystack = [task.title, task.client, task.project, task.waitingOn]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(term)
  })
}
