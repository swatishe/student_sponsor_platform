import React from 'react'
import { avatarColor, initials } from '@/utils/helpers'

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, variant='primary', size='md', loading, disabled, fullWidth, onClick, type='button', style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', fontFamily: 'var(--font-body)', fontWeight: 500,
    border: 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all .15s', borderRadius: 'var(--radius-md)',
    width: fullWidth ? '100%' : undefined, opacity: disabled || loading ? .6 : 1,
  }
  const sizes = {
    sm: { padding: '6px 12px',  fontSize: '13px' },
    md: { padding: '9px 18px',  fontSize: '14px' },
    lg: { padding: '12px 24px', fontSize: '15px' },
  }
  const variants = {
    primary:  { background: 'var(--amber)',    color: '#000' },
    secondary:{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' },
    danger:   { background: 'var(--red-bg)',   color: 'var(--red)',  border: '1px solid var(--red)' },
    ghost:    { background: 'transparent',     color: 'var(--text-secondary)' },
    outline:  { background: 'transparent',     color: 'var(--amber)', border: '1px solid var(--amber)' },
  }
  return (
    <button type={type} disabled={disabled || loading} onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {loading ? <Spinner size={14} /> : null}
      {children}
    </button>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, helpText, style, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'6px', ...style }}>
      {label && <label style={{ fontSize:'13px', fontWeight:500, color:'var(--text-secondary)' }}>{label}</label>}
      <input
        {...props}
        style={{
          background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)', padding: '9px 12px', fontSize: '14px',
          color: 'var(--text-primary)', outline: 'none', width: '100%',
          transition: 'border-color .15s',
        }}
        onFocus={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--amber)'}
        onBlur={e  => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
      />
      {error    && <span style={{ fontSize:'12px', color:'var(--red)' }}>{error}</span>}
      {helpText && !error && <span style={{ fontSize:'12px', color:'var(--text-muted)' }}>{helpText}</span>}
    </div>
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ label, error, rows=4, style, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'6px', ...style }}>
      {label && <label style={{ fontSize:'13px', fontWeight:500, color:'var(--text-secondary)' }}>{label}</label>}
      <textarea
        rows={rows}
        {...props}
        style={{
          background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)', padding: '9px 12px', fontSize: '14px',
          color: 'var(--text-primary)', outline: 'none', width: '100%', resize: 'vertical',
        }}
        onFocus={e => e.target.style.borderColor = error ? 'var(--red)' : 'var(--amber)'}
        onBlur={e  => e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)'}
      />
      {error && <span style={{ fontSize:'12px', color:'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, error, options=[], style, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'6px', ...style }}>
      {label && <label style={{ fontSize:'13px', fontWeight:500, color:'var(--text-secondary)' }}>{label}</label>}
      <select
        {...props}
        style={{
          background: 'var(--bg-input)', border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)', padding: '9px 12px', fontSize: '14px',
          color: 'var(--text-primary)', outline: 'none', width: '100%',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span style={{ fontSize:'12px', color:'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style, onClick, hoverable }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px',
        cursor: onClick ? 'pointer' : undefined,
        transition: hoverable ? 'border-color .15s, box-shadow .15s' : undefined,
        ...style,
      }}
      onMouseEnter={e => { if(hoverable){ e.currentTarget.style.borderColor='var(--amber)'; e.currentTarget.style.boxShadow='0 0 0 1px var(--amber)' } }}
      onMouseLeave={e => { if(hoverable){ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none' } }}
    >
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, bg='var(--bg-hover)', color='var(--text-secondary)', style }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'3px 10px',
      borderRadius:'999px', fontSize:'11px', fontWeight:600,
      letterSpacing:'.5px', textTransform:'uppercase',
      background:bg, color, ...style,
    }}>
      {children}
    </span>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name='', src, size=36 }) {
  const bg = avatarColor(name)
  return src
    ? <img src={src} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover' }} />
    : (
      <div style={{
        width:size, height:size, borderRadius:'50%', background:bg,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: size * 0.38, fontWeight:700, color:'#000',
        flexShrink:0,
      }}>
        {initials(name)}
      </div>
    )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size=20, color='var(--amber)' }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      border:`2px solid ${color}20`, borderTopColor:color,
      animation:'spin .7s linear infinite', flexShrink:0,
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon='📭', title, description, action }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>{icon}</div>
      <h3 style={{ color:'var(--text-secondary)', marginBottom:'8px', fontFamily:'var(--font-display)' }}>{title}</h3>
      {description && <p style={{ fontSize:'14px', marginBottom:'20px' }}>{description}</p>}
      {action}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Skeleton({ width='100%', height=16, style }) {
  return <div className="skeleton" style={{ width, height, borderRadius:'var(--radius-sm)', ...style }} />
}
