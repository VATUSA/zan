import { ALL_ROLES } from './roles.js'

const FACILITY = 'ZAN'

// VATUSA's user lookup includes a `roles` list of { cid, facility, role }. Returns the ZAN
// roles in it that this site knows about (ATM, DATM, TA, EC, WM, FE, INS, MTR), or null if the
// response has no usable `roles` list - callers must treat null as "don't touch anything",
// otherwise a bad or partial response would strip people's roles.
export function extractZanRoles(vatusaUser) {
  const list = vatusaUser?.roles
  if (!Array.isArray(list)) return null

  const roles = new Set()
  for (const entry of list) {
    if (entry?.facility === FACILITY && ALL_ROLES.includes(entry.role)) {
      roles.add(entry.role)
    }
  }
  return [...roles]
}

// Works out what to change for one member. `existingRows` is their current rows: { role, source }.
// - A VATUSA role they don't have yet is added.
// - A role this sync added earlier (source 'vatusa') that VATUSA no longer lists is removed.
// - Roles added by hand ('manual': seeded staff, the site's role manager, the sandbox test
//   accounts) are never removed, so a sync can't lock anyone out.
export function planRoleSync(existingRows, vatusaRoles) {
  const wanted = new Set(vatusaRoles)
  const have = new Set(existingRows.map((r) => r.role))

  const toAdd = [...wanted].filter((role) => !have.has(role))
  const toRemove = existingRows
    .filter((r) => r.source === 'vatusa' && !wanted.has(r.role))
    .map((r) => r.role)

  return { toAdd, toRemove }
}
