import express from 'express'
import { submitFeedback, getAllFeedback, getReviewedFeedbackForController, getFeedbackByPilot, markFeedbackReviewed } from '../db.js'
import { requireRole } from '../middleware/auth.js'

const router = express.Router()

// Must be logged in to submit
router.post('/', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Must be logged in to submit feedback' })
  }

  const { controllerCid, position, rating, comments } = req.body
  if (!rating) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  submitFeedback({
    controllerCid: controllerCid || null,
    position,
    rating,
    comments,
    pilotCid: req.user.cid,
    pilotName: req.user.name,
    pilotCallsign: position,
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

export default router