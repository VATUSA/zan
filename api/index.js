import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

// Simple test route - confirms the server is alive
app.get('/', (req, res) => {
  res.send('ZAN RTAC API is running')
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

app.post('/api/auth/callback', async (req, res) => {
  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' })
  }

  try {
    // Step 1: exchange the code for a VATSIM access token
    const tokenResponse = await fetch('https://auth-dev.vatsim.net/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.VATSIM_CLIENT_ID,
        client_secret: process.env.VATSIM_CLIENT_SECRET,
        redirect_uri: 'http://localhost:5173/',
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData)
      return res.status(400).json({ error: 'Token exchange failed', details: tokenData })
    }

    // Step 2: fetch VATSIM identity
    const userResponse = await fetch('https://auth-dev.vatsim.net/api/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const userData = await userResponse.json()
    if (!userResponse.ok) {
      console.error('VATSIM user fetch failed:', userData)
      return res.status(400).json({ error: 'VATSIM user fetch failed', details: userData })
    }

    const cid = userData.data.cid

    // Step 3: fetch VATUSA role/visitor data using that CID
    const vatusaResponse = await fetch(
      `https://api.vatusa.net/v2/user/${cid}?apikey=${process.env.VATUSA_API_KEY}`
    )
    const vatusaData = await vatusaResponse.json()

    let zanRole = null
    let isZanVisitor = false

    if (vatusaResponse.ok && vatusaData.data) {
      zanRole = vatusaData.data.roles?.find((r) => r.facility === 'ZAN')?.role ?? null
      isZanVisitor = vatusaData.data.visits?.some((v) => v.facility === 'ZAN') ?? false
    } else {
      console.error('VATUSA lookup failed:', vatusaData)
      // don't fail the whole login just because VATUSA lookup failed -
      // they're still a valid VATSIM user, just with no known ZAN role
    }

    // Step 4: merge everything into one clean response
    res.json({
      cid,
      name: userData.data.personal.name_full,
      email: userData.data.personal.email,
      rating: userData.data.vatsim.rating.long,
      division: userData.data.vatsim.division.name,
      zanRole,
      isZanVisitor,
    })
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})
