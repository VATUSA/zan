import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useRoster } from '../hooks/useRoster'

function Feedback() {
  const { user, loginWithVatsim } = useAuth()
  const { roster } = useRoster()
  const [tab, setTab] = useState('submit')

  const [controllerCid, setControllerCid] = useState('')
  const [position, setPosition] = useState('')
  const [rating, setRating] = useState('Excellent')
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [myFeedback, setMyFeedback] = useState([])

  useEffect(() => {
    if (tab === 'mine' && user) {
      fetch('http://localhost:4000/api/feedback/mine', { credentials: 'include' })
        .then((res) => res.json())
        .then(setMyFeedback)
    }
  }, [tab, user])

  const activeControllers = roster.filter((m) => m.membership === 'home' || m.membership === 'visit')

  const submitFeedback = async () => {
    const response = await fetch('http://localhost:4000/api/feedback', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        controllerCid: controllerCid || null,
        position,
        rating,
        comments,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      console.error('Feedback submit failed:', data)
      alert(data.error || 'Could not submit feedback')
      return
    }

    setSubmitted(true)
    setPosition('')
    setComments('')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-navy text-ink font-mulish">
        <Navbar />
        <div className="max-w-[600px] mx-auto px-10 py-24 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-4">Feedback</h1>
          <p className="text-muted mb-6">Log in with VATSIM to submit or view feedback.</p>
          <button
            onClick={loginWithVatsim}
            className="px-6 py-3 bg-gold hover:bg-goldLight text-navy font-bold rounded-full"
          >
            Login with VATSIM
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />

      <div className="max-w-[900px] mx-auto px-10 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-10">Feedback</h1>

        <div className="flex border-b border-white/10 mb-8">
          <button
            onClick={() => setTab('submit')}
            className={`px-5 py-3 font-bold text-sm uppercase tracking-wide border-b-2 -mb-px ${
              tab === 'submit' ? 'border-gold text-ink' : 'border-transparent text-muted2 hover:text-ink'
            }`}
          >
            Submit Feedback
          </button>
          <button
            onClick={() => setTab('mine')}
            className={`px-5 py-3 font-bold text-sm uppercase tracking-wide border-b-2 -mb-px ${
              tab === 'mine' ? 'border-gold text-ink' : 'border-transparent text-muted2 hover:text-ink'
            }`}
          >
            My Feedback
          </button>
        </div>

        {tab === 'submit' && (
          <div>
            {submitted ? (
              <div className="rounded-2xl bg-teal/10 border border-teal/30 p-6">
                <p className="text-teal font-semibold">✓ Thanks — your feedback has been submitted.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-sm text-muted2 hover:text-ink underline"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-muted2 mb-1.5">Controller</label>
                    <select
                      value={controllerCid}
                      onChange={(e) => setControllerCid(e.target.value)}
                      className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-ink"
                    >
                      <option value="">General Feedback</option>
                      {activeControllers.map((c) => (
                        <option key={c.cid} value={c.cid}>{c.fname} {c.lname}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-muted2 mb-1.5">Position / Callsign</label>
                    <input
                      value={position}
                      onChange={(e) => setPosition(e.target.value.toUpperCase())}
                      placeholder="e.g. ANC_APP"
                      className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-ink placeholder:text-muted3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-muted2 mb-1.5">Rating</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-ink"
                    >
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Fair</option>
                      <option>Poor</option>
                    </select>
                  </div>

                  <div className="text-sm text-muted3">
                    Submitting as <span className="text-ink font-semibold">{user.name}</span> (CID {user.cid})
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-muted2 mb-1.5">Comments</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={9}
                    placeholder="Comments..."
                    className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-ink placeholder:text-muted3 resize-none"
                  />
                </div>

                <button
                  onClick={submitFeedback}
                  className="col-span-2 px-6 py-3 bg-gold hover:bg-goldLight text-navy font-bold rounded-full w-fit"
                >
                  Submit
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'mine' && (
          <div className="space-y-3">
            {myFeedback.length === 0 && (
              <p className="text-muted2">You haven't submitted any feedback yet.</p>
            )}
            {myFeedback.map((f) => (
              <div key={f.id} className="rounded-xl bg-white/[0.04] p-4">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gold">{f.rating}</span>
                  <span className="text-muted3">{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                {f.position && <div className="text-sm text-muted2 mt-1">{f.position}</div>}
                {f.comments && <p className="text-sm mt-2">{f.comments}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Feedback