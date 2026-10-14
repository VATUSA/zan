// Loading dotenv here, as the very first thing imported by index.js, matters more than it
// looks like it should. ES module imports are hoisted and fully evaluated before any statement
// in the importing file runs - so if dotenv.config() is called from inside index.js *after*
// `import authRoutes from './routes/auth.js'`, every module-level `process.env.X` read in
// routes/auth.js (like the cookie's `secure` flag) already ran against an empty environment.
// Importing this file first, and doing the dotenv side effect here, avoids that trap for
// every file that reads env vars at module load time instead of inside a request handler.
import 'dotenv/config'

// Vars the app cannot run safely without. If any of these are missing, fail loudly at boot
// instead of limping along with `undefined` silently breaking auth, cookies, or CORS.
const REQUIRED_ENV_VARS = [
  'SESSION_SECRET',
  'VATUSA_API_KEY',
  'VATSIM_CLIENT_ID',
  'VATSIM_CLIENT_SECRET',
  'VATSIM_TOKEN_URL',
  'FRONTEND_URL',
  'FRONTEND_REDIRECT_URI',
]

export const isDevelopment = process.env.NODE_ENV === 'development'

// Secure defaults to ON. You have to opt OUT by explicitly setting NODE_ENV=development -
// any other value (including it being unset) keeps cookies Secure.
export const COOKIE_OPTIONS = {
  httpOnly: true,       // JavaScript in the browser can't read or touch this cookie at all
  sameSite: 'lax',      // sent on normal navigation, blocks most cross-site abuse
  secure: !isDevelopment, // only off for explicit local dev; on by default everywhere else
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in milliseconds
}

// Called once at startup. Exits the process with a clear message rather than letting the
// server come up half-configured (e.g. CORS silently open to every origin because
// FRONTEND_URL is blank, or sessions unverifiable because SESSION_SECRET is empty).
export function checkEnv() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name])

  if (missing.length > 0) {
    console.error('Missing required environment variable(s): ' + missing.join(', '))
    console.error('Copy .env.example to .env and fill these in before starting the server.')
    process.exit(1)
  }

  // FRONTEND_REDIRECT_URI is sent to VATSIM during OAuth and must be an allowed redirect
  // for the app; FRONTEND_URL is what CORS trusts for credentialed requests. They should
  // always point at the same origin - if they don't, something is misconfigured.
  try {
    const redirectOrigin = new URL(process.env.FRONTEND_REDIRECT_URI).origin
    const frontendOrigin = new URL(process.env.FRONTEND_URL).origin
    if (redirectOrigin !== frontendOrigin) {
      console.error(
        `FRONTEND_REDIRECT_URI (${redirectOrigin}) and FRONTEND_URL (${frontendOrigin}) ` +
        'must be on the same origin.'
      )
      process.exit(1)
    }
  } catch {
    console.error('FRONTEND_URL and FRONTEND_REDIRECT_URI must both be valid URLs.')
    process.exit(1)
  }

  console.log(
    `Environment OK. NODE_ENV=${process.env.NODE_ENV ?? '(unset)'}, ` +
    `secure cookies: ${isDevelopment ? 'OFF (development)' : 'ON'}` +
    (isDevelopment ? ' - set NODE_ENV=development only for local http dev' : '')
  )
}
