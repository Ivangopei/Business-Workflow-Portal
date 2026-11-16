import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest, errorMessageFrom, setToken, setUnauthorizedHandler } from './apiClient'

// Small in-memory localStorage so the token functions work under Node.
beforeEach(() => {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  setUnauthorizedHandler(() => {})
})

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body === undefined ? '' : JSON.stringify(body), { status }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('errorMessageFrom', () => {
  it('uses a plain FastAPI detail message', () => {
    expect(errorMessageFrom({ detail: 'Incorrect email or password.' }, 401)).toBe('Incorrect email or password.')
  })

  it('joins FastAPI validation messages', () => {
    const body = { detail: [{ msg: 'Value error, Name is required.' }, { msg: "Input should be 'business' or 'individual'" }] }
    expect(errorMessageFrom(body, 422)).toBe("Name is required. Input should be 'business' or 'individual'")
  })

  it('falls back to a friendly message for server errors', () => {
    expect(errorMessageFrom(null, 503)).toBe('The server is unavailable. Try again in a minute.')
    expect(errorMessageFrom(null, 500)).toBe('Something went wrong on the server.')
  })
})

describe('apiRequest', () => {
  it('sends the saved token and returns the JSON body', async () => {
    setToken('abc123')
    const fetchMock = mockFetch(200, [{ id: 1 }])

    const result = await apiRequest<{ id: number }[]>('/api/clients')

    expect(result).toEqual([{ id: 1 }])
    const headers = fetchMock.mock.calls[0][1].headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer abc123')
  })

  it('sends no Authorization header when signed out', async () => {
    const fetchMock = mockFetch(200, {})
    await apiRequest('/api/health')
    const headers = fetchMock.mock.calls[0][1].headers as Headers
    expect(headers.has('Authorization')).toBe(false)
  })

  it('throws an ApiError with the server message on failure', async () => {
    mockFetch(422, { detail: [{ msg: 'Value error, Name is required.' }] })

    await expect(apiRequest('/api/clients', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      status: 422,
      message: 'Name is required.',
    })
  })

  it('signs the user out when a request returns 401', async () => {
    const signOut = vi.fn()
    setUnauthorizedHandler(signOut)
    mockFetch(401, { detail: 'Your session expired. Please sign in again.' })

    await expect(apiRequest('/api/clients')).rejects.toBeInstanceOf(ApiError)
    expect(signOut).toHaveBeenCalledOnce()
  })

  it('does not sign out on a wrong password at the login endpoint', async () => {
    const signOut = vi.fn()
    setUnauthorizedHandler(signOut)
    mockFetch(401, { detail: 'Incorrect email or password.' })

    await expect(apiRequest('/api/auth/login', { method: 'POST', body: '{}' })).rejects.toThrow('Incorrect email or password.')
    expect(signOut).not.toHaveBeenCalled()
  })

  it('reports a network failure clearly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(apiRequest('/api/clients')).rejects.toMatchObject({ status: 0 })
  })
})
