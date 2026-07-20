import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { fetchTemplate, createTemplate, updateTemplate } from '@/lib/api/reportTemplates'
import { RANGE_OPTIONS, LEVEL_OPTIONS, metricOptionsFor } from '@/lib/reportBuilder'
import { cn } from '@/lib/utils'
import { ArrowLeft, ChevronDown, X } from 'lucide-react'

const INPUT  = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const SELECT = INPUT + ' cursor-pointer'
const LABEL  = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'
const CHIP   = 'inline-flex items-center gap-1.5 bg-[#3A3A4E] text-white text-[12px] px-2.5 py-1.5 rounded-md'

const DEFAULT_TEMPLATE = {
  title: '', reportType: 'summary', fileType: 'csv', dateRange: 'all', rangeStart: '', rangeEnd: '',
  campaignIds: [], brandNames: [], creatorIds: [], pics: [], levels: ['campaign', 'creator'], metrics: [],
}

function TagMultiSelect({ label, options, selected, onChange, getKey, getLabel, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const available = options.filter(o => !selected.includes(getKey(o)))

  return (
    <div>
      <div className={LABEL}>{label}</div>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#1A1A22] border border-white/[0.07] text-[13px] text-white/50 hover:border-white/15 transition-all"
        >
          <span>{placeholder ?? `Add ${label.toLowerCase()}`}</span>
          <ChevronDown size={13} className={cn('transition-transform text-white/30', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 max-h-[220px] overflow-y-auto bg-[#111116] border border-white/10 rounded-lg shadow-2xl py-1">
            {available.length === 0 ? (
              <div className="px-3 py-2 text-[12px] text-white/20">No more options</div>
            ) : available.map(o => (
              <button
                type="button"
                key={getKey(o)}
                onClick={() => { onChange([...selected, getKey(o)]); setOpen(false) }}
                className="w-full text-left px-3 py-2 text-[12px] text-white/70 hover:bg-white/5 transition-colors"
              >
                {getLabel(o)}
              </button>
            ))}
          </div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map(key => {
            const opt = options.find(o => getKey(o) === key)
            return (
              <span key={key} className={CHIP}>
                {opt ? getLabel(opt) : key}
                <button type="button" onClick={() => onChange(selected.filter(k => k !== key))} className="text-white/50 hover:text-white transition-colors">
                  <X size={11} />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ReportTemplateEditor() {
  const { id } = useParams()
  const isNew = !id
  const navigate  = useNavigate()
  const showToast = useUIStore(s => s.showToast)
  const authUser  = useAuthStore(s => s.user)
  const creators  = useCreatorStore(s => s.creators)
  const campaigns = useCampaignStore(s => s.campaigns)

  const [tpl, setTpl] = useState(DEFAULT_TEMPLATE)
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (isNew) return
    fetchTemplate(id)
      .then(t => setTpl({ ...DEFAULT_TEMPLATE, ...t }))
      .catch(e => showToast('Failed to load template: ' + e.message, 'error'))
      .finally(() => setLoading(false))
  }, [id, isNew]) // eslint-disable-line react-hooks/exhaustive-deps

  const brandOptions = [...new Set(campaigns.map(c => c.brandName).filter(Boolean))].sort()
  const picOptions    = [...new Set(creators.map(c => c.pic).filter(Boolean))].sort()
  const metricOptions = metricOptionsFor(tpl.reportType)

  function set(patch) { setTpl(t => ({ ...t, ...patch })) }

  function toggleLevel(key) {
    set({ levels: tpl.levels.includes(key) ? tpl.levels.filter(l => l !== key) : [...tpl.levels, key] })
  }

  async function handleSave() {
    if (!tpl.title.trim()) { showToast('Template title is required', 'error'); return }
    setSaving(true)
    try {
      const payload = { ...tpl, createdBy: tpl.createdBy || authUser?.displayName || '' }
      if (isNew) {
        const created = await createTemplate(payload)
        showToast('Template created')
        navigate(`/reports/templates/${created.id}`, { replace: true })
      } else {
        await updateTemplate(id, payload)
        showToast('Template saved')
      }
    } catch (e) {
      showToast('Failed to save template: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-white/30 text-[13px]">Loading…</div>

  return (
    <div className="animate-[fadeUp_.3s_ease] max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <button onClick={() => navigate('/reports/templates')} className="flex items-center gap-1 text-[12px] text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft size={12} /> Custom Reports
        </button>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">{isNew ? 'New Template' : 'Edit Template'}</h1>
          <p className="text-[12px] text-white/30 mt-1">Configure a reusable report and save it for later</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-[13px] font-semibold transition-all"
        >
          {saving ? 'Saving…' : 'Save Template'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-5 space-y-5">
          <div>
            <label className={LABEL}>Template Title</label>
            <input type="text" value={tpl.title} onChange={e => set({ title: e.target.value })} placeholder="e.g. Monthly Campaign Summary" className={INPUT} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={LABEL}>Report Type</label>
              <select value={tpl.reportType} onChange={e => set({ reportType: e.target.value, metrics: [] })} className={SELECT}>
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>File Type</label>
              <select value={tpl.fileType} onChange={e => set({ fileType: e.target.value })} className={SELECT}>
                <option value="csv">CSV</option>
                <option value="xlsx">XLSX</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Date Range</label>
              <select value={tpl.dateRange} onChange={e => set({ dateRange: e.target.value })} className={SELECT}>
                {RANGE_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {tpl.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Start Date</label>
                <input type="date" value={tpl.rangeStart} onChange={e => set({ rangeStart: e.target.value })} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>End Date</label>
                <input type="date" value={tpl.rangeEnd} onChange={e => set({ rangeEnd: e.target.value })} className={INPUT} />
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-5 space-y-5">
          <h2 className="font-syne text-[15px] font-bold text-white">Content</h2>

          <TagMultiSelect
            label="Campaigns" options={campaigns} selected={tpl.campaignIds} onChange={v => set({ campaignIds: v })}
            getKey={c => c.id} getLabel={c => c.name} placeholder="All campaigns (leave empty for all)"
          />
          <TagMultiSelect
            label="Brands" options={brandOptions.map(b => ({ id: b, name: b }))} selected={tpl.brandNames} onChange={v => set({ brandNames: v })}
            getKey={o => o.id} getLabel={o => o.name} placeholder="All brands (leave empty for all)"
          />
          <TagMultiSelect
            label="Creators" options={creators} selected={tpl.creatorIds} onChange={v => set({ creatorIds: v })}
            getKey={c => c.id} getLabel={c => c.name} placeholder="All creators (leave empty for all)"
          />
          <TagMultiSelect
            label="PICs" options={picOptions.map(p => ({ id: p, name: p }))} selected={tpl.pics} onChange={v => set({ pics: v })}
            getKey={o => o.id} getLabel={o => o.name} placeholder="All PICs (leave empty for all)"
          />
        </div>

        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-5 space-y-5">
          <h2 className="font-syne text-[15px] font-bold text-white">Columns and Grouping</h2>

          <div>
            <div className={LABEL}>Levels</div>
            <p className="text-[11px] text-white/25 mb-2">Group rows by campaign and/or creator, in that order.</p>
            <div className="flex flex-wrap gap-1.5">
              {LEVEL_OPTIONS.map(l => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => toggleLevel(l.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-md border transition-all',
                    tpl.levels.includes(l.key) ? 'bg-[#3A3A4E] border-white/10 text-white' : 'border-white/7 text-white/30 hover:text-white/60',
                  )}
                >
                  {l.label}
                  {tpl.levels.includes(l.key) && <X size={11} className="text-white/50" />}
                </button>
              ))}
            </div>
          </div>

          <TagMultiSelect
            label="Metrics" options={metricOptions} selected={tpl.metrics} onChange={v => set({ metrics: v })}
            getKey={m => m.key} getLabel={m => m.label} placeholder={`All ${tpl.reportType} metrics (leave empty for all)`}
          />
        </div>
      </div>
    </div>
  )
}
