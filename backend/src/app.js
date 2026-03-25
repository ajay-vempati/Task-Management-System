import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes.js'
import taskRoutes from './routes/task.routes.js'
import ApiError from './utils/ApiError.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

// 404 handler for unknown routes.
app.use((req, res, next) => next(new ApiError(404, 'Route not found')))

app.use(errorHandler)

export default app

