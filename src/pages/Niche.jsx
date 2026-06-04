import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { useUIStore } from '@/store/uiStore'
import { NICHES } from '@/lib/data'
import Avatar from '@/components/shared/Avatar'

export default function Niche() {
  const creators     = useCreatorStore(s => s.creators)
  const globalSearch = useUIStore(s => s.globalSearch)
  const navigate     = useNavigate()
  const [selected, setSelected] = useState(null)

  const nicheStats = useMemo(() => NICHES.map(niche => {
    const list = creators.filter(c => {
      const niches = [c.niche, c.secondaryNiche].filter(Boolean).flatMap(n => n.split(', ').map(s => s.trim()))
      return niches.includes(niche)
    })
    const totalFollowers = list.reduce((s, c) => s + c.followers, 0)
    const platforms = [...new Set(list.map(c => c.platform))]
    return { niche, list, totalFollowers, platforms }
  }), [creators])

  const filtered = useMemo(() => {
    if (!globalSearch) return nicheStats
    const q = globalSearch.toLowerCase()
    return nicheStats.filter(n => n.niche.toLowerCase().includes(q))
  }, [nicheStats, globalSearch])

  const selectedNiche = selected ? nicheStats.find(n => n.niche === selected) : null

  if (selectedNiche) {
    return (
      <div className="animate-[fadeUp_.3s_ease]">
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1E28] border border-white/7 text-white/40 hover:text-white/70 hover:border-white/12 transition-all text-[12px] font-medium">
            ← Niches
          </button>
          <span className="text-white/30 text-[13px]">›</span>
          <span className="text-white text-[13px]">{selectedNiche.niche}</span>
        </div>

        {selectedNiche.list.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-white/20 text-[13px]">No creators in this niche yet.</div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
            {selectedNiche.list.map(c => (
              <div
                key={c.id}
                onClick={() => navigate(`/creator/${c.id}`)}
                className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-4 cursor-pointer hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,.3)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={c.initials} color={c.avatarColor} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="font-syne text-[14px] font-bold text-white truncate">{c.name}</div>
                    <div className="text-[11px] text-white/30 mt-0.5">{c.platform}</div>
                  </div>
                  {c.niche !== selectedNiche.niche && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-medium flex-shrink-0">2nd</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/7 text-[11px] font-mono text-white/30">
                  <span>{(c.followers / 1000).toFixed(0)}K followers</span>
                  <span className={c.status === 'Active' ? 'text-emerald-400' : 'text-amber-300'}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="mb-5">
        <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Niches</h1>
        <p className="text-[12px] text-white/30 mt-1">{NICHES.length} categories · {creators.length} creators</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {filtered.map(({ niche, list, totalFollowers, platforms }) => (
          <div
            key={niche}
            onClick={() => setSelected(niche)}
            className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-4 cursor-pointer hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,.3)] transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="font-syne text-[14px] font-bold text-white group-hover:text-violet-300 transition-colors leading-snug flex-1 mr-2">{niche}</div>
              <span className={`font-mono text-[20px] font-extrabold flex-shrink-0 leading-none ${list.length > 0 ? 'text-white' : 'text-white/15'}`}>{list.length}</span>
            </div>

            <div className="text-[10px] text-white/25 mb-2">
              {list.length === 0
                ? 'No creators yet'
                : `${(totalFollowers / 1000).toFixed(0)}K total followers`
              }
            </div>

            {platforms.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {platforms.map(p => (
                  <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/7 text-white/35 font-medium">{p}</span>
                ))}
              </div>
            )}

            {list.length > 0 && (
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-white/7">
                {list.slice(0, 4).map(c => (
                  <Avatar key={c.id} initials={c.initials} color={c.avatarColor} size="xs" />
                ))}
                {list.length > 4 && (
                  <span className="text-[10px] text-white/25 font-mono ml-1">+{list.length - 4}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
