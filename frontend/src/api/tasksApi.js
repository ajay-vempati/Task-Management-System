import api from './client'

export const listTasks = async (params) => {
  const res = await api.get('/api/tasks', { params })
  return res.data
}

export const createTask = async (payload) => {
  const res = await api.post('/api/tasks', payload)
  return res.data
}

export const updateTask = async (id, payload) => {
  const res = await api.put(`/api/tasks/${id}`, payload)
  return res.data
}

export const deleteTask = async (id) => {
  const res = await api.delete(`/api/tasks/${id}`)
  return res.data
}

export const completeTask = async (id) => {
  const res = await api.patch(`/api/tasks/${id}/complete`)
  return res.data
}

export const getAnalytics = async () => {
  const res = await api.get('/api/tasks/analytics')
  return res.data
}

