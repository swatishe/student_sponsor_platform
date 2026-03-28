// src/pages/student/ProjectsPage.jsx
//@author sshende
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { projectAPI } from '../../api/services'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import Badge from '../../components/common/Badge'
import { timeAgo } from '../../utils/helpers'
import { Search, Briefcase, Calendar, DollarSign, Users } from 'lucide-react'
import styles from './Projects.module.css'

const TYPES = ['','internship','research','part_time','full_time','freelance','capstone']

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [type, setType]         = useState('')
  const [paidOnly, setPaid]     = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)  params.search       = search
      if (type)    params.project_type = type
      if (paidOnly) params.is_paid     = true
      const { data } = await projectAPI.getProjects(params)
      setProjects(data?.results ?? data ?? [])
    } finally { setLoading(false) }
  }, [search, type, paidOnly])

  useEffect(() => {
    const t = setTimeout(fetchProjects, 400)
    return () => clearTimeout(t)
  }, [fetchProjects])

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Browse Projects</h1>
        <p>Discover internships, research opportunities, and more.</p>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon}/>
          <input type="text" placeholder="Search projects, skills, keywords…" value={search}
            onChange={e => setSearch(e.target.value)} className={`form-input ${styles.searchInput}`}/>
        </div>
        <div className={styles.filters}>
          <select value={type} onChange={e => setType(e.target.value)} className="form-input" style={{ width:160 }}>
            {TYPES.map(t => <option key={t} value={t}>{t ? t.replace('_',' ') : 'All Types'}</option>)}
          </select>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={paidOnly} onChange={e => setPaid(e.target.checked)} style={{ accentColor:'var(--accent-primary)' }}/>
            Paid only
          </label>
        </div>
      </div>

      <p style={{ marginBottom:20, color:'var(--text-muted)', fontSize:'0.83rem' }}>
        {loading ? 'Searching…' : `${projects.length} project${projects.length!==1?'s':''} found`}
      </p>

      {loading
        ? <Spinner text="Loading projects…"/>
        : projects.length === 0
          ? <EmptyState icon={Briefcase} title="No projects found" description="Try adjusting your filters or search terms."/>
          : <div className="grid-2">{projects.map(p => <ProjectCard key={p.id} project={p}/>)}</div>
      }
    </div>
  )
}

function ProjectCard({ project: p }) {
  return (
    <Link to={`/student/projects/${p.id}`} style={{ textDecoration:'none' }}>
      <div className={styles.card}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, marginBottom:6 }}>
          <h3 className={styles.cardTitle}>{p.title}</h3>
          <Badge variant={p.status}/>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
          <Badge variant="draft" label={p.project_type?.replace('_',' ')} style={{ fontSize:'0.7rem' }}/>
          {p.is_paid && <span style={{ fontSize:'0.7rem', color:'var(--accent-success)', display:'flex', alignItems:'center', gap:3 }}><DollarSign size={11}/>{p.stipend||'Paid'}</span>}
        </div>
        <div className={styles.cardMeta}>
          <span><Briefcase size={13}/> {p.created_by?.first_name} {p.created_by?.last_name}</span>
          <span><Users size={13}/> {p.application_count} applied</span>
          {p.deadline && <span><Calendar size={13}/> {new Date(p.deadline).toLocaleDateString()}</span>}
        </div>
        {p.tags_list?.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12 }}>
            {p.tags_list.slice(0,4).map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
            {p.tags_list.length > 4 && <span className={styles.tag}>+{p.tags_list.length-4}</span>}
          </div>
        )}
        <div className={styles.cardFooter}>
          <span style={{ fontSize:'0.73rem', color:'var(--text-muted)' }}>{timeAgo(p.created_at)}</span>
          <span className={styles.viewLink}>View details →</span>
        </div>
      </div>
    </Link>
  )
}
