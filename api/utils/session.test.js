import test from 'node:test'
import assert from 'node:assert/strict'
import { createSessionToken, verifySessionToken } from './session.js'

process.env.SESSION_SECRET = 'test-secret-test-secret-test-secret'

test('a session issued with a string CID (old logins) comes back with a number', () => {
  const token = createSessionToken({ cid: '1234567', name: 'Test User' })
  const session = verifySessionToken(token)
  assert.equal(session.cid, 1234567)
  assert.equal(typeof session.cid, 'number')
})

test('a numeric CID round-trips unchanged', () => {
  const token = createSessionToken({ cid: 1234567, name: 'Test User' })
  assert.equal(verifySessionToken(token).cid, 1234567)
})

test('a session whose CID is not a number is rejected', () => {
  const token = createSessionToken({ cid: 'abc', name: 'Test User' })
  assert.equal(verifySessionToken(token), null)
})

test('a bad token is rejected', () => {
  assert.equal(verifySessionToken('not-a-token'), null)
})
