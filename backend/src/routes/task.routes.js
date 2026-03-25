import express from 'express'
import mongoose from 'mongoose'

import Task, { TASK_PRIORITIES, TASK_STATUSES } from '../models/Task.js'
import authMiddleware from '../middleware/authMiddleware.js'
import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import validateRequest from '../validators/validateRequest.js'
import { createTaskValidation, updateTaskValidation } from '../validators/task.validation.js'

const router = express.Router()

router.use(authMiddleware)

router.get(
  '/analytics',
  asyncHandler(async (req, res) => {
    const userId = req.user.id

    const breakdownArr = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const breakdown = {
      Todo: 0,
      'In Progress': 0,
      Done: 0,
    }

    for (const row of breakdownArr) {
      if (row?._id && typeof row.count === 'number') breakdown[row._id] = row.count
    }

    const totalTasks = breakdown.Todo + breakdown['In Progress'] + breakdown.Done
    const completedTasks = breakdown.Done
    const pendingTasks = totalTasks - completedTasks
    const completionPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionPercentage,
      breakdown,
    })
  }),
)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user.id

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50)
    const sortBy = req.query.sortBy === 'priority' ? 'priority' : 'dueDate'
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1

    const query = { userId }

    if (req.query.status && TASK_STATUSES.includes(req.query.status)) {
      query.status = req.query.status
    }
    if (req.query.priority && TASK_PRIORITIES.includes(req.query.priority)) {
      query.priority = req.query.priority
    }
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      query.title = { $regex: req.query.search.trim(), $options: 'i' }
    }

    const sort =
      sortBy === 'priority'
        ? { priorityRank: sortOrder }
        : { dueDate: sortOrder }

    const total = await Task.countDocuments(query)
    const totalPages = Math.max(Math.ceil(total / limit), 1)

    const tasks = await Task.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-priorityRank')

    res.json({
      tasks,
      pagination: { page, limit, total, totalPages },
    })
  }),
)

router.post(
  '/',
  createTaskValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { title, description, status, priority, dueDate } = req.body

    const task = await Task.create({
      userId: req.user.id,
      title,
      description: description ?? '',
      status,
      priority,
      dueDate,
    })

    res.status(201).json(task)
  }),
)

router.patch(
  '/:id/complete',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid task id')

    const task = await Task.findOne({ _id: id, userId: req.user.id })
    if (!task) throw new ApiError(404, 'Task not found')

    task.status = 'Done'
    await task.save()

    res.json(task)
  }),
)

router.put(
  '/:id',
  updateTaskValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid task id')

    const task = await Task.findOne({ _id: id, userId: req.user.id })
    if (!task) throw new ApiError(404, 'Task not found')

    const { title, description, status, priority, dueDate } = req.body

    if (title !== undefined) task.title = title
    if (description !== undefined) task.description = description ?? ''
    if (status !== undefined) task.status = status
    if (priority !== undefined) task.priority = priority
    if (dueDate !== undefined) task.dueDate = dueDate

    await task.save()

    res.json(task)
  }),
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid task id')

    const result = await Task.findOneAndDelete({ _id: id, userId: req.user.id })
    if (!result) throw new ApiError(404, 'Task not found')

    res.json({ message: 'Task deleted' })
  }),
)

export default router

