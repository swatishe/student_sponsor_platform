// src/pages/sponsor/ApplicationsReview.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { applicationAPI, projectAPI, messagingAPI } from '../../api/services'
import Spinner from '../../components/common/Spinner'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import toast from 'react-hot-toast'
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, Eye } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'

const STATUS_OPTIONS = ['','pending','reviewing','accepted','rejected']

export default function ApplicationsReview() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [project, setProject] = useState(null)
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('')

  useEffect(() => {
    Promise.all([projectAPI.getProject(id), applicationAPI.getProjectApplications(id)])
      .then(([pRes, aRes]) => { setProject(pRes.data); setApps(aRes.data?.results ?? aRes.data ?? []) })
      .finally(() => setLoading(false))
  }, [id])

  const handleStatus = async (appId, status) => {
    try { await applicationAPI.updateStatus(appId, { status }); setApps(prev => prev.map(a => a.id===appId ? {...a,status} : a)); toast.success(`Marked as ${status}.`) }
    catch { toast.error('Failed to update.') }
  }

  const handleMessage = async (recipientId) => {
    try {
      const { data } = await messagingAPI.startConversation(recipientId, `Hi, I reviewed your application for "${project?.title}".`)
      navigate(`/messages/${data.id}`)
    } catch { toast.error('Could not open conversation.') }
  }

  const filtered = filter ? apps.filter(a => a.status===filter) : apps

  if (loading) return <Spinner text="Loading applicants…"/>

  return (
    <div className="page-enter">
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom:20 }}><ArrowLeft size={16}/>Back</button>
      <div className="page-header">
        <h1>Applicants — {project?.title}</h1>
        <p>{apps.length} total applicant{apps.length!==1?'s':''}</p>
      </div>
      {/* Status filter pills */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`btn ${filter===s?'btn-primary':'btn-secondary'}`} style={{ padding:'5px 14px', fontSize:'0.82rem' }}>
            {s||'All'} ({s ? apps.filter(a=>a.status===s).length : apps.length})
          </button>
        ))}
      </div>
      {filtered.length===0
        ? <div className="empty-state"><h3>No applications {filter ? `with status "${filter}"` : 'yet'}</h3></div>
        : <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {filtered.map(app => (
              <div key={app.id} className="card" style={{ padding:'18px 22px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                      <Avatar user={app.student} size={40} radius={10}/>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.95rem' }}>{app.student?.first_name} {app.student?.last_name}</div>
                        <div style={{ fontSize:'0.77rem', color:'var(--text-muted)' }}>{app.student?.email} · Applied {timeAgo(app.applied_at)}</div>
                      </div>
                    </div>
                    {app.cover_letter && (
                      <div style={{ padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:'var(--radius-sm)', border:'1px solid var(--border-color)', fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, maxHeight:72, overflow:'hidden' }}>
                        {app.cover_letter}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0, alignItems:'flex-end' }}>
                    <Badge variant={app.status}/>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding:'5px 10px', fontSize:'0.75rem' }} onClick={() => handleMessage(app.student?.id)}><MessageSquare size={13}/>Message</button>
                      {app.status!=='accepted' && <button className="btn btn-secondary" style={{ padding:'5px 10px', fontSize:'0.75rem', color:'var(--accent-success)', borderColor:'rgba(34,211,160,.3)' }} onClick={() => handleStatus(app.id,'accepted')}><CheckCircle size={13}/>Accept</button>}
                      {app.status!=='rejected' && <button className="btn btn-danger" style={{ padding:'5px 10px', fontSize:'0.75rem' }} onClick={() => handleStatus(app.id,'rejected')}><XCircle size={13}/>Reject</button>}
                      {app.status==='pending' && <button className="btn btn-secondary" style={{ padding:'5px 10px', fontSize:'0.75rem', color:'var(--accent-info)' }} onClick={() => handleStatus(app.id,'reviewing')}><Eye size={13}/>Review</button>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
