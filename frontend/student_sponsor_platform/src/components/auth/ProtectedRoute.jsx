import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

export default function ProtectedRoute({ roles, children }) {
  const { user, accessToken } = useAuthStore()

  if (!accessToken) return <Navigate to="/login" replace />

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children ? children : <Outlet />
}
