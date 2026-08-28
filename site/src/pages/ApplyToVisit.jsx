import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

function ApplyToVisit() {
  const { user } = useAuth()
  const [eligibility, setEligibility] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!user) return
    fetch(`http://localhost:4000/api/apply/eligibility/1599990`)
      .then((res) => {
      if (!res.ok) throw new Error('Eligibility check failed')
      return res.json()
    })
      .then((data) => {
        setEligibility(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not check eligibility')
        setLoading(false)
      })
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-navy text-ink font-mulish">
        <Navbar />
        <div className="max-w-[720px] mx-auto px-10 py-24 text-center">
          <p className="text-muted">Log in with VATSIM to apply.</p>
        </div>
        <Footer />
      </div>
    )
  }

  const allRequiredPassed = eligibility?.checklist
    ?.filter((item) => item.passed !== null)
    ?.every((item) => item.passed) ?? false

  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />

      <div className="max-w-[720px] mx-auto px-10 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Apply to Visit</h1>
        <p className="text-muted mb-10">
          Thanks for your interest in visiting Anchorage ARTCC.
        </p>

        {loading && <p className="text-muted2">Checking eligibility...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {eligibility && (
          <>
            <div className="rounded-2xl bg-white/[0.04] p-6 mb-8">
              <h2 className="font-bold text-lg mb-4">Visiting Checklist</h2>
              <ul className="space-y-2.5">
                {eligibility.checklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    {item.passed === true && <span className="text-teal">✓</span>}
                    {item.passed === false && <span className="text-red-400">✗</span>}
                    {item.passed === null && <span className="text-gold">?</span>}
                    <span className={item.passed === false ? 'text-red-300' : 'text-ink'}>
                      {item.label}
                      {item.passed === null && (
                        <span className="text-muted3 ml-1">(reviewed by staff)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Field label="CID" value={eligibility.cid} />
              <Field label="Rating" value={eligibility.rating} />
              <Field label="First Name" value={eligibility.fname} />
              <Field label="Last Name" value={eligibility.lname} />
              <Field label="Email" value={eligibility.email} />
              <Field label="Home Facility" value={eligibility.facility} />
            </div>

            <label className="block mb-6">
              <span className="text-sm font-semibold text-muted2">Why do you want to visit ZAN?</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-ink placeholder:text-muted3 focus:outline-none focus:border-gold"
              />
            </label>

            <button
              disabled={!allRequiredPassed}
              className="px-7 py-3.5 rounded-full bg-gold hover:bg-goldLight disabled:bg-white/10 disabled:text-muted3 disabled:cursor-not-allowed text-navy font-bold text-[15px]"
            >
              Submit Application
            </button>
            {!allRequiredPassed && (
              <p className="text-sm text-red-400 mt-3">
                You don't currently meet all requirements to apply.
              </p>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted2 mb-1">{label}</div>
      <div className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-muted">
        {value}
      </div>
    </div>
  )
}

export default ApplyToVisit