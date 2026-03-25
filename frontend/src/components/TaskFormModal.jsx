import { useEffect, useMemo, useState } from 'react'

const statuses = ['Todo', 'In Progress', 'Done']
const priorities = ['Low', 'Medium', 'High']

function toDateInputValue(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function toIsoFromDateInput(value) {
  // value is like YYYY-MM-DD, convert as UTC midnight to avoid timezone shifting.
  if (!value) return null
  const dt = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(dt.getTime())) return null
  return dt.toISOString()
}

export default function TaskFormModal({ mode = 'create', initialTask, onSubmit, onCancel, busy }) {
  const [title, setTitle] = useState(initialTask?.title || '')
  const [description, setDescription] = useState(initialTask?.description || '')
  const [status, setStatus] = useState(initialTask?.status || 'Todo')
  const [priority, setPriority] = useState(initialTask?.priority || 'Medium')
  const [dueDate, setDueDate] = useState(toDateInputValue(initialTask?.dueDate))
  const [error, setError] = useState('')

  const modalTitle = useMemo(() => (mode === 'edit' ? 'Update Task' : 'Create Task'), [mode])

  useEffect(() => {
    setTitle(initialTask?.title || '')
    setDescription(initialTask?.description || '')
    setStatus(initialTask?.status || 'Todo')
    setPriority(initialTask?.priority || 'Medium')
    setDueDate(toDateInputValue(initialTask?.dueDate))
    setError('')
  }, [initialTask])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) return setError('Title is required')
    if (!dueDate) return setError('Due Date is required')

    const payload = {
      title: title.trim(),
      description: description ?? '',
      status,
      priority,
      dueDate: toIsoFromDateInput(dueDate),
    }

    try {
      await onSubmit(payload)
    } catch (err) {
      setError(err?.response?.data?.message || 'Request failed')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        zIndex: 50,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="card" style={{ width: 'min(680px, 100%)', padding: 16 }}>
        <div className="row" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 800 }}>{modalTitle}</div>
          <button className="btn" type="button" onClick={onCancel}>
            Close
          </button>
        </div>

        {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="field">
              <label>Title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Prepare interview answers" />
            </div>
            <div className="field">
              <label>Due Date</label>
              <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label>Description</label>
            <textarea
              className="input"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes for the task"
            />
          </div>

          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn" type="button" onClick={onCancel} disabled={busy}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Saving...' : mode === 'edit' ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

