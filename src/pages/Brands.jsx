import { useState, useMemo } from 'react'
import { useBrandStore } from '@/store/brandStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import { BRAND_INDUSTRIES } from '@/lib/data'
import { Plus, X, ChevronRight, Check } from 'lucide-react'

const BRAND_COLORS = ['#6C5CE7','#0891B2','#D97706','#059669','#DC2626','#7C3AED','#DB2777','#EA580C','#8B5CF6','#EE4D2D']
const INPUT = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const LABEL = 'block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1'

function BrandForm({ onSubmit, onCancel, loading }) {
  const [name, setName]         = useState('')
  const [industry, setIndustry] = useState(BRAND_INDUSTRIES[0])
  const [color, setColor]       = useState('#6C5CE7')
  const [website, setWebsite]   = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), industry, color, website: website.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1E1E28] border border-violet-500/30 rounded-[14px] p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-syne text-[14px] font-bold text-white">New Brand</span>
        <button type="button" onClick={onCancel} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
          <X size={13} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={LABEL}>Brand Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Wardah" className={INPUT} required />
        </div>
        <div>
          <label className={LABEL}>Industry</label>
          <select value={industry} onChange={e => setIndustry(e.target.value)} className={INPUT}>
            {BRAND_INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={LABEL}>Website <span className="normal-case font-normal text-white/20">(optional)</span></label>
          <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. brand.com" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Color</label>
          <div className="flex gap-1.5 flex-wrap mt-1">
            {BRAND_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition-all ${color === c ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-[#1E1E28] scale-110' : 'opacity-50 hover:opacity-90'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all">
          Cancel
        </button>
        <button type="submit" disabled={loading || !name.trim()} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-50">
          <Check size={13} /> Create Brand
        </button>
      </div>
    </form>
  )
}

export default function Brands() {
  const brands     = useBrandStore(s => s.brands)
  const addBrand   = useBrandStore(s => s.addBrand)
  const campaigns  = useCampaignStore(s => s.campaigns)
  const showToast  = useUIStore(s => s.showToast)
  const globalSearch = useUIStore(s => s.globalSearch)

  const [adding,   setAdding]   = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    if (!globalSearch) return brands
    const q = globalSearch.toLowerCase()
    return brands.filter(b => b.name.toLowerCase().includes(q) || b.industry.toLowerCase().includes(q))
  }, [brands, globalSearch])

  async function handleAdd(data) {
    setSaving(true)
    try {
      await addBrand(data)
      showToast(`${data.name} added`)
      setAdding(false)
    } finally {
      setSaving(false)
    }
  }

  const selectedBrand = selected ? brands.find(b => b.id === selected) : null
  const brandCampaigns = selectedBrand ? campaigns.filter(c => c.brandId === selectedBrand.id) : []

  if (selectedBrand) {
    return (
      <div className="animate-[fadeUp_.3s_ease]">
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1E28] border border-white/7 text-white/40 hover:text-white/70 hover:border-white/12 transition-all text-[12px] font-medium">
            ← Brands
          </button>
          <ChevronRight size={14} className="text-white/20" />
          <span className="text-white text-[13px]">{selectedBrand.name}</span>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-[12px] flex-shrink-0" style={{ background: selectedBrand.color }} />
          <div>
            <div className="font-syne text-[20px] font-extrabold text-white">{selectedBrand.name}</div>
            <div className="text-[12px] text-white/30 mt-0.5">
              {selectedBrand.industry}
              {selectedBrand.website && <span className="ml-2 text-violet-400">· {selectedBrand.website}</span>}
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
            {brandCampaigns.map(c => {
              const done = campaigns.length
              return (
                <div key={c.id} className="flex items-center gap-4 bg-[#1E1E28] border border-white/7 rounded-[12px] px-4 py-3.5">
                  <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-syne text-[14px] font-bold text-white">{c.name}</div>
                    <div className="text-[11px] text-white/30 mt-0.5">{c.startDate || '—'} → {c.endDate || '—'}</div>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                    c.status === 'Active' ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' :
                    c.status === 'Planning' ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' :
                    'bg-white/5 border-white/7 text-white/30'
                  }`}>{c.status}</span>
                  {c.budget > 0 && <span className="font-mono text-[12px] text-emerald-400/70">RM {c.budget.toLocaleString()}</span>}
                </div>
              )
            })}
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
          <p className="text-[12px] text-white/30 mt-1">{brands.length} brand{brands.length !== 1 ? 's' : ''} · {campaigns.length} campaigns total</p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-4 py-[7px] rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(108,92,231,.3)] hover:-translate-y-px">
            <Plus size={14} /> New Brand
          </button>
        )}
      </div>

      {adding && <BrandForm onSubmit={handleAdd} onCancel={() => setAdding(false)} loading={saving} />}

      {filtered.length === 0 && !adding ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-[13px]">
          {globalSearch ? 'No brands match your search' : 'No brands yet — add one above'}
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
                      <span className="text-[11px] text-white/25 truncate ml-3">{brand.website}</span>
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
