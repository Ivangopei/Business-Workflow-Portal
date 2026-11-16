// Client service: business logic for clients (ATL-2, ATL-3) and the login form.
//
// Pure functions only: validation, mapping API rows to what the UI shows, filtering.
// The server checks the same rules again (server/app/schemas.py); checking here
// first gives the user instant feedback without a round trip.

import { apiRequest } from '../api/apiClient'

export type ClientType = 'business' | 'individual'
export type ClientStatus = 'active' | 'waiting' | 'onboarding'
export type Program = 'h2a' | 'h2b' | 'eb3'

export const ALL_PROGRAMS: Program[] = ['h2a', 'h2b', 'eb3']

// What the Clients page shows for each row.
export type Client = {
  id: number
  name: string
  type: ClientType
  industry?: string
  location: string
  primaryContact: string
  status: ClientStatus
  programs: Program[]
  openTasks: number
}

// What GET/POST /api/clients returns (snake_case, nullable columns).
export type ClientRow = {
  id: number
  name: string
  type: ClientType
  industry: string | null
  location: string | null
  status: ClientStatus
  primary_contact: string | null
  primary_email: string | null
  primary_phone: string | null
  programs: Program[] | null
  open_tasks: number | null
}

// What the "Add client" form collects.
export type NewClientInput = {
  name: string
  type: ClientType
  industry?: string
  location?: string
  primaryContact?: string
  status: ClientStatus
  programs: string[]
}

// Body sent to POST /api/clients.
export type ClientCreateBody = {
  name: string
  type: ClientType
  industry: string | null
  location: string | null
  primary_contact: string | null
  status: ClientStatus
  programs: Program[]
}

export type ClientFilters = {
  program: Program | 'all'
  status: ClientStatus | 'all'
  type: ClientType | 'all'
  search: string
}

export const MAX_NAME_LENGTH = 200

function isProgram(value: string): value is Program {
  return (ALL_PROGRAMS as string[]).includes(value)
}

export function validateLoginInput(email: string, password: string): string | null {
  const trimmed = email.trim()
  if (!trimmed || !password) return 'Enter your email and password.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.'
  return null
}

export function validateClientInput(input: NewClientInput): string[] {
  const errors: string[] = []
  const name = input.name.trim()

  if (!name) errors.push('Name is required.')
  else if (name.length > MAX_NAME_LENGTH) errors.push(`Name must be ${MAX_NAME_LENGTH} characters or fewer.`)

  if (input.type !== 'business' && input.type !== 'individual') {
    errors.push('Choose business or individual.')
  }

  const unknown = input.programs.filter((program) => !isProgram(program))
  if (unknown.length > 0) errors.push(`Unknown program: ${unknown.join(', ')}.`)

  return errors
}

// Turns valid form input into the API body: trims text, blanks become null,
// industry is dropped for individuals, duplicate programs are removed.
export function toCreateBody(input: NewClientInput): ClientCreateBody {
  const clean = (value?: string) => value?.trim() || null

  return {
    name: input.name.trim(),
    type: input.type,
    industry: input.type === 'business' ? clean(input.industry) : null,
    location: clean(input.location),
    primary_contact: clean(input.primaryContact),
    status: input.status,
    programs: [...new Set(input.programs.filter(isProgram))],
  }
}

// API row -> UI shape. Individuals with no contact name show their email or phone.
export function fromApiRow(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    industry: row.industry ?? undefined,
    location: row.location ?? '',
    primaryContact: row.primary_contact ?? row.primary_email ?? row.primary_phone ?? '—',
    status: row.status,
    programs: (row.programs ?? []).filter(isProgram),
    openTasks: row.open_tasks ?? 0,
  }
}

export function filterClients(clients: Client[], filters: ClientFilters): Client[] {
  const term = filters.search.trim().toLowerCase()

  return clients.filter((client) => {
    if (filters.program !== 'all' && !client.programs.includes(filters.program)) return false
    if (filters.status !== 'all' && client.status !== filters.status) return false
    if (filters.type !== 'all' && client.type !== filters.type) return false
    if (!term) return true

    return [client.name, client.industry, client.location, client.primaryContact]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(term)
  })
}

export function countByProgram(clients: Client[], program: Program): number {
  return clients.filter((client) => client.programs.includes(program)).length
}

// --- API calls -------------------------------------------------------------

export async function fetchClients(): Promise<Client[]> {
  const rows = await apiRequest<ClientRow[]>('/api/clients')
  return rows.map(fromApiRow)
}

export async function saveClient(input: NewClientInput): Promise<Client> {
  const row = await apiRequest<ClientRow>('/api/clients', {
    method: 'POST',
    body: JSON.stringify(toCreateBody(input)),
  })
  return fromApiRow(row)
}
