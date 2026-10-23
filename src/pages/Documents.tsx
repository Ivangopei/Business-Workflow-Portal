import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

type DocumentStatus = 'received' | 'waiting' | 'missing' | 'expiring'

type ClientDocument = {
  id: number
  name: string
  category: string
  client: string
  status: DocumentStatus
  fileName?: string
  fileSize?: string
  fileUrl?: string // prototype only: a temporary link to a file picked in this session
  date: string
}

const initialDocuments: ClientDocument[] = [
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

const categories = ['Contract', 'Form', 'License', 'Insurance', 'Tax', 'Report', 'ID', 'Other']

// 245760 -> "240 KB"
function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Today's date as "Oct 22"
function today(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type AddDocumentModalProps = {
  clientNames: string[]
  nextId: number
  onClose: () => void
  onSave: (doc: ClientDocument) => void
}

function AddDocumentModal({ clientNames, nextId, onClose, onSave }: AddDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)

    const newDocument: ClientDocument = {
      id: nextId,
      name: String(form.get('name')).trim(),
      category: String(form.get('category')),
      client: String(form.get('client')).trim(),
      status: file ? 'received' : (form.get('status') as DocumentStatus),
      fileName: file?.name,
      fileSize: file ? formatFileSize(file.size) : undefined,
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      date: file ? `Uploaded ${today()}` : `Requested ${today()}`,
    }

    onSave(newDocument)
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-document-title">
        <div className="modal-header">
          <h3 id="add-document-title">Add document</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="document-client">Client</label>
              <input
                id="document-client"
                name="client"
                type="text"
                list="document-client-options"
                placeholder="Start typing or pick a client"
                required
                autoFocus
              />
              <datalist id="document-client-options">
                {clientNames.map((name) => (
                  <option value={name} key={name} />
                ))}
              </datalist>
            </div>

            <div className="form-field">
              <label htmlFor="document-name">Document name</label>
              <input id="document-name" name="name" type="text" placeholder="e.g. Signed job descriptions" required />
            </div>

            <div className="form-field">
              <label htmlFor="document-category">Category</label>
              <select id="document-category" name="category" defaultValue="Contract">
                {categories.map((category) => (
                  <option value={category} key={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="document-file">File (optional)</label>
              <input
                id="document-file"
                type="file"
                className="file-input"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              {file && (
                <span className="file-picked">
                  {file.name}, {formatFileSize(file.size)}
                </span>
              )}
            </div>

            {!file && (
              <div className="form-field">
                <label htmlFor="document-status">Status</label>
                <select id="document-status" name="status" defaultValue="missing">
                  <option value="missing">Missing</option>
                  <option value="waiting">Waiting on client</option>
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit">{file ? 'Upload document' : 'Add to checklist'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Documents() {
  const [documents, setDocuments] = useState<ClientDocument[]>(initialDocuments)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Every client name, each one only once:
  // ['ABC Manufacturing', 'XYZ Logistics', 'Global Foods', ...]
  const clientNames = [...new Set(documents.map((doc) => doc.client))]

  function handleSave(newDocument: ClientDocument) {
    setDocuments([...documents, newDocument])
    setIsModalOpen(false)
  }

  return (
    <div className="documents-page">

      <div className="page-header">
        <p className="page-description">
          Paperwork for every client, and what's still missing.
        </p>

        <button onClick={() => setIsModalOpen(true)}>+ Upload Document</button>
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
                        {doc.fileUrl ? (
                          <a
                            className="secondary-button"
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          <button className="secondary-button">
                            {doc.fileName ? 'View' : 'Upload'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      {isModalOpen && (
        <AddDocumentModal
          clientNames={clientNames}
          nextId={Math.max(...documents.map((doc) => doc.id)) + 1}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

    </div>
  )
}

export default Documents