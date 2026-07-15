import { useState, useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { creatorAuthHeaders } from '@/lib/creatorAuth'
import Avatar from '@/components/shared/Avatar'
import { Lock, User } from 'lucide-react'

const INPUT = 'w-full bg-[#1A1A24] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const LABEL = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

function camel(row) {
  if (!row) return row
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v
  }
  return out
}

function formatFollowers(n) {
  if (!n) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-0.5">{label}</div>
      <div className="text-[13px] text-white/80">{value || '—'}</div>
    </div>
  )
}

export default function CreatorAccount({ session }) {
  const showToast = useUIStore(s => s.showToast)
  const [form,    setForm]    = useState({ current: '', next: '', confirm: '' })
  const [saving,  setSaving]  = useState(false)
  const [creator, setCreator] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/creator-portal/me', { headers: creatorAuthHeaders() })
        if (!res.ok) return
        const data = await res.json()
        if (data.creator) setCreator(camel(data.creator))
      } catch {}
    }
    load()
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.next !== form.confirm) { showToast('New passwords do not match', 'error'); return }
    if (form.next.length < 8) { showToast('Password must be at least 8 characters', 'error'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/creator-portal/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...creatorAuthHeaders() },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to change password')
      }
      showToast('Password changed successfully')
      setForm({ current: '', next: '', confirm: '' })
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-[fadeUp_.3s_ease] max-w-2xl">
      <div className="mb-6">
        <h1 className="font-syne text-[20px] font-extrabold text-white tracking-tight">Account Settings</h1>
        <p className="text-[12px] text-white/30 mt-1">Your profile and login credentials</p>
      </div>

      <div className="space-y-4">

        {/* Profile Info */}
        {creator && (
          <div className="bg-[#1A1A24] border border-white/7 rounded-[16px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/7 flex items-center gap-2">
              <User size={12} className="text-white/25" />
              <span className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em]">My Profile</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <Avatar initials={creator.initials} color={creator.avatarColor} size="md" className="flex-shrink-0" />
                <div>
                  <div className="font-syne text-[16px] font-bold text-white">{creator.name}</div>
                  <div className="text-[12px] text-white/30 mt-0.5">{creator.platform}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <Field label="Niche"        value={creator.niche} />
                <Field label="Followers"    value={formatFollowers(creator.followers)} />
                <Field label="Email"        value={creator.email} />
                <Field label="Contact"      value={creator.contactNumber || creator.contact} />
                <Field label="Date of Birth" value={creator.dateOfBirth} />
                <Field label="Platform Username" value={creator.platformUsername} />
              </div>
            </div>
          </div>
        )}

        {/* Change Password */}
        <div className="bg-[#1A1A24] border border-white/7 rounded-[16px] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/7 flex items-center gap-2">
            <Lock size={12} className="text-white/25" />
            <span className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em]">Change Password</span>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-3 max-w-sm">
            <div>
              <label className={LABEL}>Current Password</label>
              <input type="password" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} placeholder="Enter current password" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>New Password</label>
              <input type="password" value={form.next} onChange={e => setForm(f => ({ ...f, next: e.target.value }))} placeholder="Min 8 characters" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Confirm New Password</label>
              <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat new password" className={INPUT} />
            </div>
            <div className="pt-1">
              <button
                type="submit"
                disabled={saving || !form.current || !form.next || !form.confirm}
                className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
