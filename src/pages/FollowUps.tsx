
type FollowUpMethod = 'call' | 'email' | 'meeting'
type FollowUpGroup = 'overdue' | 'today' | 'this-week' | 'later'

type FollowUp = {
  id: number
  subject: string
  contact: string
  company: string
  method: FollowUpMethod
  group: FollowUpGroup
  due: string
  lastContacted: string
}

const followUps: FollowUp[] = [
  { id: 1, subject: 'Check on signed job descriptions', contact: 'Sarah Miller', company: 'XYZ Logistics', method: 'email', group: 'overdue', due: 'Sep 25', lastContacted: 'Sep 18' },
  { id: 2, subject: 'Get shift requirements for new roles', contact: 'Emily Davis', company: 'Midwest Industries', method: 'call', group: 'overdue', due: 'Sep 26', lastContacted: 'Sep 19' },
  { id: 3, subject: 'Confirm start dates for new hires', contact: 'Mike Johnson', company: 'Global Foods', method: 'call', group: 'today', due: '11:00 AM', lastContacted: 'Sep 24' },
  { id: 4, subject: 'Weekly hiring check-in', contact: 'John Smith', company: 'ABC Manufacturing', method: 'meeting', group: 'today', due: '3:30 PM', lastContacted: 'Sep 21' },
  { id: 5, subject: 'Kickoff call to discuss hiring needs', contact: 'David Lee', company: 'Acme Construction', method: 'call', group: 'this-week', due: 'Oct 1', lastContacted: 'Sep 24' },
  { id: 6, subject: 'Share interview schedule', contact: 'Sarah Miller', company: 'XYZ Logistics', method: 'email', group: 'this-week', due: 'Oct 2', lastContacted: 'Sep 18' },
  { id: 7, subject: 'Send background check results', contact: 'John Smith', company: 'ABC Manufacturing', method: 'email', group: 'later', due: 'Oct 8', lastContacted: 'Sep 21' },
]

const groups: { key: FollowUpGroup; label: string }[] = [
  { key: 'overdue', label: 'Overdue' },
  { key: 'today', label: 'Today' },
  { key: 'this-week', label: 'This week' },
  { key: 'later', label: 'Later' },
]

const methodLabels: Record<FollowUpMethod, string> = {
  call: 'Call',
  email: 'Email',
  meeting: 'Meeting',
}

function FollowUps() {
  return (
    <div className="followups-page">

      <div className="page-header">
        <p className="page-description">
          People you need to get back to, sorted by when.
        </p>

        <button>+ New Follow-up</button>
      </div>

      <div className="page-toolbar">
        <div className="status-tabs">
          <button className="status-tab active">Upcoming</button>
          <button className="status-tab">Completed</button>
        </div>

        <input type="text" placeholder="Search follow-ups..." />
      </div>

      {groups.map((group) => {
        const items = followUps.filter((item) => item.group === group.key)

        if (items.length === 0) {
          return null
        }

        return (
          <section className={`followup-group group-${group.key}`} key={group.key}>
            <h3 className="followup-group-title">
              {group.label}
              <span className="followup-count">{items.length}</span>
            </h3>

            <div className="followup-list">
              {items.map((item) => (
                <div className="followup-row" key={item.id}>
                  <span className={`method-pill method-${item.method}`}>
                    {methodLabels[item.method]}
                  </span>

                  <div>
                    <div className="followup-subject">{item.subject}</div>
                    <div className="followup-person">
                      {item.contact}, {item.company}
                    </div>
                  </div>

                  <div className="followup-timing">
                    <div className="followup-due">{item.due}</div>
                    <div className="followup-last">
                      Last contact {item.lastContacted}
                    </div>
                  </div>

                  <button className="secondary-button">Mark done</button>
                </div>
              ))}
            </div>
          </section>
        )
      })}

    </div>
  )
}

export default FollowUps