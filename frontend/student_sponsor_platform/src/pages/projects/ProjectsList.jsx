import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '@/hooks/useProjects'
import { Card, Badge, Button, Input, Select, Skeleton, EmptyState } from '@/components/ui'
import { fmtDate, fmtRelative, statusColors, typeColors, truncate } from '@/utils/helpers'

export default function ProjectsList() {
  const navigate = useNavigate()
  const [params, setParams] = useState({ search:'', status:'', project_type:'', ordering:'-created_at' })

  const { data, isLoading } = useProjects(
    Object.fromEntries(Object.entries(params).filter(([,v])=>v))
  )
  const projects = data?.results || []

  const set = (k, v) => setParams(p => ({ ...p, [k]: v }))

  return (
    <div className="fade-in" style={{ padding:'32px', maxWidth:1100 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'26px', fontWeight:700 }}>Projects</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'14px', marginTop:'4px' }}>
            {data?.count || 0} projects available
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 160px 160px 160px', gap:'12px', marginBottom:'24px' }}>
        <Input placeholder="Search projects…" value={params.search} onChange={e => set('search', e.target.value)} />
        <Select value={params.status} onChange={e => set('status', e.target.value)}
          options={[{value:'',label:'All Status'},{value:'open',label:'Open'},{value:'in_progress',label:'In Progress'},{value:'closed',label:'Closed'}]} />
        <Select value={params.project_type} onChange={e => set('project_type', e.target.value)}
          options={[{value:'',label:'All Types'},{value:'sponsored',label:'Sponsored'},{value:'internal',label:'Internal'},{value:'research',label:'Research'}]} />
        <Select value={params.ordering} onChange={e => set('ordering', e.target.value)}
          options={[{value:'-created_at',label:'Newest'},{value:'created_at',label:'Oldest'},{value:'deadline',label:'Deadline'},{value:'title',label:'Title A-Z'}]} />
      </div>

      {/* Grid */}
      {isLoading
        ? <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))', gap:'16px' }}>
            {[...Array(6)].map((_,i) => <Skeleton key={i} height={200} />)}
          </div>
        : projects.length === 0
          ? <EmptyState icon="📋" title="No projects found" description="Try adjusting your search or filters." />
          : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))', gap:'16px' }}>
              {projects.map(p => {
                const sc = statusColors[p.status] || {}
                const tc = typeColors[p.project_type] || {}
                return (
                  <Card key={p.id} hoverable onClick={() => navigate(`/projects/${p.id}`)} style={{ cursor:'pointer' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                      <Badge bg={tc.bg} color={tc.text}>{p.project_type}</Badge>
                      <Badge bg={sc.bg} color={sc.text}>{p.status}</Badge>
                    </div>
                    <h3 style={{ fontFamily:'var(--font-display)', fontSize:'16px', fontWeight:700, marginBottom:'8px', lineHeight:1.3 }}>{p.title}</h3>
                    <p style={{ fontSize:'13px', color:'var(--text-muted)', marginBottom:'16px', lineHeight:1.5 }}>{truncate(p.description, 120)}</p>
                    {p.skills_required?.length > 0 && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'16px' }}>
                        {p.skills_required.slice(0,4).map(s => (
                          <span key={s} style={{ fontSize:'11px', padding:'2px 8px', background:'var(--bg-hover)', borderRadius:'999px', color:'var(--text-secondary)' }}>{s}</span>
                        ))}
                        {p.skills_required.length > 4 && <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>+{p.skills_required.length - 4}</span>}
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'var(--text-muted)', borderTop:'1px solid var(--border)', paddingTop:'12px' }}>
                      <span>by {p.owner?.username}</span>
                      <span>{fmtRelative(p.created_at)}</span>
                    </div>
                  </Card>
                )
              })}
            </div>
          )
      }
    </div>
  )
}
