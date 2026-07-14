import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { creatorAuthHeaders } from '@/lib/creatorAuth'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import { ExternalLink, ListTodo, CheckCircle2, Clock, ArrowRight } from 'lucide-react'

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

export default function CreatorDashboard({ session }) {
  const showToast = useUIStore(s => s.showToast)
  const [creator,  setCreator]  = useState(null)
  const [myTasks,  setMyTasks]  = useState([])
  const [openCount, setOpenCount] = useState(0)
  const [loading,  setLoading]  = useState(true)

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

  const completed = myTasks.filter(t => t.status === 'Completed').length
  const inProgress = myTasks.filter(t => t.status === 'In Progress').length
  const underReview = myTasks.filter(t => t.status === 'Under Review').length
  const url = creator.platformUsername ? profileUrl(creator.platform, creator.platformUsername) : null

  return (
    <div className="animate-[fadeUp_.3s_ease] max-w-2xl">
      {/* Profile card */}
      <div className="flex items-center gap-5 p-6 bg-[#1A1A24] border border-white/7 rounded-[20px] mb-6">
        <Avatar initials={creator.initials} color={creator.avatarColor} size="lg" className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-syne text-[20px] font-extrabold text-white">{creator.name}</span>
            <Badge variant={creator.status === 'Active' ? 'green' : creator.status === 'Pending to sign' ? 'amber' : 'red'}>
              {creator.status}
            </Badge>
          </div>
          <div className="text-[13px] text-white/30">{creator.platform} · {creator.niche}</div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] text-violet-400/70 hover:text-violet-300 transition-colors mt-1"
            >
              {creator.platformUsername?.startsWith('@') ? creator.platformUsername : `@${creator.platformUsername}`}
              <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Completed', value: completed,   icon: CheckCircle2, color: 'text-emerald-300', bg: 'bg-emerald-500/8 border-emerald-500/15' },
          { label: 'In Progress', value: inProgress + underReview, icon: Clock, color: 'text-blue-300', bg: 'bg-blue-500/8 border-blue-500/15' },
          { label: 'Available', value: openCount,   icon: ListTodo,     color: 'text-violet-300', bg: 'bg-violet-500/8 border-violet-500/15' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`flex flex-col items-center gap-1.5 p-4 rounded-[14px] border ${bg}`}>
            <Icon size={16} className={color} />
            <span className={`font-syne text-[26px] font-extrabold ${color}`}>{value}</span>
            <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        <Link
          to="/portal/tasks"
          className="flex items-center justify-between px-5 py-4 bg-[#1A1A24] border border-white/7 rounded-[14px] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
        >
          <div className="flex items-center gap-3">
            <ListTodo size={16} className="text-violet-400" />
            <div>
              <div className="text-[13px] font-semibold text-white">My Tasks & Available Tasks</div>
              <div className="text-[11px] text-white/30 mt-0.5">{openCount} task{openCount !== 1 ? 's' : ''} available to accept</div>
            </div>
          </div>
          <ArrowRight size={14} className="text-white/20 group-hover:text-violet-400 transition-colors" />
        </Link>
        <Link
          to="/portal/account"
          className="flex items-center justify-between px-5 py-4 bg-[#1A1A24] border border-white/7 rounded-[14px] hover:border-white/15 transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="text-[16px]">⚙️</span>
            <div className="text-[13px] font-semibold text-white">Account Settings</div>
          </div>
          <ArrowRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
        </Link>
      </div>
    </div>
  )
}
