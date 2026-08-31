import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import RosterTabs from '../components/RosterTabs'
import RosterTable from '../components/RosterTable'
import { useRoster } from '../hooks/useRoster'


function RosterVisiting() {
  const { roster, loading, error, refetch } = useRoster()
  const visitingMembers = roster.filter((m) => m.membership === 'visit')

  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />
      <div className="max-w-[1180px] mx-auto px-10 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Roster</h1>
        <p className="text-muted mb-8">Visiting controllers at Anchorage ARTCC.</p>

        <RosterTabs />

        {loading && <p className="text-muted2">Loading roster...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {!loading && !error && <RosterTable members={visitingMembers} onChange={refetch} />}
      </div>
      <Footer />
    </div>
  )
}

export default RosterVisiting