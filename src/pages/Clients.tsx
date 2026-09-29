type ClientStatus = 'active' | 'waiting' | 'onboarding'

type Client = {
  id: number
  name: string
  industry: string
  location: string
  primaryContact: string
  status: ClientStatus
  projects: number
  openTasks: number
  lastActivity: string
}

const clients: Client[] = [
  { id: 1, name: 'ABC Manufacturing', industry: 'Manufacturing', location: 'Wilmington, DE', primaryContact: 'John Smith', status: 'active', projects: 1, openTasks: 8, lastActivity: 'Today' },
  { id: 2, name: 'XYZ Logistics', industry: 'Logistics', location: 'Dover, DE', primaryContact: 'Sarah Miller', status: 'waiting', projects: 1, openTasks: 3, lastActivity: '2 days ago' },
  { id: 3, name: 'Global Foods', industry: 'Food processing', location: 'Newark, DE', primaryContact: 'Mike Johnson', status: 'active', projects: 1, openTasks: 6, lastActivity: 'Yesterday' },
  { id: 4, name: 'Midwest Industries', industry: 'Industrial supply', location: 'Middletown, DE', primaryContact: 'Emily Davis', status: 'active', projects: 1, openTasks: 7, lastActivity: '3 days ago' },
  { id: 5, name: 'Acme Construction', industry: 'Construction', location: 'Georgetown, DE', primaryContact: 'David Lee', status: 'onboarding', projects: 0, openTasks: 2, lastActivity: '1 week ago' },
]

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
          Companies you work with and where each one stands.
        </p>

        <button>+ Add Client</button>
      </div>

      <div className="page-toolbar">
        <div className="status-tabs">
          <button className="status-tab active">All</button>
          <button className="status-tab">Active</button>
          <button className="status-tab">Waiting on client</button>
          <button className="status-tab">Onboarding</button>
        </div>

        <input type="text" placeholder="Search clients..." />
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Primary contact</th>
              <th>Status</th>
              <th>Projects</th>
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
                    {client.industry}, {client.location}
                  </div>
                </td>

                <td>{client.primaryContact}</td>

                <td>
                  <span className={`status-badge status-${client.status}`}>
                    {statusLabels[client.status]}
                  </span>
                </td>

                <td>{client.projects}</td>
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