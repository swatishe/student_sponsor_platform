// src/components/common/StatCard.jsx
// Dashboard stat card.
//@author sshende
export default function StatCard({ icon: Icon, value, label, color = 'var(--accent-primary)' }) {
  return (
    <div className="stat-card">
      {Icon && <Icon size={20} style={{ color }} />}
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
