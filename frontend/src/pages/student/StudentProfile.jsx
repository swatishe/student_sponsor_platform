// src/pages/student/StudentProfile.jsx
//@author sshende
import { useState, useEffect } from 'react'
import { profileAPI } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/common/Spinner'
import Avatar from '../../components/common/Avatar'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

export default function StudentProfile() {
  const { user }  = useAuth()
  const [form, setForm]     = useState({ bio:'', university:'', major:'', gpa:'', skills:'', portfolio_url:'', linkedin_url:'', github_url:'' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    profileAPI.getStudentProfile().then(({ data }) => {
      setForm({ bio:data.bio||'', university:data.university||'', major:data.major||'', gpa:data.gpa||'', skills:data.skills||'', portfolio_url:data.portfolio_url||'', linkedin_url:data.linkedin_url||'', github_url:data.github_url||'' })
    }).finally(() => setLoading(false))
  }, [])

  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await profileAPI.updateStudentProfile(form); toast.success('Profile updated!') }
    catch { toast.error('Failed to save.') }
    finally { setSaving(false) }
  }

  if (loading) return <Spinner text="Loading profile…"/>

  return (
    <div className="page-enter" style={{ maxWidth:720 }}>
      <div className="page-header"><h1>My Profile</h1><p>Keep your profile up to date to attract the best opportunities.</p></div>
      <div className="card" style={{ display:'flex', alignItems:'center', gap:18, marginBottom:24 }}>
        <Avatar user={user} size={60} radius={16}/>
        <div>
          <h2 style={{ fontSize:'1.1rem', marginBottom:6 }}>{user?.first_name} {user?.last_name}</h2>
          <span className="badge badge-student">Student</span>
          <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:4 }}>{user?.email}</div>
        </div>
      </div>
      <form onSubmit={onSubmit}>
        <div className="card" style={{ marginBottom:20 }}>
          <h3 style={{ fontSize:'0.9rem', marginBottom:20, color:'var(--text-secondary)' }}>Academic Info</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group"><label className="form-label">University</label><input name="university" value={form.university} onChange={onChange} className="form-input" placeholder="MIT, Stanford…"/></div>
            <div className="form-group"><label className="form-label">Major</label><input name="major" value={form.major} onChange={onChange} className="form-input" placeholder="Computer Science"/></div>
            <div className="form-group"><label className="form-label">GPA</label><input name="gpa" value={form.gpa} onChange={onChange} type="number" step="0.01" min="0" max="4" className="form-input" placeholder="3.8"/></div>
          </div>
        </div>
        <div className="card" style={{ marginBottom:20 }}>
          <h3 style={{ fontSize:'0.9rem', marginBottom:20, color:'var(--text-secondary)' }}>About You</h3>
          <div className="form-group"><label className="form-label">Bio</label><textarea name="bio" value={form.bio} onChange={onChange} className="form-input" rows={4} placeholder="Tell sponsors about yourself…"/></div>
          <div className="form-group"><label className="form-label">Skills <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>(comma-separated)</span></label><input name="skills" value={form.skills} onChange={onChange} className="form-input" placeholder="Python, React, Machine Learning…"/></div>
        </div>
        <div className="card" style={{ marginBottom:24 }}>
          <h3 style={{ fontSize:'0.9rem', marginBottom:20, color:'var(--text-secondary)' }}>Links</h3>
          <div className="form-group"><label className="form-label">Portfolio URL</label><input name="portfolio_url" value={form.portfolio_url} onChange={onChange} type="url" className="form-input" placeholder="https://yourportfolio.com"/></div>
          <div className="form-group"><label className="form-label">LinkedIn</label><input name="linkedin_url" value={form.linkedin_url} onChange={onChange} type="url" className="form-input" placeholder="https://linkedin.com/in/you"/></div>
          <div className="form-group"><label className="form-label">GitHub</label><input name="github_url" value={form.github_url} onChange={onChange} type="url" className="form-input" placeholder="https://github.com/you"/></div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}><Save size={16}/>{saving?'Saving…':'Save Profile'}</button>
      </form>
    </div>
  )
}
