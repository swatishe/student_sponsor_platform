// src/context/AuthContext.jsx
// Global authentication state provider.
//@author sshende
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/services'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on first mount
  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const { data } = await authAPI.getMe()
      setUser(data)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login(email, password)
    localStorage.setItem('access_token',  data.access)
    localStorage.setItem('refresh_token', data.refresh)
    await fetchCurrentUser()
  }, [])

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token')
    try { if (refresh) await authAPI.logout(refresh) } catch { /* ignore */ }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    toast.success('Signed out.')
  }, [])

  const value = {
    user, loading, login, logout, fetchCurrentUser,
    isStudent: user?.role === 'student',
    isSponsor: user?.role === 'sponsor',
    isFaculty: user?.role === 'faculty',
    isAdmin:   user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
