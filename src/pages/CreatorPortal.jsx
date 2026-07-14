import { useState, useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { creatorAuthHeaders } from '@/lib/creatorAuth'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import { ExternalLink, Clock, Zap, CheckCircle2, CircleDot, AlertCircle, ChevronDown, ChevronUp, Users, Lock } from 'lucide-react'

const PLATFORM_URL = {
  'TikTok':      u => `https://www.tiktok.com/@${u.replace(/^@/, '')}`,
  'YouTube':     u => `https://www.youtube.com/@${u.replace(/^@/, '')}`,
  'Instagram':   u => `https://www.instagram.com/${u.replace(/^@/, '')}`,
  'X / Twitter': u => `https://x.com/${u.replace(/^@/, '')}`,
  'LinkedIn':    u => `https://www.linkedin.com/in/${u.replace(/^@/, '')}`,
}
function profileUrl(platform, username) {
  if (!username) return null
  const builder = PLATFORM_URL[platform]
  return builder ? builder(username) : null
}

const PRIORITY_STYLE = {
  Urgent: { bar: 'from-rose-500 to-rose-400',   badge: 'text-rose-300 bg-rose-500/10 border-rose-500/20',         dot: 'bg-rose-400'    },
  High:   { bar: 'from-amber-500 to-amber-400',  badge: 'text-amber-300 bg-amber-500/10 border-amber-500/20',       dot: 'bg-amber-400'   },
  Medium: { bar: 'from-violet-600 to-violet-400', badge: 'text-violet-300 bg-violet-500/10 border-violet-500/20',   dot: 'bg-violet-400'  },
  Low:    { bar: 'from-emerald-600 to-emerald-400', badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
}

const STATUS_STYLE = {
  'Not Started':  'text-white/40 bg-white/5 border-white/10',
  'In Progress':  'text-blue-300 bg-blue-500/10 border-blue-500/20',
  'Under Review': 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  'Completed':    'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  'Overdue':      'text-rose-300 bg-rose-500/10 border-rose-500/20',
}

function formatFollowers(n) {
  if (!n) return null
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function camel(row) {
  if (!row) return row
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    const key = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    out[key] = v
  }
  return out
}

function FollowerBadge({ min, max }) {
  if (!min && !max) return null
  const parts = []
  if (min > 0) parts.push(`min ${formatFollowers(min)}`)
  if (max > 0) parts.push(`max ${formatFollowers(max)}`)
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-violet-300/70 bg-violet-500/8 border border-violet-500/15 px-2 py-0.5 rounded-full">
      <Users size={9} />
      {parts.join(' · ')}
    </span>
  )
}

function MarketplaceCard({ task, onAccept, accepting }) {
  const p = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.Medium
  const isAccepting = accepting === task.id

  return (
    <div className="group relative bg-[#1A1A24] border border-white/8 rounded-[16px] overflow-hidden flex flex-col hover:border-violet-500/30 hover:shadow-[0_0_24px_rgba(109,40,217,.08)] transition-all duration-200">
      <div className={`h-[3px] w-full bg-gradient-to-r ${p.bar}`} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="font-syne text-[15px] font-bold text-white leading-snug mb-1">{task.task}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/30 font-medium">
              {task.campaignColor && (
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.campaignColor }} />
              )}
              {task.project}
            </div>
          </div>
        </div>

        {task.description && (
          <p className="text-[12px] text-white/40 leading-relaxed line-clamp-2 mb-3">{task.description}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${p.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 text-[10px] text-white/30 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
              <Clock size={9} />
              {task.dueDate}
            </span>
          )}
          <FollowerBadge min={task.followerMin} max={task.followerMax} />
        </div>

        {task.notes && (
          <p className="text-[11px] text-white/25 italic border-l-2 border-white/10 pl-2 mb-3 line-clamp-2">{task.notes}</p>
        )}

        <div className="mt-auto">
          <button
            onClick={() => onAccept(task.id)}
            disabled={isAccepting}
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 text-white font-syne font-bold text-[13px] transition-all duration-150 shadow-[0_0_16px_rgba(109,40,217,.3)] hover:shadow-[0_0_24px_rgba(109,40,217,.5)] flex items-center justify-center gap-2"
          >
            {isAccepting ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <Zap size={13} />
                Accept Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function MyTaskRow({ task, onSubmitProof }) {
  const [expanded, setExpanded] = useState(false)
  const [proof, setProof] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const showToast = useUIStore(s => s.showToast)

  const isCompleted  = task.status === 'Completed'
  const isInProgress = task.status === 'In Progress'
  const isUnderReview = task.status === 'Under Review'

  async function handleSubmit() {
    if (!proof.trim()) { showToast('Please describe what you completed', 'error'); return }
    setSubmitting(true)
    try {
      await onSubmitProof(task.id, proof.trim())
      setExpanded(false)
      setProof('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`rounded-[12px] border transition-colors ${isCompleted ? 'border-white/5 bg-white/2' : isUnderReview ? 'border-amber-500/15 bg-amber-500/4' : 'border-blue-500/15 bg-blue-500/5'}`}>
      <div className="flex items-start gap-3 p-3.5">
        <div className={`mt-0.5 flex-shrink-0 ${isCompleted ? 'text-emerald-400' : isUnderReview ? 'text-amber-400' : 'text-blue-400'}`}>
          {isCompleted ? <CheckCircle2 size={15} /> : isUnderReview ? <AlertCircle size={15} /> : <CircleDot size={15} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-white truncate">{task.task}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/30 mt-0.5">
            {task.campaignColor && (
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: task.campaignColor }} />
            )}
            {task.project}
          </div>
          {isCompleted && task.review && (
            <div className="mt-1.5 text-[11px] text-white/30 italic">"{task.review}"</div>
          )}
          {isUnderReview && (
            <div className="mt-1.5 text-[10px] text-amber-400/60">Proof submitted — awaiting review</div>
          )}
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_STYLE[task.status] ?? STATUS_STYLE['Not Started']}`}>
            {task.status}
          </span>
          {isInProgress && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-[10px] text-white/40 hover:text-white/70 flex items-center gap-0.5 transition-colors mt-0.5"
            >
              Submit proof {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}
        </div>
      </div>

      {isInProgress && expanded && (
        <div className="px-3.5 pb-3.5 pt-0">
          <div className="border-t border-white/5 pt-3">
            <p className="text-[11px] text-white/30 mb-2">Describe what you completed or paste a link as proof:</p>
            <textarea
              value={proof}
              onChange={e => setProof(e.target.value)}
              rows={3}
              placeholder="e.g. Posted TikTok reel at https://tiktok.com/... — 12k views in 24h"
              className="w-full bg-[#111116] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 resize-none transition-all"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button onClick={() => { setExpanded(false); setProof('') }} className="text-[12px] text-white/30 hover:text-white/60 transition-colors px-3 py-1.5">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !proof.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 text-amber-300 text-[12px] font-semibold transition-all disabled:opacity-40"
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const CP_INPUT = 'w-full bg-[#111116] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const CP_LABEL = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

function ChangePasswordSection() {
  const showToast = useUIStore(s => s.showToast)
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)

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
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? await res.text())
      showToast('Password changed successfully')
      setForm({ current: '', next: '', confirm: '' })
      setOpen(false)
    } catch (e) {
      showToast(e.message ?? 'Failed to change password', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-8 bg-[#1A1A24] border border-white/7 rounded-[16px] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Lock size={13} className="text-white/30" />
          <span className="text-[13px] font-semibold text-white/60">Change Password</span>
        </div>
        <ChevronDown size={14} className={`text-white/25 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3 max-w-sm border-t border-white/7 pt-4">
          <div>
            <label className={CP_LABEL}>Current Password</label>
            <input type="password" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} placeholder="Enter current password" className={CP_INPUT} />
          </div>
          <div>
            <label className={CP_LABEL}>New Password</label>
            <input type="password" value={form.next} onChange={e => setForm(f => ({ ...f, next: e.target.value }))} placeholder="Min 8 characters" className={CP_INPUT} />
          </div>
          <div>
            <label className={CP_LABEL}>Confirm New Password</label>
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat new password" className={CP_INPUT} />
          </div>
          <div className="pt-1 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !form.current || !form.next || !form.confirm}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Change Password'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function CreatorPortal({ session }) {
  const showToast = useUIStore(s => s.showToast)

  const [creator,   setCreator]   = useState(null)
  const [myTasks,   setMyTasks]   = useState([])
  const [openTasks, setOpenTasks] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [accepting, setAccepting] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const headers = creatorAuthHeaders()
        const [meRes, tasksRes] = await Promise.all([
          fetch('/api/creator-portal/me',    { headers }),
          fetch('/api/creator-portal/tasks', { headers }),
        ])
        if (!meRes.ok)    throw new Error(await meRes.text())
        if (!tasksRes.ok) throw new Error(await tasksRes.text())
        const meData    = await meRes.json()
        const tasksData = await tasksRes.json()
        setCreator(meData.creator ? camel(meData.creator) : null)
        setMyTasks((tasksData.myTasks ?? []).map(camel))
        setOpenTasks((tasksData.openTasks ?? []).map(camel))
      } catch (e) {
        showToast('Failed to load portal: ' + e.message, 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  async function acceptTask(taskId) {
    setAccepting(taskId)
    try {
      const res = await fetch(`/api/creator-portal/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...creatorAuthHeaders() },
        body: JSON.stringify({ status: 'In Progress' }),
      })
      if (!res.ok) throw new Error(await res.text())
      const updated = camel(await res.json())
      setOpenTasks(prev => prev.filter(t => t.id !== taskId))
      setMyTasks(prev => [updated, ...prev])
      showToast('Task accepted — good luck!')
    } catch {
      showToast('Failed to accept task', 'error')
    } finally {
      setAccepting(null)
    }
  }

  async function submitProof(taskId, proof) {
    try {
      const res = await fetch(`/api/creator-portal/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...creatorAuthHeaders() },
        body: JSON.stringify({ status: 'Under Review', proof }),
      })
      if (!res.ok) throw new Error(await res.text())
      const updated = camel(await res.json())
      setMyTasks(prev => prev.map(t => t.id === taskId ? updated : t))
      showToast('Proof submitted — awaiting review!')
    } catch {
      showToast('Failed to submit proof', 'error')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white/30 text-[13px]">Loading...</div>
  }

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/30">
        <p className="text-[14px]">No creator profile linked to your account.</p>
        <p className="text-[12px] mt-1 text-white/20">Contact your manager to set this up.</p>
      </div>
    )
  }

  // Group open tasks by campaign
  const campaignGroups = openTasks.reduce((acc, t) => {
    const key = t.project || 'General'
    if (!acc[key]) acc[key] = { color: t.campaignColor, tasks: [] }
    acc[key].tasks.push(t)
    return acc
  }, {})

  const completedCount = myTasks.filter(t => t.status === 'Completed').length
  const activeCount    = myTasks.filter(t => t.status !== 'Completed').length

  return (
    <div className="animate-[fadeUp_.3s_ease]">

      {/* Profile strip */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-[#1A1A24] border border-white/7 rounded-[16px]">
        <Avatar initials={creator.initials} color={creator.avatarColor} size="lg" className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-syne text-[18px] font-extrabold text-white">{creator.name}</span>
            <Badge variant={creator.status === 'Active' ? 'green' : creator.status === 'Pending to sign' ? 'amber' : 'red'}>
              {creator.status}
            </Badge>
          </div>
          {creator.platformUsername && profileUrl(creator.platform, creator.platformUsername) && (
            <a
              href={profileUrl(creator.platform, creator.platformUsername)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] text-violet-400/70 hover:text-violet-300 transition-colors mt-0.5"
            >
              {creator.platformUsername.startsWith('@') ? creator.platformUsername : `@${creator.platformUsername}`}
              <ExternalLink size={10} />
            </a>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex flex-col items-center gap-0.5 px-4 py-3 bg-white/3 border border-white/7 rounded-xl">
            <span className="font-mono text-[9px] text-white/25 uppercase tracking-wider">Active</span>
            <span className="font-syne text-[20px] font-extrabold text-white">{activeCount}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 px-4 py-3 bg-white/3 border border-white/7 rounded-xl">
            <span className="font-mono text-[9px] text-white/25 uppercase tracking-wider">Done</span>
            <span className="font-syne text-[20px] font-extrabold text-emerald-300">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* My Tasks — above available tasks */}
      {myTasks.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-syne font-bold text-[16px] text-white">My Tasks</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/8">
              {myTasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {myTasks.map(t => (
              <MyTaskRow key={t.id} task={t} onSubmitProof={submitProof} />
            ))}
          </div>
        </div>
      )}

      {/* Available Tasks — grouped by campaign */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-syne font-bold text-[16px] text-white">Available Tasks</span>
          {openTasks.length > 0 && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
              {openTasks.length} open
            </span>
          )}
        </div>

        {openTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 rounded-[14px] bg-[#1A1A24] border border-white/7 text-white/20">
            <Zap size={24} className="mb-2 opacity-30" />
            <span className="text-[13px]">No tasks available right now</span>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(campaignGroups).map(([campaign, { color, tasks }]) => (
              <div key={campaign}>
                <div className="flex items-center gap-2 mb-3">
                  {color && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />}
                  <span className="text-[13px] font-semibold text-white/60">{campaign}</span>
                  <span className="text-[10px] text-white/25 font-mono">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tasks.map(t => (
                    <MarketplaceCard key={t.id} task={t} onAccept={acceptTask} accepting={accepting} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ChangePasswordSection />
    </div>
  )
}
