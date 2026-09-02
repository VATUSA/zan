import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config'

function Events() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/events`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setEvents(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load events')
        setLoading(false)
      })
  }, [user])

  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />

      <div className="max-w-[900px] mx-auto px-10 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Events</h1>
        <p className="text-muted mb-12">Upcoming events at Anchorage ARTCC.</p>

        {loading && <p className="text-muted2">Loading events...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <p className="text-muted2">No upcoming events right now — check back soon.</p>
        )}

        <div className="space-y-5">
          {events.map((event) => {
            const startDate = new Date(event.start_time * 1000)
            return (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="block rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] overflow-hidden transition-colors"
              >
                {event.banner_image_url && (
                  <div className="w-full max-h-[220px] overflow-hidden bg-[#101E42]">
                    <img src={event.banner_image_url} alt="" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-teal">
                      {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}z
                    </span>
                    {event.hidden && (
                      <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold text-xs font-bold">
                        Hidden
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight mt-2">{event.title}</h2>
                  <p className="text-muted mt-2 leading-relaxed line-clamp-2">{event.body}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Events