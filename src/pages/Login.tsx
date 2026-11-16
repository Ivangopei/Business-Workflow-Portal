import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { validateLoginInput } from '../services/clientService'

// ATL-1: correct email + password opens the dashboard; wrong ones show an error.
function Login() {
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    const problem = validateLoginInput(email, password)
    if (problem) {
      setError(problem)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <h1>Atlas</h1>
        <p className="login-subtitle">Sign in to your client workspace</p>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" name="email" type="email" autoComplete="username" autoFocus />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" />
        </div>

        <button type="submit" className="login-button" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

export default Login
