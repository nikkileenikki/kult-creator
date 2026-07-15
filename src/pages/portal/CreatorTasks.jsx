import { useState, useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { creatorAuthHeaders } from '@/lib/creatorAuth'
import { Clock, Zap, ChevronDown, ChevronUp, Users, Info } from 'lucide-react'

const PRIORITY_STYLE = {
  Urgent: { bar: 'from-rose-500 to-rose-400',       badge: 'text-rose-300 bg-rose-500/10 border-rose-500/20',           dot: 'bg-rose-400'    },
  High:   { bar: 'from-amber-500 to-amber-400',     badge: 'text-amber-300 bg-amber-500/10 border-amber-500/20',         dot: 'bg-amber-400'   },
  Medium: { bar: 'from-violet-600 to-violet-400',   badge: 'text-violet-300 bg-violet-500/10 border-violet-500/20',      dot: 'bg-violet-400'  },
  Low:    { bar: 'from-emerald-600 to-emerald-400', badge: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',   dot: 'bg-emerald-400' },
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
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v
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
  const [detailOpen, setDetailOpen] = useState(false)
  const p = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.Medium
  const isAccepting = accepting === task.id

  return (
    <div className="bg-[#1A1A24] border border-white/8 rounded-[16px] overflow-hidden flex flex-col hover:border-violet-500/30 hover:shadow-[0_0_24px_rgba(109,40,217,.08)] transition-all duration-200">
      <div className={`h-[3px] w-full bg-gradient-to-r ${p.bar}`} />
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="font-syne text-[15px] font-bold text-white leading-snug">{task.task}</div>
            <button
              onClick={() => setDetailOpen(v => !v)}
              title="Show details"
              className="flex-shrink-0 mt-0.5 text-white/20 hover:text-white/60 transition-colors"
            >
              <Info size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/30 font-medium mt-1 flex-wrap">
            {task.campaignColor && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.campaignColor }} />}
            <span>{task.project}</span>
            {task.brandName && <><span className="text-white/15">·</span><span className="text-white/50 font-semibold">{task.brandName}</span></>}
          </div>
        </div>

        {task.description && !detailOpen && (
          <p className="text-[12px] text-white/40 leading-relaxed line-clamp-2 mb-3">{task.description}</p>
        )}

        {detailOpen && (
          <div className="mb-3 space-y-2 text-[12px] text-white/40 leading-relaxed border-t border-white/5 pt-3">
            {task.description && <p>{task.description}</p>}
            {task.notes && (
              <p className="border-l-2 border-violet-500/30 pl-2 text-white/30 italic">{task.notes}</p>
            )}
          </div>
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

        <div className="mt-auto">
          <button
            onClick={() => onAccept(task.id)}
            disabled={isAccepting}
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 text-white font-syne font-bold text-[13px] transition-all shadow-[0_0_16px_rgba(109,40,217,.3)] hover:shadow-[0_0_24px_rgba(109,40,217,.5)] flex items-center justify-center gap-2"
          >
            {isAccepting ? (
              <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Accepting…</>
            ) : (
              <><Zap size={13} />Accept Task</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CreatorTasks({ session }) {
  const showToast = useUIStore(s => s.showToast)
  const [openTasks, setOpenTasks] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [accepting, setAccepting] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/creator-portal/tasks', { headers: creatorAuthHeaders() })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setOpenTasks((data.openTasks ?? []).map(camel))
      } catch (e) {
        showToast('Failed to load tasks: ' + e.message, 'error')
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
      setOpenTasks(prev => prev.filter(t => t.id !== taskId))
      showToast('Task accepted — check My Tasks!')
    } catch {
      showToast('Failed to accept task', 'error')
    } finally {
      setAccepting(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-white/30 text-[13px]">Loading…</div>

  const campaignGroups = openTasks.reduce((acc, t) => {
    const key = t.project || 'General'
    if (!acc[key]) acc[key] = { color: t.campaignColor, brandName: t.brandName, tasks: [] }
    acc[key].tasks.push(t)
    return acc
  }, {})

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="mb-6">
        <h1 className="font-syne text-[20px] font-extrabold text-white tracking-tight">Browse Tasks</h1>
        <p className="text-[12px] text-white/30 mt-1">Accept tasks that match your profile and start earning</p>
      </div>

      {openTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-[14px] bg-[#1A1A24] border border-white/7 text-white/20">
          <Zap size={24} className="mb-2 opacity-30" />
          <span className="text-[13px]">No tasks available right now</span>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(campaignGroups).map(([campaign, { color, brandName, tasks }]) => (
            <div key={campaign}>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {color && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />}
                <span className="text-[13px] font-semibold text-white/70">{campaign}</span>
                {brandName && <span className="text-[11px] text-white/40 font-medium">· {brandName}</span>}
                <span className="text-[10px] text-white/25 font-mono">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {tasks.map(t => <MarketplaceCard key={t.id} task={t} onAccept={acceptTask} accepting={accepting} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
