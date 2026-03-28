// src/pages/sponsor/SponsorProfile.jsx
// Sponsor profile page — company info, industry, website, description.

import { useState, useEffect } from 'react'
import { profileAPI } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../../components/common/Spinner'
import Avatar from '../../components/common/Avatar'
import toast from 'react-hot-toast'
import { Save, Building2, Globe, Briefcase } from 'lucide-react'

export default function SponsorProfile() {
  const { user }  = useAuth()
  const [form, setForm]     = useState({
    company_name: '', industry: '', website: '', description: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    profileAPI.getSponsorProfile()
      .then(({ data }) => {
        setForm({
          company_name: data.company_name || '',
          industry:     data.industry     || '',
          website:      data.website      || '',
          description:  data.description  || '',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await profileAPI.updateSponsorProfile(form)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner text="Loading profile…" />

  return (
    <div className="page-enter" style={{ maxWidth: 720 }}>
      <div className="page-header">
        <h1>Company Profile</h1>
        <p>Keep your profile up to date so students can learn about your organisation.</p>
      </div>

      {/* Header card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16,
          background: 'var(--accent-warning)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', fontWeight: 800, color: 'white',
        }}>
          {form.company_name?.[0] || user?.first_name?.[0]}
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 6 }}>
            {form.company_name || `${user?.first_name} ${user?.last_name}`}
          </h2>
          <span className="badge badge-sponsor">Sponsor</span>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {user?.email}
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        {/* Company details */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: 20, color: 'var(--text-secondary)' }}>
            Company Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                name="company_name"
                value={form.company_name}
                onChange={onChange}
                required
                className="form-input"
                placeholder="Acme Corp"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Industry</label>
              <input
                name="industry"
                value={form.industry}
                onChange={onChange}
                className="form-input"
                placeholder="Technology, Finance, Healthcare…"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Website</label>
            <input
              name="website"
              value={form.website}
              onChange={onChange}
              type="url"
              className="form-input"
              placeholder="https://yourcompany.com"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Company Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              className="form-input"
              rows={5}
              placeholder="Describe your company, what you do, and what kind of students you're looking for…"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={16} />
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
