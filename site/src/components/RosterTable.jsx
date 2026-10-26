import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasMinimumRole } from '../utils/roles'
import { API_URL } from '../config'

const POSITIONS = ['Unrestricted', 'Enroute', 'Oceanic']

function RosterTable({ members, onChange }) {
  const { user } = useAuth()
  const isStaff = hasMinimumRole(user?.zanRole, 'INS')

  const toggleEndorsement = async (member, position, e) => {
    e.stopPropagation()
    if (!isStaff) return

    const hasIt = member.endorsements.includes(position)
    await fetch(`${API_URL}/api/roster/endorsements`, {
      method: hasIt ? 'DELETE' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cid: member.cid, position }),
    })
    onChange()
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-white/[0.04] text-left text-muted2 uppercase text-xs tracking-wide">
              <th className="px-5 py-3 font-bold">Name</th>
              <th className="px-5 py-3 font-bold">Initials</th>
              <th className="px-5 py-3 font-bold">Rating</th>
              <th className="px-5 py-3 font-bold">Role</th>
              {POSITIONS.map((pos) => (
                <th key={pos} className="px-5 py-3 font-bold text-center">{pos}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member, i) => {
              const inactive = member.status === 'inactive'
              const badge = inactive ? (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 text-[10px] font-bold uppercase tracking-wide">
                  Inactive
                </span>
              ) : null

              return (
                <tr
                  key={member.cid}
                  className={`border-t border-white/5 ${isStaff ? 'hover:bg-white/[0.05] cursor-pointer' : ''} ${i % 2 === 1 ? 'bg-white/[0.02]' : ''} ${inactive ? 'opacity-60' : ''}`}
                >
                  <td className="px-5 py-3 font-semibold">
                    {isStaff ? (
                      <Link to={`/roster/member/${member.cid}`} className="block">
                        {member.fname} {member.lname}{badge}
                        <div className="text-xs text-muted3 font-normal">CID: {member.cid}</div>
                      </Link>
                    ) : (
                      <div>
                        {member.fname} {member.lname}{badge}
                        <div className="text-xs text-muted3 font-normal">CID: {member.cid}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple/15 text-purple font-mono">
                      {member.initials}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-gold/15 text-gold">
                      {member.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted2">{member.role || '—'}</td>
                  {POSITIONS.map((pos) => {
                    const has = member.endorsements.includes(pos)
                    return (
                      <td key={pos} className="px-5 py-3 text-center">
                        <button
                          onClick={(e) => toggleEndorsement(member, pos, e)}
                          disabled={!isStaff}
                          className={isStaff ? 'cursor-pointer' : 'cursor-default'}
                          title={isStaff ? (has ? `Revoke ${pos}` : `Grant ${pos}`) : ''}
                        >
                          {has ? (
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal" />
                          ) : (
                            <span className={isStaff ? 'text-muted2 hover:text-teal' : 'text-muted3'}>—</span>
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RosterTable