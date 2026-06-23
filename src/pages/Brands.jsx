import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrandStore } from '@/store/brandStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { ChevronRight, Trash2, Pencil, Check, X } from 'lucide-react'

const COLOR_OPTS = ['#6C5CE7','#0891B2','#D97706','#059669','#DC2626','#7C3AED','#DB2777','#EA580C']
const INPUT = 'w-full bg-[#16161C] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all'
const LABEL = 'block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1'

export default function Brands() {
  const navigate     = useNavigate()
  const brands       = useBrandStore(s => s.brands)
  const deleteBrand  = useBrandStore(s => s.deleteBrand)
  const updateBrand  = useBrandStore(s => s.updateBrand)
  const campaigns    = useCampaignStore(s => s.campaigns)
  const globalSearch = useUIStore(s => s.globalSearch)
  const openAddBrand = useUIStore(s => s.openAddBrand)
  const showToast    = useUIStore(s => s.showToast)
  const can          = useAuthStore(s => s.can)

  const [selected,        setSelected]        = useState(null)
  const [filterIndustry,  setFilterIndustry]  = useState('All')
  const [editing,         setEditing]         = useState(false)
  const [draft,           setDraft]           = useState(null)
  const [saving,          setSaving]          = useState(false)

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

  function startEdit() {
    setDraft({ name: selectedBrand.name, industry: selectedBrand.industry ?? '', website: selectedBrand.website ?? '', color: selectedBrand.color })
    setEditing(true)
  }
  function cancelEdit() { setDraft(null); setEditing(false) }
  async function saveEdit() {
    setSaving(true)
    try {
      await updateBrand(selectedBrand.id, draft)
      showToast(`${draft.name} updated`)
      setEditing(false); setDraft(null)
    } finally { setSaving(false) }
  }

  if (selectedBrand) {
    return (
      <div className="animate-[fadeUp_.3s_ease]">
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => { setSelected(null); setEditing(false); setDraft(null) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1E28] border border-white/7 text-white/40 hover:text-white/70 hover:border-white/12 transition-all text-[12px] font-medium">
            ← Brands
          </button>
          <ChevronRight size={14} className="text-white/20" />
          <span className="text-white text-[13px]">{selectedBrand.name}</span>
          {can('brands.manage') && (
            <div className="ml-auto flex items-center gap-2">
              {editing ? (
                <>
                  <button onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
                    <X size={13} /> Cancel
                  </button>
                  <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-50">
                    <Check size={13} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={async () => {
                      if (!window.confirm(`Delete brand "${selectedBrand.name}"? This cannot be undone.`)) return
                      await deleteBrand(selectedBrand.id)
                      showToast(`${selectedBrand.name} deleted`)
                      setSelected(null)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/7 hover:border-rose-500/20 text-white/40 hover:text-rose-400 text-[13px] font-semibold transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button onClick={startEdit} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/7 text-white/60 hover:text-white text-[13px] font-semibold transition-all">
                    <Pencil size={13} /> Edit
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-5 mb-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Brand Name</label>
                <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Industry</label>
                <input value={draft.industry} onChange={e => setDraft(d => ({ ...d, industry: e.target.value }))} className={INPUT} placeholder="e.g. Fashion, Tech…" />
              </div>
            </div>
            <div>
              <label className={LABEL}>Website <span className="normal-case font-normal text-white/20">(optional)</span></label>
              <input value={draft.website} onChange={e => setDraft(d => ({ ...d, website: e.target.value }))} className={INPUT} placeholder="e.g. brand.com" />
            </div>
            <div>
              <label className={LABEL}>Color</label>
              <div className="flex gap-2 mt-1">
                {COLOR_OPTS.map(c => (
                  <button key={c} type="button" onClick={() => setDraft(d => ({ ...d, color: c }))}
                    className={`w-7 h-7 rounded-full transition-all ${draft.color === c ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-[#1E1E28] scale-110' : 'opacity-50 hover:opacity-90'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
        ) : (
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
        )}

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
        <div className="flex items-center gap-2">
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
          {can('brands.manage') && (
            <button
              onClick={openAddBrand}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-300 hover:bg-violet-600/25 text-[13px] font-semibold transition-all"
            >
              + Add Brand
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-[13px]">
          {globalSearch ? 'No brands match your search' : 'No brands yet — click "+ Add Brand" to get started'}
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
