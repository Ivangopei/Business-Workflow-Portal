type ActivityType = 'task' | 'follow-up' | 'client' | 'contact' | 'project' | 'note'
type ActivityDay = 'today' | 'yesterday' | 'earlier'

type ActivityEvent = {
  id: number
  type: ActivityType
  day: ActivityDay
  time: string
  action: string
  target: string
  context: string
  detail?: string
}

const activity: ActivityEvent[] = [
  { id: 1, type: 'task', day: 'today', time: '10:15 AM', action: 'Started task', target: 'Call John Smith about open positions', context: 'ABC Manufacturing Hiring' },
  { id: 2, type: 'note', day: 'today', time: '9:40 AM', action: 'Logged a call with', target: 'Mike Johnson', context: 'Global Foods', detail: 'Start dates are waiting on HR approval. Expect an answer today.' },
  { id: 3, type: 'task', day: 'today', time: '9:05 AM', action: 'Marked as waiting on Sarah Miller', target: 'Get signed job descriptions', context: 'XYZ Logistics Recruitment' },
  { id: 4, type: 'project', day: 'yesterday', time: '4:20 PM', action: 'Updated progress on', target: 'Global Foods Expansion', context: '9 of 15 tasks completed' },
  { id: 5, type: 'contact', day: 'yesterday', time: '2:10 PM', action: 'Added contact', target: 'David Lee', context: 'Acme Construction' },
  { id: 6, type: 'follow-up', day: 'yesterday', time: '11:30 AM', action: 'Scheduled follow-up', target: 'Weekly hiring check-in', context: 'John Smith, ABC Manufacturing' },
  { id: 7, type: 'task', day: 'earlier', time: 'Sep 24', action: 'Completed task', target: 'Send welcome email to David Lee', context: 'Acme Construction' },
  { id: 8, type: 'client', day: 'earlier', time: 'Sep 24', action: 'Added client', target: 'Acme Construction', context: 'Status set to Onboarding' },
  { id: 9, type: 'client', day: 'earlier', time: 'Sep 22', action: 'Changed status of', target: 'XYZ Logistics', context: 'Active to Waiting on client' },
]

const days: { key: ActivityDay; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'earlier', label: 'Earlier' },
]

const typeLabels: Record<ActivityType, string> = {
  task: 'Task',
  'follow-up': 'Follow-up',
  client: 'Client',
  contact: 'Contact',
  project: 'Project',
  note: 'Note',
}

function Activity() {
  return (
    <div className="activity-page">

      <div className="page-header">
        <p className="page-description">
          A history of changes across clients, projects, and tasks.
        </p>
      </div>

      <div className="page-toolbar">
        <div className="status-tabs">
          <button className="status-tab active">All</button>
          <button className="status-tab">Tasks</button>
          <button className="status-tab">Follow-ups</button>
          <button className="status-tab">Clients</button>
          <button className="status-tab">Notes</button>
        </div>

        <input type="text" placeholder="Search activity..." />
      </div>

      {days.map((day) => {
        const events = activity.filter((event) => event.day === day.key)

        if (events.length === 0) {
          return null
        }

        return (
          <section className="activity-day" key={day.key}>
            <h3 className="activity-day-title">{day.label}</h3>

            <div className="activity-card">
              <ul className="activity-timeline">
                {events.map((event) => (
                  <li className="activity-item" key={event.id}>
                    <span className={`activity-dot dot-${event.type}`} />

                    <div className="activity-body">
                      <p className="activity-text">
                        {event.action} <strong>{event.target}</strong>
                      </p>

                      <p className="activity-context">
                        {typeLabels[event.type]}, {event.context}
                      </p>

                      {event.detail && (
                        <p className="activity-detail">{event.detail}</p>
                      )}
                    </div>

                    <span className="activity-time">{event.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )
      })}

    </div>
  )
}

export default Activity