import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { hasMinimumRole } from '../utils/roles'

const CATEGORIES = ['Enroute', 'TRACON', 'Local']

function EventDetail() {
  const { id } = useParams()
  const { user, loginWithVatsim } = useAuth()
  const [event, setEvent] = useState(null)
  const [positions, setPositions] = useState([])
  const [signups, setSignups] = useState([])
  const [newPosition, setNewPosition] = useState('')
  const [newCategory, setNewCategory] = useState('Enroute')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isStaff = hasMinimumRole(user?.zanRole, 'EC')

  const load = () => {
    fetch(`http://localhost:4000/api/events/${id}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then((data) => {
        setEvent(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Event not found, or not available yet.')
        setLoading(false)
      })

    fetch(`http://localhost:4000/api/events/${id}/positions`, { credentials: 'include' })
      .then((res) => res.json())
      .then(setPositions)

    fetch(`http://localhost:4000/api/events/${id}/signups`, { credentials: 'include' })
      .then((res) => res.json())
      .then(setSignups)
  }

  useEffect(load, [id, user])

  const toggleVisibility = async () => {
    await fetch(`http://localhost:4000/api/events/${id}/visibility`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hidden: !event.hidden }),
    })
    load()
  }

  const addPosition = async () => {
    if (!newPosition.trim()) return
    await fetch(`http://localhost:4000/api/events/${id}/positions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPosition.trim().toUpperCase(), category: newCategory }),
    })
    setNewPosition('')
    load()
  }

  const removePosition = async (posId) => {
    await fetch(`http://localhost:4000/api/events/${id}/positions/${posId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    load()
  }

  const signUp = async (posId) => {
    await fetch(`http://localhost:4000/api/events/${id}/positions/${posId}/signup`, {
      method: 'POST',
      credentials: 'include',
    })
    load()
  }

  const approveSignup = async (signupId) => {
    await fetch(`http://localhost:4000/api/events/signups/${signupId}/approve`, {
      method: 'PUT',
      credentials: 'include',
    })
    load()
  }

  const denySignup = async (signupId) => {
    await fetch(`http://localhost:4000/api/events/signups/${signupId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    load()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy text-ink font-mulish">
        <Navbar />
        <p className="text-muted2 text-center py-24">Loading...</p>
        <Footer />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-navy text-ink font-mulish">
        <Navbar />
        <p className="text-muted2 text-center py-24">{error}</p>
        <Footer />
      </div>
    )
  }

  const startDate = new Date(event.start_time * 1000)

  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />

      <div className="max-w-[800px] mx-auto px-10 py-16">
        <Link to="/events" className="text-sm text-muted2 hover:text-ink mb-6 inline-block">
          ← All events
        </Link>

        {event.banner_image_url && (
          <div className="w-full max-h-[320px] overflow-hidden bg-[#101E42] rounded-2xl mb-8">
            <img src={event.banner_image_url} alt="" className="w-full h-full object-contain" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-bold text-teal">
            {startDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            {' · '}
            {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}z
          </span>
          {event.hidden && (
            <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold text-xs font-bold">Hidden</span>
          )}
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-4">{event.title}</h1>
        <p className="text-muted leading-relaxed whitespace-pre-line mb-10">{event.body}</p>

        {isStaff && (
          <div className="rounded-2xl bg-gold/[0.06] border border-gold/20 p-6 mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg">Staff Controls</h2>
              <button
                onClick={toggleVisibility}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${
                  event.hidden ? 'bg-teal/20 text-teal hover:bg-teal/30' : 'bg-white/10 text-muted2 hover:bg-white/15'
                }`}
              >
                {event.hidden ? 'Publish event' : 'Hide event'}
              </button>
            </div>

            <div className="text-sm font-semibold text-muted2 mb-2">Add Position</div>
            <div className="flex gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-ink"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value.toUpperCase())}
                placeholder="e.g. ANC_APP or LCL_1"
                className="flex-1 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-sm text-ink placeholder:text-muted3"
              />
              <button
                onClick={addPosition}
                className="px-4 py-2 rounded-lg bg-gold hover:bg-goldLight text-navy font-bold text-sm"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div>
          <h2 className="font-bold text-lg mb-5">Positions</h2>

          {positions.length === 0 && (
            <p className="text-muted2">No positions have been posted for this event yet.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => {
              const categoryPositions = positions.filter((p) => p.category === category)
              if (categoryPositions.length === 0) return null

              return (
                <div key={category}>
                  <h3 className="font-extrabold tracking-tight mb-3">{category} Positions</h3>
                  <div className="rounded-xl border border-white/10 overflow-hidden divide-y divide-white/10">
                    {categoryPositions.map((p) => {
                      const posSignups = signups.filter((s) => s.position_id === p.id)
                      const approved = posSignups.filter((s) => s.status === 'approved')
                      const myOwn = posSignups.find((s) => s.cid === user?.cid)

                      return (
                        <div key={p.id} className="px-4 py-3 bg-white/[0.02]">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-sm">{p.name}</span>
                            <div className="flex items-center gap-1.5">
                              {!user && (
                                <button
                                  onClick={loginWithVatsim}
                                  className="w-7 h-7 grid place-items-center rounded-lg bg-teal/20 text-teal hover:bg-teal/30"
                                  title="Log in to sign up"
                                >
                                  +
                                </button>
                              )}
                              {user && !myOwn && (
                                <button
                                  onClick={() => signUp(p.id)}
                                  className="w-7 h-7 grid place-items-center rounded-lg bg-teal/20 text-teal hover:bg-teal/30"
                                  title="Sign up"
                                >
                                  +
                                </button>
                              )}
                              {myOwn && myOwn.status === 'pending' && (
                                <span className="text-xs font-bold text-gold" title="Awaiting staff approval">
                                  Pending
                                </span>
                              )}
                              {isStaff && (
                                <button
                                  onClick={() => removePosition(p.id)}
                                  className="w-7 h-7 grid place-items-center rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                  title="Remove position"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="mt-1.5 space-y-0.5">
                            {approved.length === 0 && (
                              <div className="text-xs text-muted3">Vacant</div>
                            )}
                            {approved.map((s) => (
                              <div key={s.id} className="text-xs text-muted3">{s.name}</div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {isStaff && signups.some((s) => s.status === 'pending') && (
            <div className="mt-8">
              <h3 className="font-bold text-sm text-muted2 uppercase tracking-wide mb-3">Pending Signup Requests</h3>
              <div className="space-y-2">
                {signups.filter((s) => s.status === 'pending').map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gold/[0.06] border border-gold/20"
                  >
                    <span className="text-sm">
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-muted3"> — {s.position_name}</span>
                    </span>
                    <div className="flex gap-3">
                      <button onClick={() => approveSignup(s.id)} className="text-teal hover:underline text-xs font-bold">
                        ✓ Approve
                      </button>
                      <button onClick={() => denySignup(s.id)} className="text-red-400 hover:underline text-xs font-bold">
                        ✗ Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default EventDetail