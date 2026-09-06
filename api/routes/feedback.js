import express from 'express'
import { submitFeedback, getAllFeedback, getReviewedFeedbackForController, getFeedbackByPilot, markFeedbackReviewed } from '../db.js'
import { requireRole } from '../middleware/auth.js'

const router = express.Router()

const FEEDBACK_RATINGS = ['Excellent', 'Good', 'Fair', 'Poor']
// `position` is the ATC position being rated (e.g. "ANC_APP"), typed freely - not an enum.
// Just cap its shape/length rather than allowlisting exact values.
const CALLSIGN_PATTERN = /^[A-Z0-9_-]{1,16}$/
const MAX_COMMENTS_LENGTH = 2000

// Must be logged in to submit
router.post('/', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in to submit feedback' })
  }

  const { controllerCid, position, rating, comments } = req.body
  if (!FEEDBACK_RATINGS.includes(rating)) {
    return res.status(400).json({ error: 'Invalid rating' })
  }
  if (position && !CALLSIGN_PATTERN.test(position)) {
    return res.status(400).json({ error: 'Invalid position/callsign' })
  }
  if (typeof comments === 'string' && comments.length > MAX_COMMENTS_LENGTH) {
    return res.status(400).json({ error: 'Comments are too long' })
  }

  submitFeedback({
    controllerCid: controllerCid || null,
    position,
    rating,
    comments,
    pilotCid: req.user.cid,
    pilotName: req.user.name,
    // pilotCallsign is a distinct column for the pilot's own aircraft callsign - `position`
    // is the ATC position being rated, a different thing entirely. There's no form field
    // that actually collects the pilot's callsign, so there's nothing correct to put here.
    pilotCallsign: null,
  })
  res.json({ success: true })
})

// Staff only - all feedback (for the dashboard)
router.get('/', requireRole('TA'), (req, res) => {
  res.json(getAllFeedback())
})

// Staff only - reviewed feedback about one specific controller (for their profile page)
router.get('/controller/:cid', requireRole('TA'), (req, res) => {
  res.json(getReviewedFeedbackForController(req.params.cid))
})

// A pilot's own submitted feedback (for "My Feedback" tab) - only your own
router.get('/mine', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in' })
  }
  res.json(getFeedbackByPilot(req.user.cid))
})

// Staff only - mark reviewed
router.put('/:id/reviewed', requireRole('TA'), (req, res) => {
  markFeedbackReviewed(req.params.id)
  res.json({ success: true })
})

router.get('/about-me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in' })
  }
  res.json(getReviewedFeedbackForController(req.user.cid))
})

export default router