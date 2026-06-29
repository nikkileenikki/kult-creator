import { useState, useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { getTier, getProgress, coinsToNextTier } from '@/lib/tierUtils'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import ProgressBar from '@/components/shared/ProgressBar'
import { ExternalLink, Clock, Zap, CheckCircle2, CircleDot, ShoppingBag, Filter } from 'lucide-react'

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
  Urgent: { dot: 'bg-rose-400',    badge: 'text-rose-300 bg-rose-500/10 border-rose-500/20',       label: 'Urgent' },
  High:   { dot: 'bg-amber-400',   badge: 'text-amber-300 bg-amber-500/10 border-amber-500/20',     label: 'High'   },
  Medium: { dot: 'bg-blue-400',    badge: 'text-blue-300 bg-blue-500/10 border-blue-500/20',        label: 'Medium' },
  Low:    { dot: 'bg-emerald-400', badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20', label: 'Low'  },
}

const STATUS_STYLE = {
  'Not Started': 'text-white/40 bg-white/5 border-white/10',
  'In Progress': 'text-blue-300 bg-blue-500/10 border-blue-500/20',
  'Completed':   'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  'Overdue':     'text-rose-300 bg-rose-500/10 border-rose-500/20',
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

function MarketplaceCard({ task, onAccept, accepting }) {
  const p = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.Medium
  const isAccepting = accepting === task.id

  return (
    <div className="group relative bg-[#1A1A24] border border-white/8 rounded-[16px] overflow-hidden flex flex-col hover:border-violet-500/30 hover:shadow-[0_0_24px_rgba(109,40,217,.08)] transition-all duration-200">
      {/* top accent bar */}
      <div className={`h-[3px] w-full ${task.priority === 'Urgent' ? 'bg-gradient-to-r from-rose-500 to-rose-400' : task.priority === 'High' ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-violet-600 to-violet-400'}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="font-syne text-[15px] font-bold text-white leading-snug mb-1">{task.task}</div>
            <div className="text-[11px] text-white/30 font-medium">{task.project}</div>
          </div>
          {/* coin reward */}
          {task.coins > 0 && (
            <div className="flex-shrink-0 flex flex-col items-center bg-amber-400/8 border border-amber-400/15 rounded-xl px-3 py-2 min-w-[64px]">
              <span className="text-[18px] leading-none">🪙</span>
              <span className="font-syne font-extrabold text-[15px] text-amber-300 mt-0.5">{task.coins.toLocaleString()}</span>
              <span className="text-[9px] text-amber-400/50 uppercase tracking-wider">coins</span>
            </div>
          )}
        </div>

        {/* description */}
        {task.description && (
          <p className="text-[12px] text-white/40 leading-relaxed line-clamp-2 mb-3">{task.description}</p>
        )}

        {/* meta row */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${p.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
            {p.label}
          </span>
          {task.dueDate && (
            <span className="inline-flex items-center gap-1 text-[10px] text-white/30 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
              <Clock size={9} />
              {task.dueDate}
            </span>
          )}
        </div>

        {/* accept button — always at bottom */}
        <div className="mt-auto">
          <button
            onClick={() => onAccept(task.id)}
            disabled={isAccepting}
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 text-white font-syne font-bold text-[13px] transition-all duration-150 shadow-[0_0_16px_rgba(109,40,217,.3)] hover:shadow-[0_0_24px_rgba(109,40,217,.5)] flex items-center justify-center gap-2"
          >
            {isAccepting ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Accepting…
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

function MyTaskRow({ task }) {
  const isCompleted = task.status === 'Completed'
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-[12px] border transition-colors ${isCompleted ? 'border-white/5 bg-white/2' : 'border-blue-500/15 bg-blue-500/5'}`}>
      <div className={`mt-0.5 flex-shrink-0 ${isCompleted ? 'text-emerald-400' : 'text-blue-400'}`}>
        {isCompleted ? <CheckCircle2 size={15} /> : <CircleDot size={15} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-white truncate">{task.task}</div>
        <div className="text-[11px] text-white/30 mt-0.5">{task.project}</div>
        {isCompleted && task.review && (
          <div className="mt-1.5 text-[11px] text-white/30 italic">"{task.review}"</div>
        )}
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_STYLE[task.status] ?? STATUS_STYLE['Not Started']}`}>
          {task.status}
        </span>
        {task.coins > 0 && (
          <span className="text-[10px] text-amber-300/60 font-mono">+{task.coins.toLocaleString()} 🪙</span>
        )}
      </div>
    </div>
  )
}

export default function CreatorPortal({ session }) {
  const showToast = useUIStore(s => s.showToast)

  const [creator,   setCreator]   = useState(null)
  const [tasks,     setTasks]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [filter,    setFilter]    = useState('All')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [meRes, tasksRes] = await Promise.all([
          fetch('/api/creator-portal/me'),
          fetch('/api/creator-portal/tasks'),
        ])
        const meData    = await meRes.json()
        const tasksData = await tasksRes.json()
        setCreator(meData.creator ? camel(meData.creator) : null)
        setTasks((tasksData ?? []).map(camel))
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Progress' }),
      })
      if (!res.ok) throw new Error(await res.text())
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'In Progress' } : t))
      showToast('Task accepted — good luck!')
    } catch {
      showToast('Failed to accept task', 'error')
    } finally {
      setAccepting(null)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-white/30 text-[13px]">Loading…</div>
  }

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/30">
        <p className="text-[14px]">No creator profile linked to your account.</p>
        <p className="text-[12px] mt-1 text-white/20">Contact your manager to set this up.</p>
      </div>
    )
  }

  const available  = tasks.filter(t => t.status === 'Not Started')
  const inProgress = tasks.filter(t => t.status === 'In Progress')
  const completed  = tasks.filter(t => t.status === 'Completed')
  const myTasks    = [...inProgress, ...completed]

  const PRIORITIES = ['All', 'Urgent', 'High', 'Medium', 'Low']
  const filtered = filter === 'All' ? available : available.filter(t => t.priority === filter)

  const tier     = getTier(creator.coins)
  const progress = getProgress(creator.coins)
  const toNext   = coinsToNextTier(creator.coins)
  const tierEmoji = { Platinum: '👑', Diamond: '💎', Gold: '🥇', Silver: '🥈', Bronze: '🥉' }

  return (
    <div className="animate-[fadeUp_.3s_ease]">

      {/* ── Profile strip ── */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-[#1A1A24] border border-white/7 rounded-[16px]">
        <Avatar initials={creator.initials} color={creator.avatarColor} size="lg" className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-syne text-[18px] font-extrabold text-white">{creator.name}</span>
            <Badge variant={tier.name.toLowerCase()}>{tierEmoji[tier.name]} {tier.name}</Badge>
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
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 max-w-[200px]">
              <ProgressBar value={progress} tierColor={tier.name.toLowerCase()} height="h-[4px]" />
            </div>
            <span className="font-mono text-[11px] text-white/30">
              {creator.coins.toLocaleString()} 🪙 {toNext > 0 && `· ${toNext.toLocaleString()} to next`}
            </span>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-center gap-1 px-4 py-3 bg-white/3 border border-white/7 rounded-xl flex-shrink-0">
          <span className="font-mono text-[10px] text-white/25 uppercase tracking-wider">Completed</span>
          <span className="font-syne text-[22px] font-extrabold text-white">{completed.length}</span>
          <span className="font-mono text-[9px] text-white/25">tasks</span>
        </div>
      </div>

      {/* ── Marketplace ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ShoppingBag size={15} className="text-violet-400" />
            <span className="font-syne font-bold text-[16px] text-white">Task Marketplace</span>
            {available.length > 0 && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
                {available.length} available
              </span>
            )}
          </div>

          {/* priority filter */}
          {available.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Filter size={11} className="text-white/25" />
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all ${
                    filter === p
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                      : 'text-white/30 hover:text-white/60 border border-transparent hover:border-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-36 rounded-[14px] bg-[#1A1A24] border border-white/7 text-white/20">
            <ShoppingBag size={24} className="mb-2 opacity-30" />
            <span className="text-[13px]">{available.length === 0 ? 'No tasks available right now' : 'No tasks match this filter'}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(t => (
              <MarketplaceCard key={t.id} task={t} onAccept={acceptTask} accepting={accepting} />
            ))}
          </div>
        )}
      </div>

      {/* ── My Tasks ── */}
      {myTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-syne font-bold text-[15px] text-white">My Tasks</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/8">
              {myTasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {myTasks.map(t => (
              <MyTaskRow key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
