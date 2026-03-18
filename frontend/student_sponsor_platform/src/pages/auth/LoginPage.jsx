// src/pages/auth/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { extractErrors } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import styles from './Auth.module.css'

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]         = useState({ email:'', password:'' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      extractErrors(err).forEach(m => toast.error(m))
    } finally { setLoading(false) }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.panel}>
        <div className={styles.panelContent}>
          <h1>Student Sponsor<br/>Platform</h1>
          <p>Connect students with industry sponsors and faculty. Build your future, one project at a time.</p>
          <div className={styles.dots}><span/><span/><span/></div>
        </div>
      </div>
      <div className={styles.formSide}>
        <div className={styles.formBox}>
          <div className={styles.formHeader}>
            <div className={styles.iconWrap}><LogIn size={24}/></div>
            <h2>Sign In</h2>
            <p>Enter your credentials to continue</p>
          </div>
          <form onSubmit={onSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon}/>
                <input type="email" name="email" value={form.email} onChange={onChange}
                  placeholder="you@university.edu" required
                  className={`form-input ${styles.paddedInput}`}/>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon}/>
                <input type={showPass?'text':'password'} name="password" value={form.password} onChange={onChange}
                  placeholder="••••••••" required
                  className={`form-input ${styles.paddedInput} ${styles.paddedRight}`}/>
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(p=>!p)} tabIndex={-1}>
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className={styles.switchLink}>Don't have an account? <Link to="/register">Create one →</Link></p>
        </div>
      </div>
    </div>
  )
}
