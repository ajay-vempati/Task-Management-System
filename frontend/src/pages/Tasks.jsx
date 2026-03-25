import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import * as tasksApi from '../api/tasksApi'
import TaskFormModal from '../components/TaskFormModal'

const statuses = ['Todo', 'In Progress', 'Done']
const priorities = ['Low', 'Medium', 'High']

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString()
}

function statusBadgeClass(status) {
  if (status === 'Done') return 'badge badge-success'
  if (status === 'In Progress') return 'badge badge-primary'
  return 'badge'
}

function priorityBadgeClass(priority) {
  if (priority === 'High') return 'badge badge-warning'
  if (priority === 'Medium') return 'badge badge-primary'
  return 'badge'
}

export default function Tasks() {
  const { user } = useContext(AuthContext)

  const [tasks, setTasks] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [status, setStatus] = useState('All')
  const [priority, setPriority] = useState('All')
  const [search, setSearch] = useState('')

  const [sortBy, setSortBy] = useState('dueDate') // dueDate | priority
  const [sortOrder, setSortOrder] = useState('asc') // asc | desc

  const [page, setPage] = useState(1)
  const limit = 10

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // create | edit
  const [selectedTask, setSelectedTask] = useState(null)
  const [modalBusy, setModalBusy] = useState(false)
  const [modalError, setModalError] = useState('')

  const appliedFilters = useMemo(() => ({ status, priority, search: search.trim() }), [status, priority, search])

  const loadTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
      }

      if (appliedFilters.status !== 'All') params.status = appliedFilters.status
      if (appliedFilters.priority !== 'All') params.priority = appliedFilters.priority
      if (appliedFilters.search) params.search = appliedFilters.search

      const data = await tasksApi.listTasks(params)
      setTasks(data.tasks || [])
      setPagination(data.pagination || { page: 1, limit, total: 0, totalPages: 1 })
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  // Fetch tasks when controls change.
  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, priority, search, sortBy, sortOrder])

  const openCreate = () => {
    setModalMode('create')
    setSelectedTask(null)
    setModalError('')
    setModalOpen(true)
  }

  const openEdit = (task) => {
    setModalMode('edit')
    setSelectedTask(task)
    setModalError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedTask(null)
    setModalError('')
  }

  const onModalSubmit = async (payload) => {
    setModalBusy(true)
    setModalError('')
    try {
      if (modalMode === 'create') {
        await tasksApi.createTask(payload)
      } else {
        await tasksApi.updateTask(selectedTask._id, payload)
      }
      closeModal()
      await loadTasks()
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Failed to save task')
      throw err
    } finally {
      setModalBusy(false)
    }
  }

  const onDelete = async (id) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this task?')
    if (!ok) return

    setLoading(true)
    setError('')
    try {
      await tasksApi.deleteTask(id)
      // If deleting last item on a page, step back.
      await loadTasks()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  const onComplete = async (id) => {
    setLoading(true)
    setError('')
    try {
      await tasksApi.completeTask(id)
      await loadTasks()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to mark complete')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = pagination.totalPages || 1

  return (
    <div>
      <div className="page-title">Your Tasks</div>

      <div className="card section">
        <div className="toolbar">
          <div className="field">
            <label>Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="All">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Priority</label>
            <select
              className="input"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value)
                setPage(1)
              }}
            >
              <option value="All">All</option>
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="field" style={{ minWidth: 240 }}>
            <label>Search (title)</label>
            <input
              className="input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="e.g. interview"
            />
          </div>

          <div className="field">
            <label>Sort By</label>
            <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <div className="field">
            <label>Order</label>
            <select className="input" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              + New Task
            </button>
          </div>
        </div>
      </div>

      <div className="card section">
        {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

        {loading ? (
          <div className="empty">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty">No tasks found.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {tasks.map((t) => (
              <div key={t._id} className="card" style={{ padding: 14, boxShadow: 'none' }}>
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>{t.title}</div>
                    <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                      Due: {formatDate(t.dueDate)}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className={statusBadgeClass(t.status)}>{t.status}</span>
                      <span className={priorityBadgeClass(t.priority)}>{t.priority}</span>
                    </div>

                    {t.description ? (
                      <div className="muted" style={{ fontSize: 13, marginTop: 10, whiteSpace: 'pre-wrap' }}>
                        {t.description}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
                    {t.status !== 'Done' ? (
                      <button className="btn btn-primary" type="button" onClick={() => onComplete(t._id)} disabled={loading}>
                        Mark Done
                      </button>
                    ) : (
                      <button className="btn" type="button" disabled>
                        Completed
                      </button>
                    )}
                    <button className="btn" type="button" onClick={() => openEdit(t)} disabled={loading}>
                      Edit
                    </button>
                    <button className="btn btn-danger" type="button" onClick={() => onDelete(t._id)} disabled={loading}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="row" style={{ marginTop: 16, flexWrap: 'wrap' }}>
          <div className="muted" style={{ fontSize: 13 }}>
            Page {pagination.page} of {totalPages} (Total: {pagination.total})
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button className="btn" type="button" disabled={pagination.page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </button>
            <button className="btn" type="button" disabled={pagination.page >= totalPages || loading} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </button>
          </div>
        </div>
      </div>

      {modalOpen ? (
        <TaskFormModal
          mode={modalMode}
          busy={modalBusy}
          initialTask={selectedTask}
          onCancel={closeModal}
          onSubmit={onModalSubmit}
        />
      ) : null}
    </div>
  )
}

