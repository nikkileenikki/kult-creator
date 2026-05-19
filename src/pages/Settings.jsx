import { useState, useEffect } from 'react'
import { useCreatorStore } from '@/store/creatorStore'
import { useTaskStore } from '@/store/taskStore'
import { useRecruitStore } from '@/store/recruitStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { request, USE_MOCK } from '@/lib/api'
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS, ROLE_COLOR } from '@/lib/permissions'
import { RotateCcw, AlertTriangle, Plus, Pencil, Trash2, Check, X, Eye, EyeOff } from 'lucide-react'

const INPUT = 'w-full bg-[#16161C] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/15 transition-all'
const LABEL = 'block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1'

// ─── User Form ────────────────────────────────────────────────────────────────
function UserForm({ initial = {}, onSave, onCancel, isSelf }) {
  const [displayName, setDisplayName] = useState(initial.displayName ?? '')
  const [username,    setUsername]    = useState(initial.username    ?? '')
  const [password,    setPassword]    = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [role,        setRole]        = useState(initial.role        ?? 'viewer')
  const [perms,       setPerms]       = useState(initial.permissions ?? ROLE_PERMISSIONS['viewer'])
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const isEdit = !!initial.id

  function applyRole(r) {
    setRole(r)
    setPerms(ROLE_PERMISSIONS[r] ?? [])
  }

  function togglePerm(key) {
    setPerms(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key])
  }

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      const body = { displayName, role, permissions: perms }
      if (!isEdit) { body.username = username; body.password = password }
      if (password && isEdit) body.password = password
      await onSave(body)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const permGroups = PERMISSIONS.reduce((acc, p) => {
    acc[p.group] = acc[p.group] ?? []
    acc[p.group].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {!isEdit && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. sarah.k" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Display Name</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Sarah K." className={INPUT} />
          </div>
        </div>
      )}
      {isEdit && (
        <div>
          <label className={LABEL}>Display Name</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} className={INPUT} />
        </div>
      )}

      <div>
        <label className={LABEL}>{isEdit ? 'New Password' : 'Password'} {isEdit && <span className="normal-case font-normal text-white/20">(leave blank to keep)</span>}</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={isEdit ? '••••••••' : 'Set a password'}
            className={INPUT + ' pr-9'}
          />
          <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
            {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
      </div>

      <div>
        <label className={LABEL}>Role</label>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map(r => (
            <button
              key={r.key}
              type="button"
              onClick={() => applyRole(r.key)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${role === r.key
                ? `${ROLE_COLOR[r.key].bg} ring-1 ring-white/20`
                : 'bg-white/5 border-white/7 text-white/40 hover:text-white/60'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-white/25 mt-1.5">{ROLES.find(r => r.key === role)?.desc}</p>
      </div>

      <div>
        <label className={LABEL}>Permissions</label>
        <div className="space-y-3">
          {Object.entries(permGroups).map(([group, items]) => (
            <div key={group}>
              <div className="text-[9px] font-medium text-white/20 uppercase tracking-wider mb-1.5">{group}</div>
              <div className="space-y-1">
                {items.map(p => (
                  <label key={p.key} className="flex items-start gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => togglePerm(p.key)}
                      className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 border flex items-center justify-center transition-all cursor-pointer ${
                        perms.includes(p.key)
                          ? 'bg-violet-500 border-violet-500'
                          : 'bg-transparent border-white/15 group-hover:border-white/30'
                      }`}
                    >
                      {perms.includes(p.key) && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>
                    <div onClick={() => togglePerm(p.key)}>
                      <div className="text-[12px] text-white/70">{p.label}</div>
                      <div className="text-[10px] text-white/25">{p.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</div>}

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving || (!isEdit && (!username || !password || !displayName))}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-50"
        >
          <Check size={13} /> {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] text-white/40 hover:text-white hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const authUser = useAuthStore(s => s.user)
  const showToast = useUIStore(s => s.showToast)
  const [users,     setUsers]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [adding,    setAdding]    = useState(false)

  async function fetchUsers() {
    setLoading(true)
    try { setUsers(await request('GET', '/users')) }
    catch (e) { showToast('Failed to load users: ' + e.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(body) {
    await request('POST', '/users', body)
    showToast(`User ${body.displayName} created`)
    setAdding(false)
    fetchUsers()
  }

  async function handleUpdate(id, body) {
    await request('PATCH', `/users/${id}`, body)
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
    <div className="space-y-4">
      {/* User list */}
      <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/7">
          <span className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em]">
            Users ({users.length})
          </span>
          {!adding && (
            <button
              onClick={() => { setAdding(true); setEditingId(null) }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-300 hover:bg-violet-600/25 text-[12px] font-semibold transition-all"
            >
              <Plus size={12} /> New User
            </button>
          )}
        </div>

        {loading ? (
          <div className="px-5 py-8 text-center text-[13px] text-white/20">Loading…</div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {users.map(u => (
              <div key={u.id}>
                {editingId === u.id ? (
                  <div className="px-5 py-4">
                    <div className="text-[12px] font-semibold text-white/50 mb-3">Editing {u.username}</div>
                    <UserForm
                      initial={u}
                      onSave={body => handleUpdate(u.id, body)}
                      onCancel={() => setEditingId(null)}
                      isSelf={u.id === authUser?.sub}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-5 py-3 hover:bg-white/[.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white">{u.displayName}</span>
                        <span className="font-mono text-[10px] text-white/25">@{u.username}</span>
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
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => { setEditingId(u.id); setAdding(false) }}
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
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {adding && (
          <div className="px-5 py-4 border-t border-white/7 bg-violet-500/[.03]">
            <div className="text-[12px] font-semibold text-white/50 mb-3">New User</div>
            <UserForm onSave={handleCreate} onCancel={() => setAdding(false)} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Settings() {
  const fetchCreators  = useCreatorStore(s => s.fetchCreators)
  const fetchTasks     = useTaskStore(s => s.fetchTasks)
  const fetchRecruits  = useRecruitStore(s => s.fetchRecruits)
  const fetchCampaigns = useCampaignStore(s => s.fetchCampaigns)
  const showToast      = useUIStore(s => s.showToast)
  const canManageUsers = useAuthStore(s => s.can)('users.manage')

  const [tab,        setTab]        = useState('data')
  const [confirming, setConfirming] = useState(false)
  const [loading,    setLoading]    = useState(false)

  async function handleReset() {
    if (!confirming) { setConfirming(true); return }
    setLoading(true)
    setConfirming(false)
    try {
      if (USE_MOCK) { showToast('Mock mode: no DB to reset', 'info'); return }
      await request('POST', '/reset')
      await Promise.all([fetchCreators(), fetchTasks(), fetchRecruits(), fetchCampaigns()])
      showToast('Database reset — demo data restored')
    } catch (e) {
      showToast('Reset failed: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-[fadeUp_.3s_ease] max-w-2xl">
      <div className="mb-6">
        <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-[12px] text-white/30 mt-1">App configuration and user management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[#16161C] border border-white/7 rounded-lg p-0.5 w-fit">
        <button
          onClick={() => setTab('data')}
          className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${tab === 'data' ? 'bg-[#1E1E28] text-white' : 'text-white/30 hover:text-white/60'}`}
        >
          Data
        </button>
        {canManageUsers && (
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-1.5 text-[12px] font-medium rounded-md transition-all ${tab === 'users' ? 'bg-[#1E1E28] text-white' : 'text-white/30 hover:text-white/60'}`}
          >
            Users
          </button>
        )}
      </div>

      {tab === 'data' && (
        <div className="space-y-4">
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/7">
              <span className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em]">Data Management</span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[14px] font-semibold text-white mb-1">Reset to Demo Data</div>
                  <div className="text-[12px] text-white/40 leading-relaxed">
                    Truncates all tables (creators, tasks, campaigns, recruits, activity) and reseeds with the original mock data. This cannot be undone.
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-50 ${
                    confirming
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {loading ? <RotateCcw size={14} className="animate-spin" /> : confirming ? <AlertTriangle size={14} /> : <RotateCcw size={14} />}
                  {loading ? 'Resetting…' : confirming ? 'Confirm reset?' : 'Reset Data'}
                </button>
              </div>
              {confirming && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[12px] text-rose-400/70">Click again to confirm — all data will be permanently deleted.</span>
                  <button onClick={() => setConfirming(false)} className="text-[11px] text-white/30 hover:text-white/60 transition-all ml-auto">Cancel</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-white/15 font-mono px-1">
            <span>CreatorOS v2.0</span>
            <span>·</span>
            <span>{USE_MOCK ? 'Mock mode' : 'Live mode'}</span>
          </div>
        </div>
      )}

      {tab === 'users' && canManageUsers && <UsersTab />}
    </div>
  )
}
