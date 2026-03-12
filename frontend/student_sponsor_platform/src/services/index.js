import api from './api.js'

// ── Auth ──────────────────────────────────────────────────────────────────
export const authService = {
  register:       (data)      => api.post('/auth/register/',  data),
  login:          (data)      => api.post('/auth/login/',     data),
  logout:         (refresh)   => api.post('/auth/logout/',    { refresh }),
  me:             ()          => api.get('/auth/me/'),
  updateMe:       (data)      => api.patch('/auth/me/',       data),
  getProfile:     ()          => api.get('/auth/profile/'),
  updateProfile:  (data)      => api.patch('/auth/profile/',  data),
}

// ── Projects ──────────────────────────────────────────────────────────────
export const projectsService = {
  list:           (params)    => api.get('/projects/',            { params }),
  detail:         (id)        => api.get(`/projects/${id}/`),
  create:         (data)      => api.post('/projects/',           data),
  update:         (id, data)  => api.patch(`/projects/${id}/`,   data),
  delete:         (id)        => api.delete(`/projects/${id}/`),
  getApplicants:  (id)        => api.get(`/projects/${id}/applications/`),
  apply:          (id, data)  => api.post(`/projects/${id}/applications/`, data),
}

// ── Applications ──────────────────────────────────────────────────────────
export const applicationsService = {
  mine:           ()          => api.get('/applications/'),
  update:         (id, data)  => api.patch(`/applications/${id}/`, data),
}

// ── Messaging ─────────────────────────────────────────────────────────────
export const messagingService = {
  conversations:   ()         => api.get('/conversations/'),
  createOrGet:     (userId)   => api.post('/conversations/create/', { user_id: userId }),
  messages:        (convId)   => api.get(`/conversations/${convId}/messages/`),
}

// ── Notifications ─────────────────────────────────────────────────────────
export const notificationsService = {
  list:            ()         => api.get('/notifications/'),
  markAllRead:     ()         => api.post('/notifications/mark-all-read/'),
  markRead:        (id)       => api.patch(`/notifications/${id}/`, { is_read: true }),
}

// ── Admin ─────────────────────────────────────────────────────────────────
export const adminService = {
  users:           (params)   => api.get('/admin/users/',    { params }),
  updateUser:      (id, data) => api.patch(`/admin/users/${id}/`, data),
  stats:           ()         => api.get('/admin/stats/'),
}
