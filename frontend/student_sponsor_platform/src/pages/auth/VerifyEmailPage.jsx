// src/pages/auth/VerifyEmailPage.jsx
// Handles the email verification link: /verify-email?token=<uuid>

import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authAPI } from '../../api/services'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import styles from './Auth.module.css'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token          = searchParams.get('token')

  const [status, setStatus]   = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token found in the URL.')
      return
    }

    authAPI.verifyEmail(token)
      .then(() => {
        setStatus('success')
        setMessage('Your email has been verified! You can now log in.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.detail || 'This verification link is invalid or has expired.')
      })
  }, [token])

  return (
    <div className={styles.authPage} style={{ justifyContent: 'center' }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '48px 40px',
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
      }}>
        {status === 'loading' && (
          <>
            <Loader size={48} style={{ color: 'var(--accent-primary)', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ marginBottom: 8 }}>Verifying your email…</h2>
            <p style={{ color: 'var(--text-muted)' }}>Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={52} style={{ color: 'var(--accent-success)', margin: '0 auto 16px' }} />
            <h2 style={{ marginBottom: 8, color: 'var(--accent-success)' }}>Email Verified!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{message}</p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              Go to Login →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={52} style={{ color: 'var(--accent-danger)', margin: '0 auto 16px' }} />
            <h2 style={{ marginBottom: 8, color: 'var(--accent-danger)' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{message}</p>
            <Link to="/register" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
              Register again
            </Link>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
