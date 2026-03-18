// src/components/common/Avatar.jsx
// Renders initials-based avatar with role-specific colour.

import { initials, roleColor } from '../../utils/helpers'

/**
 * @param {object} user   - { first_name, last_name, role }
 * @param {number} size   - pixel size (default 40)
 * @param {number} radius - border-radius (default 10)
 */
export default function Avatar({ user, size = 40, radius = 10 }) {
  const bg   = roleColor(user?.role)
  const text = initials(user?.first_name, user?.last_name)

  return (
    <div style={{
      width: size, height: size,
      borderRadius: radius,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: size * 0.36,
      color: 'white',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {text || '?'}
    </div>
  )
}
