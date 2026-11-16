import { describe, expect, it } from 'vitest'
import {
  countByProgram,
  filterClients,
  fromApiRow,
  toCreateBody,
  validateClientInput,
  validateLoginInput,
} from './clientService'
import type { Client, ClientFilters, ClientRow, NewClientInput } from './clientService'

function input(overrides: Partial<NewClientInput> = {}): NewClientInput {
  return {
    name: 'Sunrise Dairy',
    type: 'business',
    industry: 'Dairy',
    location: 'Dover, DE',
    primaryContact: 'Ann Lee',
    status: 'onboarding',
    programs: ['h2a'],
    ...overrides,
  }
}

const clients: Client[] = [
  { id: 1, name: 'ABC Manufacturing', type: 'business', industry: 'Manufacturing', location: 'Wilmington, DE', primaryContact: 'John Smith', status: 'active', programs: ['h2b', 'eb3'], openTasks: 4 },
  { id: 3, name: 'Global Foods', type: 'business', industry: 'Food processing', location: 'Newark, DE', primaryContact: 'Mike Johnson', status: 'active', programs: ['h2a', 'h2b'], openTasks: 2 },
  { id: 7, name: 'Maria Lopez', type: 'individual', location: 'Dover, DE', primaryContact: 'maria.lopez@email.com', status: 'waiting', programs: ['eb3'], openTasks: 1 },
]

const noFilters: ClientFilters = { program: 'all', status: 'all', type: 'all', search: '' }

describe('validateLoginInput (ATL-1)', () => {
  it('accepts an email and password', () => {
    expect(validateLoginInput('demo@atlas.test', 'secret')).toBeNull()
  })

  it('asks for both fields when either is empty', () => {
    expect(validateLoginInput('', 'secret')).toBe('Enter your email and password.')
    expect(validateLoginInput('demo@atlas.test', '')).toBe('Enter your email and password.')
  })

  it('rejects text that is not an email address', () => {
    expect(validateLoginInput('demo', 'secret')).toBe('Enter a valid email address.')
  })
})

describe('validateClientInput (ATL-2)', () => {
  it('accepts a valid client', () => {
    expect(validateClientInput(input())).toEqual([])
  })

  it('requires a name', () => {
    expect(validateClientInput(input({ name: '   ' }))).toContain('Name is required.')
  })

  it('rejects an overly long name', () => {
    expect(validateClientInput(input({ name: 'x'.repeat(201) }))).toContain('Name must be 200 characters or fewer.')
  })

  it('rejects unknown programs', () => {
    expect(validateClientInput(input({ programs: ['h1b'] }))).toContain('Unknown program: h1b.')
  })

  it('allows a client with no programs yet', () => {
    expect(validateClientInput(input({ programs: [] }))).toEqual([])
  })
})

describe('toCreateBody', () => {
  it('trims text and maps to the API field names', () => {
    expect(toCreateBody(input({ name: '  Sunrise Dairy  ', primaryContact: ' Ann Lee ' }))).toEqual({
      name: 'Sunrise Dairy',
      type: 'business',
      industry: 'Dairy',
      location: 'Dover, DE',
      primary_contact: 'Ann Lee',
      status: 'onboarding',
      programs: ['h2a'],
    })
  })

  it('drops industry for individuals (ATL-2)', () => {
    expect(toCreateBody(input({ type: 'individual', industry: 'Dairy' })).industry).toBeNull()
  })

  it('turns blank optional fields into null', () => {
    const body = toCreateBody(input({ location: '  ', primaryContact: '' }))
    expect(body.location).toBeNull()
    expect(body.primary_contact).toBeNull()
  })

  it('keeps several programs and removes duplicates (ATL-3)', () => {
    expect(toCreateBody(input({ programs: ['h2a', 'h2b', 'eb3', 'h2a'] })).programs).toEqual(['h2a', 'h2b', 'eb3'])
  })
})

describe('fromApiRow', () => {
  const row: ClientRow = {
    id: 7, name: 'Maria Lopez', type: 'individual', industry: null, location: 'Dover, DE',
    status: 'waiting', primary_contact: null, primary_email: 'maria@email.com', primary_phone: null,
    programs: ['eb3'], open_tasks: 2,
  }

  it('maps snake_case API fields to the UI shape', () => {
    expect(fromApiRow(row)).toEqual({
      id: 7, name: 'Maria Lopez', type: 'individual', industry: undefined, location: 'Dover, DE',
      primaryContact: 'maria@email.com', status: 'waiting', programs: ['eb3'], openTasks: 2,
    })
  })

  it('handles missing programs, contact and counts', () => {
    const client = fromApiRow({ ...row, programs: null, primary_email: null, open_tasks: null, location: null })
    expect(client.programs).toEqual([])
    expect(client.primaryContact).toBe('—')
    expect(client.openTasks).toBe(0)
    expect(client.location).toBe('')
  })
})

describe('filterClients and countByProgram (ATL-3)', () => {
  it('shows everything with no filters', () => {
    expect(filterClients(clients, noFilters)).toHaveLength(3)
  })

  it('filters by program, including clients in several programs', () => {
    expect(filterClients(clients, { ...noFilters, program: 'h2b' }).map((c) => c.id)).toEqual([1, 3])
  })

  it('combines status, type and search filters', () => {
    expect(filterClients(clients, { ...noFilters, type: 'individual' }).map((c) => c.id)).toEqual([7])
    expect(filterClients(clients, { ...noFilters, status: 'active', search: 'newark' }).map((c) => c.id)).toEqual([3])
    expect(filterClients(clients, { ...noFilters, search: 'nobody' })).toEqual([])
  })

  it('counts clients per program tab', () => {
    expect(countByProgram(clients, 'eb3')).toBe(2)
    expect(countByProgram(clients, 'h2a')).toBe(1)
  })
})
