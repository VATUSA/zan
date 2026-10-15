import express from 'express'
import { getRoles, syncVatusaRoles } from '../db.js'
import { getHighestRole } from '../utils/roles.js'
import { extractZanRoles } from '../utils/vatusaRoles.js'
import { createSessionToken, verifySessionToken } from '../utils/session.js'
import { COOKIE_OPTIONS } from '../config.js'
import { parseCid } from '../utils/validate.js'
import { isVisitingZan } from '../utils/visiting.js'

const router = express.Router()

// Copies the member's ZAN roles from their VATUSA record onto this site. A failure here must
// never stop someone logging in, so it's logged and skipped.
function syncRolesFromVatusa(cid, vatusaUser) {
  try {
    const roles = extractZanRoles(vatusaUser)
    if (roles === null) return
    const { added, removed } = syncVatusaRoles(cid, roles)
    if (added.length || removed.length) {
      console.log(`Role sync for ${cid}: added [${added}] removed [${removed}]`)
    }
  } catch (err) {
    console.error('Role sync failed:', err)
  }
}

router.post('/callback', async (req, res) => {
  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' })
  }

  try {
    const tokenResponse = await fetch(process.env.VATSIM_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.VATSIM_CLIENT_ID,
        client_secret: process.env.VATSIM_CLIENT_SECRET,
        redirect_uri: process.env.FRONTEND_REDIRECT_URI,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData)
      return res.status(400).json({ error: 'Token exchange failed' })
    }

    const userResponse = await fetch(new URL('/api/user', process.env.VATSIM_TOKEN_URL), {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const userData = await userResponse.json()
    if (!userResponse.ok) {
      console.error('VATSIM user fetch failed:', userData)
      return res.status(400).json({ error: 'VATSIM user fetch failed' })
    }

    const cid = userData.data.cid

    const vatusaResponse = await fetch(
      `https://api.vatusa.net/v2/user/${cid}?apikey=${process.env.VATUSA_API_KEY}`
    )
    const vatusaData = await vatusaResponse.json()

    let isZanVisitor = false

    if (vatusaResponse.ok && vatusaData.data) {
      isZanVisitor = isVisitingZan(vatusaData.data)
      syncRolesFromVatusa(cid, vatusaData.data)
    } else {
      console.error('VATUSA lookup failed:', vatusaData)
    }

    // Read after the sync so a role just granted in VATUSA shows up on this very login. Also
    // read when the VATUSA lookup failed (e.g. sandbox test accounts that aren't real VATUSA
    // members), so roles added by hand still apply instead of showing as none until a refresh.
    const zanRole = getHighestRole(getRoles(cid))

    const user = {
      cid,
      name: userData.data.personal.name_full,
      email: userData.data.personal.email,
      // Short code (e.g. "S3"), matching dev-login below and what the site expects to display
      rating: userData.data.vatsim.rating.short,
      division: userData.data.vatsim.division.name,
      zanRole,
      isZanVisitor,
    }

    const sessionToken = createSessionToken(user)
    res.cookie('session', sessionToken, COOKIE_OPTIONS)

    res.json(user)
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// dev only - disabled automatically outside development
router.get('/dev-login/:cid', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' })
  }

  const cid = parseCid(req.params.cid)
  if (!cid) {
    return res.status(400).json({ error: 'Invalid CID' })
  }

  try {
    const vatusaResponse = await fetch(
      `https://api.vatusa.net/v2/user/${cid}?apikey=${process.env.VATUSA_API_KEY}`
    )
    const vatusaData = await vatusaResponse.json()

    if (!vatusaResponse.ok || !vatusaData.data) {
      return res.status(400).json({ error: 'Could not find that CID in VATUSA' })
    }

    const vatusaUser = vatusaData.data
    syncRolesFromVatusa(cid, vatusaUser)
    const zanRole = getHighestRole(getRoles(cid))
    const isZanVisitor = isVisitingZan(vatusaUser)

    const user = {
      cid: vatusaUser.cid,
      name: `${vatusaUser.fname} ${vatusaUser.lname}`,
      email: vatusaUser.email,
      rating: vatusaUser.rating_short,
      division: vatusaUser.facility,
      zanRole,
      isZanVisitor,
    }

    const sessionToken = createSessionToken(user)
    res.cookie('session', sessionToken, COOKIE_OPTIONS)

    res.json(user)
  } catch (err) {
    console.error('Dev login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/me', (req, res) => {
  const token = req.cookies.session
  if (!token) {
    return res.status(401).json({ error: 'Not logged in' })
  }

  const session = verifySessionToken(token)
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  const zanRole = getHighestRole(getRoles(session.cid))

  // Same shape as the login response, so the site looks the same after a page refresh.
  // Sessions created before these fields were added to the token just won't have them until
  // the member logs in again.
  res.json({
    cid: session.cid,
    name: session.name,
    email: session.email,
    rating: session.rating,
    division: session.division,
    zanRole,
    isZanVisitor: session.isZanVisitor,
  })
})

router.post('/logout', (req, res) => {
  res.clearCookie('session', COOKIE_OPTIONS)
  res.json({ success: true })
})

export default router