import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config'
import Weather from '../components/Weather'

function Home() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const firstName = user?.name?.split(' ')[0]

  useEffect(() => {
    fetch(`${API_URL}/api/events`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setEvents(data.slice(0, 2)))
      .catch(() => setEvents([]))
  }, [user])

  return (
    <div className="bg-navy text-ink font-mulish">
      {/* Header */}
      <Navbar />

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
              Control here tonight <span>→</span>
            </Link>
            <a href="#airspace" className="flex items-center gap-2 px-7 py-4 border border-white/30 hover:border-white hover:bg-white/[0.06] text-ink font-bold text-[15px] rounded-full">
              Learn more
            </a>
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-12 text-sm font-semibold text-muted2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal" style={{ animation: 'livedot 2.4s ease-out infinite' }} />
            <span className="text-ink">4 controllers on frequency · 31 pilots in the FIR</span>
          </div>
        </div>
      </section>

      {/* Division-wide announcement */}
      <section className="px-10 pb-24">
        <div className="max-w-[1180px] mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-purple/10 via-transparent to-gold/10 border border-white/10 p-10 md:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-bold uppercase tracking-widest mb-6">
                  Division-Wide Announcement
                </span>

                <h2 className="font-extrabold leading-tight tracking-tight text-[clamp(28px,3.2vw,42px)]">
                  Any S3 controller in the division can fly and control here — starting now.
                </h2>

                <p className="max-w-[52ch] mt-5 text-muted leading-relaxed">
                  VATUSA2 has granted every home controller rated S3 or above in the division inherent
                  visiting privileges at Anchorage — no activity requirement, no visiting roster needed,
                  unless you're going for a Tier 2 endorsement.
                </p>

                <details className="mt-8 group">
                  <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-bold text-ink hover:text-gold">
                    <span className="transition-transform group-open:rotate-90">▸</span>
                    Read the full announcement from VATUSA2
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
                

                <Link
                  to="/apply"
                  className="inline-flex items-center gap-2 mt-10 px-7 py-4 bg-gold hover:bg-goldLight text-navy font-bold text-[15px] rounded-full"
                >
                  Get started at ZAN <span>→</span>
                </Link>
              </div>

              <div className="grid gap-4 content-start">
                <div className="p-6 rounded-2xl bg-white/[0.04]">
                  <div className="text-3xl font-extrabold text-gold">S3+</div>
                  <div className="mt-1.5 text-sm text-muted2">Any home controller S3 or above, division-wide</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.04]">
                  <div className="text-3xl font-extrabold text-teal">Minimums</div>
                  <div className="mt-1.5 text-sm text-muted2">Only 2 Hours, Every 6 months!</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/[0.04]">
                  <div className="text-3xl font-extrabold text-purple">No roster needed</div>
                  <div className="mt-1.5 text-sm text-muted2">Unless you're pursuing a Tier 2 endorsement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Weather />
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
              <p className="mt-3.5 text-muted leading-relaxed">Train here and you learn oceanic procedure, non-radar separation and terrain — the things most facilities never touch. Visiting controllers welcome from S3.</p>
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