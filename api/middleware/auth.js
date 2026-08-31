import { verifySessionToken } from '../utils/session.js'
import { getRoles } from '../db.js'
import { getHighestRole, hasMinimumRole } from '../utils/roles.js'

export function attachUser(req, res, next) {
  const token = req.cookies.session
  if (token) {
    const session = verifySessionToken(token)
    if (session) {
      req.user = {
        cid: session.cid,
        name: session.name,
        zanRole: getHighestRole(getRoles(session.cid)),
      }
    }
  }
  next()
}

export function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not logged in' })
    }
    if (!hasMinimumRole(req.user.zanRole, minRole)) {
      return res.status(403).json({ error: 'Not authorized' })
    }
    next()
  }
}