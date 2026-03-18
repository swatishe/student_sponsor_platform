// src/pages/faculty/FacultyDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { projectAPI } from '../../api/services'
import StatCard from '../../components/common/StatCard'
import Spinner from '../../components/common/Spinner'
import Badge from '../../components/common/Badge'
import { Plus, Briefcase, Users, ArrowRight } from 'lucide-react'

export default function FacultyDashboard() {
  const { user }    = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    projectAPI.getMyProjects().then(({ data }) => setProjects(data?.results ?? data ?? [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner text="Loading dashboard…"/>

  const totalApps = projects.reduce((s,p) => s+(p.application_count||0), 0)

  return (
    <div className="page-enter">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32 }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1>Welcome, {user?.first_name} 👋</h1>
          <p>Post research and capstone projects for your students.</p>
        </div>
        <Link to="/faculty/projects/new" className="btn btn-primary"><Plus size={16}/>Post Project</Link>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:16, marginBottom:32 }}>
        <StatCard icon={Briefcase} value={projects.length} label="Projects Posted"  color="var(--accent-info)"/>
        <StatCard icon={Users}     value={totalApps}       label="Total Applicants" color="var(--accent-warning)"/>
      </div>
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ fontSize:'1rem' }}>Your Projects</h3>
          <Link to="/faculty/projects" className="btn btn-secondary" style={{ padding:'5px 12px', fontSize:'0.8rem' }}>Manage All <ArrowRight size={14}/></Link>
        </div>
        {projects.length===0
          ? <p style={{ color:'var(--text-muted)', fontSize:'0.88rem' }}>No projects yet. Post a research or capstone project for students.</p>
          : projects.slice(0,5).map(p => (
            <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-color)', marginBottom:8 }}>
              <div>
                <div style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:2 }}>{p.title}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{p.application_count} applicants · {p.project_type}</div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <Badge variant={p.status}/>
                <Link to={`/faculty/projects/${p.id}/applicants`} className="btn btn-secondary" style={{ padding:'4px 10px', fontSize:'0.75rem' }}>Applicants</Link>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
