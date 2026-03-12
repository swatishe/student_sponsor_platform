import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProject } from '@/hooks/useProjects'
import { Card, Button, Input, Textarea, Select } from '@/components/ui'

export default function NewProject() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title:'', description:'', requirements:'',
    project_type:'sponsored', max_applicants:10,
    deadline:'', skills_required:[],
  })
  const [skillInput, setSkillInput] = useState('')
  const createMutation = useCreateProject()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills_required.includes(s)) {
      set('skills_required', [...form.skills_required, s])
      setSkillInput('')
    }
  }

  const removeSkill = (s) => set('skills_required', form.skills_required.filter(x => x !== s))

  const onSubmit = e => {
    e.preventDefault()
    const payload = { ...form, max_applicants: Number(form.max_applicants) }
    if (!payload.deadline) delete payload.deadline
    createMutation.mutate(payload, { onSuccess: () => navigate('/projects') })
  }

  return (
    <div className="fade-in" style={{ padding:'32px', maxWidth:720 }}>
      <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} style={{ marginBottom:'20px' }}>← Back</Button>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:'24px', fontWeight:700, marginBottom:'24px' }}>Post a New Project</h1>

      <Card style={{ padding:'28px' }}>
        <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          <Input label="Project Title *" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. AI-powered data pipeline" />
          <Textarea label="Description *" value={form.description} onChange={e => set('description', e.target.value)} required rows={5} placeholder="Describe the project scope, goals, and what students will learn..." />
          <Textarea label="Requirements" value={form.requirements} onChange={e => set('requirements', e.target.value)} rows={3} placeholder="Prerequisites, time commitment, deliverables..." />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
            <Select label="Type" value={form.project_type} onChange={e => set('project_type', e.target.value)}
              options={[{value:'sponsored',label:'Sponsored'},{value:'internal',label:'Internal'},{value:'research',label:'Research'}]} />
            <Input label="Max Applicants" type="number" min={1} max={100} value={form.max_applicants} onChange={e => set('max_applicants', e.target.value)} />
            <Input label="Application Deadline" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
          </div>

          {/* Skills */}
          <div>
            <label style={{ fontSize:'13px', fontWeight:500, color:'var(--text-secondary)', display:'block', marginBottom:'6px' }}>Skills Required</label>
            <div style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addSkill()} }}
                placeholder="Type a skill and press Enter"
                style={{ flex:1, background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'8px 12px', fontSize:'14px', color:'var(--text-primary)', outline:'none' }} />
              <Button type="button" variant="secondary" onClick={addSkill}>Add</Button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {form.skills_required.map(s => (
                <span key={s} onClick={() => removeSkill(s)} style={{ padding:'4px 12px', background:'var(--amber-bg)', color:'var(--amber)', borderRadius:'999px', fontSize:'12px', cursor:'pointer' }}>
                  {s} ×
                </span>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', paddingTop:'8px' }}>
            <Button type="button" variant="secondary" onClick={() => navigate('/projects')}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending}>Publish Project</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
