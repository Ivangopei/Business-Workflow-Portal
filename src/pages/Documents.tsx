type DocumentStatus = 'received' | 'waiting' | 'missing' | 'expiring'

type ClientDocument = {
  id: number
  name: string
  category: string
  client: string
  status: DocumentStatus
  fileName?: string
  fileSize?: string
  date: string
}

const documents: ClientDocument[] = [
  { id: 1, name: 'Service agreement', category: 'Contract', client: 'ABC Manufacturing', status: 'received', fileName: 'service-agreement-abc.pdf', fileSize: '240 KB', date: 'Uploaded Sep 12' },
  { id: 2, name: 'Signed job descriptions', category: 'Form', client: 'XYZ Logistics', status: 'waiting', date: 'Requested Sep 18' },
  { id: 3, name: 'Business license', category: 'License', client: 'Global Foods', status: 'expiring', fileName: 'business-license.pdf', fileSize: '180 KB', date: 'Expires Oct 15' },
  { id: 4, name: 'Insurance certificate', category: 'Insurance', client: 'ABC Manufacturing', status: 'received', fileName: 'insurance-certificate.pdf', fileSize: '310 KB', date: 'Uploaded Sep 20' },
  { id: 5, name: 'Shift requirements', category: 'Form', client: 'Midwest Industries', status: 'waiting', date: 'Requested Sep 19' },
  { id: 6, name: 'Service agreement', category: 'Contract', client: 'Acme Construction', status: 'missing', date: 'Due Oct 1' },
  { id: 7, name: 'W-9 tax form', category: 'Tax', client: 'Acme Construction', status: 'missing', date: 'Due Oct 1' },
  { id: 8, name: 'Candidate list', category: 'Report', client: 'ABC Manufacturing', status: 'received', fileName: 'candidate-list-sep.xlsx', fileSize: '85 KB', date: 'Uploaded Sep 26' },
  { id: 9, name: "Workers' comp certificate", category: 'Insurance', client: 'Midwest Industries', status: 'expiring', fileName: 'workers-comp.pdf', fileSize: '205 KB', date: 'Expires Oct 10' },
  { id: 10, name: 'Service agreement', category: 'Contract', client: 'Global Foods', status: 'received', fileName: 'service-agreement-gf.pdf', fileSize: '256 KB', date: 'Uploaded Aug 30' },
]

const statusLabels: Record<DocumentStatus, string> = {
  received: 'Received',
  waiting: 'Waiting on client',
  missing: 'Missing',
  expiring: 'Expiring soon',
}

// Every client name, each one only once:
// ['ABC Manufacturing', 'XYZ Logistics', 'Global Foods', ...]
const clientNames = [...new Set(documents.map((doc) => doc.client))]

function Documents() {
  return (
    <div className="documents-page">

      <div className="page-header">
        <p className="page-description">
          Paperwork for every client, and what's still missing.
        </p>

        <button>+ Upload Document</button>
      </div>

      <div className="page-toolbar">
        <div className="status-tabs">
          <button className="status-tab active">All</button>
          <button className="status-tab">Received</button>
          <button className="status-tab">Waiting on client</button>
          <button className="status-tab">Missing</button>
          <button className="status-tab">Expiring soon</button>
        </div>

        <input type="text" placeholder="Search documents..." />
      </div>

      {clientNames.map((clientName) => {
        const clientDocs = documents.filter((doc) => doc.client === clientName)

        return (
          <section className="document-group" key={clientName}>
            <div className="document-group-header">
              <h3>{clientName}</h3>

              <span className="document-group-count">
                {clientDocs.length} {clientDocs.length === 1 ? 'document' : 'documents'}
              </span>
            </div>

            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Status</th>
                    <th>File</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {clientDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="document-name">{doc.name}</div>
                        <div className="document-category">{doc.category}</div>
                      </td>

                      <td>
                        <span className={`status-badge status-${doc.status}`}>
                          {statusLabels[doc.status]}
                        </span>
                      </td>

                      <td>
                        {doc.fileName ? (
                          <>
                            <div className="file-name">{doc.fileName}</div>
                            <div className="file-size">{doc.fileSize}</div>
                          </>
                        ) : (
                          <span className="file-empty">No file yet</span>
                        )}
                      </td>

                      <td>{doc.date}</td>

                      <td>
                        <button className="secondary-button">
                          {doc.fileName ? 'View' : 'Upload'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

    </div>
  )
}

export default Documents