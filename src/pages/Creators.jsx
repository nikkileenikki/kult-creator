import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { getTier, getProgress, coinsToNextTier } from '@/lib/tierUtils'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import ProgressBar from '@/components/shared/ProgressBar'
import { Search } from 'lucide-react'

const TIER_BADGE  = { Platinum:'platinum', Diamond:'diamond', Gold:'gold', Silver:'silver', Bronze:'bronze' }
const TIER_EMOJI  = { Platinum:'👑', Diamond:'💎', Gold:'🥇', Silver:'🥈', Bronze:'🥉' }
const TIER_ORDER  = ['All', 'Platinum', 'Diamond', 'Gold', 'Silver', 'Bronze']

const SELECT = 'text-[12px] px-2.5 py-1.5 border border-white/7 rounded-lg bg-[#1E1E28] text-white/50 font-figtree outline-none hover:border-white/12 cursor-pointer transition-all'

export default function Creators() {
  const creators = useCreatorStore(s => s.creators)
  const navigate = useNavigate()

  const [filterPlatform, setFilterPlatform] = useState('All')
  const [filterTier,     setFilterTier]     = useState('All')
  const [filterStatus,   setFilterStatus]   = useState('Active')
  const [search,         setSearch]         = useState('')

  const platforms = useMemo(() => ['All', ...[...new Set(creators.map(c => c.platform))]], [creators])

  const filtered = useMemo(() => creators.filter(c => {
    if (filterStatus !== 'All' && c.status !== filterStatus) return false
    if (filterPlatform !== 'All' && c.platform !== filterPlatform) return false
    if (filterTier !== 'All' && getTier(c.coins).name !== filterTier) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [creators, filterPlatform, filterTier, filterStatus, search])

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Creators</h1>
          <p className="text-[12px] text-white/30 mt-1">
            {filtered.length}{filtered.length !== creators.length ? ` of ${creators.length}` : ''} creators
            {filterStatus !== 'All' ? ` · ${filterStatus}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 bg-[#1E1E28] border border-white/7 rounded-lg px-3 py-[7px] text-[12px] text-white/30 hover:border-white/12 transition-all">
            <Search size={12} className="flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="bg-transparent outline-none text-white placeholder:text-white/20 w-28"
            />
          </div>

          {/* Tier filter */}
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)} className={SELECT}>
            {TIER_ORDER.map(t => <option key={t} value={t}>{t === 'All' ? 'All Tiers' : t}</option>)}
          </select>

          {/* Platform filter */}
          <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className={SELECT}>
            {platforms.map(p => <option key={p} value={p}>{p === 'All' ? 'All Platforms' : p}</option>)}
          </select>

          {/* Status filter */}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={SELECT}>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="All">All Statuses</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-[14px]">No creators match this filter</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
          {filtered.map(c => {
            const tier     = getTier(c.coins)
            const progress = getProgress(c.coins)
            const toNext   = coinsToNextTier(c.coins)
            const isRejected = c.status === 'Rejected'

            return (
              <div
                key={c.id}
                onClick={() => !isRejected && navigate(`/persona/${c.id}`)}
                className={`bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px] transition-all duration-200 hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,.3)] group relative overflow-hidden ${isRejected ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start gap-3 mb-3.5">
                  <Avatar initials={c.initials} color={c.avatarColor} size="md" />
                  <div className="flex-1">
                    <div className="font-syne text-[15px] font-bold text-white tracking-tight">{c.name}</div>
                    <div className="text-[11px] text-white/30 mt-0.5">{c.platform} · {c.niche}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {isRejected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400/70 font-medium">Rejected</span>
                      ) : (
                        <Badge variant={TIER_BADGE[tier.name]}>{TIER_EMOJI[tier.name]} {tier.name}</Badge>
                      )}
                      {!isRejected && (
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status==='Active'?'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,.5)]':'bg-amber-400'}`} />
                      )}
                      <span className="font-mono text-[11px] text-white/25 ml-auto">{c.coins.toLocaleString()} 🪙</span>
                    </div>
                  </div>
                </div>

                {!isRejected && (
                  <div className="mb-3.5">
                    <div className="flex justify-between font-mono text-[10px] text-white/25 mb-1.5">
                      <span>{toNext > 0 ? `${toNext.toLocaleString()} to ${getTier(c.coins + toNext).name}` : 'Max tier reached'}</span>
                      <span>{c.coins.toLocaleString()}{toNext > 0 ? ` / ${(c.coins + toNext).toLocaleString()}` : ''}</span>
                    </div>
                    <ProgressBar value={progress} tierColor={tier.name.toLowerCase()} height="h-1" />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 border-t border-white/7 pt-3.5">
                  <div>
                    <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.04em]">Followers</div>
                    <div className="font-syne text-[14px] font-bold text-white mt-0.5">{(c.followers/1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.04em]">Tasks</div>
                    <div className="font-syne text-[14px] font-bold text-white mt-0.5">{c.tasksCompleted}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.04em]">Status</div>
                    <div className={`text-[11px] font-medium mt-0.5 ${isRejected?'text-rose-400/60':c.status==='Active'?'text-emerald-400':'text-amber-300'}`}>{c.status}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
