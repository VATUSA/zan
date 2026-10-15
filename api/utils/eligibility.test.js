import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateEligibility, failedChecks } from './eligibility.js'

const NOW = new Date('2026-10-15T12:00:00Z')

const eligible = {
  facility: 'ZDC',
  rating: 4,
  last_promotion: '2026-01-01 00:00:00',
  visiting_facilities: [],
}

const failedLabels = (user, opts) =>
  failedChecks(evaluateEligibility(user, { now: NOW, ...opts })).map((c) => c.label)

test('an eligible S3 from another facility passes everything checkable', () => {
  assert.deepEqual(failedLabels(eligible), [])
})

test('rating below S3 fails', () => {
  assert.deepEqual(failedLabels({ ...eligible, rating: 3 }), ['Holds at least an S3 rating'])
})

test('no home facility fails', () => {
  assert.ok(failedLabels({ ...eligible, facility: '' }).includes('Has a home facility'))
})

test('a ZAN home controller cannot apply to visit ZAN', () => {
  assert.deepEqual(failedLabels({ ...eligible, facility: 'ZAN' }), ['Home facility is not ZAN'])
})

test('promoted less than 90 days ago fails', () => {
  const recent = { ...eligible, last_promotion: '2026-09-20 00:00:00' }
  assert.deepEqual(failedLabels(recent), ['At least 90 days since last promotion'])
})

test('missing promotion date fails the promotion check', () => {
  assert.deepEqual(failedLabels({ ...eligible, last_promotion: null }), [
    'At least 90 days since last promotion',
  ])
})

test('already visiting ZAN fails (visiting_facilities)', () => {
  const user = { ...eligible, visiting_facilities: [{ facility: 'ZAN' }] }
  assert.deepEqual(failedLabels(user), ['Not already visiting ZAN'])
})

test('already visiting ZAN fails (legacy visits field)', () => {
  const { visiting_facilities, ...rest } = eligible
  void visiting_facilities
  assert.deepEqual(failedLabels({ ...rest, visits: [{ facility: 'ZAN' }] }), ['Not already visiting ZAN'])
})

test('a pending application fails', () => {
  assert.deepEqual(failedLabels(eligible, { hasPending: true }), ['No pending visiting applications'])
})

test('the 50 hour check is left to staff', () => {
  const item = evaluateEligibility(eligible, { now: NOW }).find((c) => c.label.includes('50 hours'))
  assert.equal(item.passed, null)
})
