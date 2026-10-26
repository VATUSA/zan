import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasMinimumRole } from '../utils/roles'

const TABS = [
  { label: 'SOPs', path: '/files/sops' },
  { label: 'LOAs', path: '/files/loas' },
  { label: 'Training', path: '/files/training' },
  { label: 'Admin Policies', path: '/files/admin', minRole: 'TA' },
]

function FilesTabs() {
  const location = useLocation()
  const { user } = useAuth()

  // Not a security boundary by itself (the route and the API both enforce this too) - just
  // avoids showing staff a tab that leads to a "you don't have permission" wall.
  const visibleTabs = TABS.filter((tab) => !tab.minRole || hasMinimumRole(user?.zanRole, tab.minRole))

  return (
    <div className="flex border-b border-white/10 mb-8 flex-wrap">
      {visibleTabs.map((tab) => {
        const isActive = location.pathname === tab.path
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-6 py-4 font-bold text-sm border-b-2 -mb-px ${
              isActive ? 'border-gold text-ink' : 'border-transparent text-muted2 hover:text-ink'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

export default FilesTabs