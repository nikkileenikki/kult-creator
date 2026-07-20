import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { useTaskStore } from '@/store/taskStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import { request } from '@/lib/api'
import { fetchTemplates, deleteTemplate } from '@/lib/api/reportTemplates'
import { generateReport, RANGE_OPTIONS } from '@/lib/reportBuilder'
import { downloadCSV, rowsToCSV } from '@/lib/csv'
import { downloadXLSX } from '@/lib/xlsx'
import { Plus, FileSpreadsheet, Pencil, Trash2, Download, ArrowLeft } from 'lucide-react'

const RANGE_LABEL = Object.fromEntries(RANGE_OPTIONS.map(o => [o.key, o.label]))

export default function CustomReports() {
  const navigate  = useNavigate()
  const showToast = useUIStore(s => s.showToast)
  const creators  = useCreatorStore(s => s.creators)
  const tasks     = useTaskStore(s => s.tasks)
  const campaigns = useCampaignStore(s => s.campaigns)

  const [templates, setTemplates] = useState([])
  const [loading, setLoading]     = useState(true)
  const [runningId, setRunningId] = useState(null)

  useEffect(() => {
    fetchTemplates().then(setTemplates).catch(e => showToast('Failed to load templates: ' + e.message, 'error')).finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRun(template) {
    setRunningId(template.id)
    try {
      const taskTimeline = await request('GET', '/analytics/task-timeline').catch(() => ({}))
      const { sheets } = generateReport(template, { creators, tasks, campaigns }, taskTimeline)
      const filenameBase = `${template.title.replace(/[^\w\-]+/g, '_')}-${new Date().toISOString().slice(0, 10)}`
      if (template.fileType === 'xlsx') downloadXLSX(`${filenameBase}.xlsx`, sheets)
      else downloadCSV(`${filenameBase}.csv`, sheets.map(s => rowsToCSV(s.rows, s.columns)).join('\n\n'))
      showToast('Report generated')
    } catch (e) {
      showToast('Failed to generate report: ' + e.message, 'error')
    } finally {
      setRunningId(null)
    }
  }

  async function handleDelete(template) {
    if (!confirm(`Delete template "${template.title}"?`)) return
    try {
      await deleteTemplate(template.id)
      setTemplates(prev => prev.filter(t => t.id !== template.id))
      showToast('Template deleted')
    } catch (e) {
      showToast('Failed to delete template: ' + e.message, 'error')
    }
  }

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-center gap-2 mb-1">
        <button onClick={() => navigate('/reports')} className="flex items-center gap-1 text-[12px] text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft size={12} /> Reports
        </button>
      </div>
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Custom Reports</h1>
          <p className="text-[12px] text-white/30 mt-1">Saved report templates you can re-run anytime</p>
        </div>
        <button
          onClick={() => navigate('/reports/templates/new')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all"
        >
          <Plus size={14} /> New Template
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-white/30 text-[13px]">Loading…</div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 rounded-[14px] bg-[#1E1E28] border border-white/7 text-white/20">
          <FileSpreadsheet size={28} className="mb-3 opacity-40" />
          <p className="text-[13px]">No custom report templates yet</p>
          <button onClick={() => navigate('/reports/templates/new')} className="mt-3 text-[12px] text-violet-400/70 hover:text-violet-300 transition-colors font-medium">
            Create your first template
          </button>
        </div>
      ) : (
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                {['Title', 'Type', 'File', 'Date Range', 'Updated', ''].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left font-mono text-[10px] font-medium text-white/20 uppercase tracking-[.08em] border-b border-white/7 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {templates.map(t => (
                <tr key={t.id} className="border-b border-white/7 last:border-0 hover:bg-white/[.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-[13px] text-white font-medium">{t.title}</div>
                    <div className="text-[11px] text-white/25 mt-0.5">{t.createdBy || 'Unknown'}</div>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-white/50 capitalize">{t.reportType}</td>
                  <td className="px-5 py-3 text-[12px] text-white/50 uppercase font-mono">{t.fileType}</td>
                  <td className="px-5 py-3 text-[12px] text-white/50">{RANGE_LABEL[t.dateRange] ?? t.dateRange}</td>
                  <td className="px-5 py-3 font-mono text-[11px] text-white/30">{new Date(t.updatedAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleRun(t)}
                        disabled={runningId === t.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-300 text-[11px] font-medium transition-all disabled:opacity-40"
                      >
                        <Download size={11} /> {runningId === t.id ? 'Generating…' : 'Generate'}
                      </button>
                      <button
                        onClick={() => navigate(`/reports/templates/${t.id}`)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 flex items-center justify-center text-white/40 hover:text-rose-400 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
