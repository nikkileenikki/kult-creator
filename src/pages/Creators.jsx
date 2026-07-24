import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { getTier } from '@/lib/tierUtils'
import { formatCompactNumber } from '@/lib/utils'
import { useNicheStore } from '@/store/nicheStore'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import { ExternalLink } from 'lucide-react'

const TIER_BADGE  = { Platinum:'platinum', Diamond:'diamond', Gold:'gold', Silver:'silver', Bronze:'bronze' }
const TIER_EMOJI  = { Platinum:'👑', Diamond:'💎', Gold:'🥇', Silver:'🥈', Bronze:'🥉' }
const TIER_ORDER  = ['All', 'Platinum', 'Diamond', 'Gold', 'Silver', 'Bronze']

const PLATFORM_URL = {
  'TikTok':     u => `https://www.tiktok.com/@${u.replace(/^@/, '')}`,
  'YouTube':    u => `https://www.youtube.com/@${u.replace(/^@/, '')}`,
  'Instagram':  u => `https://www.instagram.com/${u.replace(/^@/, '')}`,
  'X / Twitter':u => `https://x.com/${u.replace(/^@/, '')}`,
  'LinkedIn':   u => `https://www.linkedin.com/in/${u.replace(/^@/, '')}`,
}

function profileUrl(platform, username) {
  if (!username) return null
  const builder = PLATFORM_URL[platform]
  return builder ? builder(username) : null
}

const SELECT = 'text-[12px] px-2.5 py-1.5 border border-white/7 rounded-lg bg-[#1E1E28] text-white/50 font-figtree outline-none hover:border-white/12 cursor-pointer transition-all'

export default function Creators() {
  const creators        = useCreatorStore(s => s.creators)
  const navigate        = useNavigate()
  const search          = useUIStore(s => s.globalSearch)
  const openAddCreator  = useUIStore(s => s.openAddCreator)
  const can             = useAuthStore(s => s.can)
  const nichesData      = useNicheStore(s => s.niches)

  const [filterPlatform, setFilterPlatform] = useState('All')
  const [filterTier,     setFilterTier]     = useState('All')
  const [filterStatus,   setFilterStatus]   = useState('Active')
  const [filterNiche,    setFilterNiche]    = useState('All')
  const [filterPic,      setFilterPic]      = useState('All')

  const platforms = useMemo(() => ['All', ...[...new Set(creators.map(c => c.platform))]], [creators])
  const pics      = useMemo(() => ['All', ...[...new Set(creators.map(c => c.pic).filter(Boolean))].sort()], [creators])

  const filtered = useMemo(() => creators.filter(c => {
    if (filterStatus !== 'All' && c.status !== filterStatus) return false
    if (filterPlatform !== 'All' && c.platform !== filterPlatform) return false
    if (filterTier !== 'All' && getTier(c.coins).name !== filterTier) return false
    if (filterNiche !== 'All') {
      const niches = [c.niche, c.secondaryNiche].filter(Boolean).flatMap(n => n.split(', ').map(s => s.trim()))
      if (!niches.includes(filterNiche)) return false
    }
    if (filterPic !== 'All' && c.pic !== filterPic) return false
    if (search) {
      const q = search.toLowerCase()
      const matchName     = c.name.toLowerCase().includes(q)
      const matchUsername = c.platformUsername?.toLowerCase().includes(q.replace(/^@/, ''))
      if (!matchName && !matchUsername) return false
    }
    return true
  }), [creators, filterPlatform, filterTier, filterStatus, filterNiche, filterPic, search])

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Creators</h1>
          <p className="text-[12px] text-white/30 mt-1">
            {filtered.length} creator{filtered.length !== 1 ? 's' : ''}
            {filterStatus !== 'All' ? ` · ${filterStatus}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Niche filter */}
          <select value={filterNiche} onChange={e => setFilterNiche(e.target.value)} className={SELECT}>
            <option value="All">All Niches</option>
            {nichesData.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
          </select>

          {/* PIC filter */}
          <select value={filterPic} onChange={e => setFilterPic(e.target.value)} className={SELECT}>
            {pics.map(p => <option key={p} value={p}>{p === 'All' ? 'All PICs' : p}</option>)}
          </select>

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
            <option value="Pending to sign">Pending to sign</option>
            <option value="Suspended">Suspended</option>
            <option value="All">All Statuses</option>
            <option value="Rejected">Rejected</option>
          </select>
          {/* Add Creator */}
          {can('creators.edit') && (
            <button
              onClick={openAddCreator}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-300 hover:bg-violet-600/25 text-[13px] font-semibold transition-all"
            >
              + Add Creator
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-[14px]">No creators match this filter</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
          {filtered.map(c => {
            const tier       = getTier(c.coins)
            const isRejected = c.status === 'Rejected'

            return (
              <div
                key={c.id}
                onClick={() => navigate(`/creator/${c.id}`)}
                className={`bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px] transition-all duration-200 hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,.3)] group relative overflow-hidden cursor-pointer ${isRejected ? 'opacity-60' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start gap-3 mb-3.5">
                  <Avatar initials={c.initials} color={c.avatarColor} size="md" />
                  <div className="flex-1">
                    <div className="font-syne text-[15px] font-bold text-white tracking-tight">{c.name}</div>
                    {c.platformUsername && profileUrl(c.platform, c.platformUsername) && (
                      <a
                        href={profileUrl(c.platform, c.platformUsername)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 mt-0.5 text-[11px] text-violet-400/70 hover:text-violet-300 transition-colors"
                      >
                        {c.platformUsername.startsWith('@') ? c.platformUsername : `@${c.platformUsername}`}
                        <ExternalLink size={10} />
                      </a>
                    )}
                    <div className="text-[11px] text-white/30 mt-0.5">{c.platform} · {[c.niche, c.secondaryNiche].filter(Boolean).join(', ')}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {isRejected ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400/70 font-medium">Rejected</span>
                      ) : (
                        <Badge variant={TIER_BADGE[tier.name]}>{TIER_EMOJI[tier.name]} {tier.name}</Badge>
                      )}
                      {!isRejected && (
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          c.status==='Active'          ? 'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,.5)]' :
                          c.status==='Pending to sign' ? 'bg-amber-400' :
                          c.status==='Suspended'       ? 'bg-rose-400' :
                                                         'bg-white/20'
                        }`} />
                      )}
                      <span className="font-mono text-[11px] text-white/25 ml-auto">{c.coins.toLocaleString()} 🪙</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-white/7 pt-3.5">
                  <div>
                    <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.04em]">Followers</div>
                    <div className="font-syne text-[14px] font-bold text-white mt-0.5">{formatCompactNumber(c.followers)}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.04em]">Tasks</div>
                    <div className="font-syne text-[14px] font-bold text-white mt-0.5">{c.tasksCompleted}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.04em]">PIC</div>
                    <div className="text-[11px] font-medium text-white/60 mt-0.5 truncate">{c.pic}</div>
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
