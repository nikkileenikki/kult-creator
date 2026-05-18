const TIER_COLORS = {
  platinum: 'from-purple-700 to-purple-300',
  diamond:  'from-blue-700 to-blue-300',
  gold:     'from-amber-600 to-amber-300',
  silver:   'from-gray-500 to-gray-300',
  bronze:   'from-rose-700 to-rose-300',
}

export default function TierSnapshot({ tierCounts = [] }) {
  const maxCount = Math.max(...tierCounts.map(t => t.count), 1)

  return (
    <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
      <div className="px-4 py-3.5 border-b border-white/7">
        <span className="font-syne text-[13px] font-bold text-white">Tier Distribution</span>
      </div>
      {tierCounts.map(({ name, count }) => (
        <div key={name} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/7 last:border-0">
          <span className="text-[12px] font-medium text-white/50 capitalize w-16">{name}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/6 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${TIER_COLORS[name]}`}
              style={{ width: `${(count / maxCount) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-white/30 w-3 text-right">{count}</span>
        </div>
      ))}
    </div>
  )
}
