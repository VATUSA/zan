import express from 'express'
import { submitApplication, getPendingApplications, updateApplicationStatus } from '../db.js'
import { requireRole } from '../middleware/auth.js'
import { parseCid } from '../utils/validate.js'

const router = express.Router()

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
    const response = await fetch(
      `https://api.vatusa.net/v2/user/${cid}?apikey=${process.env.VATUSA_API_KEY}`
    )
    const data = await response.json()

    if (!response.ok || !data.data) {
      return res.status(400).json({ error: 'Could not look up user' })
    }

    const user = data.data
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

// Must be logged in to submit a real application
router.post('/submit', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in to apply' })
  }

  const { fname, lname, email, facility, rating, reason } = req.body
  if (!fname || !lname) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  submitApplication({ cid: req.user.cid, fname, lname, email, facility, rating, reason })
  res.json({ success: true })
})

// Staff only - list of pending applications, for the staff dashboard
router.get('/pending', requireRole('TA'), (req, res) => {
  res.json(getPendingApplications())
})

// Staff only - approve/deny an application
router.put('/:id/status', requireRole('TA'), (req, res) => {
  const { status } = req.body
  updateApplicationStatus(req.params.id, status)
  res.json({ success: true })
})

export default router