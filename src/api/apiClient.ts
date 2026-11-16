// API client: the one place the frontend talks to the backend.
//
// Every request goes through apiRequest(), which
//   - adds the saved login token as "Authorization: Bearer <token>"
//   - turns error responses into an ApiError with a readable message
//   - tells the app to sign out when the server says 401 (expired or bad token)
//
// Pages never call fetch() directly. That keeps the UI layer free of HTTP details
// and gives one place to change if the API address or auth scheme changes.

// In development Vite forwards /api to localhost:8000 (vite.config.ts).
// In production Vercel forwards /api to the Render backend (vercel.json).
// VITE_API_URL can point somewhere else if needed.
const API_BASE = import.meta.env.VITE_API_URL ?? ''

const TOKEN_KEY = 'atlas.token'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// localStorage can throw (private mode, blocked storage), so every access is guarded.
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Ignore: the user just won't stay signed in after a refresh.
  }
}

// AuthProvider registers a handler here so a 401 anywhere signs the user out.
let onUnauthorized: () => void = () => {}
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

// FastAPI errors look like {"detail": "message"} or, for validation errors,
// {"detail": [{"loc": [..., "name"], "msg": "..."}]}. Turn either into one sentence.
export function errorMessageFrom(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = (body as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item: { msg?: string }) => (item.msg ?? 'Invalid value').replace(/^Value error, /, ''))
        .join(' ')
    }
  }
  if (status === 503) return 'The server is unavailable. Try again in a minute.'
  if (status >= 500) return 'Something went wrong on the server.'
  return `Request failed (${status}).`
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body) headers.set('Content-Type', 'application/json')

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.')
  }

  // Read the body once; some error responses aren't JSON.
  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = null
    }
  }

  if (!response.ok) {
    // A 401 on the login request itself just means a wrong password, not a lost session.
    if (response.status === 401 && path !== '/api/auth/login') onUnauthorized()
    throw new ApiError(response.status, errorMessageFrom(body, response.status))
  }

  return body as T
}
