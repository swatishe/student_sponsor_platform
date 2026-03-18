// src/pages/sponsor/SponsorDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { projectAPI } from '../../api/services'
import StatCard from '../../components/common/StatCard'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import { Plus, Briefcase, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react'

export default function SponsorDashboard() {
  const { user }    = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    projectAPI.getMyProjects().then(({ data }) => setProjects(data?.results ?? data ?? [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner text="Loading dashboard…"/>

  const openCount  = projects.filter(p => p.status==='open').length
  const totalApps  = projects.reduce((s,p) => s+(p.application_count||0), 0)
  const closedCount= projects.filter(p => p.status==='closed').length

  return (
    <div className="page-enter">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1>Welcome, {user?.first_name} 👋</h1>
          <p>Manage your projects and review applicants.</p>
        </div>
        <Link to="/sponsor/projects/new" className="btn btn-primary"><Plus size={16}/>New Project</Link>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:16, marginBottom:32 }}>
        <StatCard icon={Briefcase}   value={projects.length} label="Total Projects"  color="var(--accent-primary)"/>
        <StatCard icon={CheckCircle} value={openCount}       label="Open"            color="var(--accent-success)"/>
        <StatCard icon={Users}       value={totalApps}       label="Total Applicants"color="var(--accent-warning)"/>
        <StatCard icon={Clock}       value={closedCount}     label="Closed"          color="var(--accent-info)"/>
      </div>
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ fontSize:'1rem' }}>Your Projects</h3>
          <Link to="/sponsor/projects" className="btn btn-secondary" style={{ padding:'5px 12px', fontSize:'0.8rem' }}>Manage All <ArrowRight size={14}/></Link>
        </div>
        {projects.length===0
          ? <div style={{ textAlign:'center', padding:'30px 0', color:'var(--text-muted)', fontSize:'0.88rem' }}>
              No projects yet. <Link to="/sponsor/projects/new">Create one →</Link>
            </div>
          : projects.slice(0,5).map(p => (
            <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-color)', marginBottom:8 }}>
              <div>
                <div style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:2 }}>{p.title}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{p.application_count} applicant{p.application_count!==1?'s':''} · {p.project_type?.replace('_',' ')}</div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <Badge variant={p.status}/>
                <Link to={`/sponsor/projects/${p.id}/applicants`} className="btn btn-secondary" style={{ padding:'4px 10px', fontSize:'0.75rem' }}>Applicants</Link>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
