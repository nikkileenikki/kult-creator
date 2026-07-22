import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useTaskStore } from '@/store/taskStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { request } from '@/lib/api'
import { fetchTemplate, createTemplate, updateTemplate } from '@/lib/api/reportTemplates'
import { RANGE_OPTIONS, LEVEL_OPTIONS, metricOptionsFor, generateReport } from '@/lib/reportBuilder'
import { downloadCSV, rowsToCSV } from '@/lib/csv'
import { downloadXLSX } from '@/lib/xlsx'
import TagMultiSelect from '@/components/shared/TagMultiSelect'
import { cn } from '@/lib/utils'
import { ArrowLeft, X, Download } from 'lucide-react'

const INPUT  = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const SELECT = INPUT + ' cursor-pointer'
const LABEL  = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

const DEFAULT_TEMPLATE = {
  title: '', reportType: 'summary', fileType: 'csv', dateRange: 'all', rangeStart: '', rangeEnd: '',
  campaignIds: [], brandNames: [], creatorIds: [], pics: [], levels: ['campaign', 'creator'], metrics: [],
}

export default function ReportTemplateEditor() {
  const { id } = useParams()
  const isNew = !id
  const navigate  = useNavigate()
  const showToast = useUIStore(s => s.showToast)
  const authUser  = useAuthStore(s => s.user)
  const creators  = useCreatorStore(s => s.creators)
  const campaigns = useCampaignStore(s => s.campaigns)
  const tasks     = useTaskStore(s => s.tasks)

  const can       = useAuthStore(s => s.can)
  const canManage = can('reports.manage')

  const [tpl, setTpl] = useState(DEFAULT_TEMPLATE)
  const [saving, setSaving]         = useState(false)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading]       = useState(!isNew)

  useEffect(() => {
    if (!canManage) navigate('/reports/templates', { replace: true })
  }, [canManage]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Saves the template (create or update) and returns the saved template, or null on failure.
  async function persist() {
    if (!tpl.title.trim()) { showToast('Template title is required', 'error'); return null }
    const payload = { ...tpl, createdBy: tpl.createdBy || authUser?.displayName || '' }
    if (isNew) {
      const created = await createTemplate(payload)
      navigate(`/reports/templates/${created.id}`, { replace: true })
      return created
    }
    await updateTemplate(id, payload)
    return { ...payload, id }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const saved = await persist()
      if (saved) showToast(isNew ? 'Template created' : 'Template saved')
    } catch (e) {
      showToast('Failed to save template: ' + e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAndGenerate() {
    setGenerating(true)
    try {
      const saved = await persist()
      if (!saved) return
      const taskTimeline = await request('GET', '/analytics/task-timeline').catch(() => ({}))
      const { sheets } = generateReport(saved, { creators, tasks, campaigns }, taskTimeline)
      const filenameBase = `${saved.title.replace(/[^\w\-]+/g, '_')}-${new Date().toISOString().slice(0, 10)}`
      if (saved.fileType === 'xlsx') downloadXLSX(`${filenameBase}.xlsx`, sheets)
      else downloadCSV(`${filenameBase}.csv`, sheets.map(s => rowsToCSV(s.rows, s.columns)).join('\n\n'))
      showToast('Template saved and report generated')
    } catch (e) {
      showToast('Failed to generate report: ' + e.message, 'error')
    } finally {
      setGenerating(false)
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || generating}
            className="px-5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/7 hover:border-white/12 disabled:opacity-50 text-white/70 hover:text-white text-[13px] font-semibold transition-all"
          >
            {saving ? 'Saving…' : 'Save Template'}
          </button>
          <button
            onClick={handleSaveAndGenerate}
            disabled={saving || generating}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-[13px] font-semibold transition-all"
          >
            <Download size={14} /> {generating ? 'Generating…' : 'Save & Generate Report'}
          </button>
        </div>
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
