import { useNavigate } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { getTier } from '@/lib/tierUtils'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'

const TIER_BADGE = { Platinum:'platinum', Diamond:'diamond', Gold:'gold', Silver:'silver', Bronze:'bronze' }

export default function Niche() {
  const creators = useCreatorStore(s => s.creators)
  const navigate  = useNavigate()

  // Group creators by niche, sorted by group size desc
  const groups = creators.reduce((acc, c) => {
    ;(acc[c.niche] = acc[c.niche] || []).push(c)
    return acc
  }, {})
  const niches = Object.entries(groups).sort((a, b) => b[1].length - a[1].length)

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="mb-5">
        <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Niche</h1>
        <p className="text-[12px] text-white/30 mt-1">{niches.length} categories · {creators.length} creators</p>
      </div>

      <div className="space-y-6">
        {niches.map(([niche, list]) => (
          <div key={niche}>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="font-syne text-[14px] font-bold text-white">{niche}</span>
              <span className="font-mono text-[10px] text-white/30 px-2 py-0.5 rounded-full bg-white/5 border border-white/7">
                {list.length}
              </span>
              <div className="flex-1 h-px bg-white/7" />
            </div>

            {/* Creator cards */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
              {list.map(c => {
                const tier = getTier(c.coins)
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/persona/${c.id}`)}
                    className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-4 cursor-pointer hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,.3)] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar initials={c.initials} color={c.avatarColor} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="font-syne text-[14px] font-bold text-white truncate">{c.name}</div>
                        <div className="text-[11px] text-white/30 mt-0.5">{c.platform}</div>
                      </div>
                      <Badge variant={TIER_BADGE[tier.name]}>{tier.name}</Badge>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/7 text-[11px]">
                      <span className="font-mono text-white/30">{(c.followers/1000).toFixed(0)}K followers</span>
                      <span className="font-mono text-white/30">{c.coins.toLocaleString()} 🪙</span>
                      <span className={c.status === 'Active' ? 'text-emerald-400 font-medium' : 'text-amber-300 font-medium'}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {niches.length === 0 && (
          <div className="flex items-center justify-center h-48 text-white/20 text-[13px]">
            No creators yet
          </div>
        )}
      </div>
    </div>
  )
}
