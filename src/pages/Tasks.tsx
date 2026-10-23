import { useState } from 'react'
import type { FormEvent } from 'react'

type TaskStatus = 'todo' | 'in-progress' | 'waiting' | 'done'
type TaskPriority = 'high' | 'medium' | 'low'

type Task = {
  id: number
  title: string
  client: string
  project?: string
  status: TaskStatus
  priority: TaskPriority
  due: string
  overdue?: boolean
  waitingOn?: string
}

const initialTasks: Task[] = [
  /* your 13 tasks, unchanged */
]

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To do',
  'in-progress': 'In progress',
  waiting: 'Waiting on',
  done: 'Done',
}

const priorityLabels: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

// "2026-10-25" (from a date input) -> a Date at local midnight.
// new Date("2026-10-25") would be read as UTC and can land on the previous day.
function parseDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

type AddTaskModalProps = {
  clientNames: string[]
  projectNames: string[]
  nextId: number
  onClose: () => void
  onSave: (task: Task) => void
}

function AddTaskModal({ clientNames, projectNames, nextId, onClose, onSave }: AddTaskModalProps) {
  const [status, setStatus] = useState<TaskStatus>('todo')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const project = String(form.get('project')).trim()
    const dueValue = String(form.get('due'))

    let due = 'No due date'
    let overdue = false

    if (dueValue) {
      const dueDate = parseDateInput(dueValue)
      const startOfToday = new Date()
      startOfToday.setHours(0, 0, 0, 0)

      due = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      overdue = dueDate < startOfToday && status !== 'done'
    }

    const newTask: Task = {
      id: nextId,
      title: String(form.get('title')).trim(),
      client: String(form.get('client')).trim(),
      project: project || undefined,
      status: status,
      priority: form.get('priority') as TaskPriority,
      due: due,
      overdue: overdue,
      waitingOn: status === 'waiting' ? String(form.get('waitingOn')).trim() : undefined,
    }

    onSave(newTask)
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-task-title">
        <div className="modal-header">
          <h3 id="add-task-title">New task</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="task-title">Task</label>
              <input id="task-title" name="title" type="text" placeholder="e.g. Collect signed job offers" required autoFocus />
            </div>

            <div className="form-field">
              <label htmlFor="task-client">Client</label>
              <input id="task-client" name="client" type="text" list="task-client-options" placeholder="Start typing or pick a client" required />
              <datalist id="task-client-options">
                {clientNames.map((name) => (
                  <option value={name} key={name} />
                ))}
              </datalist>
            </div>

            <div className="form-field">
              <label htmlFor="task-project">Project (optional)</label>
              <input id="task-project" name="project" type="text" list="task-project-options" />
              <datalist id="task-project-options">
                {projectNames.map((name) => (
                  <option value={name} key={name} />
                ))}
              </datalist>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="task-priority">Priority</label>
                <select id="task-priority" name="priority" defaultValue="medium">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="task-due">Due date</label>
                <input id="task-due" name="due" type="date" />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as TaskStatus)}
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="waiting">Waiting on someone</option>
                <option value="done">Done</option>
              </select>
            </div>

            {status === 'waiting' && (
              <div className="form-field">
                <label htmlFor="task-waiting-on">Waiting on</label>
                <input
                  id="task-waiting-on"
                  name="waitingOn"
                  type="text"
                  placeholder="Who needs to do something? e.g. Sarah Miller"
                  required
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit">Add task</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const clientNames = [...new Set(tasks.map((task) => task.client))]
  const projectNames = [...new Set(tasks.flatMap((task) => (task.project ? [task.project] : [])))]

  function handleSave(newTask: Task) {
    setTasks([...tasks, newTask])
    setIsModalOpen(false)
  }

  return (
    <div className="tasks-page">

      <div className="page-header">
        <p className="page-description">
          Everything that needs to get done, across all clients.
        </p>

        <button onClick={() => setIsModalOpen(true)}>+ New Task</button>
      </div>

      <div className="page-toolbar">
        <div className="status-tabs">
          <button className="status-tab active">All</button>
          <button className="status-tab">To do</button>
          <button className="status-tab">In progress</button>
          <button className="status-tab">Waiting on</button>
          <button className="status-tab">Done</button>
        </div>

        <input type="text" placeholder="Search tasks..." />
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className={task.status === 'done' ? 'task-done' : ''}
              >
                <td>
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    {task.project ?? task.client}
                  </div>
                </td>

                <td>
                  <span className={`status-badge status-${task.status}`}>
                    {statusLabels[task.status]}
                  </span>

                  {task.waitingOn && (
                    <div className="waiting-on">{task.waitingOn}</div>
                  )}
                </td>

                <td>
                  <span className={`priority priority-${task.priority}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </td>

                <td className={task.overdue ? 'due-overdue' : ''}>
                  {task.overdue ? `Overdue, ${task.due}` : task.due}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AddTaskModal
          clientNames={clientNames}
          projectNames={projectNames}
          nextId={Math.max(...tasks.map((task) => task.id)) + 1}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

    </div>
  )
}

export default Tasks