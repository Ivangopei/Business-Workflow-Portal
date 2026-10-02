
function Projects() {
  const projects = [
    {
      name: 'ABC Manufacturing Hiring',
      company: 'ABC Manufacturing',
      tasks: 12,
      completed: 4,
      waiting: 2,
    },
    {
      name: 'XYZ Logistics Recruitment',
      company: 'XYZ Logistics',
      tasks: 8,
      completed: 5,
      waiting: 1,
    },
    {
      name: 'Global Foods Expansion',
      company: 'Global Foods',
      tasks: 15,
      completed: 9,
      waiting: 2,
    },
    {
      name: 'Midwest Industries Staffing',
      company: 'Midwest Industries',
      tasks: 10,
      completed: 3,
      waiting: 3,
    },
  ]

  return (
    <div className="projects-page">

      <div className="page-header">
        <div>
          <p className="page-description">
            Manage ongoing work and projects.
          </p>
        </div>

        <button>+ New Project</button>
      </div>


      <div className="projects-grid">

        {projects.map((project) => {
          const progress = Math.round(
            (project.completed / project.tasks) * 100
          )

          return (
            <div className="project-card" key={project.name}>

              <div className="project-card-header">
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.company}</p>
                </div>

                <span className="project-status">
                  Active
                </span>
              </div>


              <div className="project-stats">

                <div>
                  <span className="project-stat-number">
                    {project.tasks}
                  </span>

                  <span className="project-stat-label">
                    Tasks
                  </span>
                </div>


                <div>
                  <span className="project-stat-number">
                    {project.completed}
                  </span>

                  <span className="project-stat-label">
                    Completed
                  </span>
                </div>


                <div>
                  <span className="project-stat-number">
                    {project.waiting}
                  </span>

                  <span className="project-stat-label">
                    Waiting
                  </span>
                </div>

              </div>


              <div className="project-progress">

                <div className="project-progress-header">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

              </div>


              <div className="project-card-footer">
                <span>Last updated recently</span>

                <button className="view-project-button">
                  View Project
                </button>
              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}

export default Projects