import { useState } from 'react'
import type { FormEvent } from 'react'
import { initialTasks } from '../data/tasks'
import type { Task, TaskStatus, TaskPriority } from '../data/tasks'
import { createTask, filterTasks } from '../services/taskService'
import type { TaskFilter } from '../services/taskService'

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

// The status tabs above the table. 'all' shows every task.
const filterTabs: { value: TaskFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'waiting', label: 'Waiting on' },
  { value: 'done', label: 'Done' },
]

type AddTaskModalProps = {
  clientNames: string[]
  projectNames: string[]
  existingTasks: Task[]
  onClose: () => void
  onSave: (task: Task) => void
}

// UI layer only: collects the form values and shows errors.
// The rules for what makes a valid task live in services/taskService.ts.
function AddTaskModal({ clientNames, projectNames, existingTasks, onClose, onSave }: AddTaskModalProps) {
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [errors, setErrors] = useState<string[]>([])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const result = createTask(
      {
        title: String(form.get('title') ?? ''),
        client: String(form.get('client') ?? ''),
        project: String(form.get('project') ?? ''),
        status: status,
        priority: form.get('priority') as TaskPriority,
        due: String(form.get('due') ?? ''),
        waitingOn: String(form.get('waitingOn') ?? ''),
      },
      existingTasks,
    )

    if (!result.ok) {
      setErrors(result.errors)
      return
    }

    onSave(result.task)
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
            {errors.length > 0 && (
              <ul className="form-errors" role="alert">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}

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
  const [statusFilter, setStatusFilter] = useState<TaskFilter>('all')
  const [search, setSearch] = useState('')

  const visibleTasks = filterTasks(tasks, statusFilter, search)

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
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              className={`status-tab${statusFilter === tab.value ? ' active' : ''}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
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
            {visibleTasks.length === 0 && (
              <tr>
                <td colSpan={4} className="table-empty">No tasks match these filters.</td>
              </tr>
            )}

            {visibleTasks.map((task) => (
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
          existingTasks={tasks}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

    </div>
  )
}

export default Tasks