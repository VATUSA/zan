import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isKnownCategory, canSeeCategory } from './files.js'

test('Policies and Resources are known and public', () => {
  for (const category of ['Policies', 'Resources']) {
    assert.equal(isKnownCategory(category), true)
    assert.equal(canSeeCategory(undefined, category), true)
  }
})

test('Admin Policies and unknown categories stay hidden from the public', () => {
  assert.equal(canSeeCategory(undefined, 'Admin Policies'), false)
  assert.equal(canSeeCategory(undefined, 'Misc'), false)
})
