import { Link, useLocation } from 'react-router-dom'

function RosterTabs() {
  const location = useLocation()
  const isHome = location.pathname === '/roster' || location.pathname === '/roster/home'
  const isVisiting = location.pathname === '/roster/visiting'

  return (
    <div className="flex border-b border-white/10 mb-8">
      <Link
        to="/roster/home"
        className={`px-6 py-4 font-bold text-sm border-b-2 -mb-px ${
          isHome ? 'border-gold text-ink' : 'border-transparent text-muted2 hover:text-ink'
        }`}
      >
        🏠 Home Controllers
      </Link>
      <Link
        to="/roster/visiting"
        className={`px-6 py-4 font-bold text-sm border-b-2 -mb-px ${
          isVisiting ? 'border-gold text-ink' : 'border-transparent text-muted2 hover:text-ink'
        }`}
      >
        🧳 Visiting Controllers
      </Link>
    </div>
  )
}

export default RosterTabs