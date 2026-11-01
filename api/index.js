// config.js must be the first import in this file. ES module imports are hoisted and
// evaluated in source order before any of index.js's own code runs - so because config.js
// is listed first, its dotenv side effect happens before routes/auth.js (and anything else
// below) is evaluated, instead of racing it. See config.js for the rest of the story.
import { checkEnv } from './config.js'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import rosterRoutes from './routes/roster.js'
import applyRoutes from './routes/apply.js'
import feedbackRoutes from './routes/feedback.js'
import eventsRoutes from './routes/events.js'
import filesRoutes from './routes/files.js'
import { seedInitialRoles } from './db.js'
import { attachUser } from './middleware/auth.js'
import adminRoutes from './routes/admin.js'
import weatherRoutes from './routes/weather.js'

checkEnv()

seedInitialRoles()
console.log('Database connected, roles seeded.')

const app = express()
const PORT = process.env.PORT || 4000

// A specific hop count, never `true`. `true` trusts X-Forwarded-For from anyone, which lets
// a client hand the rate limiter (and anything else keyed on IP) whatever "IP" it wants -
// both evading its own limit and poisoning another user's bucket. Defaults to 0 (trust
// nothing, use the raw socket address) rather than assuming a reverse proxy is present -
// an assumed "1" is just as spoofable as `true` when there's actually no proxy in front
// stripping/overwriting client-supplied X-Forwarded-For. Set TRUST_PROXY_HOPS to the real
// number of trusted reverse proxies in front of this server once deployed.
const trustProxyHops = process.env.TRUST_PROXY_HOPS !== undefined
  ? Number(process.env.TRUST_PROXY_HOPS)
  : 0
app.set('trust proxy', trustProxyHops)

// A generous baseline for every route - this exists to blunt abuse/DoS, not to ration
// normal use. A single event page fires several requests per load (more under React
// StrictMode in dev), so this needs real headroom.
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }))

// Tighter limits on the routes that either cost money (VATUSA/VATSIM calls) or are the
// natural target of brute-forcing/spam: auth, applications, and feedback submission.
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
})

app.use(helmet({
  // This is a pure JSON + file-download API with no HTML pages of its own, so helmet's
  // default CSP (meant for rendered pages) doesn't apply here and only adds noise.
  contentSecurityPolicy: false,
  // helmet defaults resources to same-origin only, which would block the frontend (a
  // different origin) from embedding anything served here - e.g. an <img> or <iframe> onto
  // an uploaded file - even though plain <a href> downloads aren't affected either way.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))
app.use(cookieParser())
app.use(attachUser)
app.use(express.json())

app.get('/', (req, res) => {
  res.send('ZAN RTAC API is running')
})

app.use('/api/auth', strictLimiter, authRoutes)
app.use('/api/roster', rosterRoutes)
app.use('/api/apply', strictLimiter, applyRoutes)
app.use('/api/feedback', strictLimiter, feedbackRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/files', filesRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/weather', weatherRoutes)

// Unmatched API routes get a JSON 404 instead of Express's default HTML page.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Last stop for anything thrown or passed to next(err) in a route above. Without this,
// Express's built-in handler sends a full stack trace to the browser whenever NODE_ENV
// isn't exactly "production" - which, before the previous commits, was effectively always.
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }
  console.error('Unhandled error:', err)
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File is too large' })
  }
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})