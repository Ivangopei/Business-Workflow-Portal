function Dashboard() {
  const todayTasks = [
    {
      title: 'Call ABC Manufacturing',
      time: 'Today',
      priority: 'High priority',
    },
    {
      title: 'Send candidate list to John',
      time: 'Today',
      priority: 'Medium priority',
    },
    {
      title: 'Review immigration documents',
      time: '2:00 PM',
      priority: '',
    },
  ]

  const followUps = [
    {
      name: 'John Smith',
      company: 'ABC Manufacturing',
      description: 'Follow up about open positions',
      due: 'Due tomorrow',
    },
    {
      name: 'Sarah Miller',
      company: 'XYZ Logistics',
      description: 'Check if they reviewed candidates',
      due: 'Due Friday',
    },
  ]

  const waitingOn = [
    {
      company: 'ABC Manufacturing',
      waitingFor: 'Job descriptions',
      since: 'Sep 24',
    },
    {
      company: 'John Smith',
      waitingFor: 'Candidate requirements',
      since: 'Sep 22',
    },
  ]

  const recentActivity = [
    {
      text: 'Created task "Call ABC Manufacturing"',
      time: '2 hours ago',
    },
    {
      text: 'Added note to ABC Manufacturing',
      time: 'Yesterday',
    },
    {
      text: 'Completed "Send candidate list"',
      time: 'Yesterday',
    },
  ]

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <div>
          <h2>Good morning, Ivan. Here's what needs your attention.</h2>
        </div>
      </div>

      <div className="summary-grid">

        <div className="summary-card">
          <span className="summary-label">Open Tasks</span>
          <span className="summary-number">12</span>
        </div>

        <div className="summary-card">
          <span className="summary-label">Due Today</span>
          <span className="summary-number">4</span>
        </div>

        <div className="summary-card">
          <span className="summary-label">Follow-ups</span>
          <span className="summary-number">7</span>
        </div>

        <div className="summary-card">
          <span className="summary-label">Waiting On</span>
          <span className="summary-number">3</span>
        </div>

      </div>

      <div className="dashboard-grid">

        <section className="dashboard-section">
          <div className="section-header">
            <h3>Today's Tasks</h3>
            <button className="section-link">View all</button>
          </div>

          <div className="dashboard-card">

            {todayTasks.map((task) => (
              <div className="task-row" key={task.title}>

                <div className="task-checkbox"></div>

                <div className="task-content">
                  <span className="task-title">
                    {task.title}
                  </span>

                  <span className="task-meta">
                    {task.time}

                    {task.priority && (
                      <>
                        <span className="task-separator">·</span>
                        <span
                          className={
                            task.priority === 'High priority'
                              ? 'priority-high'
                              : 'priority-medium'
                          }
                        >
                          {task.priority}
                        </span>
                      </>
                    )}
                  </span>
                </div>

              </div>
            ))}

          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h3>Follow-ups</h3>
            <button className="section-link">View all</button>
          </div>

          <div className="dashboard-card">

            {followUps.map((followUp) => (
              <div
                className="follow-up-row"
                key={followUp.name}
              >
                <div className="follow-up-content">

                  <span className="follow-up-name">
                    {followUp.name}
                  </span>

                  <span className="follow-up-company">
                    {followUp.company}
                  </span>

                  <span className="follow-up-description">
                    {followUp.description}
                  </span>

                  <span className="follow-up-due">
                    {followUp.due}
                  </span>

                </div>
              </div>
            ))}

          </div>
        </section>

      </div>

      <div className="dashboard-grid">

        <section className="dashboard-section">
          <div className="section-header">
            <h3>Waiting On</h3>
            <button className="section-link">View all</button>
          </div>

          <div className="dashboard-card">

            {waitingOn.map((item) => (
              <div
                className="waiting-row"
                key={item.company}
              >
                <div className="waiting-content">

                  <span className="waiting-company">
                    {item.company}
                  </span>

                  <span className="waiting-for">
                    Waiting for: {item.waitingFor}
                  </span>

                  <span className="waiting-since">
                    Since: {item.since}
                  </span>

                </div>
              </div>
            ))}

          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <button className="section-link">View all</button>
          </div>

          <div className="dashboard-card">

            {recentActivity.map((activity) => (
              <div
                className="activity-row"
                key={activity.text}
              >
                <div className="activity-dot"></div>

                <div className="activity-content">
                  <span className="activity-text">
                    {activity.text}
                  </span>

                  <span className="activity-time">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}

          </div>
        </section>

      </div>

    </div>
  )
}

export default Dashboard