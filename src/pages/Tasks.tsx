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

const tasks: Task[] = [
  { id: 1, title: 'Call John Smith about open positions', client: 'ABC Manufacturing', project: 'ABC Manufacturing Hiring', status: 'in-progress', priority: 'high', due: 'Today, 10:00 AM' },
  { id: 2, title: 'Review candidate documents', client: 'ABC Manufacturing', project: 'ABC Manufacturing Hiring', status: 'todo', priority: 'high', due: 'Today, 2:00 PM' },
  { id: 3, title: 'Send candidate list to John Smith', client: 'ABC Manufacturing', project: 'ABC Manufacturing Hiring', status: 'todo', priority: 'medium', due: 'Tomorrow' },
  { id: 4, title: 'Get signed job descriptions', client: 'XYZ Logistics', project: 'XYZ Logistics Recruitment', status: 'waiting', priority: 'high', due: 'Sep 25', overdue: true, waitingOn: 'Sarah Miller' },
  { id: 5, title: 'Schedule interviews for warehouse roles', client: 'XYZ Logistics', project: 'XYZ Logistics Recruitment', status: 'todo', priority: 'medium', due: 'Oct 2' },
  { id: 6, title: 'Confirm start dates for new hires', client: 'Global Foods', project: 'Global Foods Expansion', status: 'waiting', priority: 'medium', due: 'Today', waitingOn: 'Mike Johnson' },
  { id: 7, title: 'Prepare onboarding packet', client: 'Global Foods', project: 'Global Foods Expansion', status: 'in-progress', priority: 'low', due: 'Oct 5' },
  { id: 8, title: 'Collect shift requirements', client: 'Midwest Industries', project: 'Midwest Industries Staffing', status: 'waiting', priority: 'medium', due: 'Sep 26', overdue: true, waitingOn: 'Emily Davis' },
  { id: 9, title: 'Post openings for machine operators', client: 'Midwest Industries', project: 'Midwest Industries Staffing', status: 'todo', priority: 'high', due: 'Today, 4:00 PM' },
  { id: 10, title: 'Kickoff call with Acme Construction', client: 'Acme Construction', status: 'todo', priority: 'medium', due: 'Oct 1' },
  { id: 11, title: 'Send welcome email to David Lee', client: 'Acme Construction', status: 'done', priority: 'low', due: 'Sep 24' },
  { id: 12, title: 'Follow up on background checks', client: 'ABC Manufacturing', project: 'ABC Manufacturing Hiring', status: 'todo', priority: 'low', due: 'Oct 1' },
  { id: 13, title: 'Update hiring timeline', client: 'Global Foods', project: 'Global Foods Expansion', status: 'todo', priority: 'low', due: 'Oct 6' },
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

function Tasks() {
  return (
    <div className="tasks-page">

      <div className="page-header">
        <p className="page-description">
          Everything that needs to get done, across all clients.
        </p>

        <button>+ New Task</button>
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

    </div>
  )
}

export default Tasks