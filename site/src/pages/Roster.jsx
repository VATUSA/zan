import { useState, useEffect } from 'react'

function Roster() {
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:4000/api/roster')
      .then((res) => res.json())
      .then((data) => {
        setRoster(data)
        setLoading(false)
      })
      .catch((err) => {
        setError('Could not load roster')
        setLoading(false)
      })
  }, [])

  const homeMembers = roster.filter((m) => m.membership === 'home')
  const visitingMembers = roster.filter((m) => m.membership === 'visit')

  return (
    <div className="min-h-screen bg-[#060D22] text-[#F6F7FA] font-['Mulish']">
      <div className="max-w-[1180px] mx-auto px-10 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          Roster
        </h1>
        <p className="text-[#A9B4D0] mb-12">
          Everyone controlling under Anchorage ARTCC — home and visiting.
        </p>

        {loading && <p className="text-[#8A96B8]">Loading roster...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <>
            <RosterSection title="Home Controllers" members={homeMembers} />
            <RosterSection title="Visiting Controllers" members={visitingMembers} />
          </>
        )}
      </div>
    </div>
  )
}

function RosterSection({ title, members }) {
  return (
    <div className="mb-14">
      <h2 className="text-2xl font-extrabold tracking-tight mb-5">
        {title} <span className="text-[#8A96B8] font-normal text-lg">({members.length})</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map((member) => (
          <div
            key={member.cid}
            className="p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px]">
                {member.fname} {member.lname}
              </span>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#FFB612]/15 text-[#FFB612]">
                {member.rating}
              </span>
            </div>
            {member.role && (
              <div className="mt-2 text-sm text-[#3FD9A8] font-semibold">
                {member.role}
              </div>
            )}
            <div className="mt-1 text-xs text-[#6F7C9E]">CID: {member.cid}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Roster