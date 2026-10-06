import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './routes/auth.js'
import rosterRoutes from './routes/roster.js'
import applyRoutes from './routes/apply.js'
import feedbackRoutes from './routes/feedback.js'
import eventsRoutes from './routes/events.js'
import filesRoutes from './routes/files.js'
import { seedInitialRoles } from './db.js'
import { attachUser } from './middleware/auth.js'
import discordRoutes from './routes/discord.js'
import adminRoutes from './routes/admin.js'
import weatherRoutes from './routes/weather.js'

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
app.use('/api/discord', discordRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/weather', weatherRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})