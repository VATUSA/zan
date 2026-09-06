// config.js must be the first import in this file. ES module imports are hoisted and
// evaluated in source order before any of index.js's own code runs - so because config.js
// is listed first, its dotenv side effect happens before routes/auth.js (and anything else
// below) is evaluated, instead of racing it. See config.js for the rest of the story.
import { checkEnv } from './config.js'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})