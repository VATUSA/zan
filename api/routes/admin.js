import express from 'express'
import { requireRole } from '../middleware/auth.js'
import {
  getAllEndorsements, getAllInitials, getAllRoles,
  getPendingApplications, getAllFeedback,
} from '../db.js'
import { getHighestRole } from '../utils/roles.js'

const router = express.Router()

// Own small cache of the VATUSA roster, so every keystroke in the search
// box doesn't hit VATUSA. (Could be merged with roster.js's cache later.)
let cachedMembers = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000

async function fetchMembers() {
  const now = Date.now()
  if (cachedMembers && now - cacheTime < CACHE_DURATION) return cachedMembers

  const response = await fetch(
    `https://api.vatusa.net/v2/facility/ZAN/roster/both?apikey=${process.env.VATUSA_API_KEY}`
  )
  const data = await response.json()
  if (!response.ok || !Array.isArray(data.data)) {
    throw new Error('VATUSA roster fetch failed')
  }

  cachedMembers = data.data
  cacheTime = now
  return cachedMembers
}

// Staff only (TA+): search roster members by name, CID or operating initials
router.get('/users', requireRole('TA'), async (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase()
  if (q.length < 2) return res.json([])

  try {
    const members = await fetchMembers()
    const allEndorsements = getAllEndorsements()
    const allInitials = getAllInitials()
    const allRoles = getAllRoles()

    const results = members
      .filter((m) => {
        const fullName = `${m.fname} ${m.lname}`.toLowerCase()
        const initials = (allInitials[m.cid] || '').toLowerCase()
        return fullName.includes(q) || String(m.cid).includes(q) || initials === q
      })
      .slice(0, 25)
      .map((m) => ({
        cid: m.cid,
        fname: m.fname,
        lname: m.lname,
        rating: m.rating_short,
        membership: m.membership,
        role: getHighestRole(allRoles[m.cid]) ?? null,
        endorsements: allEndorsements[m.cid] || [],
        initials: allInitials[m.cid] || null,
      }))

    res.json(results)
  } catch (err) {
    console.error('Admin user search error:', err)
    res.status(502).json({ error: 'Could not reach VATUSA' })
  }
})

// Staff only (TA+): headline numbers for the dashboard overview
router.get('/stats', requireRole('TA'), async (req, res) => {
  try {
    const members = await fetchMembers()
    const allRoles = getAllRoles()

    res.json({
      homeMembers: members.filter((m) => m.membership === 'home').length,
      visitingMembers: members.filter((m) => m.membership === 'visit').length,
      staffCount: Object.keys(allRoles).length,
      pendingApplications: getPendingApplications().length,
      newFeedback: getAllFeedback().filter((f) => f.status === 'new').length,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    res.status(502).json({ error: 'Could not reach VATUSA' })
  }
})

export default router