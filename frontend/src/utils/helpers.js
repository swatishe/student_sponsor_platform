// src/utils/helpers.js
// Shared utility / helper functions used across the app.

import { formatDistanceToNow, format } from 'date-fns'

/**
 * Format a date string into a human-readable relative time.
 * e.g.  "3 days ago"
 */
export function timeAgo(dateStr) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

/**
 * Format a date string into a short date.
 * e.g.  "Jan 15, 2025"
 */
export function shortDate(dateStr) {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert snake_case to Title Case.
 * e.g.  "project_type" → "Project Type"
 */
export function snakeToTitle(str = '') {
  return str
    .split('_')
    .map((w) => capitalize(w))
    .join(' ')
}

/**
 * Extract readable error messages from an Axios error response.
 * Returns an array of strings.
 */
export function extractErrors(err) {
  const data = err?.response?.data
  if (!data) return ['An unexpected error occurred.']
  if (typeof data === 'string') return [data]
  if (typeof data === 'object') {
    return Object.entries(data).flatMap(([key, val]) => {
      const msgs = Array.isArray(val) ? val : [val]
      return msgs.map((m) => (key === 'detail' ? m : `${capitalize(key)}: ${m}`))
    })
  }
  return ['An unexpected error occurred.']
}

/**
 * Return role-specific accent color CSS variable.
 */
export function roleColor(role) {
  return {
    student: 'var(--accent-success)',
    sponsor: 'var(--accent-warning)',
    faculty: 'var(--accent-info)',
    admin:   'var(--accent-primary)',
  }[role] ?? 'var(--accent-primary)'
}

/**
 * Return initials from a first + last name.
 */
export function initials(firstName = '', lastName = '') {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
}

/**
 * Truncate a string to maxLen characters, adding '…' if cut.
 */
export function truncate(str = '', maxLen = 120) {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}
