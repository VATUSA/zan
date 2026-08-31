import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasMinimumRole } from '../utils/roles'

const POSITIONS = ['Unrestricted', 'Enroute', 'Oceanic']

function RosterTable({ members, onChange }) {
  const { user } = useAuth()
  const isStaff = hasMinimumRole(user?.zanRole, 'INS')

  const toggleEndorsement = async (member, position, e) => {
    e.stopPropagation()
    if (!isStaff) return

    const hasIt = member.endorsements.includes(position)
    await fetch('http://localhost:4000/api/roster/endorsements', {
      method: hasIt ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cid: member.cid,
        position,
        grantedByCid: user.cid,
        grantedByRole: user.zanRole,
        revokedByRole: user.zanRole,
      }),
    })
    onChange()
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <table className="w-full text-sm">
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
          {members.map((member, i) => (
            <tr
              key={member.cid}
              className={`border-t border-white/5 ${isStaff ? 'hover:bg-white/[0.05] cursor-pointer' : ''} ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}
            >
              <td className="px-5 py-3 font-semibold">
                {isStaff ? (
                  <Link to={`/roster/member/${member.cid}`} className="block">
                    {member.fname} {member.lname}
                    <div className="text-xs text-muted3 font-normal">CID: {member.cid}</div>
                  </Link>
                ) : (
                  <div>
                    {member.fname} {member.lname}
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
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RosterTable