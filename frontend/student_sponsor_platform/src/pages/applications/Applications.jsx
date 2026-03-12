// import React from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useMyApplications } from '@/hooks/useProjects'
// import { Card, Badge, Button, Spinner, EmptyState } from '@/components/ui'
// import { fmtDate, fmtRelative, statusColors } from '@/utils/helpers'

// export default function Applications() {
//   const navigate = useNavigate()
//   const { data, isLoading } = useMyApplications()
//   const apps = data?.results || []

//   if (isLoading) return <div style={{ display:'flex', justifyContent:'center', padding:'80px' }}><Spinner size={40} /></div>

//   return (
//     <div className="fade-in" style={{ padding:'32px', maxWidth:900 }}>
//       <div style={{ marginBottom:'28px' }}>
//         <h1 style={{ fontFamily:'var(--font-display)', fontSize:'26px', fontWeight:700 }}>My Applications</h1>
//         <p style={{ color:'var(--text-muted)', fontSize:'14px', marginTop:'4px' }}>{apps.length} total applications</p>
//       </div>

//       {apps.length === 0
//         ? <EmptyState icon="📝" title="No applications yet"
//             description="Browse projects and apply to get started."
//             action={<Button onClick={() => navigate('/projects')}>Browse Projects</Button>} />
//         : apps.map(app => {
//           const sc = statusColors[app.status] || {}
//           return (
//             <Card key={app.id} style={{ marginBottom:'16px', padding:'20px' }}>
//               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
//                 <h3 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'16px' }}
//                   onClick={() => navigate(`/projects/${app.project?.id}`)}
//                   style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'16px', cursor:'pointer', color:'var(--amber)' }}>
//                   {app.project?.title}
//                 </h3>
//                 <Badge bg={sc.bg} color={sc.text}>{app.status}</Badge>
//               </div>
//               <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'12px', lineHeight:1.5 }}>
//                 {app.cover_letter || <em style={{ color:'var(--text-muted)' }}>No cover letter submitted.</em>}
//               </p>
//               {app.feedback && (
//                 <div style={{ background:'var(--bg-surface)', borderRadius:'var(--radius-md)', padding:'12px', marginBottom:'12px', borderLeft:'2px solid var(--amber)' }}>
//                   <div style={{ fontSize:'12px', fontWeight:600, color:'var(--amber)', marginBottom:'4px' }}>Feedback</div>
//                   <p style={{ fontSize:'13px', color:'var(--text-secondary)' }}>{app.feedback}</p>
//                 </div>
//               )}
//               {app.status === 'accepted' && (
//                 <div style={{ background:'var(--green-bg)', borderRadius:'var(--radius-md)', padding:'12px', marginBottom:'12px' }}>
//                   <p style={{ fontSize:'13px', color:'var(--green)', fontWeight:600 }}>🎉 Congratulations! Your application was accepted.</p>
//                 </div>
//               )}
//               <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>Applied {fmtRelative(app.applied_at)}</div>
//             </Card>
//           )
//         })
//       }
//     </div>
//   )
// }
