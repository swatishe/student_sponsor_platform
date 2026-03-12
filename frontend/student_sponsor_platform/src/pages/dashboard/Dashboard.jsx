import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { projectsService, applicationsService, notificationsService } from '@/services'
import { Card, Badge, Button, Spinner, Skeleton } from '@/components/ui'
import { fmtRelative, statusColors, typeColors } from '@/utils/helpers'

const StatCard = ({ label, value, sub, color='var(--amber)' }) => (
  <Card style={{ padding:'20px' }}>
    <div style={{ fontSize:'28px', fontWeight:700, color, fontFamily:'var(--font-display)' }}>{value}</div>
    <div style={{ fontSize:'13px', fontWeight:600, marginTop:'4px' }}>{label}</div>
    {sub && <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>{sub}</div>}
  </Card>
)

export default function Dashboard() {
  const { user }    = useAuthStore()
  const navigate    = useNavigate()
  const role        = user?.role

  const { data: projectsData, isLoading: loadP } = useQuery({
    queryKey: ['projects', { page_size: 5 }],
    queryFn:  () => projectsService.list({ page_size: 5 }).then(r => r.data),
  })

  const { data: appsData, isLoading: loadA } = useQuery({
    queryKey: ['my-applications'],
    queryFn:  () => applicationsService.mine().then(r => r.data),
    enabled:  role === 'student',
  })

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationsService.list().then(r => r.data),
  })

  const projects     = projectsData?.results || []
  const apps         = appsData?.results || []
  const notifications = notifData?.results?.slice(0, 4) || []
  const unread       = notifications.filter(n => !n.is_read).length

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="fade-in" style={{ padding:'32px', maxWidth:1200 }}>
      {/* Header */}
      <div style={{ marginBottom:'32px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'28px', fontWeight:700 }}>
          {greeting()}, {user?.profile?.full_name || user?.username} 👋
        </h1>
        <p style={{ color:'var(--text-muted)', marginTop:'4px' }}>
          {role === 'student'  && 'Find exciting projects and track your applications.'}
          {role === 'sponsor'  && 'Manage your projects and review applicants.'}
          {role === 'faculty'  && 'Post research opportunities and connect with students.'}
          {role === 'admin'    && 'Platform overview and user management.'}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:'16px', marginBottom:'32px' }}>
        <StatCard label="Open Projects"   value={projectsData?.count || '—'} sub="Available now" />
        {role === 'student' && <StatCard label="My Applications" value={apps.length} sub="Submitted" color="var(--blue)" />}
        {role === 'student' && <StatCard label="Accepted"        value={apps.filter(a=>a.status==='accepted').length} sub="Congrats!" color="var(--green)" />}
        {(role==='sponsor'||role==='faculty') && <StatCard label="My Projects" value={projects.filter(p=>p.owner?.id===user?.id).length} sub="Posted" color="var(--blue)" />}
        <StatCard label="Notifications"  value={unread} sub="Unread" color={unread>0 ? 'var(--red)' : 'var(--text-muted)'} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'24px', alignItems:'start' }}>
        {/* Recent projects */}
        <Card style={{ padding:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'16px', fontWeight:700 }}>Recent Projects</h2>
            <Button size="sm" variant="ghost" onClick={() => navigate('/projects')}>View all →</Button>
          </div>
          {loadP ? [...Array(3)].map((_,i) => <Skeleton key={i} height={60} style={{ marginBottom:12 }} />) :
            projects.length === 0
              ? <p style={{ color:'var(--text-muted)', fontSize:'14px' }}>No projects yet.</p>
              : projects.map(p => {
                const sc = statusColors[p.status] || {}
                const tc = typeColors[p.project_type] || {}
                return (
                  <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                    style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px', borderRadius:'var(--radius-md)', cursor:'pointer', marginBottom:'4px', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:'14px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
                      <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>by {p.owner?.username}</div>
                    </div>
                    <Badge bg={tc.bg} color={tc.text}>{p.project_type}</Badge>
                    <Badge bg={sc.bg} color={sc.text}>{p.status}</Badge>
                  </div>
                )
              })
          }
        </Card>

        {/* Notifications */}
        <Card style={{ padding:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'16px', fontWeight:700 }}>Notifications</h2>
            {unread > 0 && <Badge bg='var(--red-bg)' color='var(--red)'>{unread} new</Badge>}
          </div>
          {notifications.length === 0
            ? <p style={{ color:'var(--text-muted)', fontSize:'14px' }}>All caught up!</p>
            : notifications.map(n => (
              <div key={n.id} style={{ padding:'10px', borderRadius:'var(--radius-md)', marginBottom:'4px', background: n.is_read ? 'transparent' : 'var(--amber-bg)', borderLeft: n.is_read ? 'none' : '2px solid var(--amber)' }}>
                <div style={{ fontSize:'13px', fontWeight:600 }}>{n.title}</div>
                <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>{n.message}</div>
                <div style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'4px' }}>{fmtRelative(n.created_at)}</div>
              </div>
            ))
          }
        </Card>
      </div>

      {/* Quick actions */}
      <Card style={{ marginTop:'24px', padding:'20px' }}>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'16px', fontWeight:700, marginBottom:'16px' }}>Quick Actions</h2>
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
          <Button onClick={() => navigate('/projects')}>Browse Projects</Button>
          {role === 'student'  && <Button variant="secondary" onClick={() => navigate('/applications')}>My Applications</Button>}
          {(role==='sponsor'||role==='faculty') && <Button variant="outline" onClick={() => navigate('/my-projects/new')}>+ Post Project</Button>}
          <Button variant="secondary" onClick={() => navigate('/messages')}>Messages</Button>
          <Button variant="ghost" onClick={() => navigate('/profile')}>Edit Profile</Button>
        </div>
      </Card>
    </div>
  )
}
