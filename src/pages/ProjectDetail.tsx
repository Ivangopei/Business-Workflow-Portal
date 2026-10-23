import { Link, useParams } from 'react-router-dom'
import type { Project } from '../data/projects'
import { getProjectStats, programLabels, projectStatusLabels } from '../data/projects'

const taskStatusLabels = {
  todo: 'To do',
  'in-progress': 'In progress',
  waiting: 'Waiting on',
  done: 'Done',
}

const priorityLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

type ProjectDetailProps = {
  projects: Project[]
}

function ProjectDetail({ projects }: ProjectDetailProps) {
  // For the URL /projects/3, projectId is the string "3"
  const { projectId } = useParams()

  const project = projects.find((p) => p.id === Number(projectId))

  if (!project) {
    return (
      <div className="project-detail-page">
        <Link className="back-link" to="/projects">← All projects</Link>
        <p className="page-description">This project doesn't exist.</p>
      </div>
    )
  }

  const stats = getProjectStats(project)

  return (
    <div className="project-detail-page">

      <Link className="back-link" to="/projects">← All projects</Link>

      <div className="project-detail-header">
        <div>
          <h3>{project.name}</h3>
          <p>
            {project.client}{' '}
            <span className={`program-tag program-${project.program}`}>
              {programLabels[project.program]}
            </span>
          </p>
        </div>

        <span className={`project-status project-status-${project.status}`}>
          {projectStatusLabels[project.status]}
        </span>
      </div>

      <div className="project-stats project-detail-stats">
        <div>
          <span className="project-stat-number">{stats.total}</span>
          <span className="project-stat-label">Tasks</span>
        </div>
        <div>
          <span className="project-stat-number">{stats.completed}</span>
          <span className="project-stat-label">Completed</span>
        </div>
        <div>
          <span className="project-stat-number">{stats.waiting}</span>
          <span className="project-stat-label">Waiting</span>
        </div>
        <div>
          <span className="project-stat-number">{stats.progress}%</span>
          <span className="project-stat-label">Progress</span>
        </div>
      </div>

      <h3 className="project-section-title">Tasks</h3>

      {stats.projectTasks.length === 0 ? (
        <p className="empty-state">No tasks in this project yet.</p>
      ) : (
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
              {stats.projectTasks.map((task) => (
                <tr key={task.id} className={task.status === 'done' ? 'task-done' : ''}>
                  <td>
                    <div className="task-title">{task.title}</div>
                  </td>

                  <td>
                    <span className={`status-badge status-${task.status}`}>
                      {taskStatusLabels[task.status]}
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
      )}

    </div>
  )
}

export default ProjectDetail