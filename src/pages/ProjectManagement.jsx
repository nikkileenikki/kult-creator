import { useState, useMemo } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useCreatorStore } from '@/store/creatorStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import Badge from '@/components/shared/Badge'
import { Kanban, List, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const TASK_STATUS  = { 'In Progress':'blue', 'Under Review':'amber', 'Completed':'green', 'Overdue':'red', 'Not Started':'gray' }
const PRIORITY_DOT = { Urgent:'bg-rose-400 shadow-[0_0_4px_rgba(248,113,113,.5)]', High:'bg-orange-400', Medium:'bg-amber-400', Low:'bg-emerald-400' }
const PRIORITY_TEXT = { Urgent:'text-rose-400', High:'text-orange-400', Medium:'text-amber-400', Low:'text-emerald-400' }
const KANBAN_COLS  = ['Not Started', 'In Progress', 'Under Review', 'Overdue', 'Completed']
const KANBAN_HEADER = {
  'Not Started':  'text-white/40 border-white/10',
  'In Progress':  'text-blue-400 border-blue-500/30',
  'Under Review': 'text-amber-400 border-amber-500/30',
  'Overdue':      'text-rose-400 border-rose-500/30',
  'Completed':    'text-emerald-400 border-emerald-500/30',
}

const SEL = 'bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2 text-[12px] text-white/60 outline-none hover:border-white/15 focus:border-violet-500/40 cursor-pointer transition-all'

function StatCard({ label, value, color }) {
  return (
    <div className="bg-[#1E1E28] border border-white/7 rounded-xl px-4 py-3 flex items-center gap-3">
      <div className={`w-2 h-8 rounded-full flex-shrink-0 ${color}`} />
      <div>
        <div className="font-syne text-[22px] font-bold text-white leading-none">{value}</div>
        <div className="text-[11px] text-white/30 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

export default function ProjectManagement() {
  const tasks     = useTaskStore(s => s.tasks)
  const campaigns = useCampaignStore(s => s.campaigns)
  const creators  = useCreatorStore(s => s.creators)
  const openEdit  = useUIStore(s => s.openEditTask)
  const openAdd   = useUIStore(s => s.openAddTask)
  const canEdit   = useAuthStore(s => s.can('creators.edit'))

  const [view,        setView]        = useState('list')
  const [search,      setSearch]      = useState('')
  const [filterCamp,  setFilterCamp]  = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterCreator, setFilterCreator] = useState('')
  const [sortBy,      setSortBy]      = useState('dueDate')
  const [sortDir,     setSortDir]     = useState('asc')

  const filtered = useMemo(() => {
    let list = tasks.filter(t => {
      if (filterCamp     && t.project !== filterCamp)    return false
      if (filterStatus   && t.status !== filterStatus)   return false
      if (filterPriority && t.priority !== filterPriority) return false
      if (filterCreator  && t.creatorId !== filterCreator) return false
      if (search) {
        const q = search.toLowerCase()
        if (!t.task.toLowerCase().includes(q) &&
            !(t.creatorName ?? '').toLowerCase().includes(q) &&
            !(t.description ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      let av = a[sortBy] ?? '', bv = b[sortBy] ?? ''
      if (sortBy === 'coins') { av = Number(av); bv = Number(bv) }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [tasks, filterCamp, filterStatus, filterPriority, filterCreator, search, sortBy, sortDir])

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const stats = useMemo(() => ({
    total:      tasks.length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    overdue:    tasks.filter(t => t.status === 'Overdue').length,
    completed:  tasks.filter(t => t.status === 'Completed').length,
    notStarted: tasks.filter(t => t.status === 'Not Started').length,
  }), [tasks])

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span className="text-white/15 ml-1">↕</span>
    return <span className="text-violet-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syne text-[22px] font-bold text-white">Project Management</h1>
          <p className="text-[13px] text-white/30 mt-0.5">All tasks across campaigns and creators</p>
        </div>
        {canEdit && (
          <button
            onClick={() => openAdd()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all shadow-[0_0_16px_rgba(108,92,231,.3)] hover:-translate-y-px"
          >
            <Plus size={14} />
            Add Task
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard label="Total Tasks"  value={stats.total}      color="bg-violet-500" />
        <StatCard label="Not Started"  value={stats.notStarted} color="bg-white/20" />
        <StatCard label="In Progress"  value={stats.inProgress} color="bg-blue-500" />
        <StatCard label="Overdue"      value={stats.overdue}    color="bg-rose-500" />
        <StatCard label="Completed"    value={stats.completed}  color="bg-emerald-500" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="bg-[#1A1A22] border border-white/[0.07] rounded-lg pl-8 pr-3 py-2 text-[12px] text-white placeholder:text-white/25 outline-none focus:border-violet-500/40 transition-all w-44"
          />
        </div>

        <select value={filterCamp} onChange={e => setFilterCamp(e.target.value)} className={SEL}>
          <option value="">All Campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={SEL}>
          <option value="">All Statuses</option>
          {['Not Started','In Progress','Under Review','Completed','Overdue'].map(s => <option key={s}>{s}</option>)}
        </select>

        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={SEL}>
          <option value="">All Priorities</option>
          {['Urgent','High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
        </select>

        <select value={filterCreator} onChange={e => setFilterCreator(e.target.value)} className={SEL}>
          <option value="">All Creators</option>
          {creators.filter(c => c.status !== 'Rejected').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {(search || filterCamp || filterStatus || filterPriority || filterCreator) && (
          <button
            onClick={() => { setSearch(''); setFilterCamp(''); setFilterStatus(''); setFilterPriority(''); setFilterCreator('') }}
            className="text-[11px] text-white/30 hover:text-white/60 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-1 bg-[#1A1A22] border border-white/[0.07] rounded-lg p-1">
          <button
            onClick={() => setView('list')}
            className={cn('p-1.5 rounded-md transition-all', view === 'list' ? 'bg-violet-600/20 text-violet-300' : 'text-white/30 hover:text-white/60')}
            title="List view"
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setView('kanban')}
            className={cn('p-1.5 rounded-md transition-all', view === 'kanban' ? 'bg-violet-600/20 text-violet-300' : 'text-white/30 hover:text-white/60')}
            title="Kanban view"
          >
            <Kanban size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-white/20">
          <SlidersHorizontal size={28} className="mb-3 opacity-40" />
          <p className="text-[14px]">No tasks match your filters</p>
        </div>
      ) : view === 'list' ? (

        /* ── List View ── */
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[
                  { col: 'task',        label: 'Task' },
                  { col: 'project',     label: 'Campaign' },
                  { col: 'creatorName', label: 'Creator' },
                  { col: 'status',      label: 'Status' },
                  { col: 'priority',    label: 'Priority' },
                  { col: 'dueDate',     label: 'Due Date' },
                  { col: 'coins',       label: 'Coins' },
                ].map(({ col, label }) => (
                  <th
                    key={col}
                    onClick={() => toggleSort(col)}
                    className="px-3.5 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider cursor-pointer hover:text-white/50 transition-colors select-none"
                  >
                    {label}<SortIcon col={col} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr
                  key={t.id}
                  onClick={() => openEdit(t.id)}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[.025] cursor-pointer transition-colors"
                >
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority]}`} />
                      <div>
                        <div className="text-[13px] text-white/80">{t.task}</div>
                        {t.description && <div className="text-[11px] text-white/30 mt-0.5 truncate max-w-[220px]">{t.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 text-[12px] text-white/40">{t.project || '—'}</td>
                  <td className="px-3.5 py-3 text-[12px] text-white/50">{t.creatorName || 'Unassigned'}</td>
                  <td className="px-3.5 py-3"><Badge variant={TASK_STATUS[t.status]}>{t.status}</Badge></td>
                  <td className={`px-3.5 py-3 text-[12px] font-medium ${PRIORITY_TEXT[t.priority]}`}>{t.priority}</td>
                  <td className={`px-3.5 py-3 font-mono text-[11px] ${t.status === 'Overdue' ? 'text-rose-400 font-semibold' : 'text-white/30'}`}>{t.dueDate || '—'}</td>
                  <td className={`px-3.5 py-3 font-mono text-[12px] ${t.status === 'Completed' ? 'text-emerald-400 font-medium' : 'text-white/30'}`}>
                    {t.status === 'Completed' ? `+${t.coins}` : t.coins}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-white/[0.04] text-[11px] text-white/20">
            {filtered.length} task{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

      ) : (

        /* ── Kanban View ── */
        <div className="flex gap-3 overflow-x-auto pb-2">
          {KANBAN_COLS.map(col => {
            const colTasks = filtered.filter(t => t.status === col)
            return (
              <div key={col} className="flex-shrink-0 w-64">
                <div className={`flex items-center justify-between mb-2 px-1 pb-2 border-b ${KANBAN_HEADER[col]}`}>
                  <span className="text-[11px] font-semibold uppercase tracking-wider">{col}</span>
                  <span className="font-mono text-[10px] opacity-60">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => openEdit(t.id)}
                      className={cn(
                        'bg-[#1E1E28] border rounded-[9px] p-3 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,.3)] transition-all',
                        col === 'Overdue' ? 'border-rose-500/30' : 'border-white/7 hover:border-violet-500/40'
                      )}
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${PRIORITY_DOT[t.priority]}`} />
                        <div className="text-[12px] font-medium text-white leading-snug">{t.task}</div>
                      </div>
                      {t.description && <div className="text-[11px] text-white/30 mb-1.5 line-clamp-2 ml-3.5">{t.description}</div>}
                      <div className="text-[11px] text-white/30 mb-2 ml-3.5">{t.creatorName || 'Unassigned'} {t.project ? `· ${t.project}` : ''}</div>
                      <div className="flex items-center justify-between ml-3.5">
                        <span className={`font-mono text-[10px] ${col === 'Overdue' ? 'text-rose-400 font-semibold' : 'text-white/25'}`}>{t.dueDate || '—'}</span>
                        <span className={`font-mono text-[10px] ${col === 'Completed' ? 'text-emerald-400' : 'text-white/25'}`}>{t.coins} coins</span>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="text-center text-[11px] text-white/15 py-6 border border-dashed border-white/5 rounded-lg">Empty</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
