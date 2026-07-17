import { useState, useMemo } from 'react'
import { useCreatorStore } from '@/store/creatorStore'
import { useTaskStore } from '@/store/taskStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useRecruitStore } from '@/store/recruitStore'
import { cn } from '@/lib/utils'
import { STATUS_COLOR, PLATFORM_COLOR, OTHER_COLOR, categoricalColor } from '@/lib/reportColors'
import { rowsToCSV, downloadCSV } from '@/lib/csv'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList,
} from 'recharts'
import {
  Download, TrendingUp, Users, FolderOpen, AlertTriangle, ListTodo, UserPlus,
  CircleDot, AlertCircle, Circle, CheckCircle2, Trophy, Briefcase, Smartphone, Tags, GitBranch,
} from 'lucide-react'

// ── Date range ───────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [
  { key: 'all',   label: 'All Time' },
  { key: 'month', label: 'This Month' },
  { key: '30',    label: 'Last 30 Days' },
  { key: '90',    label: 'Last 90 Days' },
]

function getRangeBounds(preset) {
  if (preset === 'all') return null
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

// ── Page ─────────────────────────────────────────────────────────────────────

function sectionCSV(title, rows, columns) {
  if (!rows.length) return `${title}\nNo data`
  return `${title}\n${rowsToCSV(rows, columns)}`
}

export default function Reports() {
  const creators  = useCreatorStore(s => s.creators)
  const tasks     = useTaskStore(s => s.tasks)
  const campaigns = useCampaignStore(s => s.campaigns)
  const requests  = useRecruitStore(s => s.requests)

  const [range, setRange] = useState('all')
  const [showAllCreators, setShowAllCreators] = useState(false)
  const bounds = useMemo(() => getRangeBounds(range), [range])

  const filteredTasks    = useMemo(() => tasks.filter(t => inRange(t.dueDate, bounds)), [tasks, bounds])
  const filteredRequests = useMemo(() => requests.filter(r => inRange(r.appliedDate, bounds)), [requests, bounds])

  // Overview
  const activeCreatorsCount     = creators.filter(c => c.status === 'Active').length
  const activeCampaignsCount    = campaigns.filter(c => c.status === 'Active').length
  const overdueNow              = tasks.filter(t => t.status === 'Overdue').length
  const totalInPeriod           = filteredTasks.length
  const completedInPeriod       = filteredTasks.filter(t => t.status === 'Completed').length
  const completionRate          = totalInPeriod ? Math.round((completedInPeriod / totalInPeriod) * 100) : 0
  const pendingRecruitsInPeriod = filteredRequests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length

  // Distributions
  const taskPlatformData = useMemo(() => PLATFORM_ORDER
    .map(name => ({ name, count: filteredTasks.filter(t => t.platform === name).length }))
    .filter(d => d.count > 0), [filteredTasks])

  const creatorPlatformData = useMemo(() => PLATFORM_ORDER
    .map(name => ({ name, count: creators.filter(c => c.platform === name).length }))
    .filter(d => d.count > 0), [creators])

  const nicheData = useMemo(() => {
    const map = new Map()
    for (const c of creators) {
      const key = c.niche || 'Unspecified'
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])
    const top  = sorted.slice(0, 6).map(([name, count]) => ({ name, count }))
    const rest = sorted.slice(6).reduce((sum, [, n]) => sum + n, 0)
    if (rest > 0) top.push({ name: 'Other', count: rest })
    return top
  }, [creators])

  // Campaign performance
  const campaignPerf = useMemo(() => campaigns.map(c => {
    const cTasks = filteredTasks.filter(t => t.project === c.name)
    const completed = cTasks.filter(t => t.status === 'Completed').length
    const overdue    = cTasks.filter(t => t.status === 'Overdue').length
    return {
      ...c,
      totalTasks: cTasks.length,
      completed,
      overdue,
      completionRate: cTasks.length ? Math.round((completed / cTasks.length) * 100) : 0,
    }
  }).sort((a, b) => b.totalTasks - a.totalTasks), [campaigns, filteredTasks])

  // Creator leaderboard
  const creatorPerf = useMemo(() => creators.map(c => {
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
  }).filter(c => c.assigned > 0)
    .sort((a, b) => b.completed - a.completed || b.assigned - a.assigned), [creators, filteredTasks])

  const visibleCreatorPerf = showAllCreators ? creatorPerf : creatorPerf.slice(0, 10)

  // Brand performance
  const brandPerf = useMemo(() => {
    const byBrand = new Map()
    for (const c of campaigns) {
      const key = c.brandName || 'Unassigned'
      if (!byBrand.has(key)) byBrand.set(key, [])
      byBrand.get(key).push(c)
    }
    return [...byBrand.entries()].map(([brandName, camps]) => {
      const campNames = camps.map(c => c.name)
      const bTasks    = filteredTasks.filter(t => campNames.includes(t.project))
      const completed = bTasks.filter(t => t.status === 'Completed').length
      const budget    = camps.reduce((s, c) => s + (c.budget || 0), 0)
      return {
        brandName,
        campaignCount: camps.length,
        totalTasks: bTasks.length,
        completed,
        completionRate: bTasks.length ? Math.round((completed / bTasks.length) * 100) : 0,
        budget,
      }
    }).sort((a, b) => b.totalTasks - a.totalTasks)
  }, [campaigns, filteredTasks])

  // PIC workload
  const picWorkload = useMemo(() => {
    const pics = new Set([
      ...creators.map(c => c.pic).filter(Boolean),
      ...tasks.map(t => t.pic).filter(Boolean),
      ...requests.map(r => r.pic).filter(Boolean),
    ])
    return [...pics].map(pic => {
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
  }, [creators, tasks, requests, filteredTasks, filteredRequests])

  // Recruitment pipeline
  const pipelineStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected']
  const pipelineData = pipelineStatuses.map(status => ({
    name: status, count: filteredRequests.filter(r => r.status === status).length,
  }))

  const sourceEffectiveness = useMemo(() => {
    const map = new Map()
    for (const r of filteredRequests) {
      const key = r.source || 'Unspecified'
      if (!map.has(key)) map.set(key, { source: key, total: 0, approved: 0 })
      const entry = map.get(key)
      entry.total++
      if (r.status === 'Approved') entry.approved++
    }
    return [...map.values()]
      .map(e => ({ ...e, approvalRate: e.total ? Math.round((e.approved / e.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total)
  }, [filteredRequests])

  // Overdue tasks — always current, independent of the date filter
  const overdueTasks = useMemo(() =>
    tasks.filter(t => t.status === 'Overdue').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
  [tasks])

  function handleExport() {
    const parts = [
      sectionCSV('OVERVIEW', [
        { label: 'Active Creators', value: activeCreatorsCount },
        { label: 'Active Campaigns', value: activeCampaignsCount },
        { label: 'Overdue Tasks (now)', value: overdueNow },
        { label: 'Tasks in Period', value: totalInPeriod },
        { label: 'Completed in Period', value: completedInPeriod },
        { label: 'Completion Rate', value: `${completionRate}%` },
        { label: 'Pending Recruits in Period', value: pendingRecruitsInPeriod },
      ], [{ key: 'label', label: 'Metric' }, { key: 'value', label: 'Value' }]),

      sectionCSV('CAMPAIGN PERFORMANCE', campaignPerf, [
        { key: 'name', label: 'Campaign' }, { key: 'brandName', label: 'Brand' }, { key: 'status', label: 'Status' },
        { key: 'totalTasks', label: 'Total Tasks' }, { key: 'completed', label: 'Completed' }, { key: 'overdue', label: 'Overdue' },
        { key: 'completionRate', label: 'Completion %' }, { key: 'budget', label: 'Budget' },
      ]),

      sectionCSV('CREATOR PERFORMANCE', creatorPerf, [
        { key: 'name', label: 'Creator' }, { key: 'platform', label: 'Platform' },
        { key: 'assigned', label: 'Assigned' }, { key: 'completed', label: 'Completed' }, { key: 'underReview', label: 'Under Review' },
        { key: 'completionRate', label: 'Completion %' }, { key: 'avgRating', label: 'Avg Rating' }, { key: 'coinsEarned', label: 'Coins Earned' },
      ]),

      sectionCSV('BRAND PERFORMANCE', brandPerf, [
        { key: 'brandName', label: 'Brand' }, { key: 'campaignCount', label: 'Campaigns' },
        { key: 'totalTasks', label: 'Total Tasks' }, { key: 'completed', label: 'Completed' },
        { key: 'completionRate', label: 'Completion %' }, { key: 'budget', label: 'Budget' },
      ]),

      sectionCSV('PIC WORKLOAD', picWorkload, [
        { key: 'pic', label: 'PIC' }, { key: 'creatorsManaged', label: 'Creators Managed' },
        { key: 'tasksAssigned', label: 'Tasks Assigned' }, { key: 'tasksCompleted', label: 'Tasks Completed' },
        { key: 'completionRate', label: 'Completion %' }, { key: 'recruitsHandled', label: 'Recruits Handled' },
      ]),

      sectionCSV('RECRUITMENT PIPELINE', pipelineData, [
        { key: 'name', label: 'Status' }, { key: 'count', label: 'Count' },
      ]),

      sectionCSV('RECRUITMENT SOURCE EFFECTIVENESS', sourceEffectiveness, [
        { key: 'source', label: 'Source' }, { key: 'total', label: 'Total' }, { key: 'approved', label: 'Approved' }, { key: 'approvalRate', label: 'Approval %' },
      ]),

      sectionCSV('OVERDUE TASKS (current)', overdueTasks.map(t => ({ ...t, daysOverdue: daysOverdue(t.dueDate) })), [
        { key: 'task', label: 'Task' }, { key: 'project', label: 'Campaign' }, { key: 'creatorName', label: 'Creator' },
        { key: 'pic', label: 'PIC' }, { key: 'dueDate', label: 'Due Date' }, { key: 'daysOverdue', label: 'Days Overdue' },
      ]),
    ]
    downloadCSV(`kult-creator-report-${new Date().toISOString().slice(0, 10)}.csv`, parts.join('\n\n'))
  }

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Reports</h1>
          <p className="text-[12px] text-white/30 mt-1">Campaign, creator, and pipeline performance</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[#1A1A22] border border-white/7 rounded-lg p-1">
            {RANGE_OPTIONS.map(o => (
              <button
                key={o.key}
                onClick={() => setRange(o.key)}
                className={cn(
                  'text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-all',
                  range === o.key ? 'bg-violet-600/25 text-violet-300' : 'text-white/40 hover:text-white/70',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/7 hover:border-white/12 text-white/60 hover:text-white text-[12px] font-medium transition-all"
          >
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-6 gap-3 mb-5">
        <KpiTile icon={Users}       label="Active Creators"  value={activeCreatorsCount}  caption="Now"                iconBg="bg-violet-400/15 text-violet-300" />
        <KpiTile icon={FolderOpen}  label="Active Campaigns" value={activeCampaignsCount} caption="Now"                iconBg="bg-blue-400/12 text-blue-400" />
        <KpiTile icon={AlertTriangle} label="Overdue"        value={overdueNow}           caption="Now — needs action" iconBg="bg-rose-400/12 text-rose-400" />
        <KpiTile icon={ListTodo}    label="Tasks"             value={totalInPeriod}        caption="This period"       iconBg="bg-teal-400/12 text-teal-400" />
        <KpiTile icon={TrendingUp}  label="Completion Rate"   value={`${completionRate}%`}  caption={`${completedInPeriod} completed`} iconBg="bg-emerald-400/12 text-emerald-400" />
        <KpiTile icon={UserPlus}    label="Pending Recruits"  value={pendingRecruitsInPeriod} caption="This period"     iconBg="bg-amber-400/12 text-amber-300" />
      </div>

      {/* Status + distributions */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card title="Task Status" icon={ListTodo}>
          <StatusDonut tasks={filteredTasks} />
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

      {/* Campaign performance */}
      <Card title="Campaign Performance" icon={FolderOpen} className="mb-4">
        {campaignPerf.length === 0 ? <EmptyState>No campaigns yet</EmptyState> : (
          <div className="max-h-[360px] overflow-y-auto -mx-5 -mb-5">
            <table className="w-full">
              <thead className="sticky top-0 bg-[#1E1E28]">
                <tr>
                  {['Campaign', 'Brand', 'Status', 'Tasks', 'Completed', 'Overdue', 'Completion', 'Budget'].map(h => (
                    <th key={h} className="px-5 py-2.5 text-left font-mono text-[10px] font-medium text-white/20 uppercase tracking-[.08em] border-b border-white/7 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaignPerf.map(c => (
                  <tr key={c.id} className="border-b border-white/7 last:border-0 hover:bg-white/[.02] transition-colors">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="text-[12px] text-white/80">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-[12px] text-white/40">{c.brandName || '—'}</td>
                    <td className="px-5 py-2.5 text-[11px] text-white/40">{c.status}</td>
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

      {/* Creator leaderboard + Brand performance */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card
          title="Creator Leaderboard"
          icon={Trophy}
          action={creatorPerf.length > 10 && (
            <button onClick={() => setShowAllCreators(v => !v)} className="text-[11px] text-violet-400/70 hover:text-violet-300 transition-colors font-medium">
              {showAllCreators ? 'Show top 10' : `Show all (${creatorPerf.length})`}
            </button>
          )}
        >
          {visibleCreatorPerf.length === 0 ? <EmptyState>No assigned tasks in this period</EmptyState> : (
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
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

        <Card title="Brand Performance" icon={Briefcase}>
          {brandPerf.length === 0 ? <EmptyState>No brands yet</EmptyState> : (
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {brandPerf.map(b => (
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
      </div>

      {/* PIC workload + Recruitment */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card title="Staff (PIC) Workload" icon={Users}>
          {picWorkload.length === 0 ? <EmptyState>No PICs assigned yet</EmptyState> : (
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {picWorkload.map(p => (
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

        <Card title="Recruitment Pipeline" icon={GitBranch}>
          <div className="mb-4">
            <DistributionBar
              data={pipelineData.filter(d => d.count > 0)}
              colorFor={d => d.name === 'Approved' ? STATUS_COLOR['Completed'] : d.name === 'Rejected' ? STATUS_COLOR['Overdue'] : d.name === 'Under Review' ? STATUS_COLOR['Under Review'] : STATUS_COLOR['Not Started']}
            />
          </div>
          {sourceEffectiveness.length > 0 && (
            <div className="border-t border-white/7 pt-3 space-y-1.5">
              <div className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-1.5">Source Effectiveness</div>
              {sourceEffectiveness.map(s => (
                <div key={s.source} className="flex items-center gap-3 text-[12px]">
                  <span className="flex-1 text-white/60 truncate">{s.source}</span>
                  <span className="font-mono text-white/40">{s.approved}/{s.total}</span>
                  <span className="font-mono text-emerald-400 w-10 text-right">{s.approvalRate}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
