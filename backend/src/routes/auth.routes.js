import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

import validateRequest from '../validators/validateRequest.js'
import { signupValidation, loginValidation } from '../validators/auth.validation.js'

const router = express.Router()

router.post(
  '/signup',
  signupValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) throw new ApiError(409, 'Email is already registered')

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      email,
      passwordHash,
    })

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    )

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    })
  }),
)

router.post(
  '/login',
  loginValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) throw new ApiError(401, 'Invalid email or password')

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new ApiError(401, 'Invalid email or password')

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    )

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    })
  }),
)

export default router

