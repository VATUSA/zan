export const API_URL = import.meta.env.VITE_API_URL

export const VATSIM_AUTH_URL = import.meta.env.VITE_VATSIM_AUTH_URL
export const VATSIM_CLIENT_ID = import.meta.env.VITE_VATSIM_CLIENT_ID

// Defaults to wherever this build is actually being served from, so it can never drift from
// what the API expects. The backend independently requires its own FRONTEND_REDIRECT_URI to
// be on the same origin as FRONTEND_URL (see api/config.js) - so as long as this site is
// served from the URL the API's FRONTEND_URL points at, the two always agree without either
// side's .env needing to be updated in lockstep.
export const VATSIM_REDIRECT_URI =
  import.meta.env.VITE_VATSIM_REDIRECT_URI || `${window.location.origin}/`

// Names of any OAuth config values that ended up undefined - used to show a clear error
// instead of silently sending someone to a broken or wrong VATSIM login page.
export const missingAuthConfig = [
  !VATSIM_AUTH_URL && 'VITE_VATSIM_AUTH_URL',
  !VATSIM_CLIENT_ID && 'VITE_VATSIM_CLIENT_ID',
].filter(Boolean)
