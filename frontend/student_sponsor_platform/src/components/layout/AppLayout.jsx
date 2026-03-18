// src/components/layout/AppLayout.jsx
// Sidebar navigation shell for authenticated pages.

import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Briefcase, FileText, MessageSquare,
  User, Users, LogOut, Menu, X, ChevronRight,
} from 'lucide-react'
import { roleColor, initials } from '../../utils/helpers'
import styles from './AppLayout.module.css'

const NAV = {
  student: [
    { to:'/student/dashboard',    icon:LayoutDashboard, label:'Dashboard' },
    { to:'/student/projects',     icon:Briefcase,       label:'Browse Projects' },
    { to:'/student/applications', icon:FileText,        label:'My Applications' },
    { to:'/student/profile',      icon:User,            label:'My Profile' },
    { to:'/messages',             icon:MessageSquare,   label:'Messages' },
  ],
  sponsor: [
    { to:'/sponsor/dashboard', icon:LayoutDashboard, label:'Dashboard' },
    { to:'/sponsor/projects',  icon:Briefcase,       label:'My Projects' },
    { to:'/messages',          icon:MessageSquare,   label:'Messages' },
  ],
  faculty: [
    { to:'/faculty/dashboard', icon:LayoutDashboard, label:'Dashboard' },
    { to:'/faculty/projects',  icon:Briefcase,       label:'My Projects' },
    { to:'/messages',          icon:MessageSquare,   label:'Messages' },
  ],
  admin: [
    { to:'/admin/dashboard', icon:LayoutDashboard, label:'Dashboard' },
    { to:'/admin/users',     icon:Users,            label:'Manage Users' },
    { to:'/messages',        icon:MessageSquare,    label:'Messages' },
  ],
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const [open, setOpen]  = useState(false)

  const navItems = NAV[user?.role] || []
  const rColor   = roleColor(user?.role)

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className={styles.layout}>
      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
        <div className={styles.logo}>
          <span className={styles.logoIcon} style={{ background: rColor }}>S</span>
          <span className={styles.logoText}>SSP</span>
          <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close menu"><X size={18}/></button>
        </div>

        <div className={styles.userChip}>
          <div className={styles.userAvatar} style={{ background: rColor }}>
            {initials(user?.first_name, user?.last_name)}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.first_name} {user?.last_name}</span>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className={styles.chevron} />
            </NavLink>
          ))}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18}/><span>Sign Out</span>
        </button>
      </aside>

      {/* ── Main ── */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22}/>
          </button>
          <span className={styles.topbarTitle}>Student Sponsor Platform</span>
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
