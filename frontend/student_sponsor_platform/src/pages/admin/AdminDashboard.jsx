// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI, projectAPI } from '../../api/services'
import StatCard from '../../components/common/StatCard'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import { Users, Briefcase, GraduationCap, Building2, BookOpen, ShieldCheck } from 'lucide-react'

export default function AdminDashboard() {
  const [users, setUsers]       = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([adminAPI.getUsers(), projectAPI.getProjects()])
      .then(([uRes, pRes]) => {
        setUsers(uRes.data?.results ?? uRes.data ?? [])
        setProjects(pRes.data?.results ?? pRes.data ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner text="Loading admin panel…" />

  const byRole = (r) => users.filter((u) => u.role === r).length

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and user management.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16, marginBottom: 36 }}>
        <StatCard icon={Users}          value={users.length}       label="Total Users"  color="var(--accent-primary)" />
        <StatCard icon={GraduationCap}  value={byRole('student')}  label="Students"     color="var(--accent-success)" />
        <StatCard icon={Building2}      value={byRole('sponsor')}  label="Sponsors"     color="var(--accent-warning)" />
        <StatCard icon={BookOpen}       value={byRole('faculty')}  label="Faculty"      color="var(--accent-info)" />
        <StatCard icon={Briefcase}      value={projects.length}    label="Projects"     color="var(--accent-primary)" />
        <StatCard icon={ShieldCheck}    value={byRole('admin')}    label="Admins"       color="var(--accent-danger)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent users */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1rem' }}>Recent Users</h3>
            <Link to="/admin/users" className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
              Manage All →
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.slice(0, 7).map((u) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <Avatar user={u} size={32} radius={8} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.first_name} {u.last_name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.email}
                  </div>
                </div>
                <Badge variant={u.role} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent projects */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: 20 }}>Recent Projects</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projects.slice(0, 7).map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {p.created_by?.first_name} {p.created_by?.last_name} · {p.project_type}
                  </div>
                </div>
                <Badge variant={p.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
