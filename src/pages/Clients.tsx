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

const clients: Client[] = [
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

function Clients() {
  return (
    <div className="clients-page">

      <div className="page-header">
        <p className="page-description">
          Businesses and individuals you work with, by program.
        </p>

        <button>+ Add Client</button>
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
                      ? `Business, ${client.industry}, ${client.location}`
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

    </div>
  )
}

export default Clients