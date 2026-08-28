import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, loading, loginWithVatsim, logout } = useAuth()

  // Only show a "join" style link if: not logged in (generic info link),
  // or logged in but not yet a ZAN visitor (real prompt to apply)
  const showJoinLink = !user || !user.isZanVisitor

  return (
    <header className="sticky top-0 z-40 flex flex-wrap items-center gap-4 px-10 py-5 bg-navy/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <img src="/logo-no-text.png" alt="Anchorage ARTCC" className="w-10 h-10" />
        <span className="font-extrabold text-[17px] tracking-tight">Anchorage ARTCC</span>
      </div>

      <nav className="flex flex-wrap gap-1 ml-auto text-[14.5px] font-semibold">
        <Link to="/" className="px-3.5 py-2 rounded-full text-muted hover:text-ink hover:bg-white/[0.07]">Home</Link>
        <Link to="/roster" className="px-3.5 py-2 rounded-full text-muted hover:text-ink hover:bg-white/[0.07]">Roster</Link>
        <a href="#events" className="px-3.5 py-2 rounded-full text-muted hover:text-ink hover:bg-white/[0.07]">Events</a>
        {showJoinLink && (
          <Link to="/apply" className="px-3.5 py-2 rounded-full text-muted hover:text-ink hover:bg-white/[0.07]">
            {user ? 'Apply to Visit' : 'Join'}
          </Link>
        )}
      </nav>

      {!user && (
        <button
          onClick={loginWithVatsim}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gold hover:bg-goldLight text-navy font-bold text-[14.5px] rounded-full"
        >
          {loading ? 'Connecting...' : 'Get started'}
        </button>
      )}

      {user && (
        <div className="flex items-center gap-3">
          <Link to="/profile" className="text-sm font-semibold text-ink hover:text-gold">{user.name}</Link>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-full border border-white/20 text-muted2 hover:text-ink hover:border-white/40 text-sm font-semibold"
          >
            Log out
          </button>
        </div>
      )}
    </header>
  )
}

export default Navbar