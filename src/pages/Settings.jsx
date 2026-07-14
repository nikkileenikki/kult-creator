import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'
import { request } from '@/lib/api'
import { Lock } from 'lucide-react'

const INPUT = 'w-full bg-[#111116] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const LABEL = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

export default function Settings() {
  const showToast = useUIStore(s => s.showToast)
  const [form,   setForm]   = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.next !== form.confirm) { showToast('New passwords do not match', 'error'); return }
    if (form.next.length < 8) { showToast('Password must be at least 8 characters', 'error'); return }
    setSaving(true)
    try {
      await request('POST', '/users/me/password', { currentPassword: form.current, newPassword: form.next })
      showToast('Password changed successfully')
      setForm({ current: '', next: '', confirm: '' })
    } catch (e) {
      showToast(e.message ?? 'Failed to change password', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-[fadeUp_.3s_ease] max-w-2xl">
      <div className="mb-6">
        <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-[12px] text-white/30 mt-1">App configuration and account settings</p>
      </div>

      <div className="space-y-4">
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
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
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-40"
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
