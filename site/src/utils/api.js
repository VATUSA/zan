import { API_URL } from '../config'

// fetch() only rejects on a network failure - a 401 or 500 still "succeeds" as far as fetch
// is concerned, so without checking response.ok an error body like { error: "..." } ends up
// wherever the caller expected real data (often an array), and the next render throws or
// silently shows nothing. Every GET in this app should go through this instead of a bare
// fetch().then(res => res.json()).
export async function apiGet(path) {
  const response = await fetch(`${API_URL}${path}`, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`GET ${path} failed (${response.status})`)
  }
  return response.json()
}
