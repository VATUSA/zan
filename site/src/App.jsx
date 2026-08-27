import { useState, useEffect } from 'react'

const VATSIM_AUTH_URL = 'https://auth-dev.vatsim.net/oauth/authorize'
const CLIENT_ID = import.meta.env.VITE_VATSIM_CLIENT_ID
const REDIRECT_URI = 'http://localhost:5173/'
const BACKEND_URL = 'http://localhost:4000'

function App() {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      window.history.replaceState({}, '', '/')
      exchangeCodeForUser(code)
    }
  }, [])

  const exchangeCodeForUser = async (code) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/callback`, {
        method: 'POST',
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

  const logout = () => {
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-left">
        <h1 className="text-2xl font-bold text-white mb-6">ZAN RTAC</h1>

        {!user && !loading && (
          <button
            onClick={loginWithVatsim}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg"
          >
            Login with VATSIM (sandbox)
          </button>
        )}

        {loading && <p className="text-slate-400">Exchanging code with backend...</p>}

        {error && <p className="text-red-400 text-sm break-all">Error: {error}</p>}

        {user && (
          <div className="text-slate-200 space-y-1">
            <p className="text-green-400 mb-2">✓ Logged in</p>
            <p><span className="text-slate-400">Name:</span> {user.name}</p>
            <p><span className="text-slate-400">CID:</span> {user.cid}</p>
            <p><span className="text-slate-400">Rating:</span> {user.rating}</p>
            <p><span className="text-slate-400">Division:</span> {user.division}</p>
            <p><span className="text-slate-400">Email:</span> {user.email}</p>

            <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
              <p>
                <span className="text-slate-400">ZAN Visitor:</span>{' '}
                {user.isZanVisitor ? 'Yes' : 'No'}
              </p>
              <p>
                <span className="text-slate-400">ZAN Role:</span>{' '}
                {user.zanRole ?? 'None'}
              </p>
            </div>

            {/* Role-gated content - only shows for certain ZAN roles */}
            {user.zanRole && (
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-purple-300 text-sm">
                  Staff controls visible here (holds role: {user.zanRole})
                </p>
              </div>
            )}

            <button
              onClick={logout}
              className="mt-4 text-sm text-slate-400 hover:text-white"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
