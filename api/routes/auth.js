import express from 'express'
import { getRoles } from '../db.js'
import { getHighestRole } from '../utils/roles.js'
import { createSessionToken, verifySessionToken } from '../utils/session.js'

const router = express.Router()

const COOKIE_OPTIONS = {
  httpOnly: true,       // JavaScript in the browser can't read or touch this cookie at all
  sameSite: 'lax',      // sent on normal navigation, blocks most cross-site abuse
  secure: process.env.NODE_ENV === 'production', // false locally over http, true once deployed over https
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in milliseconds
}

router.post('/callback', async (req, res) => {
  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' })
  }

  try {
    const tokenResponse = await fetch('https://auth.vatsim.net/oauth/token', {
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
      return res.status(400).json({ error: 'Token exchange failed', details: tokenData })
    }

    const userResponse = await fetch('https://auth.vatsim.net/api/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const userData = await userResponse.json()
    if (!userResponse.ok) {
      console.error('VATSIM user fetch failed:', userData)
      return res.status(400).json({ error: 'VATSIM user fetch failed', details: userData })
    }

    const cid = userData.data.cid

    const vatusaResponse = await fetch(
      `https://api.vatusa.net/v2/user/${cid}?apikey=${process.env.VATUSA_API_KEY}`
    )
    const vatusaData = await vatusaResponse.json()

    let zanRole = null
    let isZanVisitor = false

    if (vatusaResponse.ok && vatusaData.data) {
      zanRole = getHighestRole(getRoles(cid))
      isZanVisitor = vatusaData.data.visits?.some((v) => v.facility === 'ZAN') ?? false
    } else {
      console.error('VATUSA lookup failed:', vatusaData)
    }

    const user = {
      cid,
      name: userData.data.personal.name_full,
      email: userData.data.personal.email,
      rating: userData.data.vatsim.rating.long,
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

  const { cid } = req.params

  try {
    const vatusaResponse = await fetch(
      `https://api.vatusa.net/v2/user/${cid}?apikey=${process.env.VATUSA_API_KEY}`
    )
    const vatusaData = await vatusaResponse.json()

    if (!vatusaResponse.ok || !vatusaData.data) {
      return res.status(400).json({ error: 'Could not find that CID in VATUSA' })
    }

    const vatusaUser = vatusaData.data
    const zanRole = getHighestRole(getRoles(cid))
    const isZanVisitor = vatusaUser.visits?.some((v) => v.facility === 'ZAN') ?? false

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

  res.json({ cid: session.cid, name: session.name, zanRole })
})

router.post('/logout', (req, res) => {
  res.clearCookie('session', COOKIE_OPTIONS)
  res.json({ success: true })
})

export default router