import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { UserIdCard } from '../components/UserBadge'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { apiGet } from '../utils/api'

function Profile() {
  const { user } = useAuth()
  const [myFeedback, setMyFeedback] = useState([])
  const [feedbackError, setFeedbackError] = useState(null)

  useEffect(() => {
    if (!user) return
    apiGet('/api/feedback/about-me')
      .then(setMyFeedback)
      .catch(() => setFeedbackError('Could not load feedback'))
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-navy text-ink font-mulish">
        <Navbar />
        <div className="max-w-[720px] mx-auto px-6 sm:px-10 py-16 sm:py-24 text-center">
          <p className="text-muted">Log in with VATSIM to view your profile.</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />

      <div className="max-w-[840px] mx-auto px-6 sm:px-10 py-10 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">My Profile</h1>
        <p className="text-muted mb-10">Your VATSIM and ZAN membership details.</p>

        <div className="rounded-2xl bg-white/[0.04] p-5 sm:p-8 mb-6">
          <div className="mb-8">
            <UserIdCard user={user} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ProfileField label="Rating" value={user.rating} />
            <ProfileField label="Division" value={user.division} />
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="ZAN Role" value={user.zanRole ?? 'None'} />
            <ProfileField label="ZAN Visitor Status" value={user.isZanVisitor ? 'Visiting' : 'Not visiting'} />
          </div>
        </div>

        {/* Discord roles are handled by the VATUSA bot (configured for ZAN in
            VATUSA/discord-bot-v3-config). Members link Discord on their VATUSA profile, and the
            bot applies their ZAN roles - this just sends them to the right place. */}
        <div className="rounded-2xl bg-white/[0.04] p-5 sm:p-6 mb-6">
          <div className="text-xs font-semibold text-muted2 uppercase tracking-wide mb-2">Discord roles</div>
          <p className="text-sm text-muted leading-relaxed">
            Your ZAN Discord roles come from your VATUSA account. Link your Discord on your VATUSA
            profile, then press the blue <span className="font-bold text-ink">Sync</span> button there to
            get your roles straight away.
          </p>
          <a
            href="https://www.vatusa.net/my/profile"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 rounded-full bg-gold hover:bg-goldLight text-navy font-bold text-sm"
          >
            Link &amp; sync Discord on VATUSA <span aria-hidden="true">↗</span>
          </a>
        </div>

        {/* TEMP: Hours and Training Notes still need real data sources
            (VATSIM connect-time stats, an instructor notes table). */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl bg-white/[0.04] p-6">
            <div className="text-xs font-semibold text-muted2 uppercase tracking-wide mb-2">Hours this quarter</div>
            <div className="text-3xl font-extrabold text-gold">—</div>
            <div className="text-xs text-muted3 mt-1">Coming soon</div>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-6">
            <div className="text-xs font-semibold text-muted2 uppercase tracking-wide mb-2">Training notes</div>
            <div className="text-sm text-muted3 mt-1">None yet</div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.04] p-6 mb-6">
          <div className="text-xs font-semibold text-muted2 uppercase tracking-wide mb-3">Feedback about you</div>
          {feedbackError && <p className="text-sm text-red-400">{feedbackError}</p>}
          {!feedbackError && myFeedback.length === 0 && (
            <p className="text-sm text-muted3">No reviewed feedback yet.</p>
          )}
          <div className="space-y-3">
            {myFeedback.map((f) => (
              <div key={f.id} className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gold">{f.rating}</span>
                  <span className="text-muted3">{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                {f.position && <div className="text-sm text-muted2 mt-1">{f.position}</div>}
                {f.comments && <p className="text-sm mt-2">{f.comments}</p>}
              </div>
            ))}
          </div>
        </div>

        {!user.isZanVisitor && (
          <div className="rounded-2xl bg-gold/10 border border-gold/30 p-6">
            <p className="text-sm text-ink">
              You're not currently visiting ZAN.{' '}
              <Link to="/apply" className="text-gold font-bold hover:underline">Apply to visit →</Link>
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

function ProfileField({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted2 mb-1 uppercase tracking-wide">{label}</div>
      <div className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-ink break-words">
        {value}
      </div>
    </div>
  )
}

export default Profile