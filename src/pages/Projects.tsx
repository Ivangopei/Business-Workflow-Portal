import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { getProjectStats, programLabels, projectStatusLabels } from '../data/projects'
import type { Project, ProjectStatus, Program } from '../data/projects'

type AddProjectModalProps = {
  clientNames: string[]
  nextId: number
  onClose: () => void
  onSave: (project: Project) => void
}

function AddProjectModal({ clientNames, nextId, onClose, onSave }: AddProjectModalProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const newProject: Project = {
      id: nextId,
      name: String(form.get('name')).trim(),
      client: String(form.get('client')).trim(),
      program: form.get('program') as Program,
      status: form.get('status') as ProjectStatus,
    }

    onSave(newProject)
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-project-title">
        <div className="modal-header">
          <h3 id="add-project-title">New project</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="project-name">Project name</label>
              <input id="project-name" name="name" type="text" placeholder="e.g. ABC Manufacturing H-2B 2027" required autoFocus />
            </div>

            <div className="form-field">
              <label htmlFor="project-client">Client</label>
              <input id="project-client" name="client" type="text" list="project-client-options" placeholder="Start typing or pick a client" required />
              <datalist id="project-client-options">
                {clientNames.map((name) => (
                  <option value={name} key={name} />
                ))}
              </datalist>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="project-program">Program</label>
                <select id="project-program" name="program" defaultValue="h2b">
                  <option value="h2a">H-2A</option>
                  <option value="h2b">H-2B</option>
                  <option value="eb3">EB-3</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="project-status">Status</label>
                <select id="project-status" name="status" defaultValue="active">
                  <option value="active">Active</option>
                  <option value="on-hold">On hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit">Create project</button>
          </div>
        </form>
      </div>
    </div>
  )
}

type ProjectsProps = {
  projects: Project[]
  onAddProject: (project: Project) => void
}

function Projects({ projects, onAddProject }: ProjectsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const clientNames = [...new Set(projects.map((project) => project.client))]

  function handleSave(newProject: Project) {
    onAddProject(newProject)
    setIsModalOpen(false)
  }

  return (
    <div className="projects-page">

      <div className="page-header">
        <div>
          <p className="page-description">
            Manage ongoing work and projects.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)}>+ New Project</button>
      </div>

      <div className="projects-grid">

        {projects.map((project) => {
          const stats = getProjectStats(project)

          return (
            <div className="project-card" key={project.id}>

              <div className="project-card-header">
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

              <div className="project-stats">
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
              </div>

              <div className="project-progress">
                <div className="project-progress-header">
                  <span>Progress</span>
                  <span>{stats.progress}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>

              <div className="project-card-footer">
                <span>Last updated recently</span>

                <Link className="view-project-button" to={`/projects/${project.id}`}>
                  View Project
                </Link>
              </div>

            </div>
          )
        })}

      </div>

      {isModalOpen && (
        <AddProjectModal
          clientNames={clientNames}
          nextId={Math.max(...projects.map((project) => project.id)) + 1}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

    </div>
  )
}

export default Projects