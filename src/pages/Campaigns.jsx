import { useState } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { Pencil, ChevronRight, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const CAMP_STATUS  = { Active:'green', Planning:'amber', Completed:'blue', 'On Hold':'gray' }
const TASK_STATUS  = { 'In Progress':'blue','Under Review':'amber','Completed':'green','Overdue':'red','Not Started':'gray' }
const PRIORITY_DOT = { Urgent:'bg-rose-400 shadow-[0_0_4px_rgba(248,113,113,.5)]', High:'bg-orange-400', Medium:'bg-amber-400', Low:'bg-emerald-400' }
const KANBAN_COLS  = ['Not Started','In Progress','Under Review','Completed','Overdue']
const AV_COLORS    = ['v','b','g','r','t','i']
const COLOR_OPTS   = ['#6C5CE7','#0891B2','#D97706','#059669','#DC2626','#7C3AED','#DB2777','#EA580C']

const INPUT = 'w-full bg-[#16161C] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all'
const LABEL = 'block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1'

// ─── Campaign Card ────────────────────────────────────────────────────────────

function CampaignCard({ campaign, tasks, onClick }) {
  const done     = tasks.filter(t => t.status === 'Completed').length
  const overdue  = tasks.filter(t => t.status === 'Overdue').length
  const creators = [...new Set(tasks.map(t => t.creatorName))].length
  const progress = tasks.length > 0 ? (done / tasks.length) * 100 : 0

  return (
    <div
      onClick={onClick}
      className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden cursor-pointer hover:border-violet-500/30 hover:shadow-[0_8px_30px_rgba(0,0,0,.3)] transition-all group"
    >
      <div className="h-[3px]" style={{ background: campaign.color }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 mr-2">
            <div className="font-syne text-[15px] font-bold text-white group-hover:text-violet-300 transition-colors leading-snug">{campaign.name}</div>
            {campaign.description && <div className="text-[11px] text-white/30 mt-0.5 truncate">{campaign.description}</div>}
          </div>
          <Badge variant={CAMP_STATUS[campaign.status] ?? 'gray'}>{campaign.status}</Badge>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-white/25 mb-1">
            <span>Progress</span>
            <span className="font-mono">{done}/{tasks.length} tasks</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: campaign.color }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {[
            { label: 'Tasks',    value: tasks.length, cls: 'text-white' },
            { label: 'Overdue',  value: overdue,      cls: overdue > 0 ? 'text-rose-400' : 'text-white' },
            { label: 'Creators', value: creators,     cls: 'text-white' },
          ].map(s => (
            <div key={s.label} className="bg-[#16161C] rounded-[7px] p-2 text-center">
              <div className={`font-mono text-[15px] font-bold ${s.cls}`}>{s.value}</div>
              <div className="text-[9px] text-white/25 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-white/25 font-mono">{campaign.startDate || '—'} → {campaign.endDate || '—'}</span>
          {campaign.budget > 0 && <span className="text-emerald-400/70 font-mono font-medium">RM {campaign.budget.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Campaign Detail ──────────────────────────────────────────────────────────

function CampaignDetail({ campaign, tasks, onBack, openEdit }) {
  const updateCampaign = useCampaignStore(s => s.updateCampaign)
  const showToast      = useUIStore(s => s.showToast)
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [view,    setView]    = useState('table')

  const done     = tasks.filter(t => t.status === 'Completed').length
  const inProg   = tasks.filter(t => t.status === 'In Progress').length
  const overdue  = tasks.filter(t => t.status === 'Overdue').length
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  function startEdit() {
    setDraft({ name: campaign.name, description: campaign.description ?? '', status: campaign.status, budget: campaign.budget ?? 0, startDate: campaign.startDate ?? '', endDate: campaign.endDate ?? '', color: campaign.color })
    setEditing(true)
  }
  function cancelEdit() { setDraft(null); setEditing(false) }

  async function saveEdit() {
    setSaving(true)
    try {
      await updateCampaign(campaign.id, draft)
      showToast(`${draft.name} updated`)
      setEditing(false)
      setDraft(null)
    } finally { setSaving(false) }
  }

  const accentColor = editing ? (draft?.color ?? campaign.color) : campaign.color

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1E28] border border-white/7 text-white/40 hover:text-white/70 hover:border-white/12 transition-all text-[12px] font-medium">
          ← Campaigns
        </button>
        <ChevronRight size={14} className="text-white/20" />
        <span className="text-white text-[13px]">{campaign.name}</span>
        <div className="ml-auto flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
                <X size={13} /> Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-50">
                <Check size={13} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={startEdit} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/7 text-white/60 hover:text-white text-[13px] font-semibold transition-all">
              <Pencil size={13} /> Edit Campaign
            </button>
          )}
        </div>
      </div>

      {/* Campaign Info Card */}
      <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden mb-4">
        <div className="h-[3px]" style={{ background: accentColor }} />
        <div className="p-5">
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={LABEL}>Campaign Name</label>
                  <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Status</label>
                  <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))} className={INPUT}>
                    {['Planning','Active','Completed','On Hold'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={LABEL}>Description</label>
                <input value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} className={INPUT} placeholder="Campaign description…" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={LABEL}>Budget (RM)</label>
                  <input type="number" value={draft.budget} onChange={e => setDraft(d => ({ ...d, budget: Number(e.target.value) }))} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Start Date</label>
                  <input type="date" value={draft.startDate} onChange={e => setDraft(d => ({ ...d, startDate: e.target.value }))} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>End Date</label>
                  <input type="date" value={draft.endDate} onChange={e => setDraft(d => ({ ...d, endDate: e.target.value }))} className={INPUT} />
                </div>
              </div>
              <div>
                <label className={LABEL}>Color</label>
                <div className="flex gap-2 mt-1">
                  {COLOR_OPTS.map(c => (
                    <button key={c} type="button" onClick={() => setDraft(d => ({ ...d, color: c }))}
                      className={cn('w-6 h-6 rounded-full transition-all', draft.color === c ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-[#1E1E28] scale-110' : 'opacity-50 hover:opacity-90')}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-syne text-[20px] font-extrabold text-white tracking-tight">{campaign.name}</h2>
                  <Badge variant={CAMP_STATUS[campaign.status] ?? 'gray'}>{campaign.status}</Badge>
                </div>
                {campaign.description && <p className="text-[13px] text-white/40 mb-3">{campaign.description}</p>}
                <div className="flex items-center gap-5 text-[12px]">
                  {campaign.budget > 0 && <span className="text-emerald-400 font-mono font-medium">RM {campaign.budget.toLocaleString()} budget</span>}
                  {campaign.startDate && <span className="text-white/30 font-mono">{campaign.startDate} → {campaign.endDate || '—'}</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-mono text-[32px] font-bold text-white leading-none">{progress}%</div>
                <div className="text-[10px] text-white/25 mt-0.5">complete</div>
                <div className="mt-2 w-28 h-1.5 bg-white/5 rounded-full overflow-hidden ml-auto">
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: campaign.color }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      {!editing && (
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total Tasks', value: tasks.length, cls: 'text-white' },
            { label: 'Completed',   value: done,         cls: 'text-emerald-400' },
            { label: 'In Progress', value: inProg,       cls: 'text-blue-400' },
            { label: 'Overdue',     value: overdue,      cls: overdue > 0 ? 'text-rose-400' : 'text-white' },
          ].map(s => (
            <div key={s.label} className="bg-[#1E1E28] border border-white/7 rounded-[12px] p-4 text-center">
              <div className={`font-mono text-[30px] font-bold leading-none ${s.cls}`}>{s.value}</div>
              <div className="text-[10px] text-white/25 mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* View Toggle + Tasks */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-white/40">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        <div className="flex bg-[#16161C] border border-white/7 rounded-lg overflow-hidden p-0.5 gap-0.5">
          {['table','kanban'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-all ${view===v?'bg-[#1E1E28] text-white':'text-white/30 hover:text-white/60'}`}>
              {v === 'table' ? '⊞ Table' : '⧉ Kanban'}
            </button>
          ))}
        </div>
      </div>

      {view === 'table' && (
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#16161C]">
                {['Creator','Task / Deliverable','Status','PIC','Due Date','Priority','Coins'].map(h => (
                  <th key={h} className="px-3.5 py-2.5 text-left font-mono text-[10px] font-medium text-white/20 uppercase tracking-[.08em] border-b border-white/7 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr><td colSpan={7} className="px-3.5 py-10 text-center text-[13px] text-white/20">No tasks in this campaign</td></tr>
              ) : tasks.map((t, i) => (
                <tr key={t.id} onClick={() => openEdit(t.id)} className="border-b border-white/7 last:border-0 hover:bg-white/[.025] transition-colors cursor-pointer group">
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={t.creatorName.split(' ').map(n=>n[0]).join('')} color={AV_COLORS[i % AV_COLORS.length]} size="sm" />
                      <div>
                        <div className="text-[13px] font-medium text-white">{t.creatorName}</div>
                        <div className="text-[11px] text-white/30">{t.platform}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 text-[13px] text-white/70">{t.task}</td>
                  <td className="px-3.5 py-3"><Badge variant={TASK_STATUS[t.status]}>{t.status}</Badge></td>
                  <td className="px-3.5 py-3 text-[12px] text-white/40">{t.pic}</td>
                  <td className={`px-3.5 py-3 font-mono text-[11px] ${t.status==='Overdue'?'text-rose-400 font-semibold':'text-white/30'}`}>{t.dueDate}</td>
                  <td className="px-3.5 py-3"><span className="flex items-center gap-1.5 text-[12px] text-white/40"><span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority]}`} />{t.priority}</span></td>
                  <td className={`px-3.5 py-3 font-mono text-[12px] ${t.status==='Completed'?'text-emerald-400 font-medium':'text-white/30'}`}>{t.status==='Completed'?`+${t.coins}`:t.coins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'kanban' && (
        <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-1">
          {KANBAN_COLS.map(col => {
            const colTasks = tasks.filter(t => t.status === col)
            return (
              <div key={col} className="bg-[#16161C] border border-white/7 rounded-[14px] p-3 min-h-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-syne text-[12px] font-bold text-white/40">{col}</span>
                  <span className="font-mono text-[10px] bg-white/6 border border-white/7 text-white/25 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                {colTasks.map((t) => (
                  <div key={t.id} onClick={() => openEdit(t.id)} className={`bg-[#1E1E28] border rounded-[9px] p-3 mb-2 last:mb-0 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,.3)] transition-all ${col==='Overdue'?'border-rose-500/30':'border-white/7 hover:border-violet-500/40'}`}>
                    <div className="text-[12px] font-medium text-white mb-1.5 leading-snug">{t.task}</div>
                    <div className="text-[11px] text-white/30 mb-2">{t.creatorName} · {t.platform}</div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                        <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[t.priority]}`} />{t.priority}
                      </span>
                      <span className={`font-mono text-[10px] ${col==='Overdue'?'text-rose-400':col==='Completed'?'text-emerald-400 font-semibold':'text-white/25'}`}>
                        {col==='Completed'?`+${t.coins} coins`:t.dueDate.slice(5)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function Campaigns() {
  const campaigns = useCampaignStore(s => s.campaigns)
  const tasks     = useTaskStore(s => s.tasks)
  const openEdit  = useUIStore(s => s.openEditTask)
  const [selected, setSelected] = useState(null)

  const campaign = campaigns.find(c => c.id === selected)

  if (selected && campaign) {
    return (
      <CampaignDetail
        campaign={campaign}
        tasks={tasks.filter(t => t.project === campaign.name)}
        onBack={() => setSelected(null)}
        openEdit={openEdit}
      />
    )
  }

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Campaigns</h1>
          <p className="text-[12px] text-white/30 mt-1">{campaigns.length} campaigns · {tasks.length} tasks total</p>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-[14px]">No campaigns yet</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {campaigns.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              tasks={tasks.filter(t => t.project === c.name)}
              onClick={() => setSelected(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
