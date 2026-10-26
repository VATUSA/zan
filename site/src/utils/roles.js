const ROLE_LEVELS = {
  ATM: 100,
  DATM: 90,
  TA: 80,
  EC: 70,
  WM: 70,
  FE: 70,
  INS: 60,
  MTR: 50,
}

export function getRoleLevel(zanRole) {
  return ROLE_LEVELS[zanRole] ?? 0
}

export function hasMinimumRole(zanRole, requiredRole) {
  return getRoleLevel(zanRole) >= getRoleLevel(requiredRole)
}

export const ALL_ROLES = Object.keys(ROLE_LEVELS)

export function getHighestRole(roles) {
  if (!roles || roles.length === 0) return null
  return roles.reduce((highest, r) => (getRoleLevel(r) > getRoleLevel(highest) ? r : highest), roles[0])
}