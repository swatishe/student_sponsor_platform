import { format, formatDistanceToNow, parseISO } from 'date-fns'
import clsx from 'clsx'

export { clsx }

export const fmtDate    = (d) => d ? format(parseISO(d), 'MMM d, yyyy') : '—'
export const fmtTime    = (d) => d ? format(parseISO(d), 'h:mm a') : ''
export const fmtRelative = (d) => d ? formatDistanceToNow(parseISO(d), { addSuffix: true }) : ''
export const truncate   = (s, n = 120) => s?.length > n ? `${s.slice(0, n)}…` : s
export const extractError = (err) =>
  err?.response?.data?.detail
  || err?.response?.data?.non_field_errors?.[0]
  || Object.values(err?.response?.data || {})[0]?.[0]
  || err?.message
  || 'Something went wrong'

export const statusColors = {
  open:        { bg: 'var(--green-bg)',  text: 'var(--green)'  },
  in_progress: { bg: 'var(--blue-bg)',   text: 'var(--blue)'   },
  closed:      { bg: 'var(--bg-hover)',  text: 'var(--text-muted)' },
  cancelled:   { bg: 'var(--red-bg)',    text: 'var(--red)'    },
  pending:     { bg: 'var(--yellow-bg)', text: 'var(--yellow)' },
  reviewed:    { bg: 'var(--blue-bg)',   text: 'var(--blue)'   },
  accepted:    { bg: 'var(--green-bg)',  text: 'var(--green)'  },
  rejected:    { bg: 'var(--red-bg)',    text: 'var(--red)'    },
}

export const typeColors = {
  sponsored: { bg: 'rgba(217,119,6,.15)', text: 'var(--amber)' },
  internal:  { bg: 'var(--blue-bg)',      text: 'var(--blue)'  },
  research:  { bg: 'rgba(168,85,247,.15)',text: '#c084fc'      },
}

const AVATAR_COLORS = [
  '#D97706','#3B82F6','#10B981','#8B5CF6',
  '#EF4444','#F59E0B','#06B6D4','#EC4899',
]
export const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
export const initials = (name = '', fallback = '?') => {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase() || fallback
}
