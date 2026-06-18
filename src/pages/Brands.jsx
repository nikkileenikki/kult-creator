import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrandStore } from '@/store/brandStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { ChevronRight, Trash2 } from 'lucide-react'

export default function Brands() {
  const navigate     = useNavigate()
  const brands       = useBrandStore(s => s.brands)
  const deleteBrand  = useBrandStore(s => s.deleteBrand)
  const campaigns    = useCampaignStore(s => s.campaigns)
  const globalSearch = useUIStore(s => s.globalSearch)
  const showToast    = useUIStore(s => s.showToast)
  const can          = useAuthStore(s => s.can)

  const [selected,        setSelected]        = useState(null)
  const [filterIndustry,  setFilterIndustry]  = useState('All')

  const industries = useMemo(() => {
    const set = new Set(brands.map(b => b.industry).filter(Boolean))
    return ['All', ...Array.from(set).sort()]
  }, [brands])

  const filtered = useMemo(() => {
    let list = brands
    if (filterIndustry !== 'All') list = list.filter(b => b.industry === filterIndustry)
    if (globalSearch) {
      const q = globalSearch.toLowerCase()
      list = list.filter(b => b.name.toLowerCase().includes(q) || b.industry.toLowerCase().includes(q))
    }
    return list
  }, [brands, filterIndustry, globalSearch])

  const selectedBrand    = selected ? brands.find(b => b.id === selected) : null
  const brandCampaigns   = selectedBrand ? campaigns.filter(c => c.brandId === selectedBrand.id) : []

  if (selectedBrand) {
    return (
      <div className="animate-[fadeUp_.3s_ease]">
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1E28] border border-white/7 text-white/40 hover:text-white/70 hover:border-white/12 transition-all text-[12px] font-medium">
            ← Brands
          </button>
          <ChevronRight size={14} className="text-white/20" />
          <span className="text-white text-[13px]">{selectedBrand.name}</span>
          {can('brands.manage') && (
            <button
              onClick={async () => {
                if (!window.confirm(`Delete brand "${selectedBrand.name}"? This cannot be undone.`)) return
                await deleteBrand(selectedBrand.id)
                showToast(`${selectedBrand.name} deleted`)
                setSelected(null)
              }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/7 hover:border-rose-500/20 text-white/40 hover:text-rose-400 text-[13px] font-semibold transition-all"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-[12px] flex-shrink-0" style={{ background: selectedBrand.color }} />
          <div>
            <div className="font-syne text-[20px] font-extrabold text-white">{selectedBrand.name}</div>
            <div className="text-[12px] text-white/30 mt-0.5">
              {selectedBrand.industry}
              {selectedBrand.website && (
                <a href={selectedBrand.website.startsWith('http') ? selectedBrand.website : `https://${selectedBrand.website}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="ml-2 text-violet-400 hover:text-violet-300 hover:underline transition-colors">
                  · {selectedBrand.website}
                </a>
              )}
            </div>
          </div>
          <div className="ml-auto text-center">
            <div className="font-mono text-[32px] font-bold text-white leading-none">{brandCampaigns.length}</div>
            <div className="text-[10px] text-white/25 mt-0.5">campaigns</div>
          </div>
        </div>

        {brandCampaigns.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-white/20 text-[13px]">No campaigns linked to this brand yet.</div>
        ) : (
          <div className="space-y-2">
            {brandCampaigns.map(c => (
              <div key={c.id} onClick={() => navigate('/campaigns', { state: { campaignId: c.id } })} className="flex items-center gap-4 bg-[#1E1E28] border border-white/7 rounded-[12px] px-4 py-3.5 cursor-pointer hover:border-violet-500/40 hover:-translate-y-0.5 transition-all">
                <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <div className="flex-1 min-w-0">
                  <div className="font-syne text-[14px] font-bold text-white">{c.name}</div>
                  <div className="text-[11px] text-white/30 mt-0.5">{c.startDate || '—'} → {c.endDate || '—'}</div>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                  c.status === 'Active'   ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' :
                  c.status === 'Planning' ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' :
                  'bg-white/5 border-white/7 text-white/30'
                }`}>{c.status}</span>
                {c.budget > 0 && <span className="font-mono text-[12px] text-emerald-400/70">RM {c.budget.toLocaleString()}</span>}
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
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Brands</h1>
          <p className="text-[12px] text-white/30 mt-1">
            {filtered.length} brand{filtered.length !== 1 ? 's' : ''} · {campaigns.filter(c => filtered.some(b => b.id === c.brandId)).length} campaign{campaigns.filter(c => filtered.some(b => b.id === c.brandId)).length !== 1 ? 's' : ''}
          </p>
        </div>
        {industries.length > 2 && (
          <div className="flex bg-[#16161C] border border-white/7 rounded-lg overflow-hidden p-0.5 gap-0.5">
            {industries.map(ind => (
              <button key={ind} onClick={() => setFilterIndustry(ind)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${filterIndustry === ind ? 'bg-[#1E1E28] text-white' : 'text-white/30 hover:text-white/60'}`}>
                {ind}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-[13px]">
          {globalSearch ? 'No brands match your search' : 'No brands yet — use "+ New Brand" in the header'}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
          {filtered.map(brand => {
            const count = campaigns.filter(c => c.brandId === brand.id).length
            return (
              <div
                key={brand.id}
                onClick={() => setSelected(brand.id)}
                className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden cursor-pointer hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,.3)] transition-all group"
              >
                <div className="h-[4px]" style={{ background: brand.color }} />
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-[10px] flex-shrink-0" style={{ background: brand.color + '22', border: `1px solid ${brand.color}44` }}>
                      <div className="w-full h-full rounded-[10px] flex items-center justify-center font-syne text-[14px] font-extrabold" style={{ color: brand.color }}>
                        {brand.name[0]}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-syne text-[14px] font-bold text-white group-hover:text-violet-300 transition-colors truncate">{brand.name}</div>
                      <div className="text-[11px] text-white/30 mt-0.5">{brand.industry}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/7 pt-3">
                    <div className="text-center">
                      <div className="font-mono text-[20px] font-bold text-white">{count}</div>
                      <div className="text-[9px] text-white/25 uppercase tracking-wide">campaigns</div>
                    </div>
                    {brand.website && (
                      <a href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-[11px] text-white/25 hover:text-violet-400 truncate ml-3 transition-colors">
                        {brand.website}
                      </a>
                    )}
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
