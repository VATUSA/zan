import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import UserSearch from '../components/UserSearch'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { API_URL } from '../config'
import { apiGet } from '../utils/api'

const TABS = ['overview', 'users']

function StaffDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [applications, setApplications] = useState([])
  const [error, setError] = useState(null)

  const load = () => {
    if (!user) return
    apiGet('/api/admin/stats').then(setStats).catch(() => setStats(null))
    apiGet('/api/feedback').then(setFeedback).catch(() => setError('Could not load feedback'))
    apiGet('/api/apply/pending').then(setApplications).catch(() => setError('Could not load applications'))
  }

  useEffect(load, [user])

  const reviewFeedback = async (id) => {
    const response = await fetch(`${API_URL}/api/feedback/${id}/reviewed`, {
      method: 'PUT',
      credentials: 'include',
    })
    if (!response.ok) {
      alert('Could not mark feedback reviewed')
      return
    }
    load()
  }

  const decideApplication = async (id, status) => {
    const response = await fetch(`${API_URL}/api/apply/${id}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) {
      alert('Could not update application')
      return
    }
    load()
  }

  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />

      <div className="max-w-[1000px] mx-auto px-6 sm:px-10 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Staff Dashboard</h1>
        <p className="text-muted mb-10">Command center for ARTCC staff.</p>

        {error && <p className="text-red-400 mb-8">{error}</p>}

        <div className="flex border-b border-white/10 mb-10">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 font-bold text-sm uppercase tracking-wide border-b-2 -mb-px ${
                tab === t ? 'border-gold text-ink' : 'border-transparent text-muted2 hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'users' && <UserSearch />}

        {tab === 'overview' && (
          <>
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-14">
                <StatCard label="Home" value={stats.homeMembers} />
                <StatCard label="Visiting" value={stats.visitingMembers} />
                <StatCard label="Staff" value={stats.staffCount} />
                <StatCard label="Pending apps" value={stats.pendingApplications} highlight={stats.pendingApplications > 0} />
                <StatCard label="New feedback" value={stats.newFeedback} highlight={stats.newFeedback > 0} />
              </div>
            )}

            <section className="mb-16">
              <h2 className="text-xl font-extrabold tracking-tight mb-5">
                Pending Applications <span className="text-muted2 font-normal">({applications.length})</span>
              </h2>
              {applications.length === 0 && <p className="text-muted2">No pending applications.</p>}
              <div className="space-y-3">
                {applications.map((a) => (
                  <div key={a.id} className="rounded-xl bg-white/[0.04] p-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold">
                        {a.fname} {a.lname} <span className="text-muted3 font-normal">({a.cid}/{a.rating})</span>
                      </div>
                      <div className="text-sm text-muted2 mt-1">From {a.facility}</div>
                      {a.reason && <p className="text-sm mt-2 max-w-[500px]">{a.reason}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => decideApplication(a.id, 'approved')}
                        className="px-4 py-2 rounded-lg bg-teal/20 text-teal text-sm font-bold hover:bg-teal/30"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => decideApplication(a.id, 'denied')}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm font-bold hover:bg-red-500/30"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-extrabold tracking-tight mb-5">
                Feedback <span className="text-muted2 font-normal">({feedback.filter((f) => f.status === 'new').length} new)</span>
              </h2>
              <div className="space-y-3">
                {feedback.map((f) => (
                  <div
                    key={f.id}
                    className={`rounded-xl p-5 ${f.status === 'new' ? 'bg-gold/[0.06] border border-gold/20' : 'bg-white/[0.04]'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-gold">{f.rating}</span>
                        {f.controller_cid && (
                          <Link to={`/roster/member/${f.controller_cid}`} className="ml-2 text-sm text-teal hover:underline">
                            re: controller #{f.controller_cid}
                          </Link>
                        )}
                        {!f.controller_cid && <span className="ml-2 text-sm text-muted2">General feedback</span>}
                      </div>
                      <span className="text-xs text-muted3">{new Date(f.created_at).toLocaleDateString()}</span>
                    </div>
                    {f.position && <div className="text-sm text-muted2 mt-1">{f.position}</div>}
                    {f.comments && <p className="text-sm mt-2">{f.comments}</p>}
                    <div className="text-xs text-muted3 mt-2">
                      From {f.pilot_name} (CID {f.pilot_cid})
                    </div>
                    {f.status === 'new' && (
                      <button
                        onClick={() => reviewFeedback(f.id)}
                        className="mt-3 text-xs font-bold text-teal hover:underline"
                      >
                        Mark reviewed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-2xl p-5 ${highlight ? 'bg-gold/[0.08] border border-gold/20' : 'bg-white/[0.04]'}`}>
      <div className={`text-3xl font-extrabold ${highlight ? 'text-gold' : 'text-ink'}`}>{value}</div>
      <div className="text-xs font-semibold text-muted2 uppercase tracking-wide mt-1">{label}</div>
    </div>
  )
}

export default StaffDashboard