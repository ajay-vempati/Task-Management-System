import { useEffect, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import * as tasksApi from '../api/tasksApi'
import StatCard from '../components/StatCard'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')

    tasksApi
      .getAnalytics()
      .then((d) => {
        if (!mounted) return
        setData(d)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Failed to load analytics')
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const pieData = data
    ? [
        { name: 'Completed', value: data.completedTasks },
        { name: 'Pending', value: data.pendingTasks },
      ]
    : []

  const COLORS = ['#22c55e', '#f59e0b']

  return (
    <div className="app-container">
      <div className="page-title">Analytics Dashboard</div>

      {error ? <div className="error" style={{ marginBottom: 12 }}>{error}</div> : null}

      {loading ? (
        <div className="card section">Loading analytics...</div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: 14 }}>
            <StatCard label="Total Tasks" value={data.totalTasks} />
            <StatCard label="Completed Tasks" value={data.completedTasks} variant="success" />
            <StatCard label="Pending Tasks" value={data.pendingTasks} variant="warning" />
          </div>

          <div className="grid-2">
            <div className="card section">
              <div className="row" style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 800 }}>Completion</div>
                <div className="badge badge-primary">{data.completionPercentage}%</div>
              </div>

              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card section">
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Status Breakdown</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <div className="row">
                  <span className="badge badge-primary">Todo</span>
                  <strong>{data.breakdown.Todo}</strong>
                </div>
                <div className="row">
                  <span className="badge">In Progress</span>
                  <strong>{data.breakdown['In Progress']}</strong>
                </div>
                <div className="row">
                  <span className="badge badge-success">Done</span>
                  <strong>{data.breakdown.Done}</strong>
                </div>
              </div>
              <div className="hr" style={{ marginTop: 14 }} />
              <div className="muted" style={{ fontSize: 13 }}>
                Insights update automatically based on your tasks.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

