// window.__ENV__ is written by the nginx entrypoint from the container's runtime env
// (see docker-entrypoint.d/40-env-config.sh) - it takes priority so a built image can be
// deployed to any environment. Falls back to import.meta.env for `npm run dev`, where
// there is no container to inject it and Vite reads straight from a local .env file.
const env = (name) => window.__ENV__?.[name] || import.meta.env[name]

export const API_URL = env('VITE_API_URL')

export const VATSIM_AUTH_URL = env('VITE_VATSIM_AUTH_URL')
export const VATSIM_CLIENT_ID = env('VITE_VATSIM_CLIENT_ID')

// Defaults to wherever this build is actually being served from, so it can never drift from
// what the API expects. The backend independently requires its own FRONTEND_REDIRECT_URI to
// be on the same origin as FRONTEND_URL (see api/config.js) - so as long as this site is
// served from the URL the API's FRONTEND_URL points at, the two always agree without either
// side's .env needing to be updated in lockstep.
export const VATSIM_REDIRECT_URI = env('VITE_VATSIM_REDIRECT_URI') || `${window.location.origin}/`

// Names of any OAuth config values that ended up undefined - used to show a clear error
// instead of silently sending someone to a broken or wrong VATSIM login page.
export const missingAuthConfig = [
  !VATSIM_AUTH_URL && 'VITE_VATSIM_AUTH_URL',
  !VATSIM_CLIENT_ID && 'VITE_VATSIM_CLIENT_ID',
].filter(Boolean)
