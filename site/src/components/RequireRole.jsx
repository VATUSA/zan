import { useAuth } from '../context/AuthContext'
import { hasMinimumRole } from '../utils/roles'
import Navbar from './Navbar'
import Footer from './Footer'

function RequireRole({ role, children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-navy text-ink font-mulish">
        <Navbar />
        <p className="text-muted2 text-center py-24">Loading...</p>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-navy text-ink font-mulish">
        <Navbar />
        <p className="text-muted text-center py-24">Log in to view this page.</p>
        <Footer />
      </div>
    )
  }

  if (!hasMinimumRole(user.zanRole, role)) {
    return (
      <div className="min-h-screen bg-navy text-ink font-mulish">
        <Navbar />
        <p className="text-muted text-center py-24">You don't have permission to view this page.</p>
        <Footer />
      </div>
    )
  }

  return children
}

export default RequireRole