import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../config'

function UserSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    let cancelled = false
    // Wait 300ms after the last keystroke before searching
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${API_URL}/api/admin/users?q=${encodeURIComponent(term)}`,
          { credentials: 'include' }
        )
        if (!cancelled && res.ok) {
          setResults(await res.json())
          setSearched(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)

    // If the query changes again before this fires/finishes, ignore this run
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, CID or initials..."
        className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-ink placeholder:text-muted3 focus:outline-none focus:border-gold"
      />

      {loading && <p className="text-muted2 text-sm mt-4">Searching...</p>}

      {!loading && searched && results.length === 0 && (
        <p className="text-muted2 text-sm mt-4">No one on the ZAN roster matches that.</p>
      )}

      <div className="mt-4 space-y-2">
        {results.map((m) => (
          <Link
            key={m.cid}
            to={`/roster/member/${m.cid}`}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] px-5 py-3.5 transition-colors"
          >
            <div>
              <div className="font-semibold">
                {m.fname} {m.lname}
                <span className="text-muted3 font-normal text-sm ml-2">CID {m.cid}</span>
              </div>
              <div className="text-xs text-muted2 mt-1">
                {m.membership === 'home' ? 'Home' : 'Visitor'}
                {m.endorsements.length > 0 && ` · ${m.endorsements.join(', ')}`}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
              {m.initials && (
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple/15 text-purple font-mono">
                  {m.initials}
                </span>
              )}
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-gold/15 text-gold">
                {m.rating}
              </span>
              {m.role && <span className="text-xs font-bold text-teal">{m.role}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default UserSearch