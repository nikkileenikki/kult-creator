import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { useUIStore } from '@/store/uiStore'
import { useNicheStore } from '@/store/nicheStore'
import { useAuthStore } from '@/store/authStore'
import Avatar from '@/components/shared/Avatar'

export default function Niche() {
  const creators     = useCreatorStore(s => s.creators)
  const globalSearch = useUIStore(s => s.globalSearch)
  const navigate     = useNavigate()
  const niches       = useNicheStore(s => s.niches)
  const addNiche     = useNicheStore(s => s.addNiche)
  const deleteNiche  = useNicheStore(s => s.deleteNiche)
  const can          = useAuthStore(s => s.can)

  const [selected,  setSelected]  = useState(null)
  const [showAdd,   setShowAdd]   = useState(false)
  const [newNiche,  setNewNiche]  = useState('')

  const nicheStats = useMemo(() => niches.map(({ id, name: niche }) => {
    const list = creators.filter(c => {
      if (c.status === 'Rejected') return false
      const ns = [c.niche, c.secondaryNiche].filter(Boolean).flatMap(n => n.split(', ').map(s => s.trim()))
      return ns.includes(niche)
    })
    const totalFollowers = list.reduce((s, c) => s + c.followers, 0)
    const platforms = [...new Set(list.map(c => c.platform))]
    return { id, niche, list, totalFollowers, platforms }
  }), [niches, creators])

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
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Niches</h1>
          <p className="text-[12px] text-white/30 mt-1">{niches.length} categories · {creators.length} creators</p>
        </div>
        {can('campaigns.manage') && (
          <button
            onClick={() => setShowAdd(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-300 hover:bg-violet-600/25 text-[13px] font-semibold transition-all"
          >
            + Add Niche
          </button>
        )}
      </div>

      {showAdd && (
        <div className="flex items-center gap-2 mb-4">
          <input
            value={newNiche}
            onChange={e => setNewNiche(e.target.value)}
            onKeyDown={async e => {
              if (e.key === 'Enter' && newNiche.trim()) {
                await addNiche(newNiche.trim())
                setNewNiche('')
                setShowAdd(false)
              }
            }}
            placeholder="Niche name…"
            autoFocus
            className="px-3 py-2 bg-[#1E1E28] border border-white/[0.07] rounded-lg text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 w-60"
          />
          <button
            onClick={async () => {
              if (!newNiche.trim()) return
              await addNiche(newNiche.trim())
              setNewNiche('')
              setShowAdd(false)
            }}
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all"
          >
            Add
          </button>
          <button onClick={() => setShowAdd(false)} className="px-3 py-2 text-white/40 hover:text-white text-[13px]">Cancel</button>
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
        {filtered.map(({ id, niche, list, totalFollowers, platforms }) => (
          <div
            key={niche}
            onClick={() => setSelected(niche)}
            className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-4 cursor-pointer hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,.3)] transition-all group relative overflow-visible"
          >
            {can('campaigns.manage') && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); deleteNiche(id) }}
                className="absolute top-2 right-2 w-6 h-6 rounded-md bg-white/5 hover:bg-rose-500/15 flex items-center justify-center text-white/20 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            )}
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
