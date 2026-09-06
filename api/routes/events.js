import express from 'express'
import {
  signUpForPosition, getSignupsForEvent, approveSignup, removeSignup,
  isEventHidden, setEventHidden,
  addEventPosition, removeEventPosition, getPositionsForEvent, getEventPosition,
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

  // VATUSA's v3 API is documented as returning a bare array, but has been seen wrapping
  // results in { data: [...] } elsewhere in this codebase - accept either shape rather than
  // assuming one and breaking if it changes.
  const eventList = Array.isArray(data) ? data : (data?.data ?? [])
  const zanEvents = eventList.filter((e) => e.facility === 'ZAN')
  cachedEvents = zanEvents
  cacheTime = now
  return zanEvents
}

// Shared by every route below that needs to know whether an event is visible to the current
// caller. Returns the event if so, or null after sending the appropriate error response.
async function loadVisibleEvent(req, res, id) {
  const events = await fetchZanEvents()
  const event = events.find((e) => String(e.id) === String(id))
  if (!event) {
    res.status(404).json({ error: 'Event not found' })
    return null
  }
  const hidden = isEventHidden(event.id)
  const isStaff = hasMinimumRole(req.user?.zanRole, 'EC')
  if (hidden && !isStaff) {
    res.status(403).json({ error: 'Event not available' })
    return null
  }
  return { ...event, hidden }
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
    const event = await loadVisibleEvent(req, res, req.params.id)
    if (!event) return
    res.json(event)
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

// Matches the fixed set of categories the frontend offers (EventDetail.jsx's CATEGORIES).
const POSITION_CATEGORIES = ['Enroute', 'TRACON', 'Local']
const MAX_POSITION_NAME_LENGTH = 20

// Staff only (EC+) - add a position
router.post('/:id/positions', requireRole('EC'), (req, res) => {
  const { name, category } = req.body
  if (
    typeof name !== 'string' || !name.trim() || name.length > MAX_POSITION_NAME_LENGTH ||
    !POSITION_CATEGORIES.includes(category)
  ) {
    return res.status(400).json({ error: 'Missing or invalid position name or category' })
  }
  addEventPosition(req.params.id, name.trim(), category, req.user.cid)
  res.json({ success: true })
})

// Staff only (EC+) - remove a position
router.delete('/:id/positions/:posId', requireRole('EC'), (req, res) => {
  removeEventPosition(req.params.posId)
  res.json({ success: true })
})

// Public - list positions for an event (subject to the same visibility rule as the event
// itself, so positions for a hidden event aren't exposed through a different route)
router.get('/:id/positions', async (req, res) => {
  try {
    const event = await loadVisibleEvent(req, res, req.params.id)
    if (!event) return
    res.json(getPositionsForEvent(event.id))
  } catch (err) {
    console.error('Positions fetch error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Sign up for a specific position - must be logged in, goes in as 'pending'
router.post('/:id/positions/:posId/signup', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in to sign up' })
  }
  try {
    const event = await loadVisibleEvent(req, res, req.params.id)
    if (!event) return

    // Without this, a posId from a completely different event would still be accepted here,
    // letting someone sign up for (or spam) positions that have nothing to do with :id.
    const position = getEventPosition(req.params.posId)
    if (!position || String(position.event_id) !== String(event.id)) {
      return res.status(400).json({ error: 'Position not found for this event' })
    }

    signUpForPosition({
      eventId: event.id,
      positionId: position.id,
      cid: req.user.cid,
      name: req.user.name,
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Public - list signups (includes status, so frontend can show pending vs approved). Same
// visibility rule - signups for a hidden event shouldn't leak through this route either.
router.get('/:id/signups', async (req, res) => {
  try {
    const event = await loadVisibleEvent(req, res, req.params.id)
    if (!event) return
    res.json(getSignupsForEvent(event.id))
  } catch (err) {
    console.error('Signups fetch error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
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