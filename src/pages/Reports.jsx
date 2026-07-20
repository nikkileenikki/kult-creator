import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { useTaskStore } from '@/store/taskStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useRecruitStore } from '@/store/recruitStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { request } from '@/lib/api'
import { STATUS_COLOR, PLATFORM_COLOR, OTHER_COLOR, categoricalColor } from '@/lib/reportColors'
import { rowsToCSV, downloadCSV } from '@/lib/csv'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts'
import {
  Download, TrendingUp, Users, FolderOpen, AlertTriangle, ListTodo, UserPlus,
  CircleDot, AlertCircle, Circle, CheckCircle2, Trophy, Briefcase, Smartphone, Tags, GitBranch,
  Zap, Clock, Activity, LayoutGrid, ChevronDown, Filter, FileSpreadsheet,
} from 'lucide-react'

const CATEGORIES = [
  { key: 'campaigns',   label: 'Campaigns' },
  { key: 'creators',    label: 'Creators' },
  { key: 'tasks',       label: 'Tasks' },
  { key: 'brands',      label: 'Brands' },
  { key: 'pic',         label: 'PIC Workload' },
  { key: 'recruitment', label: 'Recruitment' },
]

const EXPORT_SECTIONS = [
  { key: 'overview', label: 'Overview & Velocity' },
  ...CATEGORIES,
  { key: 'overdue', label: 'Overdue Tasks' },
]

function formatDuration(hours) {
  if (hours == null) return '—'
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours < 24) return `${hours.toFixed(1)}h`
  return `${(hours / 24).toFixed(1)}d`
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Date range ───────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [
  { key: 'all',    label: 'All Time' },
  { key: 'month',  label: 'This Month' },
  { key: '30',     label: 'Last 30 Days' },
  { key: '90',     label: 'Last 90 Days' },
  { key: 'custom', label: 'Custom' },
]

const DEFAULT_RANGE = { preset: 'all', start: '', end: '' }

function getRangeBounds({ preset, start: customStart, end: customEnd }) {
  if (preset === 'all') return null
  if (preset === 'custom') {
    if (!customStart || !customEnd) return null
    const start = new Date(customStart); start.setHours(0, 0, 0, 0)
    const end   = new Date(customEnd);   end.setHours(23, 59, 59, 999)
    return { start, end }
  }
  const end = new Date(); end.setHours(23, 59, 59, 999)
  let start
  if (preset === 'month') start = new Date(end.getFullYear(), end.getMonth(), 1)
  else { start = new Date(end); start.setDate(start.getDate() - Number(preset)) }
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

function inRange(dateStr, bounds) {
  if (!bounds) return true
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (isNaN(d)) return false
  return d >= bounds.start && d <= bounds.end
}

const STATUS_ORDER = ['Not Started', 'In Progress', 'Under Review', 'Completed', 'Overdue']
const STATUS_ICON  = { 'Not Started': Circle, 'In Progress': CircleDot, 'Under Review': AlertCircle, 'Completed': CheckCircle2, 'Overdue': AlertTriangle }
const PLATFORM_ORDER = ['TikTok', 'Instagram', 'YouTube', 'X / Twitter', 'LinkedIn']

function daysOverdue(dueDate) {
  const d = new Date(dueDate), now = new Date()
  return Math.max(0, Math.round((now - d) / 86400000))
}

// ── Pure report data builder — used for both the on-screen view and export,
//    over whichever creators/tasks/campaigns/requests have already been
//    scoped by the campaign/brand/creator filters ───────────────────────────

function buildReportData(bounds, { creators, tasks, campaigns, requests }) {
  const filteredTasks    = tasks.filter(t => inRange(t.dueDate, bounds))
  const filteredRequests = requests.filter(r => inRange(r.appliedDate, bounds))

  const totalInPeriod     = filteredTasks.length
  const completedInPeriod = filteredTasks.filter(t => t.status === 'Completed').length
  const completionRate    = totalInPeriod ? Math.round((completedInPeriod / totalInPeriod) * 100) : 0
  const pendingRecruitsInPeriod = filteredRequests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length

  const campaignPerf = campaigns.map(c => {
    const cTasks = filteredTasks.filter(t => t.project === c.name)
    const completed = cTasks.filter(t => t.status === 'Completed').length
    const overdue    = cTasks.filter(t => t.status === 'Overdue').length
    return { ...c, totalTasks: cTasks.length, completed, overdue, completionRate: cTasks.length ? Math.round((completed / cTasks.length) * 100) : 0 }
  }).sort((a, b) => b.totalTasks - a.totalTasks)

  const creatorPerf = creators.map(c => {
    const cTasks    = filteredTasks.filter(t => t.creatorId === c.id)
    const completed = cTasks.filter(t => t.status === 'Completed')
    const rated     = completed.filter(t => t.rating > 0)
    return {
      ...c,
      assigned:       cTasks.length,
      completed:      completed.length,
      underReview:    cTasks.filter(t => t.status === 'Under Review').length,
      completionRate: cTasks.length ? Math.round((completed.length / cTasks.length) * 100) : 0,
      avgRating:      rated.length ? rated.reduce((s, t) => s + t.rating, 0) / rated.length : 0,
      coinsEarned:    completed.reduce((s, t) => s + (t.coins || 0), 0),
    }
  }).filter(c => c.assigned > 0).sort((a, b) => b.completed - a.completed || b.assigned - a.assigned)

  const byBrand = new Map()
  for (const c of campaigns) {
    const key = c.brandName || 'Unassigned'
    if (!byBrand.has(key)) byBrand.set(key, [])
    byBrand.get(key).push(c)
  }
  const brandPerf = [...byBrand.entries()].map(([brandName, camps]) => {
    const campNames = camps.map(c => c.name)
    const bTasks    = filteredTasks.filter(t => campNames.includes(t.project))
    const completed = bTasks.filter(t => t.status === 'Completed').length
    const budget    = camps.reduce((s, c) => s + (c.budget || 0), 0)
    return {
      brandName, campaignCount: camps.length, totalTasks: bTasks.length, completed,
      completionRate: bTasks.length ? Math.round((completed / bTasks.length) * 100) : 0, budget,
    }
  }).sort((a, b) => b.totalTasks - a.totalTasks)

  const pics = new Set([
    ...creators.map(c => c.pic).filter(Boolean),
    ...tasks.map(t => t.pic).filter(Boolean),
    ...requests.map(r => r.pic).filter(Boolean),
  ])
  const picWorkload = [...pics].map(pic => {
    const pTasks    = filteredTasks.filter(t => t.pic === pic)
    const completed = pTasks.filter(t => t.status === 'Completed').length
    return {
      pic,
      creatorsManaged: creators.filter(c => c.pic === pic).length,
      tasksAssigned:   pTasks.length,
      tasksCompleted:  completed,
      completionRate:  pTasks.length ? Math.round((completed / pTasks.length) * 100) : 0,
      recruitsHandled: filteredRequests.filter(r => r.pic === pic).length,
    }
  }).sort((a, b) => b.tasksAssigned - a.tasksAssigned)

  const pipelineStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected']
  const pipelineData = pipelineStatuses.map(status => ({
    name: status, count: filteredRequests.filter(r => r.status === status).length,
  }))

  const sourceMap = new Map()
  for (const r of filteredRequests) {
    const key = r.source || 'Unspecified'
    if (!sourceMap.has(key)) sourceMap.set(key, { source: key, total: 0, approved: 0 })
    const entry = sourceMap.get(key)
    entry.total++
    if (r.status === 'Approved') entry.approved++
  }
  const sourceEffectiveness = [...sourceMap.values()]
    .map(e => ({ ...e, approvalRate: e.total ? Math.round((e.approved / e.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total)

  return {
    filteredTasks, filteredRequests, totalInPeriod, completedInPeriod, completionRate, pendingRecruitsInPeriod,
    campaignPerf, creatorPerf, brandPerf, picWorkload, pipelineData, sourceEffectiveness,
  }
}

function sectionCSV(title, rows, columns) {
  if (!rows.length) return `${title}\nNo data`
  return `${title}\n${rowsToCSV(rows, columns)}`
}

function buildCsvSections(data, taskTimeline) {
  return {
    campaigns: () => [
      sectionCSV('CAMPAIGN PERFORMANCE', data.campaignPerf, [
        { key: 'name', label: 'Campaign' }, { key: 'brandName', label: 'Brand' }, { key: 'status', label: 'Status' },
        { key: 'startDate', label: 'Start Date' }, { key: 'endDate', label: 'End Date' },
        { key: 'totalTasks', label: 'Total Tasks' }, { key: 'completed', label: 'Completed' }, { key: 'overdue', label: 'Overdue' },
        { key: 'completionRate', label: 'Completion %' }, { key: 'budget', label: 'Budget' },
      ]),
      sectionCSV('CAMPAIGN TASK DETAIL', data.filteredTasks.map(t => ({
        ...t,
        assignedAt:  fmtDate(taskTimeline?.[t.id]?.assignedAt),
        submittedAt: fmtDate(taskTimeline?.[t.id]?.submittedAt),
        completedAt: fmtDate(taskTimeline?.[t.id]?.completedAt),
      })), [
        { key: 'project', label: 'Campaign' }, { key: 'task', label: 'Task' }, { key: 'creatorName', label: 'Creator' }, { key: 'pic', label: 'PIC' },
        { key: 'status', label: 'Status' }, { key: 'priority', label: 'Priority' }, { key: 'dueDate', label: 'Due Date' },
        { key: 'assignedAt', label: 'Assigned' }, { key: 'submittedAt', label: 'Submitted' }, { key: 'completedAt', label: 'Completed' },
      ]),
    ].join('\n\n'),
    creators: () => sectionCSV('CREATOR PERFORMANCE', data.creatorPerf, [
      { key: 'name', label: 'Creator' }, { key: 'platform', label: 'Platform' },
      { key: 'assigned', label: 'Assigned' }, { key: 'completed', label: 'Completed' }, { key: 'underReview', label: 'Under Review' },
      { key: 'completionRate', label: 'Completion %' }, { key: 'avgRating', label: 'Avg Rating' }, { key: 'coinsEarned', label: 'Coins Earned' },
    ]),
    tasks: () => sectionCSV('TASK DETAIL', data.filteredTasks.map(t => ({
      ...t,
      assignedAt:   fmtDate(taskTimeline?.[t.id]?.assignedAt),
      submittedAt:  fmtDate(taskTimeline?.[t.id]?.submittedAt),
      completedAt:  fmtDate(taskTimeline?.[t.id]?.completedAt),
    })), [
      { key: 'task', label: 'Task' }, { key: 'project', label: 'Campaign' }, { key: 'creatorName', label: 'Creator' }, { key: 'pic', label: 'PIC' },
      { key: 'status', label: 'Status' }, { key: 'dueDate', label: 'Due Date' },
      { key: 'assignedAt', label: 'Assigned' }, { key: 'submittedAt', label: 'Submitted' }, { key: 'completedAt', label: 'Completed' },
    ]),
    brands: () => sectionCSV('BRAND PERFORMANCE', data.brandPerf, [
      { key: 'brandName', label: 'Brand' }, { key: 'campaignCount', label: 'Campaigns' },
      { key: 'totalTasks', label: 'Total Tasks' }, { key: 'completed', label: 'Completed' },
      { key: 'completionRate', label: 'Completion %' }, { key: 'budget', label: 'Budget' },
    ]),
    pic: () => sectionCSV('PIC WORKLOAD', data.picWorkload, [
      { key: 'pic', label: 'PIC' }, { key: 'creatorsManaged', label: 'Creators Managed' },
      { key: 'tasksAssigned', label: 'Tasks Assigned' }, { key: 'tasksCompleted', label: 'Tasks Completed' },
      { key: 'completionRate', label: 'Completion %' }, { key: 'recruitsHandled', label: 'Recruits Handled' },
    ]),
    recruitment: () => [
      sectionCSV('RECRUITMENT PIPELINE', data.pipelineData, [{ key: 'name', label: 'Status' }, { key: 'count', label: 'Count' }]),
      sectionCSV('RECRUITMENT SOURCE EFFECTIVENESS', data.sourceEffectiveness, [
        { key: 'source', label: 'Source' }, { key: 'total', label: 'Total' }, { key: 'approved', label: 'Approved' }, { key: 'approvalRate', label: 'Approval %' },
      ]),
    ].join('\n\n'),
  }
}

// ── Shared bits ──────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#16161C] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      {label && <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px]">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.payload?.fill ?? p.color }} />
          <span className="text-white font-semibold">{p.value}</span>
          <span className="text-white/40">{p.name}</span>
        </div>
      ))}
    </div>
  )
}

function Card({ title, icon: Icon, action, children, className }) {
  return (
    <div className={cn('bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden', className)}>
      <div className="px-5 py-3.5 border-b border-white/7 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={12} className="text-white/25" />}
          <span className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em]">{title}</span>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function KpiTile({ icon: Icon, label, value, caption, iconBg }) {
  return (
    <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[16px] hover:-translate-y-0.5 hover:border-white/12 transition-all">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
        <Icon size={13} strokeWidth={2} />
      </div>
      <div className="font-syne text-[24px] font-extrabold text-white leading-none tracking-tight">{value}</div>
      <div className="text-[10px] text-white/30 font-medium uppercase tracking-[.05em] mt-1.5">{label}</div>
      {caption && <div className="text-[10px] text-white/25 mt-1.5">{caption}</div>}
    </div>
  )
}

function EmptyState({ children }) {
  return <div className="flex items-center justify-center h-[180px] text-white/20 text-[13px]">{children}</div>
}

function truncateLabel(str, max = 16) {
  if (!str) return ''
  return str.length > max ? `${str.slice(0, max - 1)}…` : str
}

function CategoryTick({ x, y, payload }) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#c3c2b7" fontSize={11}>
      {truncateLabel(payload.value)}
    </text>
  )
}

function DistributionBar({ data, colorFor }) {
  if (data.length === 0) return <EmptyState>No data in this period</EmptyState>
  return (
    <ResponsiveContainer width="100%" height={Math.max(140, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 28, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#2c2c2a" />
        <XAxis type="number" tick={{ fill: '#898781', fontSize: 10 }} axisLine={{ stroke: '#383835' }} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={<CategoryTick />} axisLine={false} tickLine={false} width={110} interval={0} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((d, i) => <Cell key={d.name} fill={colorFor(d, i)} />)}
          <LabelList dataKey="count" position="right" fill="#c3c2b7" fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function StatusDonut({ tasks }) {
  const total = tasks.length
  const data = STATUS_ORDER
    .map(status => ({ status, count: tasks.filter(t => t.status === status).length }))
    .filter(d => d.count > 0)

  if (total === 0) return <EmptyState>No tasks in this period</EmptyState>

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-[170px] h-[170px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={52} outerRadius={78} paddingAngle={2} strokeWidth={0}>
              {data.map(d => <Cell key={d.status} fill={STATUS_COLOR[d.status]} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-syne text-[22px] font-extrabold text-white">{total}</span>
          <span className="text-[9px] text-white/30 font-mono uppercase tracking-wider">Tasks</span>
        </div>
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        {data.map(d => {
          const Icon = STATUS_ICON[d.status]
          const pct = total ? Math.round((d.count / total) * 100) : 0
          return (
            <div key={d.status} className="flex items-center gap-2 text-[12px]">
              <Icon size={12} style={{ color: STATUS_COLOR[d.status] }} className="flex-shrink-0" />
              <span className="text-white/60 flex-1 truncate">{d.status}</span>
              <span className="text-white font-semibold font-mono">{d.count}</span>
              <span className="text-white/25 font-mono text-[11px] w-9 text-right">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProgressBar({ pct, color = '#9085e9' }) {
  return (
    <div className="h-1.5 bg-white/6 rounded-full overflow-hidden w-full">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

const DATE_INPUT = 'bg-[#111116] border border-white/10 rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-violet-500/50'
const SELECT = 'bg-[#1A1A22] border border-white/7 rounded-lg px-2.5 py-1.5 text-[11px] text-white/70 focus:outline-none focus:border-violet-500/40 hover:border-white/12 transition-all'

function RangeControl({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-[#1A1A22] border border-white/7 rounded-lg p-1 flex-wrap">
      {RANGE_OPTIONS.map(o => (
        <button
          key={o.key}
          onClick={() => onChange({ ...value, preset: o.key })}
          className={cn(
            'text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-all',
            value.preset === o.key ? 'bg-violet-600/25 text-violet-300' : 'text-white/40 hover:text-white/70',
          )}
        >
          {o.label}
        </button>
      ))}
      {value.preset === 'custom' && (
        <div className="flex items-center gap-1.5 pl-1">
          <input type="date" value={value.start} onChange={e => onChange({ ...value, start: e.target.value })} className={DATE_INPUT} />
          <span className="text-white/20 text-[11px]">to</span>
          <input type="date" value={value.end} onChange={e => onChange({ ...value, end: e.target.value })} className={DATE_INPUT} />
        </div>
      )}
    </div>
  )
}

// ── Export menu ──────────────────────────────────────────────────────────────

function ExportMenu({ defaultRange, onExport }) {
  const [open, setOpen]     = useState(false)
  const [exportRange, setExportRange] = useState(defaultRange)
  const [selected, setSelected] = useState(new Set(EXPORT_SECTIONS.map(s => s.key)))
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function toggleSection(key) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const allSelected = selected.size === EXPORT_SECTIONS.length
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(EXPORT_SECTIONS.map(s => s.key)))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/7 hover:border-white/12 text-white/60 hover:text-white text-[12px] font-medium transition-all"
      >
        <Download size={13} /> Export <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 z-50 w-[300px] bg-[#111116] border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,.6)] p-4 space-y-4 animate-[fadeUp_.15s_ease]">
          <div>
            <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Date Range</div>
            <RangeControl value={exportRange} onChange={setExportRange} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Sections</div>
              <button onClick={toggleAll} className="text-[10px] text-violet-400/70 hover:text-violet-300 transition-colors font-medium">
                {allSelected ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="space-y-1.5">
              {EXPORT_SECTIONS.map(s => (
                <label key={s.key} className="flex items-center gap-2 text-[12px] text-white/70 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={selected.has(s.key)}
                    onChange={() => toggleSection(s.key)}
                    className="accent-violet-500 w-3.5 h-3.5"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => { onExport(exportRange, selected); setOpen(false) }}
            disabled={selected.size === 0}
            className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/30 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-all"
          >
            Generate & Download
          </button>
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Reports() {
  const creators   = useCreatorStore(s => s.creators)
  const tasks      = useTaskStore(s => s.tasks)
  const campaigns  = useCampaignStore(s => s.campaigns)
  const requests   = useRecruitStore(s => s.requests)
  const showToast  = useUIStore(s => s.showToast)

  const [range, setRange] = useState(DEFAULT_RANGE)
  const [showAllCreators, setShowAllCreators] = useState(false)
  const [viewMode, setViewMode] = useState('summary') // 'summary' | 'category'
  const [category, setCategory] = useState('campaigns')
  const [velocity, setVelocity] = useState(null)
  const [recentLog, setRecentLog] = useState([])
  const [taskTimeline, setTaskTimeline] = useState({})

  const [campaignFilter, setCampaignFilter] = useState('all')
  const [brandFilter, setBrandFilter]       = useState('all')
  const [creatorFilter, setCreatorFilter]   = useState('all')
  const [picFilter, setPicFilter]           = useState('all')

  const bounds = useMemo(() => getRangeBounds(range), [range])

  useEffect(() => {
    request('GET', '/analytics/velocity').then(setVelocity).catch(() => {})
    request('GET', '/analytics/log?limit=15').then(setRecentLog).catch(() => {})
    request('GET', '/analytics/task-timeline').then(setTaskTimeline).catch(() => {})
  }, [])

  const brandOptions = useMemo(() => [...new Set(campaigns.map(c => c.brandName).filter(Boolean))].sort(), [campaigns])
  const picOptions = useMemo(() => [...new Set([
    ...creators.map(c => c.pic).filter(Boolean),
    ...tasks.map(t => t.pic).filter(Boolean),
    ...requests.map(r => r.pic).filter(Boolean),
  ])].sort(), [creators, tasks, requests])

  // ── Entity filters — campaign/brand/creator/PIC all combine with AND semantics,
  //    and cascade through every section (charts, KPIs, tables, export)
  const scopedCampaigns = useMemo(() => campaigns.filter(c =>
    (brandFilter === 'all' || c.brandName === brandFilter) &&
    (campaignFilter === 'all' || c.id === campaignFilter),
  ), [campaigns, brandFilter, campaignFilter])

  const scopedCampaignNames = useMemo(() => new Set(scopedCampaigns.map(c => c.name)), [scopedCampaigns])

  const scopedTasks = useMemo(() => tasks.filter(t =>
    scopedCampaignNames.has(t.project) &&
    (creatorFilter === 'all' || t.creatorId === creatorFilter) &&
    (picFilter === 'all' || t.pic === picFilter),
  ), [tasks, scopedCampaignNames, creatorFilter, picFilter])

  const scopedRequests = useMemo(() => requests.filter(r =>
    picFilter === 'all' || r.pic === picFilter,
  ), [requests, picFilter])

  const scopedCreators = useMemo(() => creators.filter(c => {
    if (creatorFilter !== 'all' && c.id !== creatorFilter) return false
    if (picFilter !== 'all' && c.pic !== picFilter) return false
    if (campaignFilter !== 'all' || brandFilter !== 'all') {
      const hasTaskInScope = tasks.some(t => scopedCampaignNames.has(t.project) && t.creatorId === c.id)
      if (!hasTaskInScope) return false
    }
    return true
  }), [creators, tasks, scopedCampaignNames, campaignFilter, brandFilter, creatorFilter, picFilter])

  const hasEntityFilter = campaignFilter !== 'all' || brandFilter !== 'all' || creatorFilter !== 'all' || picFilter !== 'all'

  const data = useMemo(
    () => buildReportData(bounds, { creators: scopedCreators, tasks: scopedTasks, campaigns: scopedCampaigns, requests: scopedRequests }),
    [bounds, scopedCreators, scopedTasks, scopedCampaigns, scopedRequests],
  )

  // Overview (state gauges, scoped by entity filters but not the date range)
  const activeCreatorsCount  = scopedCreators.filter(c => c.status === 'Active').length
  const activeCampaignsCount = scopedCampaigns.filter(c => c.status === 'Active').length
  const overdueNow           = scopedTasks.filter(t => t.status === 'Overdue').length

  // Distributions
  const taskPlatformData = useMemo(() => PLATFORM_ORDER
    .map(name => ({ name, count: data.filteredTasks.filter(t => t.platform === name).length }))
    .filter(d => d.count > 0), [data.filteredTasks])

  const creatorPlatformData = useMemo(() => PLATFORM_ORDER
    .map(name => ({ name, count: scopedCreators.filter(c => c.platform === name).length }))
    .filter(d => d.count > 0), [scopedCreators])

  const nicheData = useMemo(() => {
    const map = new Map()
    for (const c of scopedCreators) {
      const key = c.niche || 'Unspecified'
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])
    const top  = sorted.slice(0, 6).map(([name, count]) => ({ name, count }))
    const rest = sorted.slice(6).reduce((sum, [, n]) => sum + n, 0)
    if (rest > 0) top.push({ name: 'Other', count: rest })
    return top
  }, [scopedCreators])

  const visibleCreatorPerf = showAllCreators ? data.creatorPerf : data.creatorPerf.slice(0, 10)

  // Overdue tasks — always current (not date-filtered), but respects entity filters
  const overdueTasks = useMemo(() =>
    scopedTasks.filter(t => t.status === 'Overdue').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
  [scopedTasks])

  function handleExportAll(exportRange, selectedKeys) {
    const exportBounds = getRangeBounds(exportRange)
    const exportData   = buildReportData(exportBounds, { creators: scopedCreators, tasks: scopedTasks, campaigns: scopedCampaigns, requests: scopedRequests })
    const csv          = buildCsvSections(exportData, taskTimeline)
    const dateSuffix    = new Date().toISOString().slice(0, 10)

    const parts = []
    if (selectedKeys.has('overview')) {
      parts.push(sectionCSV('OVERVIEW', [
        { label: 'Active Creators', value: activeCreatorsCount },
        { label: 'Active Campaigns', value: activeCampaignsCount },
        { label: 'Overdue Tasks (now)', value: overdueNow },
        { label: 'Tasks in Period', value: exportData.totalInPeriod },
        { label: 'Completed in Period', value: exportData.completedInPeriod },
        { label: 'Completion Rate', value: `${exportData.completionRate}%` },
        { label: 'Pending Recruits in Period', value: exportData.pendingRecruitsInPeriod },
        { label: 'Completed (Last 7 Days)', value: velocity?.completedLast7 ?? '—' },
        { label: 'Completed (Last 30 Days)', value: velocity?.completedLast30 ?? '—' },
        { label: 'Avg Task Completion Time', value: formatDuration(velocity?.avgCompletionHours) },
        { label: 'Avg Recruit Approval Time', value: formatDuration(velocity?.avgApprovalHours) },
      ], [{ key: 'label', label: 'Metric' }, { key: 'value', label: 'Value' }]))
    }
    if (selectedKeys.has('campaigns'))   parts.push(csv.campaigns())
    if (selectedKeys.has('creators'))    parts.push(csv.creators())
    if (selectedKeys.has('tasks'))       parts.push(csv.tasks())
    if (selectedKeys.has('brands'))      parts.push(csv.brands())
    if (selectedKeys.has('pic'))         parts.push(csv.pic())
    if (selectedKeys.has('recruitment')) parts.push(csv.recruitment())
    if (selectedKeys.has('overdue')) {
      parts.push(sectionCSV('OVERDUE TASKS (current)', overdueTasks.map(t => ({ ...t, daysOverdue: daysOverdue(t.dueDate) })), [
        { key: 'task', label: 'Task' }, { key: 'project', label: 'Campaign' }, { key: 'creatorName', label: 'Creator' },
        { key: 'pic', label: 'PIC' }, { key: 'dueDate', label: 'Due Date' }, { key: 'daysOverdue', label: 'Days Overdue' },
      ]))
    }

    if (parts.length === 0) { showToast('Select at least one section to export', 'error'); return }
    downloadCSV(`kult-creator-report-${dateSuffix}.csv`, parts.join('\n\n'))
    showToast('Report downloaded')
  }

  // ── Section content (reused for both summary and category views) ──────────

  const campaignSection = (
    <Card title="Campaign Performance" icon={FolderOpen}>
      {data.campaignPerf.length === 0 ? <EmptyState>No campaigns yet</EmptyState> : (
        <div className={cn('overflow-y-auto -mx-5 -mb-5', viewMode === 'category' ? 'max-h-[560px]' : 'max-h-[360px]')}>
          <table className="w-full">
            <thead className="sticky top-0 bg-[#1E1E28]">
              <tr>
                {['Campaign', 'Brand', 'Status', 'Start', 'End', 'Tasks', 'Completed', 'Overdue', 'Completion', 'Budget'].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left font-mono text-[10px] font-medium text-white/20 uppercase tracking-[.08em] border-b border-white/7 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.campaignPerf.map(c => (
                <tr key={c.id} className="border-b border-white/7 last:border-0 hover:bg-white/[.02] transition-colors">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-[12px] text-white/80">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-[12px] text-white/40">{c.brandName || '—'}</td>
                  <td className="px-5 py-2.5 text-[11px] text-white/40">{c.status}</td>
                  <td className="px-5 py-2.5 font-mono text-[11px] text-white/40 whitespace-nowrap">{c.startDate || '—'}</td>
                  <td className="px-5 py-2.5 font-mono text-[11px] text-white/40 whitespace-nowrap">{c.endDate || '—'}</td>
                  <td className="px-5 py-2.5 font-mono text-[12px] text-white/60">{c.totalTasks}</td>
                  <td className="px-5 py-2.5 font-mono text-[12px] text-emerald-400">{c.completed}</td>
                  <td className="px-5 py-2.5 font-mono text-[12px]">{c.overdue > 0 ? <span className="text-rose-400">{c.overdue}</span> : <span className="text-white/20">0</span>}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2 w-28">
                      <ProgressBar pct={c.completionRate} color={c.color} />
                      <span className="font-mono text-[11px] text-white/40 w-8 text-right flex-shrink-0">{c.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-[12px] text-white/40">{c.budget ? `RM ${c.budget.toLocaleString()}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )

  const creatorSection = (
    <Card
      title="Creator Leaderboard"
      icon={Trophy}
      action={data.creatorPerf.length > 10 && (
        <button onClick={() => setShowAllCreators(v => !v)} className="text-[11px] text-violet-400/70 hover:text-violet-300 transition-colors font-medium">
          {showAllCreators ? 'Show top 10' : `Show all (${data.creatorPerf.length})`}
        </button>
      )}
    >
      {visibleCreatorPerf.length === 0 ? <EmptyState>No assigned tasks in this period</EmptyState> : (
        <div className={cn('space-y-1.5 overflow-y-auto pr-1', viewMode === 'category' ? 'max-h-[560px]' : 'max-h-[360px]')}>
          {visibleCreatorPerf.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[.03] transition-colors">
              <span className="w-5 text-center font-mono text-[11px] text-white/25 flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-white truncate">{c.name}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{c.platform} · {c.completed}/{c.assigned} tasks</div>
              </div>
              {c.avgRating > 0 && <span className="flex-shrink-0 text-[11px] font-mono text-amber-300/70">★ {c.avgRating.toFixed(1)}</span>}
              <span className="flex-shrink-0 font-mono text-[12px] text-emerald-400 w-10 text-right">{c.completionRate}%</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )

  const tasksSection = (
    <Card title="Task Detail" icon={ListTodo}>
      {data.filteredTasks.length === 0 ? <EmptyState>No tasks in this period</EmptyState> : (
        <div className={cn('overflow-y-auto -mx-5 -mb-5', viewMode === 'category' ? 'max-h-[560px]' : 'max-h-[360px]')}>
          <table className="w-full">
            <thead className="sticky top-0 bg-[#1E1E28]">
              <tr>
                {['Task', 'Campaign', 'Creator', 'PIC', 'Status', 'Due', 'Assigned', 'Submitted', 'Completed'].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left font-mono text-[10px] font-medium text-white/20 uppercase tracking-[.08em] border-b border-white/7 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.filteredTasks.map(t => {
                const tl = taskTimeline[t.id] ?? {}
                return (
                  <tr key={t.id} className="border-b border-white/7 last:border-0 hover:bg-white/[.02] transition-colors">
                    <td className="px-5 py-2.5 text-[12px] text-white/80 max-w-[220px] truncate">{t.task}</td>
                    <td className="px-5 py-2.5 text-[12px] text-white/40 max-w-[160px] truncate">{t.project}</td>
                    <td className="px-5 py-2.5 text-[12px] text-white/40">{t.creatorName || 'Unassigned'}</td>
                    <td className="px-5 py-2.5 text-[12px] text-white/40">{t.pic || '—'}</td>
                    <td className="px-5 py-2.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ color: STATUS_COLOR[t.status], backgroundColor: `${STATUS_COLOR[t.status]}1a` }}>{t.status}</span>
                    </td>
                    <td className="px-5 py-2.5 font-mono text-[11px] text-white/40 whitespace-nowrap">{t.dueDate || '—'}</td>
                    <td className="px-5 py-2.5 font-mono text-[11px] text-white/40 whitespace-nowrap">{fmtDate(tl.assignedAt)}</td>
                    <td className="px-5 py-2.5 font-mono text-[11px] text-white/40 whitespace-nowrap">{fmtDate(tl.submittedAt)}</td>
                    <td className="px-5 py-2.5 font-mono text-[11px] text-emerald-400/80 whitespace-nowrap">{fmtDate(tl.completedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )

  const brandSection = (
    <Card title="Brand Performance" icon={Briefcase}>
      {data.brandPerf.length === 0 ? <EmptyState>No brands yet</EmptyState> : (
        <div className={cn('space-y-1.5 overflow-y-auto pr-1', viewMode === 'category' ? 'max-h-[560px]' : 'max-h-[360px]')}>
          {data.brandPerf.map(b => (
            <div key={b.brandName} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[.03] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-white truncate">{b.brandName}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{b.campaignCount} campaign{b.campaignCount !== 1 ? 's' : ''} · {b.totalTasks} tasks · RM {b.budget.toLocaleString()}</div>
              </div>
              <span className="flex-shrink-0 font-mono text-[12px] text-emerald-400 w-10 text-right">{b.completionRate}%</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )

  const picSection = (
    <Card title="Staff (PIC) Workload" icon={Users}>
      {data.picWorkload.length === 0 ? <EmptyState>No PICs assigned yet</EmptyState> : (
        <div className={cn('space-y-1.5 overflow-y-auto pr-1', viewMode === 'category' ? 'max-h-[560px]' : 'max-h-[300px]')}>
          {data.picWorkload.map(p => (
            <div key={p.pic} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[.03] transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-white truncate">{p.pic}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{p.creatorsManaged} creators · {p.tasksAssigned} tasks · {p.recruitsHandled} recruits</div>
              </div>
              <span className="flex-shrink-0 font-mono text-[12px] text-white/50 w-10 text-right">{p.completionRate}%</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )

  const recruitmentSection = (
    <Card title="Recruitment Pipeline" icon={GitBranch}>
      <div className="mb-4">
        <DistributionBar
          data={data.pipelineData.filter(d => d.count > 0)}
          colorFor={d => d.name === 'Approved' ? STATUS_COLOR['Completed'] : d.name === 'Rejected' ? STATUS_COLOR['Overdue'] : d.name === 'Under Review' ? STATUS_COLOR['Under Review'] : STATUS_COLOR['Not Started']}
        />
      </div>
      {data.sourceEffectiveness.length > 0 && (
        <div className="border-t border-white/7 pt-3 space-y-1.5">
          <div className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-1.5">Source Effectiveness</div>
          {data.sourceEffectiveness.map(s => (
            <div key={s.source} className="flex items-center gap-3 text-[12px]">
              <span className="flex-1 text-white/60 truncate">{s.source}</span>
              <span className="font-mono text-white/40">{s.approved}/{s.total}</span>
              <span className="font-mono text-emerald-400 w-10 text-right">{s.approvalRate}%</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )

  const CATEGORY_SECTION = {
    campaigns:   campaignSection,
    creators:    creatorSection,
    tasks:       tasksSection,
    brands:      brandSection,
    pic:         picSection,
    recruitment: recruitmentSection,
  }

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Reports</h1>
          <p className="text-[12px] text-white/30 mt-1">Campaign, creator, and pipeline performance</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/reports/templates"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/7 hover:border-white/12 text-white/60 hover:text-white text-[12px] font-medium transition-all"
          >
            <FileSpreadsheet size={13} /> Custom Reports
          </Link>
          <RangeControl value={range} onChange={setRange} />
          <ExportMenu defaultRange={range} onExport={handleExportAll} />
        </div>
      </div>

      {/* Entity filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Filter size={12} className="text-white/25" />
        <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)} className={SELECT}>
          <option value="all">All Campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className={SELECT}>
          <option value="all">All Brands</option>
          {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)} className={SELECT}>
          <option value="all">All Creators</option>
          {creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={picFilter} onChange={e => setPicFilter(e.target.value)} className={SELECT}>
          <option value="all">All PICs</option>
          {picOptions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {hasEntityFilter && (
          <button
            onClick={() => { setCampaignFilter('all'); setBrandFilter('all'); setCreatorFilter('all'); setPicFilter('all') }}
            className="text-[11px] text-violet-400/70 hover:text-violet-300 transition-colors font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* View mode + category selector */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1 bg-[#1A1A22] border border-white/7 rounded-lg p-1">
          <button
            onClick={() => setViewMode('summary')}
            className={cn('flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-all',
              viewMode === 'summary' ? 'bg-violet-600/25 text-violet-300' : 'text-white/40 hover:text-white/70')}
          >
            <LayoutGrid size={12} /> Summary
          </button>
          <button
            onClick={() => setViewMode('category')}
            className={cn('flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-all',
              viewMode === 'category' ? 'bg-violet-600/25 text-violet-300' : 'text-white/40 hover:text-white/70')}
          >
            <FolderOpen size={12} /> By Category
          </button>
        </div>
        {viewMode === 'category' && (
          <div className="flex items-center gap-1 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={cn('text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all',
                  category === c.key ? 'border-violet-500/30 bg-violet-500/10 text-violet-300' : 'border-white/7 text-white/40 hover:text-white/70 hover:border-white/12')}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {viewMode === 'category' ? (
        <div>{CATEGORY_SECTION[category]}</div>
      ) : (
        <>
          {/* Overview KPIs */}
          <div className="grid grid-cols-6 gap-3 mb-3">
            <KpiTile icon={Users}       label="Active Creators"  value={activeCreatorsCount}  caption="Now"                iconBg="bg-violet-400/15 text-violet-300" />
            <KpiTile icon={FolderOpen}  label="Active Campaigns" value={activeCampaignsCount} caption="Now"                iconBg="bg-blue-400/12 text-blue-400" />
            <KpiTile icon={AlertTriangle} label="Overdue"        value={overdueNow}           caption="Now — needs action" iconBg="bg-rose-400/12 text-rose-400" />
            <KpiTile icon={ListTodo}    label="Tasks"             value={data.totalInPeriod}   caption="This period"       iconBg="bg-teal-400/12 text-teal-400" />
            <KpiTile icon={TrendingUp}  label="Completion Rate"   value={`${data.completionRate}%`} caption={`${data.completedInPeriod} completed`} iconBg="bg-emerald-400/12 text-emerald-400" />
            <KpiTile icon={UserPlus}    label="Pending Recruits"  value={data.pendingRecruitsInPeriod} caption="This period" iconBg="bg-amber-400/12 text-amber-300" />
          </div>

          {/* Velocity KPIs */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            <KpiTile icon={Zap}   label="Completed (7d)"  value={velocity?.completedLast7 ?? '—'}  caption="Trailing 7 days"  iconBg="bg-emerald-400/12 text-emerald-400" />
            <KpiTile icon={Zap}   label="Completed (30d)" value={velocity?.completedLast30 ?? '—'} caption="Trailing 30 days" iconBg="bg-emerald-400/12 text-emerald-400" />
            <KpiTile icon={Clock} label="Avg Completion Time" value={formatDuration(velocity?.avgCompletionHours)} caption={`${velocity?.sampleSize?.completions ?? 0} tasks measured`} iconBg="bg-violet-400/15 text-violet-300" />
            <KpiTile icon={Clock} label="Avg Recruit Approval Time" value={formatDuration(velocity?.avgApprovalHours)} caption={`${velocity?.sampleSize?.approvals ?? 0} recruits measured`} iconBg="bg-violet-400/15 text-violet-300" />
          </div>

          {/* Status + distributions */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card title="Task Status" icon={ListTodo}>
              <StatusDonut tasks={data.filteredTasks} />
            </Card>
            <Card title="Tasks by Platform" icon={Smartphone}>
              <DistributionBar data={taskPlatformData} colorFor={d => PLATFORM_COLOR[d.name] ?? OTHER_COLOR} />
            </Card>
            <Card title="Creators by Niche" icon={Tags}>
              <DistributionBar data={nicheData} colorFor={(d, i) => d.name === 'Other' ? OTHER_COLOR : categoricalColor(i)} />
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card title="Creators by Platform" icon={Users}>
              <DistributionBar data={creatorPlatformData} colorFor={d => PLATFORM_COLOR[d.name] ?? OTHER_COLOR} />
            </Card>
            <Card title="Overdue Tasks" icon={AlertTriangle} action={<span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/25">{overdueTasks.length}</span>}>
              {overdueTasks.length === 0 ? (
                <EmptyState>Nothing overdue 🎉</EmptyState>
              ) : (
                <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                  {overdueTasks.map(t => (
                    <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-rose-500/5 border border-rose-500/15">
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-white truncate">{t.task}</div>
                        <div className="text-[10px] text-white/30 mt-0.5 truncate">{t.project} · {t.creatorName || 'Unassigned'} · PIC {t.pic || '—'}</div>
                      </div>
                      <span className="flex-shrink-0 text-[11px] font-mono font-semibold text-rose-300">{daysOverdue(t.dueDate)}d</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="mb-4">{campaignSection}</div>
          <div className="mb-4">{tasksSection}</div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {creatorSection}
            {brandSection}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {picSection}
            {recruitmentSection}
          </div>

          {/* Recent activity */}
          <Card title="Recent Activity" icon={Activity}>
            {recentLog.length === 0 ? <EmptyState>No activity recorded yet</EmptyState> : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {recentLog.map(a => (
                  <div key={a.id} className="flex items-center gap-3 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLOR[a.toStatus] ?? '#71717a' }} />
                    <span className="flex-1 min-w-0 truncate text-white/60">
                      <span className="text-white font-medium">{a.entityName || a.entityType}</span>
                      {' → '}{a.toStatus}
                      {a.actor && <span className="text-white/30"> · {a.actor}</span>}
                    </span>
                    <span className="flex-shrink-0 text-white/25 font-mono text-[10px]">{relativeTime(a.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
