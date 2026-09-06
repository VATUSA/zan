import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { API_URL, VATSIM_AUTH_URL, VATSIM_CLIENT_ID, VATSIM_REDIRECT_URI, missingAuthConfig } from '../config'

const AuthContext = createContext(null)
const OAUTH_STATE_KEY = 'vatsim_oauth_state'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // React StrictMode runs effects twice in development. window.history.replaceState below
  // already strips ?code from the URL before the second invocation would run, so this isn't
  // guarding against a duplicate token exchange - it's guarding the state check itself,
  // since sessionStorage.removeItem happens on the first pass and would make a second pass
  // (if one ever ran, e.g. from a fast remount) fail verification for no real reason.
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      const returnedState = params.get('state')
      const savedState = sessionStorage.getItem(OAUTH_STATE_KEY)
      sessionStorage.removeItem(OAUTH_STATE_KEY)
      window.history.replaceState({}, '', window.location.pathname)

      if (!savedState || returnedState !== savedState) {
        setError('That login could not be verified. Please try logging in again.')
        setLoading(false)
        return
      }
      exchangeCodeForUser(code)
    } else {
      checkExistingSession()
    }
  }, [])

  const checkExistingSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (err) {
      // no valid session, stay logged out
    } finally {
      setLoading(false)
    }
  }

  const exchangeCodeForUser = async (code) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/auth/callback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        setUser(data)
      }
    } catch (err) {
      setError('Could not reach backend server')
    } finally {
      setLoading(false)
    }
  }

  const loginWithVatsim = () => {
    if (missingAuthConfig.length > 0) {
      setError(`Login is not configured (missing ${missingAuthConfig.join(', ')})`)
      return
    }
    // A random, single-use value that VATSIM echoes back on redirect. Without it, an
    // attacker could send a victim to /?code=<attacker's own code>&state=..., and if the
    // victim is logged into the attacker's account when the exchange completes, the victim
    // ends up acting as the attacker (a login CSRF). Checking this value on return is what
    // ties the callback to the login this browser actually started.
    const state = crypto.randomUUID()
    sessionStorage.setItem(OAUTH_STATE_KEY, state)

    const params = new URLSearchParams({
      client_id: VATSIM_CLIENT_ID,
      redirect_uri: VATSIM_REDIRECT_URI,
      response_type: 'code',
      scope: 'full_name email vatsim_details',
      prompt: 'login',
      state,
    })
    window.location.href = `${VATSIM_AUTH_URL}?${params.toString()}`
  }

  const loginAsDev = async (cid) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/auth/dev-login/${cid}`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Dev login failed')
      } else {
        setUser(data)
      }
    } catch (err) {
      setError('Could not reach backend server')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, loginWithVatsim, loginAsDev, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}