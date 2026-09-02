import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { hasMinimumRole } from '../utils/roles'
import Dropdown, { DropdownItem } from './Dropdown'

function Navbar() {
  const { user, loading, loginWithVatsim, loginAsDev, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isTaPlus = hasMinimumRole(user?.zanRole, 'TA')
  const canApply = !user || !user.isZanVisitor

  return (
    <header className="sticky top-0 z-40 bg-navy/80 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-4 px-6 sm:px-10 py-5">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo-no-text.png" alt="Anchorage ARTCC" className="w-10 h-10" />
          <span className="font-extrabold text-[17px] tracking-tight">Anchorage ARTCC</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex flex-wrap items-center gap-1 ml-auto text-[14.5px] font-semibold">
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
            <Dropdown
              label={
                <span className="text-left leading-tight">
                  <span className="block text-[10px] font-bold text-gold uppercase tracking-wide">Welcome back</span>
                  <span className="block font-extrabold">{user.name}</span>
                  <span className="flex items-center gap-2 mt-0.5 text-[11px] font-normal text-muted2 normal-case">
                    <span>CID {user.cid}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-gold/15 text-gold font-bold">{user.rating}</span>
                    {user.zanRole && <span className="text-teal font-semibold">{user.zanRole}</span>}
                  </span>
                </span>
              }
            >
              <DropdownItem to="/profile">Profile</DropdownItem>
              {isTaPlus && <DropdownItem to="/staff-dashboard">Staff Dashboard</DropdownItem>}
              <div className="border-t border-white/10 my-1" />
              <DropdownItem onClick={logout}>Log out</DropdownItem>
            </Dropdown>
          )}
        </nav>

        {!user && (
          <div className="hidden lg:flex items-center gap-2">
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

        {/* Mobile burger button */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="lg:hidden ml-auto w-10 h-10 grid place-items-center rounded-lg text-ink hover:bg-white/[0.07]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 px-6 py-4 space-y-1">
          <Link onClick={() => setMobileOpen(false)} to="/" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:text-ink hover:bg-white/[0.06]">Home</Link>
          <Link onClick={() => setMobileOpen(false)} to="/staff" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:text-ink hover:bg-white/[0.06]">Staff</Link>
          <Link onClick={() => setMobileOpen(false)} to="/events" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:text-ink hover:bg-white/[0.06]">Events</Link>

          <div className="pt-2 pb-1 px-3 text-[11px] font-bold text-muted3 uppercase tracking-wide">Facility</div>
          <Link onClick={() => setMobileOpen(false)} to="/roster" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:text-ink hover:bg-white/[0.06]">Roster</Link>
          <Link onClick={() => setMobileOpen(false)} to="/files" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:text-ink hover:bg-white/[0.06]">Files</Link>
          <Link onClick={() => setMobileOpen(false)} to="/feedback" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:text-ink hover:bg-white/[0.06]">Feedback</Link>
          {canApply && (
            <Link onClick={() => setMobileOpen(false)} to="/apply" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:text-ink hover:bg-white/[0.06]">Apply to Visit</Link>
          )}

          {user ? (
            <>
              <div className="pt-2 pb-1 px-3 text-[11px] font-bold text-muted3 uppercase tracking-wide">
                {user.name} · {user.rating} {user.zanRole && `· ${user.zanRole}`}
              </div>
              <Link onClick={() => setMobileOpen(false)} to="/profile" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:text-ink hover:bg-white/[0.06]">Profile</Link>
              {isTaPlus && (
                <Link onClick={() => setMobileOpen(false)} to="/staff-dashboard" className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:text-ink hover:bg-white/[0.06]">Staff Dashboard</Link>
              )}
              <button
                onClick={() => { logout(); setMobileOpen(false) }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:text-ink hover:bg-white/[0.06]"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="pt-3 flex flex-col gap-2">
              <button
                onClick={loginWithVatsim}
                disabled={loading}
                className="px-6 py-3 bg-gold hover:bg-goldLight text-navy font-bold text-sm rounded-full"
              >
                {loading ? 'Connecting...' : 'Get started'}
              </button>
              <button
                onClick={() => loginAsDev(1394476)}
                className="px-4 py-2.5 rounded-full border border-white/20 text-muted3 hover:text-ink text-xs font-semibold"
              >
                Dev login
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Navbar