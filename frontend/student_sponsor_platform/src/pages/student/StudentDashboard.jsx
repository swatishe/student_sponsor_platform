// src/pages/student/StudentDashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { projectAPI, applicationAPI } from '../../api/services'
import StatCard from '../../components/common/StatCard'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import { Briefcase, FileText, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [projects, setProjects]         = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    Promise.all([
      projectAPI.getProjects({ status: 'open' }),
      applicationAPI.getMyApplications(),
    ]).then(([pRes, aRes]) => {
      setProjects(pRes.data?.results ?? pRes.data ?? [])
      setApplications(aRes.data?.results ?? aRes.data ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner text="Loading dashboard…" />

  const counts = applications.reduce((acc, a) => { acc[a.status] = (acc[a.status]||0)+1; return acc }, {})

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Welcome back, {user?.first_name} 👋</h1>
        <p>Here's a snapshot of your activity on the platform.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:16, marginBottom:32 }}>
        <StatCard icon={Briefcase}    value={projects.length}        label="Open Projects"  color="var(--accent-primary)" />
        <StatCard icon={FileText}     value={applications.length}    label="Applications"   color="var(--accent-warning)" />
        <StatCard icon={CheckCircle}  value={counts.accepted||0}     label="Accepted"       color="var(--accent-success)" />
        <StatCard icon={TrendingUp}   value={counts.reviewing||0}    label="Under Review"   color="var(--accent-info)" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        {/* Recent Applications */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h3 style={{ fontSize:'1rem' }}>Recent Applications</h3>
            <Link to="/student/applications" className="btn btn-secondary" style={{ padding:'5px 12px', fontSize:'0.8rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {applications.length === 0
            ? <p style={{ color:'var(--text-muted)', fontSize:'0.88rem' }}>No applications yet. Start browsing!</p>
            : applications.slice(0,5).map(app => (
              <div key={app.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'9px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-color)',
                marginBottom:8, background:'rgba(255,255,255,0.02)' }}>
                <div>
                  <div style={{ fontSize:'0.87rem', fontWeight:600, marginBottom:2 }}>{app.project?.title}</div>
                  <div style={{ fontSize:'0.73rem', color:'var(--text-muted)' }}>{timeAgo(app.applied_at)}</div>
                </div>
                <Badge variant={app.status} />
              </div>
            ))
          }
        </div>

        {/* Latest Open Projects */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h3 style={{ fontSize:'1rem' }}>Latest Projects</h3>
            <Link to="/student/projects" className="btn btn-secondary" style={{ padding:'5px 12px', fontSize:'0.8rem' }}>
              Browse All <ArrowRight size={14} />
            </Link>
          </div>
          {projects.slice(0,5).map(proj => (
            <Link key={proj.id} to={`/student/projects/${proj.id}`} style={{ textDecoration:'none' }}>
              <div style={{ padding:'9px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-color)',
                marginBottom:8, background:'rgba(255,255,255,0.02)', transition:'border-color .18s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--accent-primary)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-color)'}>
                <div style={{ fontSize:'0.87rem', fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>{proj.title}</div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <Badge variant="draft" label={proj.project_type?.replace('_',' ')} style={{ fontSize:'0.7rem' }} />
                  {proj.is_paid && <span style={{ fontSize:'0.7rem', color:'var(--accent-success)' }}>💰 Paid</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
