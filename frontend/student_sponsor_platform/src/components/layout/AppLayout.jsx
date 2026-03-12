import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'
import { authService } from '@/services'
import { Avatar, Badge } from '@/components/ui'
import { useQuery } from '@tanstack/react-query'
import { notificationsService } from '@/services'

const NAV = [
  { to:'/',             icon:'⬡', label:'Dashboard',    roles:['student','sponsor','faculty','admin'] },
  { to:'/projects',     icon:'◈', label:'Projects',     roles:['student','sponsor','faculty','admin'] },
  { to:'/my-projects/new', icon:'+', label:'Post Project', roles:['sponsor','faculty'] },
  { to:'/applications', icon:'◎', label:'Applications', roles:['student'] },
  { to:'/messages',     icon:'◉', label:'Messages',     roles:['student','sponsor','faculty','admin'] },
  { to:'/profile',      icon:'◈', label:'Profile',      roles:['student','sponsor','faculty','admin'] },
  { to:'/admin',        icon:'⚙', label:'Admin',        roles:['admin'] },
]

const ROLE_COLOR = { student:'var(--blue)', sponsor:'var(--amber)', faculty:'#c084fc', admin:'var(--red)' }

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout }          = useAuthStore()
  const navigate                  = useNavigate()

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => notificationsService.list().then(r => r.data),
    refetchInterval: 30_000,
  })
  const unread = notifData?.results?.filter(n => !n.is_read).length || 0

  const handleLogout = async () => {
    try { await authService.logout(useAuthStore.getState().refreshToken) } catch {}
    logout()
    navigate('/login')
  }

  const links = NAV.filter(n => !user || n.roles.includes(user.role))
  const W = collapsed ? 60 : 220

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-base)' }}>
      {/* Sidebar */}
      <aside style={{
        width:W, minHeight:'100vh', background:'var(--bg-surface)',
        borderRight:'1px solid var(--border)', display:'flex',
        flexDirection:'column', transition:'width .2s', flexShrink:0, position:'sticky', top:0,
      }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 0' : '20px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed && (
            <span style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'18px' }}>
              <span style={{ color:'var(--amber)' }}>S</span>SP
            </span>
          )}
          <button onClick={() => setCollapsed(c => !c)}
            style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:'18px', cursor:'pointer', padding:'4px' }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex:1, padding:'12px 0', display:'flex', flexDirection:'column', gap:'2px' }}>
          {links.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to==='/'} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:'10px',
              padding: collapsed ? '10px 0' : '10px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? 'var(--amber)' : 'var(--text-secondary)',
              background: isActive ? 'var(--amber-bg)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--amber)' : '2px solid transparent',
              fontSize:'14px', fontWeight: isActive ? 600 : 400,
              transition:'all .15s', textDecoration:'none',
            })}>
              <span style={{ fontSize:'16px', minWidth:16, textAlign:'center', position:'relative' }}>
                {n.icon}
                {n.to==='/messages' && unread > 0 && (
                  <span style={{ position:'absolute', top:-4, right:-4, background:'var(--red)', color:'#fff', fontSize:'9px', borderRadius:'999px', padding:'1px 4px', fontWeight:700 }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </span>
              {!collapsed && <span>{n.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: collapsed ? '12px 0' : '12px 16px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'10px', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <Avatar name={user?.profile?.full_name || user?.username} src={user?.profile?.avatar} size={32} />
          {!collapsed && (
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'13px', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {user?.profile?.full_name || user?.username}
              </div>
              <Badge style={{ fontSize:'9px', padding:'1px 6px' }} color={ROLE_COLOR[user?.role] || 'var(--text-muted)'}>
                {user?.role}
              </Badge>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} title="Logout"
              style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'16px' }}>
              ⏻
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex:1, overflowX:'hidden', minWidth:0 }}>
        <Outlet />
      </main>
    </div>
  )
}
