import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { creatorAuthHeaders } from '@/lib/creatorAuth'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import { ExternalLink, ListTodo, ShoppingBag, CheckCircle2, Clock, ArrowRight, AlertTriangle } from 'lucide-react'

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

function camel(row) {
  if (!row) return row
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v
  }
  return out
}

function formatFollowers(n) {
  if (!n) return null
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const due  = new Date(dateStr)
  const now  = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((due - now) / 86400000)
}

export default function CreatorDashboard({ session }) {
  const showToast = useUIStore(s => s.showToast)
  const [creator,   setCreator]   = useState(null)
  const [myTasks,   setMyTasks]   = useState([])
  const [openCount, setOpenCount] = useState(0)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const headers = creatorAuthHeaders()
        const [meRes, tasksRes] = await Promise.all([
          fetch('/api/creator-portal/me',    { headers }),
          fetch('/api/creator-portal/tasks', { headers }),
        ])
        if (!meRes.ok || !tasksRes.ok) throw new Error('Failed to load')
        const meData    = await meRes.json()
        const tasksData = await tasksRes.json()
        setCreator(meData.creator ? camel(meData.creator) : null)
        setMyTasks((tasksData.myTasks ?? []).map(camel))
        setOpenCount((tasksData.openTasks ?? []).length)
      } catch (e) {
        showToast('Failed to load dashboard: ' + e.message, 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="flex items-center justify-center h-64 text-white/30 text-[13px]">Loading…</div>

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/30">
        <p className="text-[14px]">No creator profile linked to your account.</p>
        <p className="text-[12px] mt-1 text-white/20">Contact your manager to set this up.</p>
      </div>
    )
  }

  const completed   = myTasks.filter(t => t.status === 'Completed').length
  const inProgress  = myTasks.filter(t => t.status === 'In Progress').length
  const underReview = myTasks.filter(t => t.status === 'Under Review').length
  const url = creator.platformUsername ? profileUrl(creator.platform, creator.platformUsername) : null

  // Upcoming deadlines: active tasks with a due date, sorted soonest first
  const upcoming = myTasks
    .filter(t => t.status !== 'Completed' && t.dueDate)
    .map(t => ({ ...t, daysLeft: daysUntil(t.dueDate) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5)

  return (
    <div id="creator-dashboard" className="animate-[fadeUp_.3s_ease] max-w-2xl">

      {/* Profile card */}
      <div id="creator-profile-card" className="flex items-start gap-5 p-6 bg-[#1A1A24] border border-white/7 rounded-[20px] mb-6">
        <Avatar initials={creator.initials} color={creator.avatarColor} size="lg" className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-syne text-[20px] font-extrabold text-white">{creator.name}</span>
            <Badge variant={creator.status === 'Active' ? 'green' : creator.status === 'Pending to sign' ? 'amber' : 'red'}>
              {creator.status}
            </Badge>
          </div>
          <div className="text-[13px] text-white/40 mb-1">
            {creator.platform}
            {creator.niche ? ` · ${creator.niche}` : ''}
            {creator.followers ? ` · ${formatFollowers(creator.followers)} followers` : ''}
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] text-violet-400/70 hover:text-violet-300 transition-colors"
            >
              {creator.platformUsername?.startsWith('@') ? creator.platformUsername : `@${creator.platformUsername}`}
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div id="creator-stats-row" className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Completed',   value: completed,              icon: CheckCircle2, color: 'text-emerald-300', bg: 'bg-emerald-500/8 border-emerald-500/15' },
          { label: 'In Progress', value: inProgress + underReview, icon: Clock,       color: 'text-blue-300',    bg: 'bg-blue-500/8 border-blue-500/15' },
          { label: 'Available',   value: openCount,              icon: ListTodo,     color: 'text-violet-300',  bg: 'bg-violet-500/8 border-violet-500/15' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`flex flex-col items-center gap-1.5 p-4 rounded-[14px] border ${bg}`}>
            <Icon size={16} className={color} />
            <span className={`font-syne text-[26px] font-extrabold ${color}`}>{value}</span>
            <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Upcoming deadlines */}
      {upcoming.length > 0 && (
        <div id="creator-upcoming-deadlines" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} className="text-white/30" />
            <span className="font-syne font-bold text-[14px] text-white">Upcoming Deadlines</span>
          </div>
          <div className="space-y-2">
            {upcoming.map(t => {
              const overdue  = t.daysLeft < 0
              const dueToday = t.daysLeft === 0
              const urgent   = t.daysLeft <= 2 && t.daysLeft >= 0
              return (
                <Link key={t.id} to="/portal/my-tasks" className={`flex items-center justify-between px-4 py-3 rounded-[12px] border transition-colors ${overdue ? 'border-rose-500/20 bg-rose-500/5 hover:border-rose-500/35' : urgent ? 'border-amber-500/15 bg-amber-500/4 hover:border-amber-500/30' : 'border-white/7 bg-[#1A1A24] hover:border-white/15'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-white truncate">{t.task}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-white/30 mt-0.5">
                      {t.campaignColor && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.campaignColor }} />}
                      {t.project}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                    {overdue ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                        <AlertTriangle size={11} /> Overdue
                      </span>
                    ) : (
                      <span className={`text-[11px] font-mono font-medium ${dueToday ? 'text-rose-300' : urgent ? 'text-amber-300' : 'text-white/30'}`}>
                        {dueToday ? 'Due today' : `${t.daysLeft}d left`}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div id="creator-quick-links" className="grid grid-cols-2 gap-3">
        <Link
          to="/portal/my-tasks"
          className="flex items-center justify-between px-4 py-4 bg-[#1A1A24] border border-white/7 rounded-[14px] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
        >
          <div className="flex items-center gap-3">
            <ListTodo size={15} className="text-blue-400" />
            <div>
              <div className="text-[13px] font-semibold text-white">My Tasks</div>
              <div className="text-[11px] text-white/30 mt-0.5">{myTasks.length} accepted</div>
            </div>
          </div>
          <ArrowRight size={13} className="text-white/20 group-hover:text-blue-400 transition-colors" />
        </Link>
        <Link
          to="/portal/browse"
          className="flex items-center justify-between px-4 py-4 bg-[#1A1A24] border border-white/7 rounded-[14px] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag size={15} className="text-violet-400" />
            <div>
              <div className="text-[13px] font-semibold text-white">Browse Tasks</div>
              <div className="text-[11px] text-white/30 mt-0.5">{openCount} available</div>
            </div>
          </div>
          <ArrowRight size={13} className="text-white/20 group-hover:text-violet-400 transition-colors" />
        </Link>
      </div>
    </div>
  )
}
