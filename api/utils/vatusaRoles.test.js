import test from 'node:test'
import assert from 'node:assert/strict'
import { extractZanRoles, planRoleSync } from './vatusaRoles.js'

test('keeps only ZAN roles the site knows about', () => {
  const user = {
    roles: [
      { cid: 1, facility: 'ZAN', role: 'ATM' },
      { cid: 1, facility: 'ZDC', role: 'TA' },
      { cid: 1, facility: 'ZAN', role: 'US3' },
      { cid: 1, facility: 'ZAN', role: 'MTR' },
    ],
  }
  assert.deepEqual(extractZanRoles(user).sort(), ['ATM', 'MTR'])
})

test('duplicate entries collapse to one', () => {
  const user = { roles: [{ facility: 'ZAN', role: 'WM' }, { facility: 'ZAN', role: 'WM' }] }
  assert.deepEqual(extractZanRoles(user), ['WM'])
})

test('an empty roles list means no ZAN roles', () => {
  assert.deepEqual(extractZanRoles({ roles: [] }), [])
})

test('a missing or malformed roles list returns null (do not touch anything)', () => {
  assert.equal(extractZanRoles({}), null)
  assert.equal(extractZanRoles({ roles: 'nope' }), null)
  assert.equal(extractZanRoles(null), null)
})

test('adds roles VATUSA has that the site does not', () => {
  const plan = planRoleSync([{ role: 'WM', source: 'manual' }], ['ATM'])
  assert.deepEqual(plan, { toAdd: ['ATM'], toRemove: [] })
})

test('removes a role that came from VATUSA and is no longer listed', () => {
  const plan = planRoleSync([{ role: 'TA', source: 'vatusa' }], [])
  assert.deepEqual(plan, { toAdd: [], toRemove: ['TA'] })
})

test('never removes manually added roles', () => {
  const plan = planRoleSync([{ role: 'WM', source: 'manual' }, { role: 'INS', source: 'manual' }], [])
  assert.deepEqual(plan, { toAdd: [], toRemove: [] })
})

test('does not re-add a role the member already has by hand', () => {
  const plan = planRoleSync([{ role: 'ATM', source: 'manual' }], ['ATM'])
  assert.deepEqual(plan, { toAdd: [], toRemove: [] })
})

test('an unchanged VATUSA role is left alone', () => {
  const plan = planRoleSync([{ role: 'ATM', source: 'vatusa' }], ['ATM'])
  assert.deepEqual(plan, { toAdd: [], toRemove: [] })
})
