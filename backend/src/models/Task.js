import mongoose from 'mongoose'

export const TASK_STATUSES = ['Todo', 'In Progress', 'Done']
export const TASK_PRIORITIES = ['Low', 'Medium', 'High']

const priorityToRank = {
  Low: 1,
  Medium: 2,
  High: 3,
}

const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    status: {
      type: String,
      required: true,
      enum: TASK_STATUSES,
      default: 'Todo',
    },
    priority: {
      type: String,
      required: true,
      enum: TASK_PRIORITIES,
      default: 'Medium',
    },
    priorityRank: {
      type: Number,
      required: true,
      default: priorityToRank.Medium,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
)

// Indices for efficient listing and filtering.
TaskSchema.index({ userId: 1, status: 1, priority: 1, dueDate: 1 })
// Useful for title search (word-level). UI uses regex too, but this helps in some cases.
TaskSchema.index({ title: 'text' })

TaskSchema.pre('validate', function (next) {
  if (this.priority) {
    this.priorityRank = priorityToRank[this.priority] ?? priorityToRank.Medium
  }
  next()
})

TaskSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() || {}
  const $set = update.$set || {}
  const priority = $set.priority ?? update.priority
  if (priority) {
    $set.priorityRank = priorityToRank[priority] ?? priorityToRank.Medium
  }
  this.setUpdate({ ...update, $set })
  next()
})

export default mongoose.model('Task', TaskSchema)

