import jwt from 'jsonwebtoken'

// The token carries the profile fields the site needs to rebuild a logged-in user after a
// page refresh (GET /api/auth/me). Without them, the rating, division and visitor flag were
// only available straight after login. zanRole is deliberately NOT stored here - it's looked
// up from the database on every /me call so role changes take effect without a re-login.
export function createSessionToken(user) {
  return jwt.sign(
    {
      cid: user.cid,
      name: user.name,
      email: user.email,
      rating: user.rating,
      division: user.division,
      isZanVisitor: user.isZanVisitor,
    },
    process.env.SESSION_SECRET,
    { expiresIn: '7d' }
  )
}

// Sessions issued before the login code converted the CID to a number carry it as a string.
// Normalising it here means every request sees a number, so existing logins are fixed
// without anyone having to sign in again.
export function verifySessionToken(token) {
  try {
    const session = jwt.verify(token, process.env.SESSION_SECRET)
    const cid = Number(session.cid)
    if (!Number.isInteger(cid)) return null
    return { ...session, cid }
  } catch {
    return null
  }
}
