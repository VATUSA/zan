import express from 'express'
import { linkDiscord, unlinkDiscord, getDiscordLink } from '../db.js'

const router = express.Router()

// Where the frontend sends the person to start linking
router.get('/link-url', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in' })
  }

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify',
  })

  res.json({ url: `https://discord.com/api/oauth2/authorize?${params.toString()}` })
})

// Discord redirects back here (via the frontend) with a code
router.post('/callback', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in' })
  }

  const { code } = req.body
  if (!code) {
    return res.status(400).json({ error: 'Missing code' })
  }

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error('Discord token exchange failed:', tokenData)
      return res.status(400).json({ error: 'Discord authorization failed' })
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const discordUser = await userResponse.json()

    if (!userResponse.ok) {
      return res.status(400).json({ error: 'Could not fetch Discord user' })
    }

    linkDiscord(req.user.cid, discordUser.id)

    res.json({ success: true, discordUsername: discordUser.username })
  } catch (err) {
    console.error('Discord link error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Check current link status
router.get('/status', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in' })
  }
  const link = getDiscordLink(req.user.cid)
  res.json({ linked: !!link })
})

router.delete('/unlink', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in' })
  }
  unlinkDiscord(req.user.cid)
  res.json({ success: true })
})

export default router