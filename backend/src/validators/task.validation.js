import { check } from 'express-validator'
import { TASK_PRIORITIES, TASK_STATUSES } from '../models/Task.js'

export const createTaskValidation = [
  check('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Max length is 100'),
  check('description')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Description too long'),
  check('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(TASK_STATUSES)
    .withMessage(`Status must be one of: ${TASK_STATUSES.join(', ')}`),
  check('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(TASK_PRIORITIES)
    .withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  check('dueDate')
    .notEmpty()
    .withMessage('Due Date is required')
    .isISO8601()
    .withMessage('Due Date must be a valid ISO date'),
]

export const updateTaskValidation = [
  // Allow partial updates, but validate any field provided.
  check('title')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  check('description')
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Description too long'),
  check('status')
    .optional({ nullable: true })
    .isIn(TASK_STATUSES)
    .withMessage(`Status must be one of: ${TASK_STATUSES.join(', ')}`),
  check('priority')
    .optional({ nullable: true })
    .isIn(TASK_PRIORITIES)
    .withMessage(`Priority must be one of: ${TASK_PRIORITIES.join(', ')}`),
  check('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due Date must be a valid ISO date'),
]

