// config.js must be the first import in this file. ES module imports are hoisted and
// evaluated in source order before any of index.js's own code runs - so because config.js
// is listed first, its dotenv side effect happens before routes/auth.js (and anything else
// below) is evaluated, instead of racing it. See config.js for the rest of the story.
import { checkEnv } from './config.js'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import authRoutes from './routes/auth.js'
import rosterRoutes from './routes/roster.js'
import applyRoutes from './routes/apply.js'
import feedbackRoutes from './routes/feedback.js'
import eventsRoutes from './routes/events.js'
import filesRoutes from './routes/files.js'
import { seedInitialRoles } from './db.js'
import { attachUser } from './middleware/auth.js'

checkEnv()

seedInitialRoles()
console.log('Database connected, roles seeded.')

const app = express()
const PORT = process.env.PORT || 4000

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

app.use('/api/auth', authRoutes)
app.use('/api/roster', rosterRoutes)
app.use('/api/apply', applyRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/files', filesRoutes)

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