import express from 'express'
import {
  signUpForPosition, getSignupsForEvent, approveSignup, removeSignup,
  isEventHidden, setEventHidden,
  addEventPosition, removeEventPosition, getPositionsForEvent,
} from '../db.js'
import { requireRole } from '../middleware/auth.js'
import { hasMinimumRole } from '../utils/roles.js'

const router = express.Router()

let cachedEvents = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000

async function fetchZanEvents() {
  const now = Date.now()
  if (cachedEvents && now - cacheTime < CACHE_DURATION) {
    return cachedEvents
  }
  const today = new Date().toISOString().split('T')[0]
  const response = await fetch(
    `https://api.vatusa.net/v3/events?count=100&start_date_from=${today}`,
    { headers: { Authorization: `Bearer ${process.env.VATUSA_API_KEY}` } }
  )
  const data = await response.json()
  if (!response.ok) throw new Error('Failed to fetch events from VATUSA')

  const zanEvents = data.filter((e) => e.facility === 'ZAN') // TEMP: testing, revert to 'ZAN' before going live
  cachedEvents = zanEvents
  cacheTime = now
  return zanEvents
}

// Public - list events. Hidden ones only included if requester is staff (EC+).
// Uses req.user (from the session) instead of a query param, so it can't be spoofed.
router.get('/', async (req, res) => {
  try {
    const events = await fetchZanEvents()
    const isStaff = hasMinimumRole(req.user?.zanRole, 'EC')

    const visible = events
      .map((e) => ({ ...e, hidden: isEventHidden(e.id) }))
      .filter((e) => isStaff || !e.hidden)

    res.json(visible)
  } catch (err) {
    console.error('Events fetch error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Public - single event, same visibility rule
router.get('/:id', async (req, res) => {
  try {
    const events = await fetchZanEvents()
    const event = events.find((e) => String(e.id) === req.params.id)
    if (!event) return res.status(404).json({ error: 'Event not found' })

    const hidden = isEventHidden(event.id)
    const isStaff = hasMinimumRole(req.user?.zanRole, 'EC')
    if (hidden && !isStaff) return res.status(403).json({ error: 'Event not available' })

    res.json({ ...event, hidden })
  } catch (err) {
    console.error('Event fetch error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Staff only (EC+) - toggle visibility
router.put('/:id/visibility', requireRole('EC'), (req, res) => {
  const { hidden } = req.body
  setEventHidden(req.params.id, hidden)
  res.json({ success: true })
})

// Staff only (EC+) - add a position
router.post('/:id/positions', requireRole('EC'), (req, res) => {
  const { name, category } = req.body
  if (!name || !category) return res.status(400).json({ error: 'Missing position name or category' })
  addEventPosition(req.params.id, name, category, req.user.cid)
  res.json({ success: true })
})

// Staff only (EC+) - remove a position
router.delete('/:id/positions/:posId', requireRole('EC'), (req, res) => {
  removeEventPosition(req.params.posId)
  res.json({ success: true })
})

// Public - list positions for an event
router.get('/:id/positions', (req, res) => {
  res.json(getPositionsForEvent(req.params.id))
})

// Sign up for a specific position - must be logged in, goes in as 'pending'
router.post('/:id/positions/:posId/signup', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in to sign up' })
  }
  signUpForPosition({
    eventId: req.params.id,
    positionId: req.params.posId,
    cid: req.user.cid,
    name: req.user.name,
  })
  res.json({ success: true })
})

// Public - list signups (includes status, so frontend can show pending vs approved)
router.get('/:id/signups', (req, res) => {
  res.json(getSignupsForEvent(req.params.id))
})

// Staff only (EC+) - approve a pending signup
router.put('/signups/:signupId/approve', requireRole('EC'), (req, res) => {
  approveSignup(req.params.signupId)
  res.json({ success: true })
})

// Staff only (EC+) - remove/deny a signup
router.delete('/signups/:signupId', requireRole('EC'), (req, res) => {
  removeSignup(req.params.signupId)
  res.json({ success: true })
})

export default router