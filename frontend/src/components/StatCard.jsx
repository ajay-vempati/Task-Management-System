export default function StatCard({ label, value, hint, variant = 'primary' }) {
  const badgeClass =
    variant === 'success'
      ? 'badge badge-success'
      : variant === 'warning'
        ? 'badge badge-warning'
        : variant === 'danger'
          ? 'badge'
          : 'badge badge-primary'

  return (
    <div className="card section" style={{ boxShadow: 'none' }}>
      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900 }}>{value}</div>
      {hint ? (
        <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className={badgeClass}>{hint}</span>
        </div>
      ) : null}
    </div>
  )
}

