import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { request } from '@/lib/api'
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS, ROLE_COLOR } from '@/lib/permissions'
import { ArrowLeft, Check, Eye, EyeOff, Trash2 } from 'lucide-react'

const INPUT = 'w-full bg-[#16161C] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/15 transition-all'
const LABEL = 'block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1'

export default function EditUser() {
  const { id } = useParams()
  const navigate  = useNavigate()
  const authUser  = useAuthStore(s => s.user)
  const showToast = useUIStore(s => s.showToast)
  const isSelf    = id === authUser?.sub

  const [user,        setUser]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [username,    setUsername]    = useState('')
  const [password,    setPassword]    = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [role,        setRole]        = useState('viewer')
  const [perms,       setPerms]       = useState([])
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  useEffect(() => {
    request('GET', '/users')
      .then(users => {
        const u = users.find(u => u.id === id)
        if (!u) { showToast('User not found', 'error'); navigate('/users'); return }
        setUser(u)
        setDisplayName(u.displayName)
        setUsername(u.username)
        setRole(u.role)
        setPerms(u.permissions)
      })
      .catch(e => showToast('Failed to load user: ' + e.message, 'error'))
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

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
      const updated = await request('PATCH', `/users/${id}`, body)
      if (isSelf) {
        useAuthStore.setState(s => ({ user: { ...s.user, displayName: updated.displayName, username: updated.username } }))
      }
      showToast('User updated')
      navigate('/users')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete user "${user.displayName}"? This cannot be undone.`)) return
    try {
      await request('DELETE', `/users/${id}`)
      showToast(`${user.displayName} deleted`)
      navigate('/users')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const canSubmit = username.trim() && displayName.trim()

  if (loading) return <div className="flex items-center justify-center h-64 text-white/30 text-[13px]">Loading…</div>
  if (!user) return null

  return (
    <div className="animate-[fadeUp_.3s_ease] max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/users')}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Edit User</h1>
            <p className="text-[12px] text-white/30 mt-0.5">@{user.username}{isSelf && ' · You'}</p>
          </div>
        </div>
        {!isSelf && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/7 hover:border-rose-500/20 text-white/40 hover:text-rose-400 text-[12px] transition-all"
          >
            <Trash2 size={12} /> Delete
          </button>
        )}
      </div>

      <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-5 space-y-5">
        {/* Identity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[13px]">@</span>
              <input value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())} className={INPUT + ' pl-7'} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} className={INPUT} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className={LABEL}>New Password <span className="normal-case font-normal text-white/20">(leave blank to keep)</span></label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className={INPUT + ' pr-9'}
            />
            <button
              type="button"
              onClick={() => setShowPw(s => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60"
            >
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/7" />

        {/* Role */}
        <div>
          <label className={LABEL}>Role</label>
          <div className="flex gap-2 flex-wrap">
            {ROLES.map(r => {
              const disabled = isSelf && r.key !== 'admin'
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => applyRole(r.key)}
                  disabled={disabled}
                  title={disabled ? "You can't change your own role away from Admin" : undefined}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${role === r.key
                    ? `${ROLE_COLOR[r.key].bg} ring-1 ring-white/20`
                    : 'bg-white/5 border-white/7 text-white/40 hover:text-white/60'} ${disabled ? 'opacity-30 cursor-not-allowed hover:!text-white/40' : ''}`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-white/25 mt-1.5">{ROLES.find(r => r.key === role)?.desc}</p>
          {isSelf && <p className="text-[11px] text-amber-400/70 mt-1">You can't change your own role or remove your own User Management access.</p>}
        </div>

        {/* Permissions */}
        <div>
          <label className={LABEL}>Permissions</label>
          <div className="space-y-3">
            {Object.entries(permGroups).map(([group, items]) => (
              <div key={group}>
                <div className="text-[9px] font-medium text-white/20 uppercase tracking-wider mb-1.5">{group}</div>
                <div className="space-y-1">
                  {items.map(p => {
                    const locked = isSelf && p.key === 'users.manage'
                    return (
                      <label key={p.key} className={`flex items-start gap-2.5 group ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`} onClick={() => togglePerm(p.key)}>
                        <div className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 border flex items-center justify-center transition-all ${
                          perms.includes(p.key)
                            ? 'bg-violet-500 border-violet-500'
                            : 'bg-transparent border-white/15 group-hover:border-white/30'
                        } ${locked ? 'opacity-50' : ''}`}>
                          {perms.includes(p.key) && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <div>
                          <div className={`text-[12px] ${locked ? 'text-white/30' : 'text-white/70'}`}>{p.label}</div>
                          <div className="text-[10px] text-white/25">{p.desc}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || !canSubmit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(108,92,231,.3)]"
          >
            <Check size={13} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            onClick={() => navigate('/users')}
            className="px-4 py-2 rounded-lg text-[13px] text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
