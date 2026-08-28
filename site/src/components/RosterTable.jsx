const POSITIONS = ['Unrestricted', 'Enroute', 'Oceanic']

function RosterTable({ members }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/[0.04] text-left text-muted2 uppercase text-xs tracking-wide">
            <th className="px-5 py-3 font-bold">Name</th>
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
              className={`border-t border-white/5 ${i % 2 === 1 ? 'bg-white/[0.02]' : ''}`}
            >
              <td className="px-5 py-3 font-semibold">
                {member.fname} {member.lname}
                <div className="text-xs text-muted3 font-normal">CID: {member.cid}</div>
              </td>
              <td className="px-5 py-3">
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-gold/15 text-gold">
                  {member.rating}
                </span>
              </td>
              <td className="px-5 py-3 text-muted2">{member.role || '—'}</td>
              {POSITIONS.map((pos) => (
                <td key={pos} className="px-5 py-3 text-center">
                  {member.endorsements.includes(pos) ? (
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal" />
                  ) : (
                    <span className="text-muted3">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RosterTable