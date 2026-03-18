// src/components/common/Badge.jsx
// Role / status badge component.

import { snakeToTitle } from '../../utils/helpers'

/**
 * @param {string} variant - maps to .badge-<variant> CSS class
 * @param {string} label   - override text (defaults to formatted variant)
 */
export default function Badge({ variant = 'draft', label, style = {} }) {
  const text = label ?? snakeToTitle(variant)
  return (
    <span className={`badge badge-${variant}`} style={style}>
      {text}
    </span>
  )
}
