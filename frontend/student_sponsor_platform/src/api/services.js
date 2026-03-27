// src/api/services.js
// All API service calls organised by domain with verifyEmail + resendVerification to authAPI
//@author sshende

import api from './axios'

// ── Auth ────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data)             => api.post('/api/v1/users/register/', data),
  login:          (email, password)  => api.post('/api/v1/auth/login/', { email, password }),
  logout:         (refresh)          => api.post('/api/v1/auth/logout/', { refresh }),
  getMe:          ()                 => api.get('/api/v1/users/me/'),
  changePassword: (data)             => api.post('/api/v1/users/change-password/', data),
  // Email verification
  verifyEmail:          (token)  => api.get(`/api/v1/users/verify-email/?token=${token}`),
  resendVerification:   ()       => api.post('/api/v1/users/resend-verification/'),
}

// ── Profiles ────────────────────────────────────────────────────────────
export const profileAPI = {
  getStudentProfile:    ()     => api.get('/api/v1/users/profile/student/'),
  updateStudentProfile: (data) => api.patch('/api/v1/users/profile/student/', data),
  getSponsorProfile:    ()     => api.get('/api/v1/users/profile/sponsor/'),
  updateSponsorProfile: (data) => api.patch('/api/v1/users/profile/sponsor/', data),
  getFacultyProfile:    ()     => api.get('/api/v1/users/profile/faculty/'),
  updateFacultyProfile: (data) => api.patch('/api/v1/users/profile/faculty/', data),
  getStudentById:       (id)   => api.get(`/api/v1/users/students/${id}/`),
}

// ── Projects ─────────────────────────────────────────────────────────────
export const projectAPI = {
  getProjects:    (params = {}) => api.get('/api/v1/projects/', { params }),
  getProject:     (id)          => api.get(`/api/v1/projects/${id}/`),
  createProject:  (data)        => api.post('/api/v1/projects/', data),
  updateProject:  (id, data)    => api.patch(`/api/v1/projects/${id}/`, data),
  deleteProject:  (id)          => api.delete(`/api/v1/projects/${id}/`),
  getMyProjects:  ()            => api.get('/api/v1/projects/mine/'),
}

// ── Applications ─────────────────────────────────────────────────────────
export const applicationAPI = {
  apply:                  (data)      => api.post('/api/v1/applications/', data),
  getMyApplications:      ()          => api.get('/api/v1/applications/mine/'),
  getProjectApplications: (projectId) => api.get(`/api/v1/applications/project/${projectId}/`),
  updateStatus:           (id, data)  => api.patch(`/api/v1/applications/${id}/status/`, data),
  withdraw:               (id)        => api.delete(`/api/v1/applications/${id}/withdraw/`),
}

// ── Messaging ─────────────────────────────────────────────────────────────
export const messagingAPI = {
  getConversations:  ()                     => api.get('/api/v1/messages/conversations/'),
  startConversation: (recipientId, message) => api.post('/api/v1/messages/start/', { recipient_id: recipientId, message }),
  getMessages:       (convId)               => api.get(`/api/v1/messages/conversations/${convId}/messages/`),
  sendMessage:       (convId, content)      => api.post(`/api/v1/messages/conversations/${convId}/send/`, { content }),
}

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers:   (role)     => api.get('/api/v1/users/admin/users/', { params: role ? { role } : {} }),
  updateUser: (id, data) => api.patch(`/api/v1/users/admin/users/${id}/`, data),
  deleteUser: (id)       => api.delete(`/api/v1/users/admin/users/${id}/`),
}
