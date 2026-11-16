import { describe, expect, it } from 'vitest'
import type { Task } from '../data/tasks'
import {
  MAX_TITLE_LENGTH,
  createTask,
  filterTasks,
  isOverdue,
  nextTaskId,
  parseDateInput,
  validateTaskInput,
} from './taskService'
import type { NewTaskInput } from './taskService'

// A fixed "today" so the overdue tests give the same answer on any day they run.
const TODAY = new Date(2026, 10, 15) // Nov 15, 2026 (months start at 0)

// A valid input that each test changes one field of.
function validInput(overrides: Partial<NewTaskInput> = {}): NewTaskInput {
  return {
    title: 'Collect signed job offers',
    client: 'ABC Manufacturing',
    project: 'ABC Manufacturing Hiring',
    status: 'todo',
    priority: 'medium',
    due: '2026-11-20',
    waitingOn: '',
    ...overrides,
  }
}

const sampleTasks: Task[] = [
  { id: 1, title: 'Call John Smith', client: 'ABC Manufacturing', project: 'ABC Hiring', status: 'todo', priority: 'high', due: 'Today' },
  { id: 2, title: 'Get signed job descriptions', client: 'XYZ Logistics', status: 'waiting', priority: 'high', due: 'Sep 25', waitingOn: 'Sarah Miller' },
  { id: 7, title: 'Prepare onboarding packet', client: 'Global Foods', status: 'in-progress', priority: 'low', due: 'Oct 5' },
  { id: 4, title: 'Send welcome email', client: 'Acme Construction', status: 'done', priority: 'low', due: 'Sep 24' },
]

describe('parseDateInput', () => {
  it('parses a YYYY-MM-DD string as local midnight', () => {
    const date = parseDateInput('2026-10-25')
    expect(date).not.toBeNull()
    expect(date!.getFullYear()).toBe(2026)
    expect(date!.getMonth()).toBe(9) // October
    expect(date!.getDate()).toBe(25)
    expect(date!.getHours()).toBe(0)
  })

  it('returns null for text that is not a date', () => {
    expect(parseDateInput('next tuesday')).toBeNull()
    expect(parseDateInput('')).toBeNull()
    expect(parseDateInput('10/25/2026')).toBeNull()
  })

  it('returns null for impossible dates instead of rolling them over', () => {
    expect(parseDateInput('2026-02-31')).toBeNull()
    expect(parseDateInput('2026-13-01')).toBeNull()
  })
})

describe('isOverdue', () => {
  it('is overdue when the due date is before today and the task is not done', () => {
    expect(isOverdue(new Date(2026, 10, 14), 'todo', TODAY)).toBe(true)
  })

  it('is not overdue when the task is due today', () => {
    expect(isOverdue(new Date(2026, 10, 15), 'todo', TODAY)).toBe(false)
  })

  it('is never overdue once the task is done', () => {
    expect(isOverdue(new Date(2026, 0, 1), 'done', TODAY)).toBe(false)
  })
})

describe('validateTaskInput', () => {
  it('accepts a complete, valid task', () => {
    expect(validateTaskInput(validInput())).toEqual([])
  })

  it('rejects a blank or whitespace-only title', () => {
    expect(validateTaskInput(validInput({ title: '   ' }))).toContain('Task title is required.')
  })

  it('rejects a title that is too long', () => {
    const errors = validateTaskInput(validInput({ title: 'a'.repeat(MAX_TITLE_LENGTH + 1) }))
    expect(errors).toContain(`Task title must be ${MAX_TITLE_LENGTH} characters or fewer.`)
  })

  it('rejects a missing client', () => {
    expect(validateTaskInput(validInput({ client: '' }))).toContain('Client is required.')
  })

  it('rejects an invalid due date', () => {
    expect(validateTaskInput(validInput({ due: '2026-02-31' }))).toContain('Due date is not a valid date.')
  })

  it('allows no due date at all', () => {
    expect(validateTaskInput(validInput({ due: '' }))).toEqual([])
  })

  it('requires a "waiting on" name for waiting tasks', () => {
    const errors = validateTaskInput(validInput({ status: 'waiting', waitingOn: ' ' }))
    expect(errors).toContain('A waiting task needs to say who it is waiting on.')
  })

  it('reports every problem at once, not just the first', () => {
    expect(validateTaskInput(validInput({ title: '', client: '' }))).toHaveLength(2)
  })
})

describe('nextTaskId', () => {
  it('returns one more than the highest id, even if ids are out of order', () => {
    expect(nextTaskId(sampleTasks)).toBe(8)
  })

  it('starts at 1 when there are no tasks', () => {
    expect(nextTaskId([])).toBe(1)
  })
})

describe('createTask', () => {
  it('builds a trimmed task with the next id and a formatted due date', () => {
    const result = createTask(validInput({ title: '  Collect offers  ' }), sampleTasks, TODAY)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.task).toMatchObject({
      id: 8,
      title: 'Collect offers',
      client: 'ABC Manufacturing',
      status: 'todo',
      due: 'Nov 20',
      overdue: false,
    })
  })

  it('marks a past due date as overdue', () => {
    const result = createTask(validInput({ due: '2026-11-01' }), sampleTasks, TODAY)
    expect(result.ok && result.task.overdue).toBe(true)
  })

  it('uses "No due date" when no date is given', () => {
    const result = createTask(validInput({ due: '' }), sampleTasks, TODAY)
    expect(result.ok && result.task.due).toBe('No due date')
  })

  it('drops the "waiting on" name unless the task is waiting', () => {
    const result = createTask(validInput({ status: 'todo', waitingOn: 'Sarah Miller' }), sampleTasks, TODAY)
    expect(result.ok && result.task.waitingOn).toBeUndefined()
  })

  it('returns errors instead of a task when the input is invalid', () => {
    const result = createTask(validInput({ title: '' }), sampleTasks, TODAY)
    expect(result).toEqual({ ok: false, errors: ['Task title is required.'] })
  })
})

describe('filterTasks', () => {
  it('returns every task for the "all" tab with an empty search', () => {
    expect(filterTasks(sampleTasks, 'all', '')).toHaveLength(4)
  })

  it('keeps only tasks with the selected status', () => {
    const result = filterTasks(sampleTasks, 'waiting', '')
    expect(result.map((task) => task.id)).toEqual([2])
  })

  it('searches title, client and "waiting on", ignoring case and spaces', () => {
    expect(filterTasks(sampleTasks, 'all', '  global foods ').map((t) => t.id)).toEqual([7])
    expect(filterTasks(sampleTasks, 'all', 'SARAH').map((t) => t.id)).toEqual([2])
  })

  it('combines the status tab and the search', () => {
    expect(filterTasks(sampleTasks, 'done', 'John')).toEqual([])
  })
})
