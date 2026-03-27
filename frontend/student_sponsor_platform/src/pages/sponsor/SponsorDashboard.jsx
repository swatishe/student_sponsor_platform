// src/pages/sponsor/SponsorDashboard.jsx
// Layout — proper grid alignment and spacing.

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { projectAPI } from '../../api/services'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import { Plus, Briefcase, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import styles from './SponsorDashboard.module.css'

export default function SponsorDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    projectAPI.getMyProjects()
      .then(({ data }) => setProjects(data?.results ?? data ?? []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner text="Loading dashboard…" />

  const openCount = projects.filter((p) => p.status === 'open').length
  const closedCount = projects.filter((p) => p.status === 'closed').length
  const totalApps = projects.reduce((s, p) => s + (p.application_count || 0), 0)

  return (
    <div className="page-enter">

      {/* ── Page header row ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Welcome, {user?.first_name} 👋</h1>
          <p>Manage your projects and review applicants.</p>
        </div>
        <Link to="/sponsor/projects/new" className="btn btn-primary">
          <Plus size={16} /> New Project
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className={styles.statsGrid}>
        <StatCard icon={<Briefcase size={20} />} color="var(--accent-primary)" value={projects.length} label="Total Projects" />
        <StatCard icon={<CheckCircle size={20} />} color="var(--accent-success)" value={openCount} label="Open" />
        <StatCard icon={<Users size={20} />} color="var(--accent-warning)" value={totalApps} label="Total Applicants" />
        <StatCard icon={<Clock size={20} />} color="var(--accent-info)" value={closedCount} label="Closed" />
      </div>

      {/* ── Projects table ── */}
      <div className="card">
        <div className={styles.cardHeader}>
          <h3>Your Projects</h3>
          <Link to="/sponsor/projects" className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
            Manage All <ArrowRight size={14} />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <p>No projects yet. Create your first project to start receiving applications.</p>
            <Link to="/sponsor/projects/new" className="btn btn-primary" style={{ marginTop: 14 }}>
              <Plus size={15} /> Create Project
            </Link>
          </div>
        ) : (
          <div className={styles.projectList}>
            {/* Table header */}
            <div className={styles.tableHeader}>
              <span>Project</span>
              <span>Type</span>
              <span>Applicants</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {projects.map((p) => (
              <div key={p.id} className={styles.tableRow}>
                <div className={styles.projectTitle}>
                  <span>{p.title}</span>
                  {p.is_paid && <span className={styles.paidBadge}>💰 {p.stipend || 'Paid'}</span>}
                </div>
                <span className={styles.projectType}>{p.project_type?.replace('_', ' ')}</span>
                <span className={styles.appCount}>
                  <Users size={13} /> {p.application_count}
                </span>
                <Badge variant={p.status} />
                <Link
                  to={`/sponsor/projects/${p.id}/applicants`}
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  Applicants
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, color, value, label }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ color }}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}
