// src/pages/admin/AdminUsers.jsx
//@author sshende
import { useState, useEffect } from 'react'
import { adminAPI } from '../../api/services'
import Spinner from '../../components/common/Spinner'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import toast from 'react-hot-toast'
import { Trash2, Search, ShieldOff, ShieldCheck } from 'lucide-react'
import { shortDate } from '../../utils/helpers'

const ROLES = ['', 'student', 'sponsor', 'faculty', 'admin']

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [roleFilter, setRole] = useState('')

  const fetchUsers = (role = '') => {
    setLoading(true)
    adminAPI.getUsers(role || undefined)
      .then(({ data }) => setUsers(data?.results ?? data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers(roleFilter) }, [roleFilter])

  const handleDelete = async (id, name) => {
    if (!confirm(`Permanently delete "${name}"?`)) return
    try { await adminAPI.deleteUser(id); toast.success('User deleted.'); fetchUsers(roleFilter) }
    catch { toast.error('Failed to delete user.') }
  }

  const handleToggleActive = async (u) => {
    try {
      await adminAPI.updateUser(u.id, { is_active: !u.is_active })
      toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}.`)
      fetchUsers(roleFilter)
    } catch { toast.error('Failed to update.') }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q)  ||
      u.email?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>Manage Users</h1>
        <p>View, deactivate, or remove platform users.</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search name or email…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input" style={{ paddingLeft: 38 }} />
        </div>
        <select value={roleFilter} onChange={(e) => setRole(e.target.value)} className="form-input" style={{ width: 160 }}>
          {ROLES.map((r) => <option key={r} value={r}>{r || 'All Roles'}</option>)}
        </select>
      </div>

      <p style={{ marginBottom: 14, color: 'var(--text-muted)', fontSize: '0.83rem' }}>
        {filtered.length} user{filtered.length !== 1 ? 's' : ''}
      </p>

      {loading
        ? <Spinner text="Loading users…" />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((u) => (
              <div key={u.id} className="card" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    <Avatar user={u} size={38} radius={10} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {u.first_name} {u.last_name}
                        {!u.is_active && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-danger)', background: 'rgba(244,63,94,0.1)', padding: '1px 8px', borderRadius: 100 }}>
                            Inactive
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>{u.email}</span>
                        <span>Joined {shortDate(u.date_joined)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <Badge variant={u.role} />
                    <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleToggleActive(u)} title={u.is_active ? 'Deactivate' : 'Activate'}>
                      {u.is_active ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                    </button>
                    <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                      onClick={() => handleDelete(u.id, `${u.first_name} ${u.last_name}`)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
