// src/components/common/EmptyState.jsx
// Consistent empty-state card used across list views.
//@author sshende
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 24px',
      color: 'var(--text-secondary)',
    }}>
      {Icon && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <Icon size={44} style={{ opacity: 0.25, color: 'var(--text-muted)' }} />
        </div>
      )}
      <h3 style={{ fontSize: '1.05rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto' }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  )
}
