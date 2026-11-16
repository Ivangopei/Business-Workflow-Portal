// Auth state for the whole app (Observer pattern via React Context):
// AuthProvider holds who is signed in, and any component that calls useAuth()
// re-renders automatically when that changes (sign in, sign out, token expired).

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiRequest, getToken, setToken, setUnauthorizedHandler } from '../api/apiClient'

export type User = {
  id: number
  email: string
  name: string
}

type LoginResponse = {
  access_token: string
  token_type: string
  user: User
}

type AuthState = {
  user: User | null
  checking: boolean // true while we check a token saved from a previous visit
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(() => getToken() !== null)

  const signOut = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  // Any 401 from the API (expired token, etc.) signs the user out.
  useEffect(() => {
    setUnauthorizedHandler(signOut)
  }, [signOut])

  // If a token was saved last time, ask the API whether it is still valid.
  useEffect(() => {
    if (!getToken()) return

    apiRequest<User>('/api/auth/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setChecking(false))
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(result.access_token)
    setUser(result.user)
  }, [])

  const value = useMemo(() => ({ user, checking, signIn, signOut }), [user, checking, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
