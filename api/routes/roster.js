import express from 'express'

const router = express.Router()

let cachedRoster = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes, in milliseconds

// TEMP: fake endorsement data, keyed by CID.
// TODO: replace with real database lookups once we add SQLite.
const MOCK_ENDORSEMENTS = {
  1599990: ['Unrestricted', 'Enroute'],
  1394476: ['Unrestricted', 'Enroute', 'Oceanic'],
  1677974: ['Unrestricted'],
}

router.get('/', async (req, res) => {
  const now = Date.now()

  // If we have cached data and it's still fresh, use it instead of calling VATUSA again
  if (cachedRoster && now - cacheTime < CACHE_DURATION) {
    return res.json(cachedRoster)
  }

  try {
    const response = await fetch(
      `https://api.vatusa.net/v2/facility/ZAN/roster/both?apikey=${process.env.VATUSA_API_KEY}`
    )
    const data = await response.json()

    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to fetch roster', details: data })
    }

    const roster = data.data.map((member) => ({
      cid: member.cid,
      fname: member.fname,
      lname: member.lname,
      rating: member.rating_short,
      role: member.roles?.find((r) => r.facility === 'ZAN')?.role ?? null,
      membership: member.membership,
      endorsements: MOCK_ENDORSEMENTS[member.cid] || [], // TODO: real DB lookup later
    }))

    // Save this result so the next request can reuse it
    cachedRoster = roster
    cacheTime = now

    res.json(roster)
  } catch (err) {
    console.error('Roster fetch error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router