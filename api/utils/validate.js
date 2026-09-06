// VATSIM CIDs are always a plain number, 6-10 digits. Anything else (a path segment like
// "..%2f..%2ffacility%2fZAN%2froster", for example) must never reach a URL we build for an
// upstream request - it would be interpreted as part of that URL's path, not as a CID.
export function parseCid(value) {
  const str = String(value ?? '').trim()
  if (!/^[0-9]{6,10}$/.test(str)) {
    return null
  }
  return Number(str)
}
