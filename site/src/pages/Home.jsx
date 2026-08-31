import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const firstName = user?.name?.split(' ')[0]

  useEffect(() => {
    fetch('http://localhost:4000/api/events', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setEvents(data.slice(0, 2)))
      .catch(() => setEvents([]))
  }, [user])

  return (
    <div className="bg-navy text-ink font-mulish">
      {/* Header */}
      <Navbar />

      {/* Welcome banner - only shown when logged in */}
      {user && (
        <section className="px-10 pt-16 pb-10">
          <div className="max-w-[1180px] mx-auto">
            <div className="rounded-3xl bg-gradient-to-br from-gold/15 via-purple/10 to-transparent border border-white/10 px-10 py-12">
              <p className="text-sm font-bold text-gold uppercase tracking-widest mb-2">Welcome back</p>
              <h2 className="text-5xl font-extrabold tracking-tight">{firstName}</h2>
              {user.zanRole && (
                <p className="mt-3 text-muted2">
                  You hold the <span className="text-teal font-semibold">{user.zanRole}</span> role at ZAN.
                </p>
              )}
              {!user.zanRole && user.isZanVisitor && (
                <p className="mt-3 text-muted2">You're a visiting controller at ZAN.</p>
              )}
              {!user.zanRole && !user.isZanVisitor && (
                <p className="mt-3 text-muted2">
                  Not yet visiting ZAN —{' '}
                  <Link to="/apply" className="text-gold font-semibold hover:underline">apply to visit</Link>.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Hero */}
      <section className="relative px-10 pt-20 pb-24 overflow-hidden">
        <div className="absolute -inset-x-8 -top-[18%] h-[96%] pointer-events-none">
          <div className="absolute left-[-4%] top-[-22%] w-[70%] h-[120%] rounded-full blur-[60px] mix-blend-screen"
               style={{ background: 'radial-gradient(58% 46% at 50% 50%, rgba(63,217,168,.5), rgba(63,217,168,0) 72%)', animation: 'aurA 30s ease-in-out infinite' }} />
          <div className="absolute left-[28%] top-[-32%] w-[64%] h-[126%] rounded-full blur-[66px] mix-blend-screen"
               style={{ background: 'radial-gradient(52% 44% at 50% 50%, rgba(180,140,232,.42), rgba(180,140,232,0) 72%)', animation: 'aurB 38s ease-in-out infinite' }} />
        </div>

        <div className="relative max-w-[1180px] mx-auto">
          <h1 className="max-w-[14ch] font-extrabold uppercase leading-[0.86] tracking-tighter text-[clamp(48px,10vw,150px)]">
            The top of the <span className="text-gold">world.</span>
          </h1>
          <p className="max-w-[46ch] mt-9 text-lg text-muted leading-relaxed">
            Anchorage Center works 2.4 million square miles — the Panhandle to the Pole, and straight across the date line. The largest airspace in the country, and the quietest frequency you will ever be trusted with.
          </p>
          <div className="flex gap-3 mt-10 flex-wrap">
            <Link to="/apply" className="flex items-center gap-2 px-7 py-4 bg-gold hover:bg-goldLight text-navy font-bold text-[15px] rounded-full">
              Fly here tonight <span>→</span>
            </Link>
            <a href="#airspace" className="flex items-center gap-2 px-7 py-4 border border-white/30 hover:border-white hover:bg-white/[0.06] text-ink font-bold text-[15px] rounded-full">
              See the airspace
            </a>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-12 text-sm font-semibold text-muted2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal" style={{ animation: 'livedot 2.4s ease-out infinite' }} />
            <span className="text-ink">4 controllers on frequency · 31 pilots in the FIR</span>
          </div>
        </div>
      </section>

      {/* Airspace section (static sector cards, no live map) */}
      <section id="airspace" className="px-10 pb-28">
        <div className="max-w-[1180px] mx-auto">
          <h2 className="max-w-[18ch] font-extrabold leading-tight tracking-tight text-[clamp(28px,3.6vw,46px)]">
            Flat maps lie about Alaska.
          </h2>
          <p className="max-w-[52ch] mt-5 text-muted leading-relaxed">
            Look down at the pole instead and the point of this place is obvious — Asia to North America is a curve over the top, and the curve lands in our airspace.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-14">
            <div className="p-5 rounded-2xl bg-white/[0.04] hover:bg-purple/10 cursor-pointer">
              <div className="flex items-center gap-2 font-bold text-[15px]">
                <span className="w-2 h-2 rounded-full bg-purple" />
                Arctic CTA
              </div>
              <div className="mt-2 text-sm text-muted2">Polar 1 · 2 · 3 · 4, all the way to 90° N.</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.04] hover:bg-gold/10 cursor-pointer">
              <div className="flex items-center gap-2 font-bold text-[15px]">
                <span className="w-2 h-2 rounded-full bg-gold" />
                Anchorage Center
              </div>
              <div className="mt-2 text-sm text-muted2">Alaska, the Panhandle and the Aleutian chain.</div>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.04] hover:bg-teal/10 cursor-pointer">
              <div className="flex items-center gap-2 font-bold text-[15px]">
                <span className="w-2 h-2 rounded-full bg-teal" />
                Oceanic
              </div>
              <div className="mt-2 text-sm text-muted2">Non-radar. NOPAC tracks, Asia to North America.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote / transition */}
      <section className="px-10">
        <div className="max-w-[1180px] mx-auto py-16 border-t border-b border-white/[0.14]">
          <p className="max-w-[22ch] font-bold text-ink leading-tight tracking-tight text-[clamp(28px,4vw,54px)]">
            The only center that can hand you off <span className="text-gold">into tomorrow.</span>
          </p>
          <p className="max-w-[48ch] mt-5 text-muted2">
            Cross 180° westbound and you lose a day. Come back and you get it back.
          </p>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="px-10 py-24">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex items-baseline gap-5 flex-wrap">
            <h2 className="font-extrabold leading-tight tracking-tight text-[clamp(28px,3.4vw,44px)]">Next up</h2>
            <Link to="/events" className="ml-auto font-bold text-[14.5px]">All events →</Link>
          </div>

          {events.length === 0 && (
            <p className="text-muted mt-9">No upcoming events right now — check back soon.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-9">
            {events.map((event) => {
              const startDate = new Date(event.start_time * 1000)
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block rounded-3xl bg-[#0A1330] hover:bg-[#0D183C] overflow-hidden"
                >
                  {event.banner_image_url ? (
                    <img src={event.banner_image_url} alt="" className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="aspect-video bg-[#101E42] grid place-items-center">
                      <span className="text-xs font-semibold text-[#4E5A7A]">Event image</span>
                    </div>
                  )}
                  <div className="px-7 pt-6 pb-8">
                    <div className="text-[13.5px] font-bold text-teal">
                      {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}
                      {startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}z
                    </div>
                    <h3 className="mt-3.5 font-extrabold text-2xl tracking-tight">{event.title}</h3>
                    <p className="mt-2.5 text-muted leading-relaxed line-clamp-3">{event.body}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Join */}
      <section id="join" className="px-10 pb-28">
        <div className="max-w-[1180px] mx-auto">
          <h2 className="max-w-[16ch] font-extrabold leading-tight tracking-tight text-[clamp(28px,3.4vw,44px)]">
            Two ways in.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-9">
            <div className="p-9 rounded-3xl bg-white/[0.04]">
              <h3 className="font-extrabold text-xl tracking-tight">Fly it</h3>
              <p className="mt-3.5 text-muted leading-relaxed">Half our airspace is non-radar, so you will make position reports and mean it. Charts, routes and the NOPAC tracks are all here.</p>
              <Link to="/files" className="inline-flex mt-6 px-6 py-3.5 rounded-full bg-gold hover:bg-goldLight text-navy font-bold text-[14.5px]">Pilot resources</Link>
            </div>
            <div className="p-9 rounded-3xl bg-white/[0.04]">
              <h3 className="font-extrabold text-xl tracking-tight">Control it</h3>
              <p className="mt-3.5 text-muted leading-relaxed">Train here and you learn oceanic procedure, non-radar separation and terrain — the things most facilities never touch. Visiting controllers welcome from S2.</p>
              <Link to="/apply" className="inline-flex mt-6 px-6 py-3.5 rounded-full border border-white/30 hover:border-white hover:bg-white/[0.06] text-ink font-bold text-[14.5px]">Apply to ZAN</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home