import dotenv from 'dotenv'

import connectDB from './config/db.js'
import app from './app.js'
import ApiError from './utils/ApiError.js'

dotenv.config()

const PORT = process.env.PORT || 5000

try {
  await connectDB()
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Failed to connect to MongoDB:', err)
  throw new ApiError(500, 'Failed to connect to MongoDB')
}

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`)
})

