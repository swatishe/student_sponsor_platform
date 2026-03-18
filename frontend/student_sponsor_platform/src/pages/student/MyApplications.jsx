// src/pages/student/MyApplications.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { applicationAPI } from '../../api/services'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import toast from 'react-hot-toast'
import { FileText, ExternalLink, Trash2, Calendar } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)

  const fetchApps = () => {
    applicationAPI.getMyApplications()
      .then(({ data }) => setApplications(data?.results ?? data ?? []))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchApps() }, [])

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return
    try { await applicationAPI.withdraw(id); toast.success('Withdrawn.'); fetchApps() }
    catch { toast.error('Failed to withdraw.') }
  }

  if (loading) return <Spinner text="Loading applications…"/>

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track the status of all your project applications.</p>
      </div>
      {applications.length === 0
        ? <EmptyState icon={FileText} title="No applications yet" description="Browse open projects and apply to get started."
            action={<Link to="/student/projects" className="btn btn-primary">Browse Projects</Link>}/>
        : <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {applications.map(app => (
              <div key={app.id} className="card" style={{ padding:'18px 22px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <h3 style={{ fontSize:'1rem' }}>{app.project?.title}</h3>
                      <Badge variant={app.status}/>
                    </div>
                    <div style={{ display:'flex', gap:16, fontSize:'0.79rem', color:'var(--text-muted)' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:5 }}><Calendar size={13}/>{timeAgo(app.applied_at)}</span>
                      <span>{app.project?.project_type?.replace('_',' ')}</span>
                    </div>
                    {app.cover_letter && (
                      <p style={{ marginTop:8, fontSize:'0.82rem', color:'var(--text-secondary)', maxWidth:560, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                        "{app.cover_letter}"
                      </p>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <Link to={`/student/projects/${app.project?.id}`} className="btn btn-secondary" style={{ padding:'6px 12px', fontSize:'0.8rem' }}>
                      <ExternalLink size={14}/> View
                    </Link>
                    {['pending','reviewing'].includes(app.status) && (
                      <button className="btn btn-danger" style={{ padding:'6px 12px', fontSize:'0.8rem' }} onClick={() => handleWithdraw(app.id)}>
                        <Trash2 size={14}/> Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
