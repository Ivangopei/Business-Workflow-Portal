import { useState } from 'react'
import type { FormEvent } from 'react'

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

const initialFollowUps: FollowUp[] = [
  /* your 7 follow-ups, unchanged */
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

// "2026-10-25" (from a date input) -> a Date at local midnight.
function parseDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Decide which section a follow-up belongs in, based on its date.
function getGroup(date: Date): FollowUpGroup {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const oneWeekFromToday = new Date(today)
  oneWeekFromToday.setDate(today.getDate() + 7)

  if (date < today) return 'overdue'
  if (date.getTime() === today.getTime()) return 'today'
  if (date < oneWeekFromToday) return 'this-week'
  return 'later'
}

// "14:30" (from a time input) -> "2:30 PM"
function formatTime(value: string): string {
  const [hours, minutes] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

type AddFollowUpModalProps = {
  contacts: { name: string; company: string; lastContacted: string }[]
  nextId: number
  onClose: () => void
  onSave: (followUp: FollowUp) => void
}

function AddFollowUpModal({ contacts, nextId, onClose, onSave }: AddFollowUpModalProps) {
  const contactNames = [...new Set(contacts.map((c) => c.name))]
  const companyNames = [...new Set(contacts.map((c) => c.company))]

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const contactName = String(form.get('contact')).trim()
    const date = parseDateInput(String(form.get('date')))
    const time = String(form.get('time'))
    const group = getGroup(date)

    const dateText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    // Today's follow-ups show just the time (like "11:00 AM"); others show the date.
    let due = dateText
    if (time) {
      due = group === 'today' ? formatTime(time) : `${dateText}, ${formatTime(time)}`
    }

    // If you've followed up with this person before, carry over when you last spoke.
    const existing = contacts.find((c) => c.name === contactName)

    const newFollowUp: FollowUp = {
      id: nextId,
      subject: String(form.get('subject')).trim(),
      contact: contactName,
      company: String(form.get('company')).trim(),
      method: form.get('method') as FollowUpMethod,
      group: group,
      due: due,
      lastContacted: existing ? existing.lastContacted : 'never',
    }

    onSave(newFollowUp)
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-followup-title">
        <div className="modal-header">
          <h3 id="add-followup-title">New follow-up</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="followup-subject">What is it about?</label>
              <input id="followup-subject" name="subject" type="text" placeholder="e.g. Check on signed job descriptions" required autoFocus />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="followup-contact">Person</label>
                <input id="followup-contact" name="contact" type="text" list="followup-contact-options" required />
                <datalist id="followup-contact-options">
                  {contactNames.map((name) => (
                    <option value={name} key={name} />
                  ))}
                </datalist>
              </div>

              <div className="form-field">
                <label htmlFor="followup-company">Company</label>
                <input id="followup-company" name="company" type="text" list="followup-company-options" required />
                <datalist id="followup-company-options">
                  {companyNames.map((name) => (
                    <option value={name} key={name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="followup-method">How</label>
              <select id="followup-method" name="method" defaultValue="call">
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="followup-date">Date</label>
                <input id="followup-date" name="date" type="date" required />
              </div>

              <div className="form-field">
                <label htmlFor="followup-time">Time (optional)</label>
                <input id="followup-time" name="time" type="time" />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit">Add follow-up</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FollowUps() {
  const [followUps, setFollowUps] = useState<FollowUp[]>(initialFollowUps)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleSave(newFollowUp: FollowUp) {
    setFollowUps([...followUps, newFollowUp])
    setIsModalOpen(false)
  }

  return (
    <div className="followups-page">

      <div className="page-header">
        <p className="page-description">
          People you need to get back to, sorted by when.
        </p>

        <button onClick={() => setIsModalOpen(true)}>+ New Follow-up</button>
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

      {isModalOpen && (
        <AddFollowUpModal
          contacts={followUps.map((item) => ({
            name: item.contact,
            company: item.company,
            lastContacted: item.lastContacted,
          }))}
          nextId={Math.max(...followUps.map((item) => item.id)) + 1}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

    </div>
  )
}

export default FollowUps