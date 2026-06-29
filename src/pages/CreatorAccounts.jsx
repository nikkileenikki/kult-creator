import { useState, useEffect } from 'react'
import { useCreatorStore } from '@/store/creatorStore'
import { useUIStore } from '@/store/uiStore'
import { request } from '@/lib/api'
import { Plus, Trash2, Check, Eye, EyeOff, Pencil } from 'lucide-react'

const INPUT = 'w-full bg-[#16161C] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/15 transition-all'
const LABEL = 'block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1'

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function EditForm({ account, creators, linkedCreatorIds, onSave, onCancel }) {
  const [name,      setName]      = useState(account.name)
  const [email,     setEmail]     = useState(account.email)
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [creatorId, setCreatorId] = useState(account.creatorId ?? '')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      const body = { name, email, creatorId: creatorId || null }
      if (password) body.password = password
      await onSave(body)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // Allow current account's creator in the dropdown even if already linked
  const availableCreators = creators.filter(c =>
    c.status !== 'Rejected' &&
    (!linkedCreatorIds.has(c.id) || c.id === account.creatorId)
  )

  return (
    <div className="px-5 py-4 bg-violet-500/[.025] border-t border-white/7 space-y-4">
      <div className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">Editing {account.name}</div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>New Password <span className="normal-case font-normal text-white/20">(leave blank to keep)</span></label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className={INPUT + ' pr-9'}
            />
            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>
        <div>
          <label className={LABEL}>Linked Creator Profile</label>
          <select value={creatorId} onChange={e => setCreatorId(e.target.value)} className={INPUT + ' cursor-pointer'}>
            <option value="">— None —</option>
            {availableCreators.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</div>}

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !name || !email}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-50"
        >
          <Check size={13} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] text-white/40 hover:text-white hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function CreatorAccounts() {
  const creators  = useCreatorStore(s => s.creators)
  const showToast = useUIStore(s => s.showToast)

  const [accounts,   setAccounts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [editingId,  setEditingId]  = useState(null)

  const [email,     setEmail]     = useState('')
  const [name,      setName]      = useState('')
  const [password,  setPassword]  = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [creatorId, setCreatorId] = useState('')

  async function fetchAccounts() {
    setLoading(true)
    try { setAccounts(await request('GET', '/creator-accounts')) }
    catch (e) { showToast('Failed to load: ' + e.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAccounts() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await request('POST', '/creator-accounts', { email, name, password, creatorId: creatorId || null })
      showToast(`Account for ${name} created`)
      setEmail(''); setName(''); setPassword(''); setCreatorId(''); setShowForm(false)
      fetchAccounts()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id, body) {
    await request('PATCH', `/creator-accounts/${id}`, body)
    showToast('Account updated')
    setEditingId(null)
    fetchAccounts()
  }

  async function handleDelete(account) {
    if (!confirm(`Delete account for ${account.name}? They will no longer be able to log in.`)) return
    try {
      await request('DELETE', `/creator-accounts/${account.id}`)
      showToast(`${account.name} deleted`)
      fetchAccounts()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const linkedCreatorIds = new Set(accounts.map(a => a.creatorId).filter(Boolean))

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Creator Accounts</h1>
          <p className="text-[12px] text-white/30 mt-1">{accounts.length} portal account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 px-4 py-[7px] rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(108,92,231,.3)]"
        >
          <Plus size={14} /> New Account
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-5 mb-4">
          <div className="text-[11px] font-semibold text-white/30 uppercase tracking-wider mb-4">New Creator Account</div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Creator name" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="creator@email.com" className={INPUT} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Set a password"
                    className={INPUT + ' pr-9'}
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
                    {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={LABEL}>Linked Creator Profile</label>
                <select value={creatorId} onChange={e => setCreatorId(e.target.value)} className={INPUT + ' cursor-pointer'}>
                  <option value="">— Select creator —</option>
                  {creators.filter(c => c.status !== 'Rejected' && !linkedCreatorIds.has(c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div className="text-[12px] text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</div>}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving || !email || !name || !password}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-50"
              >
                <Check size={13} /> {saving ? 'Creating…' : 'Create Account'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-[13px] text-white/40 hover:text-white hover:bg-white/5 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account list */}
      <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
        {loading ? (
          <div className="px-5 py-10 text-center text-[13px] text-white/20">Loading…</div>
        ) : accounts.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-white/20">No creator accounts yet</div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {accounts.map(a => {
              const linkedCreator = creators.find(c => c.id === a.creatorId)
              return (
                <div key={a.id}>
                  <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[.02] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                      {getInitials(a.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white">{a.name}</span>
                        <span className="font-mono text-[11px] text-white/25">{a.email}</span>
                      </div>
                      <div className="text-[11px] text-white/30 mt-0.5">
                        {linkedCreator
                          ? <span className="text-emerald-400/60">↳ {linkedCreator.name} · {linkedCreator.platform}</span>
                          : <span className="text-amber-400/50 italic">No creator linked</span>
                        }
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setEditingId(editingId === a.id ? null : a.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${editingId === a.id ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/70'}`}
                        title="Edit account"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => handleDelete(a)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 flex items-center justify-center text-white/30 hover:text-rose-400 transition-all"
                        title="Delete account"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {editingId === a.id && (
                    <EditForm
                      account={a}
                      creators={creators}
                      linkedCreatorIds={linkedCreatorIds}
                      onSave={body => handleUpdate(a.id, body)}
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-white/20 mt-4 font-mono">
        Creators log in at <span className="text-white/40">/login</span> with their email and password.
      </p>
    </div>
  )
}
