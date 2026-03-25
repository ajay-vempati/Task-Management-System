import jwt from 'jsonwebtoken'
import ApiError from '../utils/ApiError.js'

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Missing authorization token'))
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
    next()
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired token'))
  }
}

