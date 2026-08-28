import express from 'express'

const router = express.Router()

router.get('/eligibility/:cid', async (req, res) => {
  const { cid } = req.params

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
    const ratingAtLeastS3 = user.rating >= 4 // S3 is rating id 4 in VATSIM's scale
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
        { label: 'Controlled 50 hours since promotion', passed: null }, // can't verify yet
        { label: 'No pending visiting applications', passed: null }, // can't verify yet
      ],
    })
  } catch (err) {
    console.error('Eligibility check error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router