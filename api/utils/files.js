import { hasMinimumRole } from './roles.js'

// null = visible to everyone. A role code = you need at least that role to see it.
// Matches the six tabs the frontend offers (FilesTabs.jsx).
export const FILE_CATEGORIES = {
  'SOPs': null,
  'LOAs': null,
  'Training': null,
  'Policies': null,
  'Resources': null,
  'Admin Policies': 'TA',
}

export function isKnownCategory(category) {
  return Object.hasOwn(FILE_CATEGORIES, category)
}

// Fail closed: a category that isn't one of the known ones (which shouldn't be
// possible once isKnownCategory() is enforced on upload, but covers any row that predates
// that check) is treated as needing TA+ rather than being visible to everyone.
export function canSeeCategory(zanRole, category) {
  const requiredRole = Object.hasOwn(FILE_CATEGORIES, category) ? FILE_CATEGORIES[category] : 'TA'
  if (requiredRole === null) return true
  return hasMinimumRole(zanRole, requiredRole)
}
