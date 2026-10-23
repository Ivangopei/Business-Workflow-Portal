import { useState } from 'react'
import type { FormEvent } from 'react'

type Contact = {
  id: number
  name: string
  company: string
  role: string
  email: string
  phone: string
}

const initialContacts: Contact[] = [
  { id: 1, name: 'John Smith', company: 'ABC Manufacturing', role: 'HR Manager', email: 'john@abcmanufacturing.com', phone: '(555) 123-4567' },
  { id: 2, name: 'Sarah Miller', company: 'XYZ Logistics', role: 'Recruiter', email: 'sarah@xyzlogistics.com', phone: '(555) 234-5678' },
  { id: 3, name: 'Mike Johnson', company: 'Global Foods', role: 'Owner', email: 'mike@globalfoods.com', phone: '(555) 345-6789' },
  { id: 4, name: 'Emily Davis', company: 'Midwest Industries', role: 'Operations Manager', email: 'emily@midwestindustries.com', phone: '(555) 456-7890' },
]

type AddContactModalProps = {
  companies: string[]
  nextId: number
  onClose: () => void
  onSave: (contact: Contact) => void
}

function AddContactModal({ companies, nextId, onClose, onSave }: AddContactModalProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const newContact: Contact = {
      id: nextId,
      name: String(form.get('name')).trim(),
      company: String(form.get('company')).trim(),
      role: String(form.get('role')).trim(),
      email: String(form.get('email')).trim(),
      phone: String(form.get('phone')).trim(),
    }

    onSave(newContact)
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-contact-title">
        <div className="modal-header">
          <h3 id="add-contact-title">Add contact</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="contact-name">Full name</label>
              <input id="contact-name" name="name" type="text" required autoFocus />
            </div>

            <div className="form-field">
              <label htmlFor="contact-company">Company</label>
              <input
                id="contact-company"
                name="company"
                type="text"
                list="company-options"
                placeholder="Start typing or pick a company"
                required
              />
              <datalist id="company-options">
                {companies.map((company) => (
                  <option value={company} key={company} />
                ))}
              </datalist>
            </div>

            <div className="form-field">
              <label htmlFor="contact-role">Role</label>
              <input id="contact-role" name="role" type="text" placeholder="e.g. HR Manager" />
            </div>

            <div className="form-field">
              <label htmlFor="contact-email">Email</label>
              <input id="contact-email" name="email" type="email" placeholder="name@company.com" />
            </div>

            <div className="form-field">
              <label htmlFor="contact-phone">Phone</label>
              <input id="contact-phone" name="phone" type="tel" placeholder="(555) 123-4567" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit">Add contact</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Every company, each one only once. Recomputed whenever contacts change,
  // so a company typed into the form shows up in the filter right away.
  const companies = [...new Set(contacts.map((contact) => contact.company))]

  function handleSave(newContact: Contact) {
    setContacts([...contacts, newContact])
    setIsModalOpen(false)
  }

  return (
    <div className="contacts-page">

      <div className="page-header">
        <div>
          <p className="page-description">
            Manage the people you work with.
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)}>+ Add Contact</button>
      </div>

      <div className="contact-filters">
        <input
          type="text"
          placeholder="Search contacts..."
        />

        <select aria-label="Filter by company">
          <option>All Companies</option>
          {companies.map((company) => (
            <option key={company}>{company}</option>
          ))}
        </select>
      </div>

      <div className="contacts-table-container">

        <table className="contacts-table">

          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Role</th>
              <th>Contact</th>
            </tr>
          </thead>

          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>
                  <div className="contact-name">
                    {contact.name}
                  </div>
                </td>

                <td>
                  {contact.company}
                </td>

                <td>
                  {contact.role}
                </td>

                <td>
                  <div className="contact-info">
                    <span>{contact.email}</span>
                    <span>{contact.phone}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {isModalOpen && (
        <AddContactModal
          companies={companies}
          nextId={Math.max(...contacts.map((contact) => contact.id)) + 1}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

    </div>
  )
}

export default Contacts