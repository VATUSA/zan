import express from 'express'
import {
  getAllEndorsements, addEndorsement, removeEndorsement,
  getAllInitials, assignInitialsIfNeeded, seedRealInitials, setInitials, getInitials,
  getAllRoles, addRole, removeRole,
} from '../db.js'
import { getHighestRole } from '../utils/roles.js'
import { requireRole } from '../middleware/auth.js'

const router = express.Router()

let cachedRoster = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000

router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store')

  const now = Date.now()

  if (cachedRoster && now - cacheTime < CACHE_DURATION) {
    return res.json(cachedRoster)
  }

  try {
    const response = await fetch(
      `https://api.vatusa.net/v2/facility/ZAN/roster/both?apikey=${process.env.VATUSA_API_KEY}`
    )
    const data = await response.json()

    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to fetch roster' })
    }

    const allEndorsements = getAllEndorsements()
    const allRoles = getAllRoles()

    data.data.forEach((member) => {
      // Only seed initials the FIRST time we ever see this person -
      // never overwrite initials that already exist (e.g. from a staff edit)
      if (!getInitials(member.cid)) {
        const wasSeeded = seedRealInitials(member.cid, member.fname, member.lname)
        if (!wasSeeded) {
          assignInitialsIfNeeded(member.cid, member.fname, member.lname)
        }
      }
    })
    const allInitials = getAllInitials()

    const roster = data.data.map((member) => ({
      cid: member.cid,
      fname: member.fname,
      lname: member.lname,
      rating: member.rating_short,
      role: getHighestRole(allRoles[member.cid]) ?? null,
      membership: member.membership,
      endorsements: allEndorsements[member.cid] || [],
      initials: allInitials[member.cid] || '??',
    }))

    cachedRoster = roster
    cacheTime = now

    res.json(roster)
  } catch (err) {
    console.error('Roster fetch error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Grant an endorsement - staff only (INS+), enforced by requireRole before this ever runs
router.post('/endorsements', requireRole('INS'), (req, res) => {
  const { cid, position } = req.body
  if (!cid || !position) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  addEndorsement(cid, position, req.user.cid)
  cachedRoster = null
  res.json({ success: true })
})

// Revoke an endorsement - staff only (INS+)
router.delete('/endorsements', requireRole('INS'), (req, res) => {
  const { cid, position } = req.body
  if (!cid || !position) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  removeEndorsement(cid, position)
  cachedRoster = null
  res.json({ success: true })
})

// Update someone's operating initials - staff only (INS+)
router.put('/initials', requireRole('INS'), (req, res) => {
  const { cid, initials } = req.body

  if (!cid || !initials) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const cleaned = initials.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(cleaned)) {
    return res.status(400).json({ error: 'Initials must be exactly 2 letters' })
  }

  const result = setInitials(cid, cleaned)
  if (!result.success) {
    return res.status(409).json(result)
  }

  cachedRoster = null
  res.json({ success: true })
})

// Assign a role - DATM+ only
router.post('/roles', requireRole('DATM'), (req, res) => {
  const { cid, role } = req.body
  if (!cid || !role) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  addRole(cid, role)
  cachedRoster = null
  res.json({ success: true })
})

// Remove a role - DATM+ only
router.delete('/roles', requireRole('DATM'), (req, res) => {
  const { cid, role } = req.body
  if (!cid || !role) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  removeRole(cid, role)
  cachedRoster = null
  res.json({ success: true })
})

export default router