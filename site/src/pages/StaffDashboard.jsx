import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function StaffDashboard() {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState([])
  const [applications, setApplications] = useState([])

  const load = () => {
    if (!user) return
    fetch('http://localhost:4000/api/feedback', { credentials: 'include' })
      .then((res) => res.json())
      .then(setFeedback)
    fetch('http://localhost:4000/api/apply/pending', { credentials: 'include' })
      .then((res) => res.json())
      .then(setApplications)
  }

  useEffect(load, [user])

  const reviewFeedback = async (id) => {
    await fetch(`http://localhost:4000/api/feedback/${id}/reviewed`, {
      method: 'PUT',
      credentials: 'include',
    })
    load()
  }

  const decideApplication = async (id, status) => {
    await fetch(`http://localhost:4000/api/apply/${id}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />

      <div className="max-w-[1000px] mx-auto px-10 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Staff Dashboard</h1>
        <p className="text-muted mb-12">Command center for ARTCC staff.</p>

        <section className="mb-16">
          <h2 className="text-xl font-extrabold tracking-tight mb-5">
            Pending Applications <span className="text-muted2 font-normal">({applications.length})</span>
          </h2>
          {applications.length === 0 && <p className="text-muted2">No pending applications.</p>}
          <div className="space-y-3">
            {applications.map((a) => (
              <div key={a.id} className="rounded-xl bg-white/[0.04] p-5 flex items-start justify-between">
                <div>
                  <div className="font-bold">{a.fname} {a.lname} <span className="text-muted3 font-normal">({a.cid}/{a.rating})</span></div>
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
              <div key={f.id} className={`rounded-xl p-5 ${f.status === 'new' ? 'bg-gold/[0.06] border border-gold/20' : 'bg-white/[0.04]'}`}>
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
      </div>

      <Footer />
    </div>
  )
}

export default StaffDashboard