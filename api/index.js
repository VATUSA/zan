import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import rosterRoutes from './routes/roster.js'
import applyRoutes from './routes/apply.js'

dotenv.config()

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('ZAN RTAC API is running')
})

app.use('/api/auth', authRoutes)
app.use('/api/roster', rosterRoutes)
app.use('/api/apply', applyRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})