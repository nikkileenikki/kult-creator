import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { request } from '@/lib/api'
import { ROLES, PERMISSIONS, ROLE_COLOR } from '@/lib/permissions'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'

const ROLE_AVATAR = {
  admin:   'from-amber-500 to-amber-400',
  manager: 'from-violet-500 to-violet-400',
  pic:     'from-blue-500 to-blue-400',
  viewer:  'from-white/20 to-white/10',
}

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function Users() {
  const navigate    = useNavigate()
  const authUser    = useAuthStore(s => s.user)
  const can         = useAuthStore(s => s.can)
  const showToast   = useUIStore(s => s.showToast)

  const [users,     setUsers]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')

  async function fetchUsers() {
    setLoading(true)
    try { setUsers(await request('GET', '/users')) }
    catch (e) { showToast('Failed to load users: ' + e.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(u =>
      u.displayName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    )
  }, [users, search])

  async function handleDelete(u) {
    if (!confirm(`Delete user "${u.displayName}"? This cannot be undone.`)) return
    try {
      await request('DELETE', `/users/${u.id}`)
      showToast(`${u.displayName} deleted`)
      fetchUsers()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Users</h1>
          <p className="text-[12px] text-white/30 mt-1">{users.length} account{users.length !== 1 ? 's' : ''}</p>
        </div>
        {can('users.manage') && (
          <button
            onClick={() => navigate('/users/new')}
            className="flex items-center gap-1.5 px-4 py-[7px] rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(108,92,231,.3)] hover:-translate-y-px"
          >
            <Plus size={14} /> New User
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#1E1E28] border border-white/7 rounded-lg px-3 py-[7px] w-72 mb-4 hover:border-white/14 focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/15 transition-all">
        <Search size={13} className="text-white/30 flex-shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or username…"
          className="bg-transparent outline-none text-[13px] text-white placeholder:text-white/25 w-full"
        />
        {search && <button onClick={() => setSearch('')} className="text-white/25 hover:text-white/60 text-[11px] flex-shrink-0">✕</button>}
      </div>

      {/* User list */}
      <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
        {loading ? (
          <div className="px-5 py-10 text-center text-[13px] text-white/20">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-white/20">
            {search ? 'No users match your search' : 'No users yet'}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {filtered.map(u => (
              <div key={u.id}>
                <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[.02] transition-colors">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${ROLE_AVATAR[u.role] ?? 'from-white/20 to-white/10'} flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}>
                    {getInitials(u.displayName)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-white">{u.displayName}</span>
                      <span className="font-mono text-[11px] text-white/25">@{u.username}</span>
                      {u.id === authUser?.sub && (
                        <span className="text-[10px] text-violet-400/60 bg-violet-400/10 border border-violet-400/15 px-1.5 py-0.5 rounded-full">You</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${ROLE_COLOR[u.role]?.bg ?? ROLE_COLOR.viewer.bg}`}>
                        {ROLES.find(r => r.key === u.role)?.label ?? u.role}
                      </span>
                      {u.permissions.slice(0, 3).map(p => (
                        <span key={p} className="text-[10px] text-white/25 bg-white/5 border border-white/7 px-1.5 py-0.5 rounded-full">
                          {PERMISSIONS.find(x => x.key === p)?.label ?? p}
                        </span>
                      ))}
                      {u.permissions.length > 3 && (
                        <span className="text-[10px] text-white/20">+{u.permissions.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {can('users.manage') && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/users/${u.id}/edit`)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white/70 transition-all"
                      >
                        <Pencil size={11} />
                      </button>
                      {u.id !== authUser?.sub && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 flex items-center justify-center text-white/30 hover:text-rose-400 transition-all"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
