// src/pages/sponsor/ManageProjects.jsx
//@author sshende
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { projectAPI } from '../../api/services'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Users, Eye, Briefcase } from 'lucide-react'

export default function ManageProjects() {
  const { user }  = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const basePath = user?.role === 'faculty' ? '/faculty' : '/sponsor'

  const fetchProjects = () => {
    projectAPI.getMyProjects().then(({ data }) => setProjects(data?.results ?? data ?? [])).finally(() => setLoading(false))
  }
  useEffect(() => { fetchProjects() }, [])

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try { await projectAPI.deleteProject(id); toast.success('Project deleted.'); fetchProjects() }
    catch { toast.error('Failed to delete.') }
  }

  if (loading) return <Spinner text="Loading projects…"/>

  return (
    <div className="page-enter">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div className="page-header" style={{ marginBottom:0 }}><h1>My Projects</h1><p>Create, edit, and manage your posted projects.</p></div>
        <Link to={`${basePath}/projects/new`} className="btn btn-primary"><Plus size={16}/>New Project</Link>
      </div>
      {projects.length===0
        ? <EmptyState icon={Briefcase} title="No projects yet" description="Create your first project to start receiving applications."
            action={<Link to={`${basePath}/projects/new`} className="btn btn-primary"><Plus size={15}/>Create Project</Link>}/>
        : <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {projects.map(p => (
              <div key={p.id} className="card" style={{ padding:'18px 22px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <h3 style={{ fontSize:'1rem' }}>{p.title}</h3>
                      <Badge variant={p.status}/>
                      <Badge variant="draft" label={p.project_type?.replace('_',' ')} style={{ fontSize:'0.7rem' }}/>
                    </div>
                    <div style={{ fontSize:'0.79rem', color:'var(--text-muted)', display:'flex', gap:16 }}>
                      <span style={{ display:'flex', alignItems:'center', gap:5 }}><Users size={13}/>{p.application_count} applicant{p.application_count!==1?'s':''}</span>
                      {p.deadline && <span>Deadline: {new Date(p.deadline).toLocaleDateString()}</span>}
                      {p.is_paid && <span style={{ color:'var(--accent-success)' }}>💰 {p.stipend||'Paid'}</span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <Link to={`${basePath}/projects/${p.id}/applicants`} className="btn btn-secondary" style={{ padding:'6px 12px', fontSize:'0.8rem' }}><Eye size={14}/>Applicants</Link>
                    <Link to={`${basePath}/projects/${p.id}/edit`} className="btn btn-secondary" style={{ padding:'6px 12px', fontSize:'0.8rem' }}><Edit size={14}/>Edit</Link>
                    <button className="btn btn-danger" style={{ padding:'6px 12px', fontSize:'0.8rem' }} onClick={() => handleDelete(p.id, p.title)}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
