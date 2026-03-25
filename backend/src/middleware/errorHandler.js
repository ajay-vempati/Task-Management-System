import ApiError from '../utils/ApiError.js'

// Global error handler to keep responses consistent.
export default function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  // express-validator errors often come with an array in `details`
  const payload = {
    message,
  }

  if (err.details) payload.details = err.details

  if (statusCode === 500 && process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack
  }

  res.status(statusCode).json(payload)
}

