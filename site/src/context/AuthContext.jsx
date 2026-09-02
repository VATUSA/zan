import { createContext, useContext, useState, useEffect } from 'react'
import { API_URL } from '../config'

const AuthContext = createContext(null)

const VATSIM_AUTH_URL = 'https://auth-dev.vatsim.net/oauth/authorize'
const CLIENT_ID = import.meta.env.VITE_VATSIM_CLIENT_ID
const REDIRECT_URI = 'http://localhost:5173/'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      window.history.replaceState({}, '', window.location.pathname)
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
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'full_name email vatsim_details',
      prompt: 'login',
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