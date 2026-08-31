import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { label: 'SOPs', path: '/files/sops' },
  { label: 'LOAs', path: '/files/loas' },
  { label: 'Training', path: '/files/training' },
  { label: 'Admin Policies', path: '/files/admin' },
]

function FilesTabs() {
  const location = useLocation()

  return (
    <div className="flex border-b border-white/10 mb-8 flex-wrap">
      {TABS.map((tab) => {
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