import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { request } from '@/lib/api'
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS, ROLE_COLOR } from '@/lib/permissions'
import { Search, Plus, Pencil, Trash2, Check, Eye, EyeOff } from 'lucide-react'

const INPUT = 'w-full bg-[#16161C] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/15 transition-all'
const LABEL = 'block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1'

const ROLE_AVATAR = {
  admin:   'from-amber-500 to-amber-400',
  manager: 'from-violet-500 to-violet-400',
  pic:     'from-blue-500 to-blue-400',
  viewer:  'from-white/20 to-white/10',
}

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function EditForm({ user, isSelf, onSave, onCancel }) {
  const [displayName, setDisplayName] = useState(user.displayName)
  const [username,    setUsername]    = useState(user.username)
  const [password,    setPassword]    = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [role,        setRole]        = useState(user.role)
  const [perms,       setPerms]       = useState(user.permissions)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  function applyRole(r) {
    if (isSelf && r !== 'admin') return
    setRole(r); setPerms(ROLE_PERMISSIONS[r] ?? [])
  }
  function togglePerm(key) {
    if (isSelf && key === 'users.manage') return
    setPerms(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])
  }

  const permGroups = PERMISSIONS.reduce((acc, p) => {
    acc[p.group] = acc[p.group] ?? []
    acc[p.group].push(p)
    return acc
  }, {})

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      const body = { displayName, role, permissions: perms }
      if (password) body.password = password
      if (username !== user.username) body.username = username
      await onSave(body)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-5 py-4 bg-violet-500/[.025] border-t border-white/7 space-y-4">
      <div className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">Editing @{user.username}</div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Display Name</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>New Password <span className="normal-case font-normal text-white/20">(leave blank to keep)</span></label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className={INPUT + ' pr-9'} />
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>
      </div>
      <div>
        <label className={LABEL}>Username</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[13px]">@</span>
          <input value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())} className={INPUT + ' pl-7'} />
        </div>
      </div>

      <div>
        <label className={LABEL}>Role</label>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map(r => {
            const disabled = isSelf && r.key !== 'admin'
            return (
              <button key={r.key} type="button" onClick={() => applyRole(r.key)} disabled={disabled}
                title={disabled ? "You can't change your own role away from Admin" : undefined}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${role === r.key
                  ? `${ROLE_COLOR[r.key].bg} ring-1 ring-white/20`
                  : 'bg-white/5 border-white/7 text-white/40 hover:text-white/60'} ${disabled ? 'opacity-30 cursor-not-allowed hover:!text-white/40' : ''}`}>
                {r.label}
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-white/25 mt-1.5">{ROLES.find(r => r.key === role)?.desc}</p>
        {isSelf && <p className="text-[11px] text-amber-400/70 mt-1">You can't change your own role or remove your own User Management access.</p>}
      </div>

      <div>
        <label className={LABEL}>Permissions</label>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          {PERMISSIONS.map(p => {
            const locked = isSelf && p.key === 'users.manage'
            return (
              <label key={p.key} className={`flex items-center gap-2 py-1 group ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`} onClick={() => togglePerm(p.key)}>
                <div className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all ${perms.includes(p.key) ? 'bg-violet-500 border-violet-500' : 'bg-transparent border-white/15 group-hover:border-white/30'} ${locked ? 'opacity-50' : ''}`}>
                  {perms.includes(p.key) && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className={`text-[12px] ${locked ? 'text-white/30' : 'text-white/60'}`}>{p.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      {error && <div className="text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</div>}

      <div className="flex items-center gap-2">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-50">
          <Check size={13} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] text-white/40 hover:text-white hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function Users() {
  const navigate    = useNavigate()
  const authUser    = useAuthStore(s => s.user)
  const can         = useAuthStore(s => s.can)
  const showToast   = useUIStore(s => s.showToast)

  const [users,     setUsers]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [editingId, setEditingId] = useState(null)

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

  async function handleUpdate(id, body) {
    const updated = await request('PATCH', `/users/${id}`, body)
    if (id === authUser?.sub) {
      useAuthStore.setState(s => ({ user: { ...s.user, displayName: updated.displayName, username: updated.username } }))
    }
    showToast('User updated')
    setEditingId(null)
    fetchUsers()
  }

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
                        onClick={() => setEditingId(editingId === u.id ? null : u.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${editingId === u.id ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/70'}`}
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

                {editingId === u.id && (
                  <EditForm
                    user={u}
                    isSelf={u.id === authUser?.sub}
                    onSave={body => handleUpdate(u.id, body)}
                    onCancel={() => setEditingId(null)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
