import jwt from 'jsonwebtoken'

export function createSessionToken(user) {
  return jwt.sign({ cid: user.cid, name: user.name }, process.env.SESSION_SECRET, { expiresIn: '7d' })
}

export function verifySessionToken(token) {
  try {
    return jwt.verify(token, process.env.SESSION_SECRET)
  } catch {
    return null
  }
}