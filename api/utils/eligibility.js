import { isVisitingZan } from './visiting.js'

const MIN_RATING = 4 // VATSIM rating id for S3
const MIN_DAYS_SINCE_PROMOTION = 90

function daysSince(dateStr, now) {
  if (!dateStr) return null
  const then = new Date(dateStr)
  if (Number.isNaN(then.getTime())) return null
  return Math.floor((now - then) / (1000 * 60 * 60 * 24))
}

// The single source of truth for "can this person apply to visit ZAN?". The eligibility
// endpoint shows the result to the applicant; the submit endpoint enforces it. Items with
// `passed: null` can't be checked automatically and are left to staff review.
export function evaluateEligibility(vatusaUser, { hasPending = false, now = new Date() } = {}) {
  const homeFacility = typeof vatusaUser.facility === 'string' ? vatusaUser.facility.trim() : ''
  const days = daysSince(vatusaUser.last_promotion, now)

  return [
    { label: 'Has a home facility', passed: homeFacility !== '' },
    { label: 'Home facility is not ZAN', passed: homeFacility !== 'ZAN' },
    { label: 'Holds at least an S3 rating', passed: Number(vatusaUser.rating) >= MIN_RATING },
    {
      label: `At least ${MIN_DAYS_SINCE_PROMOTION} days since last promotion`,
      passed: days !== null && days >= MIN_DAYS_SINCE_PROMOTION,
    },
    { label: 'Not already visiting ZAN', passed: !isVisitingZan(vatusaUser) },
    { label: 'Controlled 50 hours since promotion', passed: null },
    { label: 'No pending visiting applications', passed: !hasPending },
  ]
}

export function failedChecks(checklist) {
  return checklist.filter((item) => item.passed === false)
}
