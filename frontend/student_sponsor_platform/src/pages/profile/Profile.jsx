import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services'
import useAuthStore from '@/store/authStore'
import { Card, Button, Input, Textarea, Avatar, Badge } from '@/components/ui'
import { extractError, avatarColor } from '@/utils/helpers'
import toast from 'react-hot-toast'

const ROLE_COLOR = { student:'var(--blue)', sponsor:'var(--amber)', faculty:'#c084fc', admin:'var(--red)' }

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const qc = useQueryClient()
  const [skillInput, setSkillInput] = useState('')

  const { data: profileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn:  () => authService.getProfile().then(r => r.data),
  })

  const [form, setForm] = useState({
    full_name:'', bio:'', skills:[], organization:'',
    linkedin_url:'', github_url:'', portfolio_url:'', resume_url:'', website_url:'',
  })

  useEffect(() => {
    if (profileData) setForm({ ...form, ...profileData })
  }, [profileData])

  const mutation = useMutation({
    mutationFn:  (data) => authService.updateProfile(data),
    onSuccess:   (res)  => {
      qc.setQueryData(['my-profile'], res.data)
      toast.success('Profile saved!')
    },
    onError: (e) => toast.error(extractError(e)),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) { set('skills', [...form.skills, s]); setSkillInput('') }
  }

  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s))

  const onSubmit = e => { e.preventDefault(); mutation.mutate(form) }

  const displayName = form.full_name || user?.username || ''

  return (
    <div className="fade-in" style={{ padding:'32px', maxWidth:760 }}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:'26px', fontWeight:700, marginBottom:'28px' }}>My Profile</h1>

      {/* Avatar + identity */}
      <Card style={{ marginBottom:'24px', padding:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
          <Avatar name={displayName} src={form.avatar} size={64} />
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'18px' }}>{displayName || 'Your Name'}</h2>
            <div style={{ display:'flex', gap:'8px', marginTop:'6px' }}>
              <Badge color={ROLE_COLOR[user?.role] || 'var(--text-muted)'}>{user?.role}</Badge>
              <span style={{ fontSize:'13px', color:'var(--text-muted)' }}>{user?.email}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ padding:'28px' }}>
        <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <Input label="Full Name" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Jane Smith" />
            <Input label="Organization" value={form.organization} onChange={e => set('organization', e.target.value)} placeholder="University / Company" />
          </div>

          <Textarea label="Bio" value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Tell sponsors about yourself..." />

          {/* Skills */}
          <div>
            <label style={{ fontSize:'13px', fontWeight:500, color:'var(--text-secondary)', display:'block', marginBottom:'6px' }}>Skills</label>
            <div style={{ display:'flex', gap:'8px', marginBottom:'10px' }}>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addSkill()} }}
                placeholder="Add a skill and press Enter"
                style={{ flex:1, background:'var(--bg-input)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'8px 12px', fontSize:'14px', color:'var(--text-primary)', outline:'none' }} />
              <Button type="button" variant="secondary" onClick={addSkill}>Add</Button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {form.skills.map(s => (
                <span key={s} onClick={() => removeSkill(s)}
                  style={{ padding:'4px 12px', background:'var(--amber-bg)', color:'var(--amber)', borderRadius:'999px', fontSize:'12px', cursor:'pointer' }}>
                  {s} ×
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:'20px' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'14px', fontWeight:700, marginBottom:'16px', color:'var(--text-secondary)' }}>Links</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              <Input label="LinkedIn URL"  value={form.linkedin_url  || ''} onChange={e => set('linkedin_url',  e.target.value)} placeholder="https://linkedin.com/in/..." />
              <Input label="GitHub URL"    value={form.github_url    || ''} onChange={e => set('github_url',    e.target.value)} placeholder="https://github.com/..." />
              <Input label="Portfolio URL" value={form.portfolio_url || ''} onChange={e => set('portfolio_url', e.target.value)} placeholder="https://yoursite.com" />
              <Input label="Resume URL"    value={form.resume_url    || ''} onChange={e => set('resume_url',    e.target.value)} placeholder="Google Drive / Dropbox link" />
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:'8px' }}>
            <Button type="submit" loading={mutation.isPending}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
