import { useState, useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { getTier, getProgress, coinsToNextTier } from '@/lib/tierUtils'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import ProgressBar from '@/components/shared/ProgressBar'
import { ExternalLink, Clock } from 'lucide-react'

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

const STATUS_COLOR = {
  'Not Started': 'text-white/40 bg-white/5 border-white/10',
  'In Progress': 'text-blue-300 bg-blue-500/10 border-blue-500/20',
  'Completed':   'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  'Overdue':     'text-rose-300 bg-rose-500/10 border-rose-500/20',
}

const PRIORITY_DOT = {
  Urgent: 'bg-rose-400',
  High:   'bg-amber-400',
  Medium: 'bg-blue-400',
  Low:    'bg-emerald-400',
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

function TaskCard({ task, onAccept, accepting }) {
  const isAvailable = task.status === 'Not Started'
  const isCompleted = task.status === 'Completed'

  return (
    <div className={`bg-[#1E1E28] border rounded-[12px] p-4 transition-all ${isAvailable ? 'border-violet-500/20 hover:border-violet-500/35' : 'border-white/7'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-syne text-[14px] font-bold text-white leading-snug">{task.task}</div>
          <div className="text-[11px] text-white/30 mt-0.5">{task.project}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_COLOR[task.status] ?? STATUS_COLOR['Not Started']}`}>
            {task.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-white/30 mb-3">
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority] ?? 'bg-white/20'}`} />
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <Clock size={10} />
            Due {task.dueDate}
          </span>
        )}
        {task.coins > 0 && (
          <span className="flex items-center gap-1 text-amber-300/70 ml-auto">
            +{task.coins.toLocaleString()} 🪙
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-[12px] text-white/40 mb-3 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      {isAvailable && (
        <button
          onClick={() => onAccept(task.id)}
          disabled={accepting === task.id}
          className="w-full py-2 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-300 hover:bg-violet-600/25 text-[13px] font-semibold transition-all disabled:opacity-50"
        >
          {accepting === task.id ? 'Accepting…' : 'Accept Task'}
        </button>
      )}

      {isCompleted && task.review && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-white/3 border border-white/7 text-[11px] text-white/40 italic">
          "{task.review}"
        </div>
      )}
    </div>
  )
}

export default function CreatorPortal({ session }) {
  const showToast = useUIStore(s => s.showToast)

  const [creator,   setCreator]   = useState(null)
  const [tasks,     setTasks]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [accepting, setAccepting] = useState(null)

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

  const tier       = getTier(creator.coins)
  const progress   = getProgress(creator.coins)
  const toNext     = coinsToNextTier(creator.coins)
  const tierEmoji  = { Platinum: '👑', Diamond: '💎', Gold: '🥇', Silver: '🥈', Bronze: '🥉' }

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="mb-5">
        <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">My Profile</h1>
        <p className="text-[12px] text-white/30 mt-1">{available.length} task{available.length !== 1 ? 's' : ''} available · {completed.length} completed</p>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4 items-start">

        {/* Profile card */}
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
          <div className="px-5 pt-6 pb-5 text-center border-b border-white/7 bg-gradient-to-b from-violet-600/8 to-transparent">
            <Avatar initials={creator.initials} color={creator.avatarColor} size="xl" className="mx-auto" />
            <div className="font-syne text-[18px] font-extrabold text-white mt-3 tracking-tight">{creator.name}</div>

            {creator.platformUsername && profileUrl(creator.platform, creator.platformUsername) && (
              <a
                href={profileUrl(creator.platform, creator.platformUsername)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-0.5 text-[12px] text-violet-400/70 hover:text-violet-300 transition-colors"
              >
                {creator.platformUsername.startsWith('@') ? creator.platformUsername : `@${creator.platformUsername}`}
                <ExternalLink size={11} />
              </a>
            )}

            <div className="text-[12px] text-white/30 mt-1">
              {creator.platform} · {[creator.niche, creator.secondaryNiche].filter(Boolean).join(', ')}
            </div>

            <div className="flex justify-center gap-1.5 mt-2.5">
              <Badge variant={tier.name.toLowerCase()}>{tierEmoji[tier.name]} {tier.name}</Badge>
              <Badge variant={creator.status === 'Active' ? 'green' : creator.status === 'Pending to sign' ? 'amber' : 'red'}>
                {creator.status}
              </Badge>
            </div>

            <div className="font-mono text-[11px] text-white/25 mt-2">
              {creator.coins.toLocaleString()} 🪙 · {toNext === 0 ? 'Max tier' : `${toNext.toLocaleString()} to next`}
            </div>

            <div className="mt-2.5 px-1">
              <ProgressBar value={progress} tierColor={tier.name.toLowerCase()} height="h-[5px]" />
            </div>
          </div>

          <div>
            {[
              ['Followers',  (creator.followers / 1000).toFixed(0) + 'K'],
              ['Platform',   creator.platform],
              ['Tasks Done', creator.tasksCompleted],
              ['Joined',     creator.joinedDate],
            ].map(([label, val]) => (
              <div key={label} className="flex px-4 py-2.5 border-b border-white/7 text-[12px] justify-between items-center">
                <span className="text-white/30">{label}</span>
                <span className="text-white font-medium">{val}</span>
              </div>
            ))}
          </div>

          <div className="p-4">
            <div className="bg-white/3 border border-white/7 rounded-xl p-3 text-center">
              <div className="font-mono text-[10px] text-white/25 uppercase tracking-wider mb-1">Total Coins Earned</div>
              <div className="font-syne text-[22px] font-extrabold text-white">{creator.coins.toLocaleString()}</div>
              <div className="text-[10px] text-amber-300/50 mt-0.5">🪙 kult coins</div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-5">

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[10px] text-white/25 uppercase tracking-[.08em]">Available Tasks</span>
              {available.length > 0 && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
                  {available.length}
                </span>
              )}
            </div>
            {available.length === 0 ? (
              <div className="flex items-center justify-center h-24 rounded-[12px] bg-[#1E1E28] border border-white/7 text-white/20 text-[13px]">
                No available tasks right now
              </div>
            ) : (
              <div className="space-y-3">
                {available.map(t => (
                  <TaskCard key={t.id} task={t} onAccept={acceptTask} accepting={accepting} />
                ))}
              </div>
            )}
          </div>

          {inProgress.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[10px] text-white/25 uppercase tracking-[.08em]">In Progress</span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
                  {inProgress.length}
                </span>
              </div>
              <div className="space-y-3">
                {inProgress.map(t => (
                  <TaskCard key={t.id} task={t} onAccept={acceptTask} accepting={accepting} />
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[10px] text-white/25 uppercase tracking-[.08em]">Completed</span>
              {completed.length > 0 && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  {completed.length}
                </span>
              )}
            </div>
            {completed.length === 0 ? (
              <div className="flex items-center justify-center h-24 rounded-[12px] bg-[#1E1E28] border border-white/7 text-white/20 text-[13px]">
                No completed tasks yet
              </div>
            ) : (
              <div className="space-y-3">
                {completed.map(t => (
                  <TaskCard key={t.id} task={t} onAccept={acceptTask} accepting={accepting} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
