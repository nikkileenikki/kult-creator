import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { getTier } from '@/lib/tierUtils'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import { PLATFORMS } from '@/lib/data'

const TIER_BADGE = { Platinum:'platinum', Diamond:'diamond', Gold:'gold', Silver:'silver', Bronze:'bronze' }
const TIERS = ['Platinum', 'Diamond', 'Gold', 'Silver', 'Bronze']

const CHIP = (active) =>
  `px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
    active
      ? 'bg-violet-600 border-violet-500 text-white'
      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
  }`

export default function Niche() {
  const creators = useCreatorStore(s => s.creators)
  const navigate  = useNavigate()

  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterTier, setFilterTier]         = useState('')
  const [filterStatus, setFilterStatus]     = useState('')

  const filtered = useMemo(() => creators.filter(c => {
    if (filterPlatform && c.platform !== filterPlatform) return false
    if (filterStatus   && c.status   !== filterStatus)   return false
    if (filterTier) {
      const tier = getTier(c.coins)
      if (tier.name !== filterTier) return false
    }
    return true
  }), [creators, filterPlatform, filterTier, filterStatus])

  const groups = filtered.reduce((acc, c) => {
    ;(acc[c.niche] = acc[c.niche] || []).push(c)
    return acc
  }, {})
  const niches = Object.entries(groups).sort((a, b) => b[1].length - a[1].length)

  const hasFilter = filterPlatform || filterTier || filterStatus

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Niche</h1>
          <p className="text-[12px] text-white/30 mt-1">{niches.length} categories · {filtered.length} creators</p>
        </div>
        {hasFilter && (
          <button
            onClick={() => { setFilterPlatform(''); setFilterTier(''); setFilterStatus('') }}
            className="text-[11px] text-white/30 hover:text-white/60 transition-all"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-white/7">
        {/* Platform */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mr-1">Platform</span>
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setFilterPlatform(filterPlatform === p ? '' : p)} className={CHIP(filterPlatform === p)}>
              {p}
            </button>
          ))}
        </div>

        {/* Tier */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mr-1">Tier</span>
          {TIERS.map(t => (
            <button key={t} onClick={() => setFilterTier(filterTier === t ? '' : t)} className={CHIP(filterTier === t)}>
              {t}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/25 uppercase tracking-wider font-semibold mr-1">Status</span>
          {['Active', 'On Hold'].map(s => (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)} className={CHIP(filterStatus === s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {niches.map(([niche, list]) => (
          <div key={niche}>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-syne text-[14px] font-bold text-white">{niche}</span>
              <span className="font-mono text-[10px] text-white/30 px-2 py-0.5 rounded-full bg-white/5 border border-white/7">
                {list.length}
              </span>
              <div className="flex-1 h-px bg-white/7" />
            </div>

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

                    {c.secondaryNiche && (
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="text-[10px] text-white/20">Also</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/7 text-white/40 font-medium">
                          {c.secondaryNiche}
                        </span>
                      </div>
                    )}

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
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-white/20 text-[13px]">No creators match the selected filters</p>
            <button
              onClick={() => { setFilterPlatform(''); setFilterTier(''); setFilterStatus('') }}
              className="text-[11px] text-violet-400 hover:text-violet-300 transition-all"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
