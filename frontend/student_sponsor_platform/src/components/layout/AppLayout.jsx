// src/components/layout/AppLayout.jsx
// Top horizontal navigation bar for authenticated pages.
//@author sshende

import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Briefcase, FileText, MessageSquare,
  User, Users, LogOut, Menu, X, ChevronDown,
} from 'lucide-react'
import { roleColor, initials } from '../../utils/helpers'
import styles from './AppLayout.module.css'

const NAV = {
  student: [
    { to: '/student/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/projects',     icon: Briefcase,       label: 'Browse Projects' },
    { to: '/student/applications', icon: FileText,        label: 'My Applications' },
    { to: '/student/profile',      icon: User,            label: 'My Profile' },
    { to: '/messages',             icon: MessageSquare,   label: 'Messages' },
  ],
  sponsor: [
    { to: '/sponsor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/sponsor/projects',  icon: Briefcase,       label: 'My Projects' },
    { to: '/messages',          icon: MessageSquare,   label: 'Messages' },
  ],
  faculty: [
    { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/faculty/projects',  icon: Briefcase,       label: 'My Projects' },
    { to: '/messages',          icon: MessageSquare,   label: 'Messages' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users',     icon: Users,            label: 'Manage Users' },
    { to: '/messages',        icon: MessageSquare,    label: 'Messages' },
  ],
}

export default function AppLayout() {
  const { user, logout }         = useAuth()
  const navigate                 = useNavigate()
  const [mobileOpen, setMobile]  = useState(false)
  const [dropdownOpen, setDropdown] = useState(false)

  const navItems = NAV[user?.role] || []
  const rColor   = roleColor(user?.role)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className={styles.layout}>

      {/* ── Top Navigation Bar ── */}
      <header className={styles.navbar}>

        {/* Left: Logo */}
        <div className={styles.navLogo}>
          <span className={styles.logoIcon} style={{ background: rColor }}>S</span>
          <span className={styles.logoText}>SSP</span>
        </div>

        {/* Center: Nav links (desktop) */}
        <nav className={styles.navLinks}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right: User dropdown + logout */}
        <div className={styles.navRight}>
          {/* User avatar + dropdown */}
          <div className={styles.userDropdown}>
            <button
              className={styles.userBtn}
              onClick={() => setDropdown((p) => !p)}
            >
              <div className={styles.userAvatar} style={{ background: rColor }}>
                {initials(user?.first_name, user?.last_name)}
              </div>
              <div className={styles.userMeta}>
                <span className={styles.userName}>
                  {user?.first_name} {user?.last_name}
                </span>
                <span className={`badge badge-${user?.role}`}>{user?.role}</span>
              </div>
              <ChevronDown size={14} className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <>
                <div className={styles.dropdownBackdrop} onClick={() => setDropdown(false)} />
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {user?.email}
                    </div>
                  </div>
                  <div className={styles.dropdownDivider} />
                  <button className={styles.dropdownLogout} onClick={handleLogout}>
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobile((p) => !p)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Mobile dropdown nav ── */}
      {mobileOpen && (
        <div className={styles.mobileNav}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobile(false)}
              className={({ isActive }) =>
                `${styles.mobileNavLink} ${isActive ? styles.mobileActive : ''}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <div className={styles.mobileDivider} />
          <button className={styles.mobileLogout} onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      )}

      {/* ── Page content ── */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
