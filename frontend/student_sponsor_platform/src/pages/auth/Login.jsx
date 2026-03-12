import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '@/services'
import useAuthStore from '@/store/authStore'
import { Button, Input } from '@/components/ui'
import { extractError } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm]     = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const { login }           = useAuthStore()
  const navigate            = useNavigate()

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authService.login(form)
      login(data.user, data.access, data.refresh)
      navigate('/')
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-base)', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ fontSize:'48px', fontFamily:'var(--font-display)', fontWeight:800, color:'var(--amber)', marginBottom:'8px' }}>S</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'24px', fontWeight:700 }}>Welcome back</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'14px', marginTop:'6px' }}>Sign in to Student Sponsor Platform</p>
        </div>

        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', padding:'32px' }}>
          <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" required />
            <Input label="Password" name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" required />
            <Button type="submit" loading={loading} fullWidth size="lg">Sign In</Button>
          </form>
          <p style={{ textAlign:'center', marginTop:'20px', fontSize:'14px', color:'var(--text-muted)' }}>
            No account? <Link to="/register" style={{ color:'var(--amber)' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
