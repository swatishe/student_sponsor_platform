// src/pages/auth/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../api/services'
import { extractErrors } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { UserPlus } from 'lucide-react'
import styles from './Auth.module.css'

const ROLES = [
  { value:'student', label:'🎓 Student',  desc:'Apply to projects and internships' },
  { value:'sponsor', label:'🏢 Sponsor',  desc:'Post projects and hire students' },
  { value:'faculty', label:'📚 Faculty',  desc:'Post research and capstone projects' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ first_name:'', last_name:'', email:'', role:'student', password:'', password2:'' })
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { toast.error('Passwords do not match.'); return }
    setLoading(true)
    try {
      await authAPI.register(form)
      toast.success('Account created! Please log in.')
      navigate('/login')
    } catch (err) {
      extractErrors(err).forEach(m => toast.error(m))
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.panel}>
        <div className={styles.panelContent}>
          <h1>Join the<br/>Platform</h1>
          <p>Students, sponsors, and faculty — all in one place to collaborate on meaningful projects.</p>
          <div className={styles.dots}><span/><span/><span/></div>
        </div>
      </div>
      <div className={styles.formSide}>
        <div className={`${styles.formBox} ${styles.formBoxWide}`}>
          <div className={styles.formHeader}>
            <div className={styles.iconWrap}><UserPlus size={24}/></div>
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>
          <form onSubmit={onSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label">I am a…</label>
              <div className={styles.roleGrid}>
                {ROLES.map(({ value, label, desc }) => (
                  <label key={value} className={`${styles.roleCard} ${form.role===value?styles.roleSelected:''}`}>
                    <input type="radio" name="role" value={value} checked={form.role===value} onChange={onChange} hidden/>
                    <span className={styles.roleLabel}>{label}</span>
                    <span className={styles.roleDesc}>{desc}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" name="first_name" value={form.first_name} onChange={onChange} required className="form-input" placeholder="Jane"/>
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" name="last_name" value={form.last_name} onChange={onChange} required className="form-input" placeholder="Smith"/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={onChange} required className="form-input" placeholder="jane@university.edu"/>
            </div>
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" value={form.password} onChange={onChange} required className="form-input" placeholder="Min 8 characters"/>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="password2" value={form.password2} onChange={onChange} required className="form-input" placeholder="Repeat password"/>
              </div>
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className={styles.switchLink}>Already have an account? <Link to="/login">Sign in →</Link></p>
        </div>
      </div>
    </div>
  )
}
