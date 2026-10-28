import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useRoster } from '../hooks/useRoster'
import { Link } from 'react-router-dom'

const HIERARCHY = {
  role: 'ATM',
  label: 'Air Traffic Manager',
  children: [
    {
      role: 'DATM',
      label: 'Deputy ATM',
      children: [
        { role: 'WM', label: 'Webmaster' },
        { role: 'EC', label: 'Events Coordinator' },
        { role: 'FE', label: 'Facility Engineer' },
      ],
    },
    {
      role: 'TA',
      label: 'Training Administrator',
      children: [
        { role: 'INS', label: 'Instructor' },
        { role: 'MTR', label: 'Mentor' },
      ],
    },
  ],
}

function Staff() {
  const { roster, loading, error } = useRoster()
  const membersForRole = (roleCode) => roster.filter((m) => m.role === roleCode)

  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />

      <div className="max-w-[1000px] mx-auto px-6 sm:px-10 py-10 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Staff</h1>
        <p className="text-muted mb-10 sm:mb-16">The team behind Anchorage ARTCC.</p>

        {loading && <p className="text-muted2">Loading staff...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="space-y-10 sm:space-y-16">
            {/* Tier 1: ATM */}
            <div className="flex justify-center">
              <RoleCard node={HIERARCHY} members={membersForRole(HIERARCHY.role)} tier={1} />
            </div>

            {/* Tier 2: DATM / TA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
              {HIERARCHY.children.map((branch) => (
                <div key={branch.role} className="space-y-6">
                  <RoleCard node={branch} members={membersForRole(branch.role)} tier={2} />

                  {/* Tier 3: reports under this branch */}
                  {branch.children && (
                    <div className="grid gap-3 pl-4 sm:pl-6 border-l-2 border-white/10">
                      {branch.children.map((leaf) => (
                        <RoleCard
                          key={leaf.role}
                          node={leaf}
                          members={membersForRole(leaf.role)}
                          tier={3}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

function RoleCard({ node, members, tier }) {
  const styles = {
    1: 'px-6 sm:px-10 py-6 w-full sm:w-auto sm:min-w-[280px] border-gold/30 bg-gold/[0.06]',
    2: 'px-7 py-5 border-white/10 bg-white/[0.04]',
    3: 'px-5 py-3.5 border-white/10 bg-white/[0.03]',
  }
  const labelSize = { 1: 'text-base', 2: 'text-sm', 3: 'text-xs' }
  const nameSize = { 1: 'text-lg', 2: 'text-base', 3: 'text-sm' }

  return (
    <div className={`rounded-2xl border text-center ${styles[tier]}`}>
      <div className={`font-bold uppercase tracking-wide text-gold ${labelSize[tier]}`}>
        {node.label}
      </div>

      {members.length === 0 && (
        <div className="mt-1.5 text-muted3 italic">Vacant</div>
      )}

      <div className="mt-1.5 space-y-0.5">
        {members.map((m) => (
          <Link
            key={m.cid}
            to={`/roster/member/${m.cid}`}
            className={`block font-semibold hover:text-teal ${nameSize[tier]}`}
          >
            {m.fname} {m.lname}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Staff