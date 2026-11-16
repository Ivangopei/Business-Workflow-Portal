import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ALL_PROGRAMS,
  countByProgram,
  fetchClients,
  filterClients,
  saveClient,
  validateClientInput,
} from '../services/clientService'
import type { Client, ClientFilters, ClientStatus, ClientType, Program } from '../services/clientService'

// UI layer for ATL-2 / ATL-3. Clients are loaded from and saved to the API;
// validation and filtering live in services/clientService.ts.

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
  onSaved: (client: Client) => void
}

function AddClientModal({ onClose, onSaved }: AddClientModalProps) {
  const [clientType, setClientType] = useState<ClientType>('business')
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const input = {
      name: String(form.get('name') ?? ''),
      type: clientType,
      industry: String(form.get('industry') ?? ''),
      location: String(form.get('location') ?? ''),
      primaryContact: String(form.get('contact') ?? ''),
      status: form.get('status') as ClientStatus,
      programs: form.getAll('programs').map(String),
    }

    const problems = validateClientInput(input)
    if (problems.length > 0) {
      setErrors(problems)
      return
    }

    setSaving(true)
    setErrors([])
    try {
      const saved = await saveClient(input)
      onSaved(saved)
    } catch (err) {
      // e.g. server validation error, database down, or lost connection
      setErrors([err instanceof Error ? err.message : 'Could not save the client.'])
      setSaving(false)
    }
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

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {errors.length > 0 && (
              <ul className="form-errors" role="alert">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}

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
              <input id="client-name" name="name" type="text" maxLength={200} autoFocus />
            </div>

            {clientType === 'business' && (
              <div className="form-field">
                <label htmlFor="client-industry">Industry</label>
                <input id="client-industry" name="industry" type="text" placeholder="e.g. Agriculture" />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="client-location">Location</label>
              <input id="client-location" name="location" type="text" placeholder="City, State" />
            </div>

            <div className="form-field">
              <label htmlFor="client-contact">
                {clientType === 'business' ? 'Primary contact' : 'Email or phone'}
              </label>
              <input id="client-contact" name="contact" type="text" />
            </div>

            <fieldset className="form-field program-options">
              <legend className="form-label">Programs</legend>
              {ALL_PROGRAMS.map((program) => (
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
            <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add client'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState<ClientFilters>({
    program: 'all',
    status: 'all',
    type: 'all',
    search: '',
  })

  function requestClients() {
    return fetchClients()
      .then((list) => {
        setClients(list)
        setLoadError(null)
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }

  // Load once when the page opens. (loading already starts as true.)
  useEffect(() => {
    requestClients()
  }, [])

  // "Try again" button after a failed load.
  function retryLoad() {
    setLoading(true)
    setLoadError(null)
    requestClients()
  }

  // ATL-2: a saved client shows up in the list right away, without reloading.
  function handleSaved(newClient: Client) {
    setClients((current) =>
      [...current, newClient].sort((a, b) => a.name.localeCompare(b.name)),
    )
    setIsModalOpen(false)
  }

  const visibleClients = filterClients(clients, filters)

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
          <button
            className={`status-tab${filters.program === 'all' ? ' active' : ''}`}
            onClick={() => setFilters({ ...filters, program: 'all' })}
          >
            All clients <span className="tab-count">{clients.length}</span>
          </button>

          {ALL_PROGRAMS.map((program) => (
            <button
              className={`status-tab${filters.program === program ? ' active' : ''}`}
              key={program}
              onClick={() => setFilters({ ...filters, program })}
            >
              {programLabels[program]}{' '}
              <span className="tab-count">{countByProgram(clients, program)}</span>
            </button>
          ))}
        </div>

        <div className="toolbar-filters">
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value as ClientFilters['status'] })}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="waiting">Waiting on client</option>
            <option value="onboarding">Onboarding</option>
          </select>

          <select
            value={filters.type}
            onChange={(event) => setFilters({ ...filters, type: event.target.value as ClientFilters['type'] })}
            aria-label="Filter by client type"
          >
            <option value="all">All types</option>
            <option value="business">Businesses</option>
            <option value="individual">Individuals</option>
          </select>

          <input
            type="text"
            placeholder="Search clients..."
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          />
        </div>
      </div>

      {loadError && (
        <div className="load-error" role="alert">
          <span>Couldn't load clients: {loadError}</span>
          <button className="secondary-button" onClick={retryLoad}>Try again</button>
        </div>
      )}

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Programs</th>
              <th>Primary contact</th>
              <th>Status</th>
              <th>Open tasks</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="table-empty">Loading clients…</td>
              </tr>
            )}

            {!loading && !loadError && visibleClients.length === 0 && (
              <tr>
                <td colSpan={5} className="table-empty">
                  {clients.length === 0 ? 'No clients yet. Add your first one.' : 'No clients match these filters.'}
                </td>
              </tr>
            )}

            {!loading && visibleClients.map((client) => (
              <tr key={client.id}>
                <td>
                  <div className="client-name">{client.name}</div>
                  <div className="client-meta">
                    {client.type === 'business'
                      ? `Business${client.industry ? ', ' + client.industry : ''}${client.location ? ', ' + client.location : ''}`
                      : `Individual${client.location ? ', ' + client.location : ''}`}
                  </div>
                </td>

                <td>
                  <div className="program-tags">
                    {client.programs.length === 0 && <span className="client-meta">None</span>}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <AddClientModal
          onClose={() => setIsModalOpen(false)}
          onSaved={handleSaved}
        />
      )}

    </div>
  )
}

export default Clients
