import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '@/services'
import useAuthStore from '@/store/authStore'
import { Button, Input, Select } from '@/components/ui'
import { extractError } from '@/utils/helpers'
import toast from 'react-hot-toast'

const ROLES = [
  { value:'student', label:'Student — browse and apply to projects' },
  { value:'sponsor', label:'Sponsor — post and manage projects' },
  { value:'faculty', label:'Faculty — post research opportunities' },
]

export default function Register() {
  const [form, setForm]     = useState({ email:'', username:'', role:'student', password:'', password_confirm:'' })
  const [loading, setLoading] = useState(false)
  const { login }           = useAuthStore()
  const navigate            = useNavigate()

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.password_confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { data } = await authService.register(form)
      login(data.user, data.access, data.refresh)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ fontSize:'48px', fontFamily:'var(--font-display)', fontWeight:800, color:'var(--amber)', marginBottom:'8px' }}>S</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'24px', fontWeight:700 }}>Create your account</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'14px', marginTop:'6px' }}>Join the Student Sponsor Platform</p>
        </div>

        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'32px' }}>
          <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />
            <Input label="Username" name="username" value={form.username} onChange={onChange} placeholder="johndoe" required />
            <Select label="I am a..." name="role" value={form.role} onChange={onChange} options={ROLES} />
            <Input label="Password" name="password" type="password" value={form.password} onChange={onChange} placeholder="Min 8 characters" required />
            <Input label="Confirm Password" name="password_confirm" type="password" value={form.password_confirm} onChange={onChange} placeholder="••••••••" required />
            <Button type="submit" loading={loading} fullWidth size="lg">Create Account</Button>
          </form>
          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'14px', color:'var(--text-muted)' }}>
            Already registered? <Link to="/login" style={{ color:'var(--amber)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
