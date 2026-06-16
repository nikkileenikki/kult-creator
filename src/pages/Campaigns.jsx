import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTaskStore } from '@/store/taskStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useCreatorStore } from '@/store/creatorStore'
import { useUIStore } from '@/store/uiStore'
import { useBrandStore } from '@/store/brandStore'
import { useAuthStore } from '@/store/authStore'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { Pencil, ChevronRight, Check, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const CAMP_STATUS  = { Active:'green', Planning:'amber', Completed:'blue', 'On Hold':'gray' }
const TASK_STATUS  = { 'In Progress':'blue','Under Review':'amber','Completed':'green','Overdue':'red','Not Started':'gray' }
const PRIORITY_DOT = { Urgent:'bg-rose-400 shadow-[0_0_4px_rgba(248,113,113,.5)]', High:'bg-orange-400', Medium:'bg-amber-400', Low:'bg-emerald-400' }
const KANBAN_COLS  = ['Not Started','In Progress','Under Review','Completed','Overdue']
const AV_COLORS    = ['v','b','g','r','t','i']
const COLOR_OPTS   = ['#6C5CE7','#0891B2','#D97706','#059669','#DC2626','#7C3AED','#DB2777','#EA580C']

const INPUT = 'w-full bg-[#16161C] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all'
const LABEL = 'block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1'
const SEL   = 'text-[11px] px-2.5 py-1.5 border border-white/7 rounded-lg bg-[#16161C] text-white/50 outline-none hover:border-white/12 cursor-pointer transition-all'

// ─── By Creator View ──────────────────────────────────────────────────────────

function CreatorView({ campaign, tasks, openEdit, openAddTask, canEdit }) {
  const creators = useCreatorStore(s => s.creators)

  const groups = useMemo(() => {
    const map = new Map()
    for (const t of tasks) {
      const key = t.creatorId || ''
      if (!map.has(key)) {
        const creator = creators.find(c => c.id === key)
        map.set(key, { id: key, name: t.creatorName || 'Unassigned', platform: t.platform || '', creator, tasks: [] })
      }
      map.get(key).tasks.push(t)
    }
    return [...map.values()].sort((a, b) => {
      if (!a.id && b.id) return 1
      if (a.id && !b.id) return -1
      return a.name.localeCompare(b.name)
    })
  }, [tasks, creators])

  if (tasks.length === 0) {
    return <div className="flex items-center justify-center h-32 text-white/20 text-[13px]">No tasks yet — add one above</div>
  }

  return (
    <div className="space-y-3">
      {groups.map(group => {
        const done     = group.tasks.filter(t => t.status === 'Completed').length
        const progress = group.tasks.length > 0 ? Math.round((done / group.tasks.length) * 100) : 0

        return (
          <div key={group.id || 'unassigned'} className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
              {group.creator ? (
                <Avatar initials={group.creator.initials} color={group.creator.avatarColor} size="sm" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/25 text-[10px]">?</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-syne text-[13px] font-bold text-white">{group.name}</span>
                  {group.platform && <span className="text-[11px] text-white/30">{group.platform}</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[9px] text-white/25">{done}/{group.tasks.length} tasks</span>
                  <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="font-mono text-[9px] text-white/25">{progress}%</span>
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => openAddTask({ project: campaign.name, creatorId: group.id || undefined })}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/7 hover:border-violet-500/30 hover:bg-violet-600/10 text-white/40 hover:text-white/70 text-[11px] font-medium transition-all flex-shrink-0"
                >
                  + Add Task
                </button>
              )}
            </div>
            <div>
              {group.tasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => openEdit(t.id)}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[.02] cursor-pointer transition-colors group"
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority]}`} />
                  <span className="flex-1 text-[12px] text-white/60 group-hover:text-white/80 transition-colors">{t.task}</span>
                  <Badge variant={TASK_STATUS[t.status]}>{t.status}</Badge>
                  <span className={`font-mono text-[10px] flex-shrink-0 ${t.status==='Overdue'?'text-rose-400':'text-white/20'}`}>{t.dueDate}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

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
          <div className="flex items-center gap-2">
            {campaign.brandName && <span className="text-violet-400/70 text-[10px] truncate max-w-[80px]">{campaign.brandName}</span>}
            {campaign.budget > 0 && <span className="text-emerald-400/70 font-mono font-medium">RM {campaign.budget.toLocaleString()}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Campaign Detail ──────────────────────────────────────────────────────────

function CampaignDetail({ campaign, tasks, onBack, openEdit, openAddTask }) {
  const updateCampaign = useCampaignStore(s => s.updateCampaign)
  const deleteCampaign = useCampaignStore(s => s.deleteCampaign)
  const updateTask     = useTaskStore(s => s.updateTask)
  const showToast      = useUIStore(s => s.showToast)
  const brands         = useBrandStore(s => s.brands)
  const can            = useAuthStore(s => s.can)

  const [editing,     setEditing]     = useState(false)
  const [draft,       setDraft]       = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [view,        setView]        = useState('creator')
  const [selectedIds, setSelectedIds] = useState(new Set())

  const done     = tasks.filter(t => t.status === 'Completed').length
  const inProg   = tasks.filter(t => t.status === 'In Progress').length
  const overdue  = tasks.filter(t => t.status === 'Overdue').length
  const cCount   = new Set(tasks.filter(t => t.creatorId).map(t => t.creatorId)).size
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  function startEdit() {
    setDraft({
      name: campaign.name, description: campaign.description ?? '', status: campaign.status,
      budget: campaign.budget ?? 0, startDate: campaign.startDate ?? '', endDate: campaign.endDate ?? '',
      color: campaign.color, brief: campaign.brief ?? '',
      brandId: campaign.brandId ?? '', brandName: campaign.brandName ?? '',
    })
    setEditing(true)
  }
  function cancelEdit() { setDraft(null); setEditing(false) }

  async function saveEdit() {
    setSaving(true)
    try {
      const brand = brands.find(b => b.id === draft.brandId)
      const patch = { ...draft, brandName: brand?.name ?? '' }
      await updateCampaign(campaign.id, patch)
      showToast(`${draft.name} updated`)
      setEditing(false)
      setDraft(null)
    } finally { setSaving(false) }
  }

  async function handleBulkUpdate(field, value) {
    if (!value) return
    const eligible = field === 'status'
      ? [...selectedIds].filter(id => tasks.find(t => t.id === id)?.status !== 'Completed')
      : [...selectedIds]
    await Promise.all(eligible.map(id => updateTask(id, { [field]: value })))
    setSelectedIds(new Set())
    showToast(`Updated ${eligible.length} task${eligible.length !== 1 ? 's' : ''}`)
  }

  function switchView(v) {
    setView(v)
    setSelectedIds(new Set())
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
          {!editing && can('creators.edit') && (
            <button
              onClick={() => openAddTask({ project: campaign.name })}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-300 hover:bg-violet-600/25 text-[13px] font-semibold transition-all"
            >
              + Add Task
            </button>
          )}
          {can('campaigns.manage') && (
            editing ? (
              <>
                <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
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
                    if (!window.confirm(`Delete campaign "${campaign.name}"? This cannot be undone.`)) return
                    await deleteCampaign(campaign.id)
                    showToast(`${campaign.name} deleted`)
                    onBack()
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/7 hover:border-rose-500/20 text-white/40 hover:text-rose-400 text-[13px] font-semibold transition-all"
                >
                  <Trash2 size={13} />
                </button>
                <button onClick={startEdit} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/7 text-white/60 hover:text-white text-[13px] font-semibold transition-all">
                  <Pencil size={13} /> Edit
                </button>
              </>
            )
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Description</label>
                  <input value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} className={INPUT} placeholder="Campaign description…" />
                </div>
                <div>
                  <label className={LABEL}>Brand <span className="normal-case font-normal text-white/20">(optional)</span></label>
                  <select value={draft.brandId} onChange={e => setDraft(d => ({ ...d, brandId: e.target.value }))} className={INPUT}>
                    <option value="">No brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={LABEL}>Campaign Brief</label>
                <textarea
                  rows={3}
                  value={draft.brief}
                  onChange={e => setDraft(d => ({ ...d, brief: e.target.value }))}
                  className={cn(INPUT, 'resize-none')}
                  placeholder="Describe the campaign objectives, content style, key messages…"
                />
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
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-syne text-[20px] font-extrabold text-white tracking-tight">{campaign.name}</h2>
                    <Badge variant={CAMP_STATUS[campaign.status] ?? 'gray'}>{campaign.status}</Badge>
                  </div>
                  {campaign.description && <p className="text-[13px] text-white/40 mb-3">{campaign.description}</p>}
                  <div className="flex items-center gap-5 text-[12px]">
                    {campaign.brandName && <span className="text-violet-400 font-medium">{campaign.brandName}</span>}
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
              {campaign.brief && (
                <div className="bg-[#16161C] border border-white/7 rounded-[9px] p-3.5 mt-3">
                  <div className="font-mono text-[9px] text-white/25 uppercase tracking-[.06em] mb-1.5">Campaign Brief</div>
                  <p className="text-[12px] text-white/50 leading-relaxed whitespace-pre-wrap">{campaign.brief}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      {!editing && (
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[
            { label: 'Total Tasks', value: tasks.length, cls: 'text-white' },
            { label: 'Completed',   value: done,         cls: 'text-emerald-400' },
            { label: 'In Progress', value: inProg,       cls: 'text-blue-400' },
            { label: 'Overdue',     value: overdue,      cls: overdue > 0 ? 'text-rose-400' : 'text-white' },
            { label: 'Creators',    value: cCount,       cls: 'text-violet-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#1E1E28] border border-white/7 rounded-[12px] p-4 text-center">
              <div className={`font-mono text-[28px] font-bold leading-none ${s.cls}`}>{s.value}</div>
              <div className="text-[10px] text-white/25 mt-1.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-white/40">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        <div className="flex bg-[#16161C] border border-white/7 rounded-lg overflow-hidden p-0.5 gap-0.5">
          {[['creator','⊞ By Creator'],['table','≡ Table'],['kanban','⧉ Kanban']].map(([v, label]) => (
            <button key={v} onClick={() => switchView(v)}
              className={`px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-all ${view===v?'bg-[#1E1E28] text-white':'text-white/30 hover:text-white/60'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* By Creator view */}
      {view === 'creator' && (
        <CreatorView campaign={campaign} tasks={tasks} openEdit={openEdit} openAddTask={openAddTask} canEdit={can('creators.edit')} />
      )}

      {/* Table view */}
      {view === 'table' && (
        <>
          {/* Bulk action bar */}
          {selectedIds.size > 0 && can('creators.edit') && (
            <div className="flex items-center gap-3 mb-3 px-4 py-2.5 bg-violet-600/10 border border-violet-500/20 rounded-[10px]">
              <span className="text-[12px] text-violet-300 font-medium">{selectedIds.size} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                <select defaultValue="" onChange={e => { handleBulkUpdate('status', e.target.value); e.target.value = '' }} className={SEL}>
                  <option value="" disabled>Set Status…</option>
                  {['Not Started','In Progress','Under Review','Completed','Overdue'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select defaultValue="" onChange={e => { handleBulkUpdate('priority', e.target.value); e.target.value = '' }} className={SEL}>
                  <option value="" disabled>Set Priority…</option>
                  {['Low','Medium','High','Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={() => setSelectedIds(new Set())} className="text-[11px] text-white/40 hover:text-white/70 px-2 py-1 rounded-md hover:bg-white/5 transition-all">Clear</button>
              </div>
            </div>
          )}

          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#16161C]">
                  <th className="px-3.5 py-2.5 w-8 border-b border-white/7">
                    {can('creators.edit') && (
                      <input
                        type="checkbox"
                        checked={selectedIds.size === tasks.length && tasks.length > 0}
                        onChange={e => setSelectedIds(e.target.checked ? new Set(tasks.map(t => t.id)) : new Set())}
                        className="accent-violet-500 cursor-pointer"
                      />
                    )}
                  </th>
                  {['Creator','Task / Deliverable','Status','PIC','Due Date','Priority','Coins'].map(h => (
                    <th key={h} className="px-3.5 py-2.5 text-left font-mono text-[10px] font-medium text-white/20 uppercase tracking-[.08em] border-b border-white/7 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr><td colSpan={8} className="px-3.5 py-10 text-center text-[13px] text-white/20">No tasks in this campaign</td></tr>
                ) : tasks.map((t, i) => (
                  <tr key={t.id} className="border-b border-white/7 last:border-0 hover:bg-white/[.025] transition-colors group">
                    <td className="px-3.5 py-3" onClick={e => e.stopPropagation()}>
                      {can('creators.edit') && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(t.id)}
                          onChange={e => setSelectedIds(prev => {
                            const next = new Set(prev)
                            e.target.checked ? next.add(t.id) : next.delete(t.id)
                            return next
                          })}
                          className="accent-violet-500 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="px-3.5 py-3 cursor-pointer" onClick={() => openEdit(t.id)}>
                      <div className="flex items-center gap-2">
                        <Avatar initials={(t.creatorName||'?').split(' ').map(n=>n[0]).join('').slice(0,2)} color={AV_COLORS[i % AV_COLORS.length]} size="sm" />
                        <div>
                          <div className="text-[13px] font-medium text-white">{t.creatorName || 'Unassigned'}</div>
                          <div className="text-[11px] text-white/30">{t.platform || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-[13px] text-white/70 cursor-pointer" onClick={() => openEdit(t.id)}>{t.task}</td>
                    <td className="px-3.5 py-3 cursor-pointer" onClick={() => openEdit(t.id)}><Badge variant={TASK_STATUS[t.status]}>{t.status}</Badge></td>
                    <td className="px-3.5 py-3 text-[12px] text-white/40 cursor-pointer" onClick={() => openEdit(t.id)}>{t.pic}</td>
                    <td className={`px-3.5 py-3 font-mono text-[11px] cursor-pointer ${t.status==='Overdue'?'text-rose-400 font-semibold':'text-white/30'}`} onClick={() => openEdit(t.id)}>{t.dueDate}</td>
                    <td className="px-3.5 py-3 cursor-pointer" onClick={() => openEdit(t.id)}><span className="flex items-center gap-1.5 text-[12px] text-white/40"><span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority]}`} />{t.priority}</span></td>
                    <td className={`px-3.5 py-3 font-mono text-[12px] cursor-pointer ${t.status==='Completed'?'text-emerald-400 font-medium':'text-white/30'}`} onClick={() => openEdit(t.id)}>{t.status==='Completed'?`+${t.coins}`:t.coins}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Kanban view */}
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
                {colTasks.map(t => (
                  <div key={t.id} onClick={() => openEdit(t.id)} className={`bg-[#1E1E28] border rounded-[9px] p-3 mb-2 last:mb-0 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,.3)] transition-all ${col==='Overdue'?'border-rose-500/30':'border-white/7 hover:border-violet-500/40'}`}>
                    <div className="text-[12px] font-medium text-white mb-1.5 leading-snug">{t.task}</div>
                    <div className="text-[11px] text-white/30 mb-2">{t.creatorName || 'Unassigned'} · {t.platform || '—'}</div>
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
  const campaigns    = useCampaignStore(s => s.campaigns)
  const tasks        = useTaskStore(s => s.tasks)
  const openEdit     = useUIStore(s => s.openEditTask)
  const openAddTask  = useUIStore(s => s.openAddTask)
  const globalSearch = useUIStore(s => s.globalSearch)
  const location     = useLocation()
  const [selected, setSelected]         = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    const id = location.state?.campaignId
    if (id) setSelected(id)
  }, [location.state])

  const campaign = campaigns.find(c => c.id === selected)

  const filteredCampaigns = useMemo(() => {
    let list = filterStatus === 'All' ? campaigns : campaigns.filter(c => c.status === filterStatus)
    if (globalSearch) {
      const q = globalSearch.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.brandName && c.brandName.toLowerCase().includes(q))
      )
    }
    return list
  }, [campaigns, filterStatus, globalSearch])

  if (selected && campaign) {
    return (
      <CampaignDetail
        campaign={campaign}
        tasks={tasks.filter(t => t.project === campaign.name)}
        onBack={() => setSelected(null)}
        openEdit={openEdit}
        openAddTask={openAddTask}
      />
    )
  }

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Campaigns</h1>
          <p className="text-[12px] text-white/30 mt-1">
            {filteredCampaigns.length}{filteredCampaigns.length !== campaigns.length ? ` of ${campaigns.length}` : ''} campaigns · {tasks.length} tasks total
          </p>
        </div>
        <div className="flex bg-[#16161C] border border-white/7 rounded-lg overflow-hidden p-0.5 gap-0.5">
          {['All','Active','Planning','Completed','On Hold'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${filterStatus===s?'bg-[#1E1E28] text-white':'text-white/30 hover:text-white/60'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-white/20 text-[14px]">No campaigns match this filter</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredCampaigns.map(c => (
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
