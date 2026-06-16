const DOT = {
  green:  'bg-emerald-400',
  amber:  'bg-amber-400',
  blue:   'bg-blue-400',
  red:    'bg-rose-400',
  purple: 'bg-violet-400',
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export default function ActivityFeed({ activities = [] }) {
  return (
    <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden flex-1">
      <div className="px-4 py-3.5 border-b border-white/7">
        <span className="font-syne text-[13px] font-bold text-white">Recent Activity</span>
      </div>
      {activities.map(a => (
        <div key={a.id} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-white/7 last:border-0">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${DOT[a.color]}`} />
          <div>
            <div
              className="text-[12px] text-white/50 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: a.text }}
            />
            <div className="font-mono text-[10px] text-white/20 mt-0.5">{timeAgo(a.created_at) || a.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
