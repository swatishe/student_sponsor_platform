import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute  from '@/components/auth/ProtectedRoute'
import AppLayout       from '@/components/layout/AppLayout'
import Login           from '@/pages/auth/Login'
import Register        from '@/pages/auth/Register'
import Dashboard       from '@/pages/dashboard/Dashboard'
import ProjectsList    from '@/pages/projects/ProjectsList'
import ProjectDetail   from '@/pages/projects/ProjectDetail'
import NewProject      from '@/pages/projects/NewProject'
import Messaging       from '@/pages/messaging/Messaging'
import Profile         from '@/pages/profile/Profile'
import Applications    from '@/pages/applications/Applications'
import Admin           from '@/pages/admin/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — all inside AppLayout sidebar shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/"                  element={<Dashboard />} />
            <Route path="/projects"          element={<ProjectsList />} />
            <Route path="/projects/:id"      element={<ProjectDetail />} />
            <Route path="/my-projects/new"   element={<ProtectedRoute roles={["sponsor","faculty"]}><NewProject /></ProtectedRoute>} />
            <Route path="/messages"          element={<Messaging />} />
            <Route path="/profile"           element={<Profile />} />
            <Route path="/applications"      element={<Applications />} />
            <Route path="/admin"             element={<ProtectedRoute roles={["admin"]}><Admin /></ProtectedRoute>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
