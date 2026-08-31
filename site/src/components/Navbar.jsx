import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasMinimumRole } from '../utils/roles'
import Dropdown, { DropdownItem } from './Dropdown'

function Navbar() {
  const { user, loading, loginWithVatsim, loginAsDev, logout } = useAuth()

  const isTaPlus = hasMinimumRole(user?.zanRole, 'TA')
  const canApply = !user || !user.isZanVisitor

  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-center gap-4 px-10 py-5 bg-navy/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <img src="/logo-no-text.png" alt="Anchorage ARTCC" className="w-10 h-10" />
        <span className="font-extrabold text-[17px] tracking-tight">Anchorage ARTCC</span>
      </div>

      <nav className="flex flex-wrap items-center gap-1 ml-auto text-[14.5px] font-semibold">
        <Link to="/" className="px-3.5 py-2 rounded-full text-muted hover:text-ink hover:bg-white/[0.07]">Home</Link>
        <Link to="/staff" className="px-3.5 py-2 rounded-full text-muted hover:text-ink hover:bg-white/[0.07]">Staff</Link>
        <Link to="/events" className="px-3.5 py-2 rounded-full text-muted hover:text-ink hover:bg-white/[0.07]">Events</Link>

        <Dropdown label="Facility">
          <DropdownItem to="/roster">Roster</DropdownItem>
          <DropdownItem to="/files">Files</DropdownItem>
          <DropdownItem to="/feedback">Feedback</DropdownItem>
          {canApply && <DropdownItem to="/apply">Apply to Visit</DropdownItem>}
        </Dropdown>

        {user && (
          <Dropdown label={user.name}>
            <DropdownItem to="/profile">Profile</DropdownItem>
            {isTaPlus && <DropdownItem to="/staff-dashboard">Staff Dashboard</DropdownItem>}
            <div className="border-t border-white/10 my-1" />
            <DropdownItem onClick={logout}>Log out</DropdownItem>
          </Dropdown>
        )}
      </nav>

      {!user && (
        <div className="flex items-center gap-2">
          <button
            onClick={loginWithVatsim}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gold hover:bg-goldLight text-navy font-bold text-[14.5px] rounded-full"
          >
            {loading ? 'Connecting...' : 'Get started'}
          </button>
          <button
            onClick={() => loginAsDev(1394476)}
            className="px-4 py-2 rounded-full border border-white/20 text-muted3 hover:text-ink text-xs font-semibold"
          >
            Dev login
          </button>
        </div>
      )}
    </header>
  )
}

export default Navbar