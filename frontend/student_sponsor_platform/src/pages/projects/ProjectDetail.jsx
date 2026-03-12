import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject, useProjectApplicants, useApply, useUpdateApplication } from '@/hooks/useProjects'
import useAuthStore from '@/store/authStore'
import { Card, Badge, Button, Textarea, Avatar, Spinner, EmptyState } from '@/components/ui'
import { fmtDate, fmtRelative, statusColors, typeColors } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { user }   = useAuthStore()
  const [cover, setCover]       = useState('')
  const [applying, setApplying] = useState(false)

  const { data: project, isLoading } = useProject(id)
  const { data: applicants }         = useProjectApplicants(id)
  const applyMutation                = useApply(id)
  const updateMutation               = useUpdateApplication()

  const isOwner   = project?.owner?.id === user?.id
  const isStudent = user?.role === 'student'
  const sc = statusColors[project?.status] || {}
  const tc = typeColors[project?.project_type] || {}

  const handleApply = async () => {
    if (!cover.trim()) { toast.error('Please write a cover letter'); return }
    applyMutation.mutate({ cover_letter: cover }, {
      onSuccess: () => { setCover(''); setApplying(false) }
    })
  }

  if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:'80px' }}><Spinner size={40} /></div>
  if (!project)  return <EmptyState icon="❓" title="Project not found" action={<Button onClick={() => navigate('/projects')}>Back to Projects</Button>} />

  return (
    <div className="fade-in" style={{ padding:'32px', maxWidth:900 }}>
      <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} style={{ marginBottom:'20px' }}>← Back</Button>

      {/* Header */}
      <Card style={{ marginBottom:'24px', padding:'28px' }}>
        <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
          <Badge bg={tc.bg} color={tc.text}>{project.project_type}</Badge>
          <Badge bg={sc.bg} color={sc.text}>{project.status}</Badge>
          {project.deadline && <Badge>{`Deadline: ${fmtDate(project.deadline)}`}</Badge>}
        </div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'24px', fontWeight:700, marginBottom:'8px' }}>{project.title}</h1>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
          <Avatar name={project.owner?.username} src={project.owner?.profile?.avatar} size={28} />
          <span style={{ fontSize:'13px', color:'var(--text-muted)' }}>
            {project.owner?.username} · {fmtRelative(project.created_at)}
          </span>
        </div>
        <p style={{ lineHeight:1.7, color:'var(--text-secondary)', marginBottom:'20px' }}>{project.description}</p>
        {project.requirements && (
          <div style={{ background:'var(--bg-surface)', borderRadius:'var(--radius-md)', padding:'16px', marginBottom:'16px' }}>
            <div style={{ fontWeight:600, fontSize:'13px', marginBottom:'8px' }}>Requirements</div>
            <p style={{ fontSize:'14px', lineHeight:1.6, color:'var(--text-secondary)' }}>{project.requirements}</p>
          </div>
        )}
        {project.skills_required?.length > 0 && (
          <div>
            <div style={{ fontWeight:600, fontSize:'13px', marginBottom:'8px' }}>Skills Required</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {project.skills_required.map(s => (
                <span key={s} style={{ padding:'4px 12px', background:'var(--amber-bg)', color:'var(--amber)', borderRadius:'999px', fontSize:'12px', fontWeight:600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Apply section — student only */}
      {isStudent && project.status === 'open' && !isOwner && (
        <Card style={{ marginBottom:'24px', padding:'24px' }}>
          {!applying
            ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>Interested?</h3>
                  <p style={{ fontSize:'13px', color:'var(--text-muted)', marginTop:'4px' }}>Submit your application with a cover letter.</p>
                </div>
                <Button onClick={() => setApplying(true)}>Apply Now</Button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'16px' }}>Write your cover letter</h3>
                <Textarea value={cover} onChange={e => setCover(e.target.value)} rows={5}
                  placeholder="Tell the sponsor why you are a great fit for this project..." />
                <div style={{ display:'flex', gap:'12px', marginTop:'16px', justifyContent:'flex-end' }}>
                  <Button variant="secondary" onClick={() => setApplying(false)}>Cancel</Button>
                  <Button onClick={handleApply} loading={applyMutation.isPending}>Submit Application</Button>
                </div>
              </div>
            )
          }
        </Card>
      )}

      {/* Applicants — owner only */}
      {isOwner && (
        <Card style={{ padding:'24px' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, marginBottom:'20px' }}>
            Applicants ({applicants?.results?.length || 0})
          </h3>
          {!applicants?.results?.length
            ? <EmptyState icon="👥" title="No applications yet" description="Share your project to get applicants." />
            : applicants.results.map(app => {
              const asc = statusColors[app.status] || {}
              return (
                <div key={app.id} style={{ display:'flex', gap:'14px', padding:'16px', borderRadius:'var(--radius-md)', border:'1px solid var(--border)', marginBottom:'12px' }}>
                  <Avatar name={app.applicant?.username} src={app.applicant?.profile?.avatar} size={40} />
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                      <div style={{ fontWeight:600 }}>{app.applicant?.profile?.full_name || app.applicant?.username}</div>
                      <Badge bg={asc.bg} color={asc.text}>{app.status}</Badge>
                    </div>
                    <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'10px', lineHeight:1.5 }}>{app.cover_letter || 'No cover letter.'}</p>
                    <div style={{ display:'flex', gap:'8px' }}>
                      {['accepted','reviewed','rejected'].map(s => (
                        <Button key={s} size="sm"
                          variant={s==='accepted'?'primary':s==='rejected'?'danger':'secondary'}
                          disabled={app.status === s}
                          onClick={() => updateMutation.mutate({ id: app.id, data: { status: s } })}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })
          }
        </Card>
      )}
    </div>
  )
}
