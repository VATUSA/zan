import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import Weather from '../components/Weather'
import { apiGet } from '../utils/api'

// Used when an event has no banner image, so the cards still have some colour.
const EVENT_FALLBACKS = [
  'from-[#1B2C5E] via-[#0E1A40] to-[#2A1F5E]',
  'from-[#0E3A44] via-[#0E1A40] to-[#3A2A5E]',
  'from-[#3A2A5E] via-[#0E1A40] to-[#0E3A44]',
]

function Home() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])

  const canApply = !user || !user.isZanVisitor

  const quickLinks = [
    { to: '/roster', title: 'Roster', blurb: 'Home and visiting controllers', accent: 'border-t-gold' },
    { to: '/files', title: 'Files', blurb: 'SOPs, LOAs and training', accent: 'border-t-teal' },
    { to: '/events', title: 'Events', blurb: 'Sign up for a position', accent: 'border-t-purple' },
    ...(canApply
      ? [{ to: '/apply', title: 'Apply to visit', blurb: 'Open to S3 and above', accent: 'border-t-goldLight' }]
      : []),
  ]

  useEffect(() => {
    apiGet('/api/events')
      .then((data) => setEvents(data.slice(0, 3)))
      .catch(() => setEvents([]))
  }, [user])

  return (
    <div className="bg-navy text-ink font-mulish">
      <Navbar />

      {/* Hero */}
      <section className="relative px-6 sm:px-10 pt-14 pb-16 overflow-hidden">
        <div className="absolute -inset-x-8 -top-[18%] h-[96%] pointer-events-none">
          <div className="absolute left-[-4%] top-[-22%] w-[70%] h-[120%] rounded-full blur-[60px] mix-blend-screen"
               style={{ background: 'radial-gradient(58% 46% at 50% 50%, rgba(63,217,168,.5), rgba(63,217,168,0) 72%)', animation: 'aurA 30s ease-in-out infinite' }} />
          <div className="absolute left-[28%] top-[-32%] w-[64%] h-[126%] rounded-full blur-[66px] mix-blend-screen"
               style={{ background: 'radial-gradient(52% 44% at 50% 50%, rgba(180,140,232,.42), rgba(180,140,232,0) 72%)', animation: 'aurB 38s ease-in-out infinite' }} />
        </div>

        <div className="relative max-w-[1180px] mx-auto">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] text-[13px] font-bold text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-teal" style={{ animation: 'livedot 2.4s ease-out infinite' }} />
            Live on VATSIM
          </div>
          <h1 className="mt-6 max-w-[12ch] font-extrabold uppercase leading-[0.9] tracking-tighter text-[clamp(44px,7.2vw,104px)]">
            The top of the <span className="text-gold">world.</span>
          </h1>
          <p className="max-w-[48ch] mt-6 text-lg text-muted leading-relaxed">
            2.4 million square miles — the Panhandle to the Pole, straight across the date line. The largest airspace in the country.
          </p>
          <div className="flex gap-3 mt-8 flex-wrap">
            <Link to="/apply" className="flex items-center gap-2 px-7 py-4 bg-gold hover:bg-goldLight text-navy font-bold text-[15px] rounded-full">
              Control here tonight <span aria-hidden="true">→</span>
            </Link>
            <a href="#airspace" className="flex items-center gap-2 px-7 py-4 border border-white/30 hover:border-white hover:bg-white/[0.06] text-ink font-bold text-[15px] rounded-full">
              Explore the airspace
            </a>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="px-6 sm:px-10 pb-14">
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center justify-between gap-4 px-6 py-[22px] rounded-[20px] bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] border-t-2 ${link.accent}`}
            >
              <span>
                <span className="block font-extrabold text-lg tracking-tight">{link.title}</span>
                <span className="block mt-1 text-[13.5px] font-semibold text-muted2">{link.blurb}</span>
              </span>
              <span aria-hidden="true" className="flex-none w-9 h-9 rounded-full border border-white/20 grid place-items-center text-muted">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Division-wide announcement */}
      <section className="px-6 sm:px-10 pb-20">
        <div className="max-w-[1180px] mx-auto rounded-[28px] border border-white/10 bg-gradient-to-br from-purple/10 via-transparent to-gold/10 p-8 md:p-11">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-9 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-gold/15 text-gold text-[11.5px] font-extrabold uppercase tracking-[0.14em]">
                Division-wide announcement
              </span>
              <h2 className="mt-[18px] font-extrabold leading-[1.15] tracking-tight text-[clamp(24px,2.6vw,34px)]">
                Any S3 controller in the division can fly and control here — starting now.
              </h2>
              <p className="max-w-[56ch] mt-3.5 text-muted leading-relaxed text-[15.5px]">
                VATUSA2 has granted every home controller rated S3 or above inherent visiting privileges at
                Anchorage — no activity requirement, no visiting roster, unless you're going for a Tier 2 endorsement.
              </p>

              <div className="flex items-center flex-wrap gap-x-6 gap-y-4 mt-6">
                <Link to="/apply" className="inline-flex items-center gap-2 px-6 py-3.5 bg-gold hover:bg-goldLight text-navy font-bold text-[14.5px] rounded-full">
                  Get started at ZAN <span aria-hidden="true">→</span>
                </Link>
              </div>

              <details className="mt-6 group">
                <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-bold text-muted hover:text-gold">
                  <span className="transition-transform group-open:rotate-90">▸</span>
                  Read the full letter from VATUSA2
                </summary>
                <div className="mt-5 pl-6 border-l-2 border-white/10 text-muted leading-relaxed space-y-4 text-sm">
                  <p>
                    We are proud to offer both our pilot and controller members memorable experiences
                    across our 22 subdivisions. Each subdivision has its own culture, unique qualities,
                    and challenges. In this letter, we are announcing a new opportunity for all our
                    controlling members in the division who meet the applicable requirements.
                  </p>
                  <p>
                    Anchorage ARTCC is home to the beautiful Alaskan wilderness, unforgiving terrain,
                    and unique airports. With plenty of challenging IFR and VFR procedures throughout
                    the massive airspace, pilots and controllers will never be bored and never run out
                    of new experiences to seek! While this facility has historically not been a popular
                    one for controllers and staff to select as their home controlling facility, it would
                    be a shame to let such a fantastic subdivision remain underutilized.
                  </p>
                  <p>
                    That is why, effective today, any VATUSA home controller rated S3 or above shall be
                    granted inherent visiting controller privileges in the Anchorage subdivision with no
                    activity requirement. To exercise these privileges, you must be in good standing and
                    fully active on a VATUSA subdivision's home roster. You will not need to be listed on
                    the ZAN visiting roster, unless you are seeking a Tier 2 endorsement. These details
                    can be found in Section 2 of the ZAN ARTCC Administrative Manual.
                  </p>
                  <p>
                    We hope that many of you will take advantage of this amazing opportunity to spread
                    your wings and try something new on the network. This is a unique opportunity for our
                    controllers to get together as an entire division and interact outside of the typical
                    subdivision boundaries. Our pilots love it when we staff ZAN facilities and would
                    certainly appreciate more controllers logging on and enjoying a fun session together!
                  </p>
                  <p>
                    We will also seek to host events in ZAN in the future, allowing our members to get
                    together and display the cumulative power of the division! If you have any questions,
                    please feel free to reach out to Brandon Wening, VATUSA2, via{' '}
                    <a href="mailto:vatusa2@vatusa.net" className="text-gold hover:underline">
                      vatusa2@vatusa.net
                    </a>
                    . See you on the scopes!
                  </p>
                </div>
              </details>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-baseline gap-3 px-5 py-4 rounded-2xl bg-white/[0.05]">
                <span className="text-2xl font-extrabold text-gold">S3+</span>
                <span className="text-[13.5px] font-semibold text-muted2">Any home controller, division-wide</span>
              </div>
              <div className="flex items-baseline gap-3 px-5 py-4 rounded-2xl bg-white/[0.05]">
                <span className="text-2xl font-extrabold text-teal">2 hrs</span>
                <span className="text-[13.5px] font-semibold text-muted2">Minimum, every 6 months</span>
              </div>
              <div className="flex items-baseline gap-3 px-5 py-4 rounded-2xl bg-white/[0.05]">
                <span className="text-2xl font-extrabold text-purple">No roster</span>
                <span className="text-[13.5px] font-semibold text-muted2">Unless going for Tier 2</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="px-6 sm:px-10 pb-20">
        <div className="max-w-[1180px] mx-auto">
          <div className="flex items-baseline gap-5 flex-wrap">
            <h2 className="font-extrabold leading-tight tracking-tight text-[clamp(28px,3vw,40px)]">Next up</h2>
            <Link to="/events" className="ml-auto font-bold text-[14.5px] text-gold hover:text-goldLight">All events →</Link>
          </div>

          {events.length === 0 && (
            <p className="text-muted mt-7">No upcoming events right now — check back soon.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] mt-7">
            {events.map((event, i) => {
              const start = new Date(event.start_time * 1000)
              const month = start.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
              const day = start.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'UTC' })
              const weekday = start.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
              const time = start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).replace(':', '')
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="block rounded-3xl bg-[#0A1330] hover:bg-[#0D183C] border border-white/[0.06] overflow-hidden"
                >
                  <div className={`relative h-[150px] bg-gradient-to-br ${EVENT_FALLBACKS[i % EVENT_FALLBACKS.length]}`}>
                    {event.banner_image_url && (
                      <img src={event.banner_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                    <div className="absolute left-5 top-5 px-3.5 py-2 rounded-[14px] bg-navy/70 text-center leading-[1.1]">
                      <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-teal">{month}</div>
                      <div className="text-2xl font-extrabold">{day}</div>
                    </div>
                  </div>
                  <div className="px-6 pt-5 pb-[26px]">
                    <div className="text-[13px] font-extrabold text-teal">{weekday} · {time}z</div>
                    <h3 className="mt-2.5 font-extrabold text-xl tracking-tight">{event.title}</h3>
                    <p className="mt-2 text-[14.5px] text-muted leading-relaxed line-clamp-2">{event.body}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Weather */}
      <Weather />

      {/* Airspace */}
      <section id="airspace" className="px-6 sm:px-10 pb-20">
        <div className="max-w-[1180px] mx-auto pt-[72px] border-t border-white/[0.14] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="max-w-[16ch] font-extrabold leading-[1.05] tracking-tight text-[clamp(30px,3.6vw,48px)]">
              Flat maps lie about Alaska.
            </h2>
            <p className="max-w-[50ch] mt-[18px] text-muted leading-relaxed text-[16.5px]">
              Look down at the pole instead and the point of this place is obvious — Asia to North America is a curve over the top, and the curve lands in our airspace.
            </p>
            <p className="max-w-[40ch] mt-[22px] font-extrabold text-[19px] leading-snug">
              The only center that can hand you off <span className="text-gold">into tomorrow.</span>
              <span className="block mt-1.5 font-semibold text-[14.5px] text-muted2">
                Cross 180° westbound and you lose a day.
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="px-6 py-5 rounded-[20px] bg-white/[0.04] border-l-[3px] border-purple">
              <div className="font-extrabold text-base">Arctic CTA</div>
              <div className="mt-1 text-sm font-semibold text-muted2 leading-normal">Polar 1 · 2 · 3 · 4, all the way to 90° N.</div>
            </div>
            <div className="px-6 py-5 rounded-[20px] bg-white/[0.04] border-l-[3px] border-gold">
              <div className="font-extrabold text-base">Anchorage Center</div>
              <div className="mt-1 text-sm font-semibold text-muted2 leading-normal">Alaska, the Panhandle and the Aleutian chain.</div>
            </div>
            <div className="px-6 py-5 rounded-[20px] bg-white/[0.04] border-l-[3px] border-teal">
              <div className="font-extrabold text-base">Oceanic</div>
              <div className="mt-1 text-sm font-semibold text-muted2 leading-normal">Non-radar. NOPAC tracks, Asia to North America.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Join */}
      <section id="join" className="px-6 sm:px-10 pb-24">
        <div className="max-w-[1180px] mx-auto">
          <h2 className="font-extrabold leading-tight tracking-tight text-[clamp(28px,3vw,40px)]">Two ways in.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[18px] mt-7">
            <div className="px-[34px] py-8 rounded-3xl bg-white/[0.04]">
              <h3 className="font-extrabold text-[22px] tracking-tight">Fly it</h3>
              <p className="mt-3 text-muted leading-relaxed text-[15.5px]">Half our airspace is non-radar, so you will make position reports and mean it. Charts, routes and the NOPAC tracks are all here.</p>
              <Link to="/files" className="inline-flex mt-[22px] px-6 py-3.5 rounded-full bg-gold hover:bg-goldLight text-navy font-bold text-[14.5px]">Pilot resources</Link>
            </div>
            <div className="px-[34px] py-8 rounded-3xl bg-white/[0.04]">
              <h3 className="font-extrabold text-[22px] tracking-tight">Control it</h3>
              <p className="mt-3 text-muted leading-relaxed text-[15.5px]">Train here and you learn oceanic procedure, non-radar separation and terrain — the things most facilities never touch. Visiting controllers welcome from S3.</p>
              <Link to="/apply" className="inline-flex mt-[22px] px-6 py-3.5 rounded-full border border-white/30 hover:border-white hover:bg-white/[0.06] text-ink font-bold text-[14.5px]">Apply to ZAN</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
