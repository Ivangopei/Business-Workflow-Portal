import { useState } from 'react'
import type { FormEvent } from 'react'

type ClientType = 'business' | 'individual'
type ClientStatus = 'active' | 'waiting' | 'onboarding'
type Program = 'h2a' | 'h2b' | 'eb3'

type Client = {
  id: number
  name: string
  type: ClientType
  industry?: string
  location: string
  primaryContact: string
  status: ClientStatus
  programs: Program[]
  openTasks: number
  lastActivity: string
}

const initialClients: Client[] = [
  { id: 1, name: 'ABC Manufacturing', type: 'business', industry: 'Manufacturing', location: 'Wilmington, DE', primaryContact: 'John Smith', status: 'active', programs: ['h2b', 'eb3'], openTasks: 8, lastActivity: 'Today' },
  { id: 2, name: 'XYZ Logistics', type: 'business', industry: 'Logistics', location: 'Dover, DE', primaryContact: 'Sarah Miller', status: 'waiting', programs: ['h2b'], openTasks: 3, lastActivity: '2 days ago' },
  { id: 3, name: 'Global Foods', type: 'business', industry: 'Food processing', location: 'Newark, DE', primaryContact: 'Mike Johnson', status: 'active', programs: ['h2a', 'h2b'], openTasks: 6, lastActivity: 'Yesterday' },
  { id: 4, name: 'Midwest Industries', type: 'business', industry: 'Industrial supply', location: 'Middletown, DE', primaryContact: 'Emily Davis', status: 'active', programs: ['eb3'], openTasks: 7, lastActivity: '3 days ago' },
  { id: 5, name: 'Acme Construction', type: 'business', industry: 'Construction', location: 'Georgetown, DE', primaryContact: 'David Lee', status: 'onboarding', programs: ['h2b'], openTasks: 2, lastActivity: '1 week ago' },
  { id: 6, name: 'Green Valley Farms', type: 'business', industry: 'Agriculture', location: 'Smyrna, DE', primaryContact: 'Tom Baker', status: 'active', programs: ['h2a'], openTasks: 4, lastActivity: '2 days ago' },
  { id: 7, name: 'Maria Lopez', type: 'individual', location: 'Dover, DE', primaryContact: 'maria.lopez@email.com', status: 'waiting', programs: ['eb3'], openTasks: 2, lastActivity: 'Yesterday' },
  { id: 8, name: 'Andrei Popescu', type: 'individual', location: 'Newark, DE', primaryContact: '(302) 555-0148', status: 'onboarding', programs: ['eb3'], openTasks: 1, lastActivity: '4 days ago' },
]

const allPrograms: Program[] = ['h2a', 'h2b', 'eb3']

const programLabels: Record<Program, string> = {
  h2a: 'H-2A',
  h2b: 'H-2B',
  eb3: 'EB-3',
}

const statusLabels: Record<ClientStatus, string> = {
  active: 'Active',
  waiting: 'Waiting on client',
  onboarding: 'Onboarding',
}

type AddClientModalProps = {
  onClose: () => void
  onSave: (client: Client) => void
  nextId: number
}

function AddClientModal({ onClose, onSave, nextId }: AddClientModalProps) {
  const [clientType, setClientType] = useState<ClientType>('business')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const newClient: Client = {
      id: nextId,
      name: String(form.get('name')).trim(),
      type: clientType,
      industry: clientType === 'business' ? String(form.get('industry')).trim() : undefined,
      location: String(form.get('location')).trim(),
      primaryContact: String(form.get('contact')).trim(),
      status: form.get('status') as ClientStatus,
      programs: form.getAll('programs') as Program[],
      openTasks: 0,
      lastActivity: 'Just now',
    }

    onSave(newClient)
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-client-title">
        <div className="modal-header">
          <h3 id="add-client-title">Add client</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <span className="form-label">Client type</span>
              <div className="type-toggle">
                <button
                  type="button"
                  className={clientType === 'business' ? 'active' : ''}
                  onClick={() => setClientType('business')}
                >
                  Business
                </button>
                <button
                  type="button"
                  className={clientType === 'individual' ? 'active' : ''}
                  onClick={() => setClientType('individual')}
                >
                  Individual
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="client-name">
                {clientType === 'business' ? 'Company name' : 'Full name'}
              </label>
              <input id="client-name" name="name" type="text" required autoFocus />
            </div>

            {clientType === 'business' && (
              <div className="form-field">
                <label htmlFor="client-industry">Industry</label>
                <input id="client-industry" name="industry" type="text" placeholder="e.g. Agriculture" />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="client-location">Location</label>
              <input id="client-location" name="location" type="text" placeholder="City, State" required />
            </div>

            <div className="form-field">
              <label htmlFor="client-contact">
                {clientType === 'business' ? 'Primary contact' : 'Email or phone'}
              </label>
              <input id="client-contact" name="contact" type="text" required />
            </div>

            <fieldset className="form-field program-options">
              <legend className="form-label">Programs</legend>
              {allPrograms.map((program) => (
                <label className="checkbox-option" key={program}>
                  <input type="checkbox" name="programs" value={program} />
                  {programLabels[program]}
                </label>
              ))}
            </fieldset>

            <div className="form-field">
              <label htmlFor="client-status">Status</label>
              <select id="client-status" name="status" defaultValue="onboarding">
                <option value="onboarding">Onboarding</option>
                <option value="active">Active</option>
                <option value="waiting">Waiting on client</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit">Add client</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Clients() {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleSave(newClient: Client) {
    setClients([...clients, newClient])
    setIsModalOpen(false)
  }

  return (
    <div className="clients-page">

      <div className="page-header">
        <p className="page-description">
          Businesses and individuals you work with, by program.
        </p>

        <button onClick={() => setIsModalOpen(true)}>+ Add Client</button>
      </div>

      <div className="page-toolbar">
        <div className="status-tabs">
          <button className="status-tab active">
            All clients <span className="tab-count">{clients.length}</span>
          </button>

          {allPrograms.map((program) => (
            <button className="status-tab" key={program}>
              {programLabels[program]}{' '}
              <span className="tab-count">
                {clients.filter((client) => client.programs.includes(program)).length}
              </span>
            </button>
          ))}
        </div>

        <div className="toolbar-filters">
          <select defaultValue="all" aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="waiting">Waiting on client</option>
            <option value="onboarding">Onboarding</option>
          </select>

          <select defaultValue="all" aria-label="Filter by client type">
            <option value="all">All types</option>
            <option value="business">Businesses</option>
            <option value="individual">Individuals</option>
          </select>

          <input type="text" placeholder="Search clients..." />
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Programs</th>
              <th>Primary contact</th>
              <th>Status</th>
              <th>Open tasks</th>
              <th>Last activity</th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>
                  <div className="client-name">{client.name}</div>
                  <div className="client-meta">
                    {client.type === 'business'
                      ? `Business, ${client.industry ? client.industry + ', ' : ''}${client.location}`
                      : `Individual, ${client.location}`}
                  </div>
                </td>

                <td>
                  <div className="program-tags">
                    {client.programs.map((program) => (
                      <span className={`program-tag program-${program}`} key={program}>
                        {programLabels[program]}
                      </span>
                    ))}
                  </div>
                </td>

                <td>{client.primaryContact}</td>

                <td>
                  <span className={`status-badge status-${client.status}`}>
                    {statusLabels[client.status]}
                  </span>
                </td>

                <td>{client.openTasks}</td>
                <td>{client.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AddClientModal
          nextId={Math.max(...clients.map((client) => client.id)) + 1}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

    </div>
  )
}

export default Clients