// src/pages/student/ProjectDetailPage.jsx
//@author sshende
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projectAPI, applicationAPI, messagingAPI } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/common/Spinner'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import toast from 'react-hot-toast'
import { ArrowLeft, Send, MessageSquare, CheckCircle, Calendar, Briefcase, DollarSign, Users } from 'lucide-react'

export default function ProjectDetailPage() {
  const { id }      = useParams()
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [project, setProject]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [applied, setApplied]     = useState(false)
  const [applying, setApplying]   = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [coverLetter, setCL]      = useState('')

  useEffect(() => {
    projectAPI.getProject(id)
      .then(({ data }) => setProject(data))
      .catch(() => toast.error('Project not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    setApplying(true)
    try {
      await applicationAPI.apply({ project_id: id, cover_letter: coverLetter })
      setApplied(true); setShowForm(false)
      toast.success('Application submitted!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to apply.')
    } finally { setApplying(false) }
  }

  const handleMessage = async () => {
    if (!project?.created_by?.id) return
    try {
      const { data } = await messagingAPI.startConversation(project.created_by.id, `Hi, I'm interested in your project: "${project.title}"`)
      navigate(`/messages/${data.id}`)
    } catch { toast.error('Could not start conversation.') }
  }

  if (loading) return <Spinner text="Loading project…"/>
  if (!project) return <div className="empty-state"><h3>Project not found.</h3></div>

  return (
    <div className="page-enter">
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom:24 }}>
        <ArrowLeft size={16}/> Back
      </button>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>
        <div>
          <div className="card" style={{ marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <h1 style={{ fontSize:'1.5rem', flex:1, paddingRight:12 }}>{project.title}</h1>
              <Badge variant={project.status}/>
            </div>
            <div style={{ display:'flex', gap:18, flexWrap:'wrap', marginBottom:24, color:'var(--text-muted)', fontSize:'0.84rem' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}><Briefcase size={14}/>{project.project_type?.replace('_',' ')}</span>
              {project.is_paid && <span style={{ display:'flex', alignItems:'center', gap:5, color:'var(--accent-success)' }}><DollarSign size={14}/>{project.stipend||'Paid'}</span>}
              <span style={{ display:'flex', alignItems:'center', gap:5 }}><Users size={14}/>{project.application_count} applicants</span>
              {project.deadline && <span style={{ display:'flex', alignItems:'center', gap:5 }}><Calendar size={14}/>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>}
            </div>
            <div className="divider"/>
            <section style={{ marginBottom:24 }}>
              <h3 style={{ fontSize:'0.9rem', marginBottom:10, color:'var(--text-secondary)' }}>Description</h3>
              <p style={{ color:'var(--text-secondary)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{project.description}</p>
            </section>
            {project.requirements && (
              <section style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:'0.9rem', marginBottom:10, color:'var(--text-secondary)' }}>Requirements</h3>
                <p style={{ color:'var(--text-secondary)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>{project.requirements}</p>
              </section>
            )}
            {project.tags_list?.length > 0 && (
              <section>
                <h3 style={{ fontSize:'0.9rem', marginBottom:10, color:'var(--text-secondary)' }}>Skills & Tags</h3>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {project.tags_list.map(tag => (
                    <span key={tag} style={{ padding:'4px 12px', borderRadius:100, background:'rgba(108,99,255,.1)', color:'var(--accent-primary)', fontSize:'0.8rem', border:'1px solid rgba(108,99,255,.2)' }}>{tag}</span>
                  ))}
                </div>
              </section>
            )}
          </div>
          {!applied && showForm && (
            <div className="card">
              <h3 style={{ marginBottom:16, fontSize:'1rem' }}>Submit Application</h3>
              <div className="form-group">
                <label className="form-label">Cover Letter (optional)</label>
                <textarea className="form-input" rows={5} placeholder="Tell the sponsor why you're a great fit…" value={coverLetter} onChange={e => setCL(e.target.value)}/>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-primary" onClick={handleApply} disabled={applying}><Send size={15}/>{applying?'Submitting…':'Submit Application'}</button>
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            {applied
              ? <div style={{ textAlign:'center', padding:'10px 0' }}>
                  <CheckCircle size={32} style={{ color:'var(--accent-success)', margin:'0 auto 10px' }}/>
                  <p style={{ color:'var(--accent-success)', fontWeight:600 }}>Application Submitted!</p>
                </div>
              : <>
                  {!showForm && project.status === 'open' && (
                    <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginBottom:10 }} onClick={() => setShowForm(true)}>
                      <Send size={15}/> Apply Now
                    </button>
                  )}
                  <button className="btn btn-secondary" style={{ width:'100%', justifyContent:'center' }} onClick={handleMessage}>
                    <MessageSquare size={15}/> Message {project.created_by?.role === 'faculty' ? 'Faculty' : 'Sponsor'}
                  </button>
                </>
            }
          </div>
          <div className="card">
            <h4 style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:12, letterSpacing:'.06em' }}>POSTED BY</h4>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <Avatar user={project.created_by} size={42} radius={12}/>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:4 }}>{project.created_by?.first_name} {project.created_by?.last_name}</div>
                <Badge variant={project.created_by?.role}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
