import express from 'express'
import { submitApplication, getPendingApplications, updateApplicationStatus } from '../db.js'
import { requireRole } from '../middleware/auth.js'
import { parseCid } from '../utils/validate.js'

const router = express.Router()

// Shared with both routes below that need a member's real VATUSA record. Returns null on
// any failure so callers can respond however fits their own endpoint.
async function fetchVatusaUser(cid) {
  const response = await fetch(
    `https://api.vatusa.net/v2/user/${cid}?apikey=${process.env.VATUSA_API_KEY}`
  )
  const data = await response.json()
  if (!response.ok || !data.data) {
    return null
  }
  return data.data
}

// Must be logged in, and can only check your own eligibility - this endpoint returns a
// VATUSA member's name, email, facility, and rating, none of which should be exposed to
// an anonymous caller or to someone looking up a CID that isn't their own.
router.get('/eligibility/:cid', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in' })
  }

  const cid = parseCid(req.params.cid)
  if (!cid) {
    return res.status(400).json({ error: 'Invalid CID' })
  }
  if (cid !== req.user.cid) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  try {
    const user = await fetchVatusaUser(cid)
    if (!user) {
      return res.status(400).json({ error: 'Could not look up user' })
    }

    const now = new Date()
    const daysSince = (dateStr) => {
      if (!dateStr) return null
      return Math.floor((now - new Date(dateStr)) / (1000 * 60 * 60 * 24))
    }

    const hasHomeFacility = !!user.facility
    const ratingAtLeastS3 = user.rating >= 4
    const daysSincePromotion = daysSince(user.last_promotion)
    const meetsPromotionWindow = daysSincePromotion !== null && daysSincePromotion >= 90
    const alreadyVisitingZan = user.visits?.some((v) => v.facility === 'ZAN') ?? false

    res.json({
      cid: user.cid,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      facility: user.facility,
      rating: user.rating_short,
      checklist: [
        { label: 'Has a home facility', passed: hasHomeFacility },
        { label: 'Holds at least an S3 rating', passed: ratingAtLeastS3 },
        { label: 'At least 90 days since last promotion', passed: meetsPromotionWindow },
        { label: 'Not already visiting ZAN', passed: !alreadyVisitingZan },
        { label: 'Controlled 50 hours since promotion', passed: null },
        { label: 'No pending visiting applications', passed: null },
      ],
    })
  } catch (err) {
    console.error('Eligibility check error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

const MAX_REASON_LENGTH = 2000

// Must be logged in to submit a real application. Identity fields (name, email, facility,
// rating) are looked up from VATUSA using the logged-in session's own CID rather than trusted
// from the request body - otherwise anyone could submit an application under a fabricated
// name or claim a rating they don't hold. Only `reason` is genuinely free text from the
// applicant, so it's the only field still taken from the body.
router.post('/submit', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in to apply' })
  }

  let { reason } = req.body
  if (typeof reason === 'string') {
    reason = reason.trim().slice(0, MAX_REASON_LENGTH)
  }

  try {
    const user = await fetchVatusaUser(req.user.cid)
    if (!user) {
      return res.status(400).json({ error: 'Could not verify your VATUSA membership' })
    }

    submitApplication({
      cid: req.user.cid,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      facility: user.facility,
      rating: user.rating_short,
      reason,
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Application submit error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Staff only - list of pending applications, for the staff dashboard
router.get('/pending', requireRole('TA'), (req, res) => {
  res.json(getPendingApplications())
})

const APPLICATION_STATUSES = ['pending', 'approved', 'denied']

// Staff only - approve/deny an application
router.put('/:id/status', requireRole('TA'), (req, res) => {
  const { status } = req.body
  if (!APPLICATION_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }
  updateApplicationStatus(req.params.id, status)
  res.json({ success: true })
})

export default router