import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { useRoster } from '../hooks/useRoster'
import { hasMinimumRole, ALL_ROLES } from '../utils/roles'
import { API_URL } from '../config'
import { useState, useEffect } from 'react'

const POSITIONS = ['Unrestricted', 'Enroute', 'Oceanic']

function RosterMember() {
  const { cid } = useParams()
  const { user } = useAuth()
  const { roster, loading, refetch } = useRoster()
  const [tab, setTab] = useState('profile')

  const [editingInitials, setEditingInitials] = useState(false)
  const [initialsInput, setInitialsInput] = useState('')
  const [initialsError, setInitialsError] = useState(null)

  const [newRole, setNewRole] = useState('')
  const [roleError, setRoleError] = useState(null)

  const [controllerFeedback, setControllerFeedback] = useState([])

  const member = roster.find((m) => String(m.cid) === cid)
  const isSeniorStaff = hasMinimumRole(user?.zanRole, 'TA')

  useEffect(() => {
    if (tab === 'feedback' && member && isSeniorStaff) {
      fetch(`${API_URL}/api/feedback/controller/${member.cid}`, {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then(setControllerFeedback)
    }
  }, [tab, member, isSeniorStaff, user])

  const toggleEndorsement = async (position) => {
    if (!member) return
    const hasIt = member.endorsements.includes(position)
    await fetch(`${API_URL}/api/roster/endorsements`, {
      method: hasIt ? 'DELETE' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid: member.cid, position }),
    })
    refetch()
  }

  const saveInitials = async () => {
    setInitialsError(null)
    const response = await fetch(`${API_URL}/api/roster/initials`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid: member.cid, initials: initialsInput }),
    })
    const data = await response.json()
    if (!response.ok) {
      setInitialsError(data.error || 'Could not update initials')
      return
    }
    setEditingInitials(false)
    refetch()
  }

  const addRole = async () => {
    setRoleError(null)
    const cleaned = newRole.trim().toUpperCase()
    if (!cleaned) return

    const response = await fetch(`${API_URL}/api/roster/roles`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid: member.cid, role: cleaned }),
    })
    const data = await response.json()
    if (!response.ok) {
      setRoleError(data.error || 'Could not add role')
      return
    }
    setNewRole('')
    refetch()
  }

  const removeMemberRole = async (role) => {
    await fetch(`${API_URL}/api/roster/roles`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid: member.cid, role }),
    })
    refetch()
  }
    const changeStatus = async (status) => {
    await fetch(`${API_URL}/api/roster/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid: member.cid, status }),
    })
    refetch()
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

  if (!member) {
    return (
      <div className="min-h-screen bg-navy text-ink font-mulish">
        <Navbar />
        <p className="text-muted2 text-center py-24">Member not found.</p>
        <Footer />
      </div>
    )
  }

  const TABS = isSeniorStaff
    ? ['profile', 'training notes', 'feedback', 'actions']
    : ['profile', 'training notes']

  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />

      <div className="max-w-[900px] mx-auto px-10 py-14">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {member.fname} {member.lname}
              <span className="text-muted3 font-normal text-xl ml-2">
                ({member.cid}/{member.rating})
              </span>
            </h1>
            {member.role && <p className="text-muted2 mt-1">{member.role}</p>}
                      <div className="mt-3 flex items-center gap-2">
              <span className="px-2 py-1 rounded-full bg-purple/15 text-purple text-xs font-bold font-mono">
                {member.initials}
              </span>
              {member.status === 'inactive' && (
                <span className="px-2 py-1 rounded-full bg-red-500/15 text-red-300 text-xs font-bold">
                  Inactive
                </span>
              )}
            </div>
          </div>
          <Link
            to="/roster"
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-sm font-bold"
          >
            ← Back to Roster
          </Link>
        </div>

        <div className="flex gap-2 mb-8">
          {member.endorsements.map((e) => (
            <span key={e} className="px-3 py-1 rounded-full bg-teal/15 text-teal text-xs font-bold">
              {e}
            </span>
          ))}
        </div>

        <div className="flex border-b border-white/10 mb-8">
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

        {tab === 'profile' && (
          <div>
            <h2 className="text-xl font-extrabold tracking-tight mb-4">General</h2>
            <div className="grid grid-cols-2 gap-4 mb-10 text-sm">
              <InfoRow label="Rating" value={member.rating} />
              <InfoRow label="Membership" value={member.membership === 'home' ? 'Home' : 'Visitor'} />
              <InfoRow label="Role" value={member.role || '—'} />
              <InfoRow label="CID" value={member.cid} />
            </div>

            <h2 className="text-xl font-extrabold tracking-tight mb-4">Certifications</h2>
            <div className="grid grid-cols-2 gap-5 max-w-[500px]">
              {POSITIONS.map((pos) => {
                const has = member.endorsements.includes(pos)
                return (
                  <div key={pos}>
                    <div className="text-sm font-semibold text-muted2 mb-1.5">{pos}</div>
                    <select
                      value={has ? 'certified' : 'none'}
                      onChange={() => toggleEndorsement(pos)}
                      className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-ink"
                    >
                      <option value="none">None</option>
                      <option value="certified">Certified</option>
                    </select>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'training notes' && (
          <p className="text-muted2">No training notes yet. (Coming soon — needs its own database table.)</p>
        )}

        {tab === 'feedback' && isSeniorStaff && (
          <div>
            <h2 className="text-xl font-extrabold tracking-tight mb-4">Feedback</h2>
            {controllerFeedback.length === 0 && (
              <p className="text-muted2">No reviewed feedback yet.</p>
            )}
            <div className="space-y-3">
              {controllerFeedback.map((f) => (
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
          </div>
        )}

        {tab === 'actions' && isSeniorStaff && (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight mb-5">Actions</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 max-w-[700px]">
                <div>
                  <div className="text-sm font-semibold text-muted2 mb-1.5">Type</div>
                  <div className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-ink">
                    {member.membership === 'home' ? 'Home' : 'Visitor'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-muted2 mb-1.5">Removal Reason</div>
                  <div className="flex gap-2">
                    <input
                      disabled
                      placeholder="Coming soon"
                      className="flex-1 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-muted3 placeholder:text-muted3"
                    />
                    <button
                      disabled
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300/50 text-sm font-bold cursor-not-allowed"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                               <div>
                  <div className="text-sm font-semibold text-muted2 mb-1.5">Status</div>
                  <select
                    value={member.status}
                    onChange={(e) => changeStatus(e.target.value)}
                    className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-ink"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <div className="text-sm font-semibold text-muted2 mb-1.5">Operating Initials</div>
                  <div className="flex items-center gap-2">
                    {editingInitials ? (
                      <>
                        <input
                          value={initialsInput}
                          onChange={(e) => setInitialsInput(e.target.value.toUpperCase())}
                          maxLength={2}
                          className="w-20 rounded-lg bg-white/[0.04] border border-white/10 px-2 py-2 text-center font-mono font-bold text-purple"
                        />
                        <button onClick={saveInitials} className="text-xs font-bold text-teal hover:underline">Save</button>
                        <button onClick={() => setEditingInitials(false)} className="text-xs text-muted3 hover:underline">Cancel</button>
                      </>
                    ) : (
                      <>
                        <div className="rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-ink font-mono font-bold flex-1">
                          {member.initials}
                        </div>
                        <button
                          onClick={() => {
                            setInitialsInput(member.initials)
                            setEditingInitials(true)
                          }}
                          className="text-xs text-muted3 hover:text-ink"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                  {initialsError && <p className="text-xs text-red-400 mt-1">{initialsError}</p>}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold tracking-tight mb-5">Roles</h2>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {member.role ? (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-sm font-semibold lowercase">
                    {member.role}
                    <button
                      onClick={() => removeMemberRole(member.role)}
                      className="text-red-400 hover:text-red-300 font-bold"
                      title={`Remove ${member.role}`}
                    >
                      ×
                    </button>
                  </span>
                ) : (
                  <span className="text-muted3 text-sm">No roles</span>
                )}
              </div>
              <div className="flex items-center gap-2 max-w-[400px]">
                <span className="text-sm font-semibold text-muted2 whitespace-nowrap">Add Role:</span>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="flex-1 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-ink"
                >
                  <option value="">Select a role...</option>
                  {ALL_ROLES.filter((r) => r !== member.role).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <button
                  onClick={addRole}
                  disabled={!newRole}
                  className="w-9 h-9 grid place-items-center rounded-lg bg-gold hover:bg-goldLight disabled:bg-white/10 disabled:cursor-not-allowed text-navy font-bold"
                >
                  +
                </button>
              </div>
              {roleError && <p className="text-xs text-red-400 mt-2">{roleError}</p>}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted2 mb-1 uppercase tracking-wide">{label}</div>
      <div className="text-ink">{value}</div>
    </div>
  )
}

export default RosterMember