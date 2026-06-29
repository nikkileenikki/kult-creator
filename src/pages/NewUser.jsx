import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useCreatorStore } from '@/store/creatorStore'
import { request } from '@/lib/api'
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS, ROLE_COLOR } from '@/lib/permissions'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'

const INPUT = 'w-full bg-[#16161C] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/15 transition-all'
const LABEL = 'block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1'

export default function NewUser() {
  const navigate   = useNavigate()
  const showToast  = useUIStore(s => s.showToast)
  const creators   = useCreatorStore(s => s.creators)

  const [displayName, setDisplayName] = useState('')
  const [username,    setUsername]    = useState('')
  const [password,    setPassword]    = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [role,        setRole]        = useState('viewer')
  const [perms,       setPerms]       = useState(ROLE_PERMISSIONS['viewer'] ?? [])
  const [creatorId,   setCreatorId]   = useState('')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  function applyRole(r) { setRole(r); setPerms(ROLE_PERMISSIONS[r] ?? []); if (r !== 'creator') setCreatorId('') }
  function togglePerm(key) { setPerms(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]) }

  const permGroups = PERMISSIONS.reduce((acc, p) => {
    acc[p.group] = acc[p.group] ?? []
    acc[p.group].push(p)
    return acc
  }, {})

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      await request('POST', '/users', { username, displayName, password, role, permissions: perms, creatorId: creatorId || null })
      showToast(`User ${displayName} created`)
      navigate('/users')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const canSubmit = username.trim() && displayName.trim() && password

  return (
    <div className="animate-[fadeUp_.3s_ease] max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/users')}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">New User</h1>
          <p className="text-[12px] text-white/30 mt-0.5">Create a new account with role and permissions</p>
        </div>
      </div>

      <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-5 space-y-5">
        {/* Identity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. sarah.k"
              autoComplete="off"
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Display Name</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Sarah K."
              className={INPUT}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className={LABEL}>Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Set a password"
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

        {/* Creator link (only for creator role) */}
        {role === 'creator' && (
          <div>
            <label className={LABEL}>Linked Creator Profile</label>
            <select
              value={creatorId}
              onChange={e => setCreatorId(e.target.value)}
              className={INPUT + ' cursor-pointer'}
            >
              <option value="">— Select a creator —</option>
              {creators.filter(c => c.status !== 'Rejected').map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>
              ))}
            </select>
            <p className="text-[11px] text-white/25 mt-1.5">This creator's profile will be shown in their portal.</p>
          </div>
        )}

        {/* Permissions */}
        <div>
          <label className={LABEL}>Permissions</label>
          <div className="space-y-3">
            {Object.entries(permGroups).map(([group, items]) => (
              <div key={group}>
                <div className="text-[9px] font-medium text-white/20 uppercase tracking-wider mb-1.5">{group}</div>
                <div className="space-y-1">
                  {items.map(p => (
                    <label key={p.key} className="flex items-start gap-2.5 cursor-pointer group" onClick={() => togglePerm(p.key)}>
                      <div className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 border flex items-center justify-center transition-all ${
                        perms.includes(p.key)
                          ? 'bg-violet-500 border-violet-500'
                          : 'bg-transparent border-white/15 group-hover:border-white/30'
                      }`}>
                        {perms.includes(p.key) && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <div>
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
            <Check size={13} /> {saving ? 'Creating…' : 'Create User'}
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
