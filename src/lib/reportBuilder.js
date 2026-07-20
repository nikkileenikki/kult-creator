export const RANGE_OPTIONS = [
  { key: 'all',    label: 'All Time' },
  { key: 'month',  label: 'This Month' },
  { key: '30',     label: 'Last 30 Days' },
  { key: '90',     label: 'Last 90 Days' },
  { key: 'custom', label: 'Custom' },
]

export const LEVEL_OPTIONS = [
  { key: 'campaign', label: 'Campaign' },
  { key: 'creator',  label: 'Creator' },
]

export const SUMMARY_METRICS = [
  { key: 'totalTasks',     label: 'Total Tasks' },
  { key: 'completed',      label: 'Completed' },
  { key: 'overdue',        label: 'Overdue' },
  { key: 'completionRate', label: 'Completion Rate (%)' },
  { key: 'budget',         label: 'Budget' },
  { key: 'coinsEarned',    label: 'Coins Earned' },
]

export const DETAIL_METRICS = [
  { key: 'status',      label: 'Status' },
  { key: 'priority',    label: 'Priority' },
  { key: 'platform',    label: 'Platform' },
  { key: 'pic',         label: 'PIC' },
  { key: 'dueDate',     label: 'Due Date' },
  { key: 'assignedAt',  label: 'Assigned Date' },
  { key: 'submittedAt', label: 'Submitted Date' },
  { key: 'completedAt', label: 'Completed Date' },
  { key: 'coins',       label: 'Coins' },
]

export function metricOptionsFor(reportType) {
  return reportType === 'detailed' ? DETAIL_METRICS : SUMMARY_METRICS
}

export function getRangeBounds(preset, rangeStart, rangeEnd) {
  if (preset === 'all') return null
  if (preset === 'custom') {
    if (!rangeStart || !rangeEnd) return null
    const start = new Date(rangeStart); start.setHours(0, 0, 0, 0)
    const end   = new Date(rangeEnd);   end.setHours(23, 59, 59, 999)
    return { start, end }
  }
  const end = new Date(); end.setHours(23, 59, 59, 999)
  let start
  if (preset === 'month') start = new Date(end.getFullYear(), end.getMonth(), 1)
  else { start = new Date(end); start.setDate(start.getDate() - Number(preset)) }
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

export function inRange(dateStr, bounds) {
  if (!bounds) return true
  if (!dateStr) return false
  const d = new Date(dateStr)
  if (isNaN(d)) return false
  return d >= bounds.start && d <= bounds.end
}

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Runs a saved template against live data and returns { sheets: [{ name, rows, columns }] }
// ready to hand to either the CSV or XLSX writer.
export function generateReport(template, { creators, tasks, campaigns }, taskTimeline = {}) {
  const bounds = getRangeBounds(template.dateRange, template.rangeStart, template.rangeEnd)

  let scopedCampaigns = campaigns
  if (template.brandNames?.length)  scopedCampaigns = scopedCampaigns.filter(c => template.brandNames.includes(c.brandName))
  if (template.campaignIds?.length) scopedCampaigns = scopedCampaigns.filter(c => template.campaignIds.includes(c.id))
  const campaignByName = new Map(scopedCampaigns.map(c => [c.name, c]))
  const scopedCampaignNames = new Set(scopedCampaigns.map(c => c.name))

  let scopedTasks = tasks.filter(t => scopedCampaignNames.has(t.project))
  if (template.creatorIds?.length) scopedTasks = scopedTasks.filter(t => template.creatorIds.includes(t.creatorId))
  if (template.pics?.length)       scopedTasks = scopedTasks.filter(t => template.pics.includes(t.pic))
  scopedTasks = scopedTasks.filter(t => inRange(t.dueDate, bounds))

  const levels  = template.levels?.length ? template.levels : []
  const metrics = template.metrics?.length ? template.metrics : metricOptionsFor(template.reportType).map(m => m.key)

  if (template.reportType === 'detailed') {
    const columns = []
    if (levels.includes('campaign')) columns.push({ key: 'project', label: 'Campaign' })
    if (levels.includes('creator'))  columns.push({ key: 'creatorName', label: 'Creator' })
    columns.push({ key: 'task', label: 'Task' })
    for (const m of DETAIL_METRICS) if (metrics.includes(m.key)) columns.push(m)

    const rows = scopedTasks
      .slice()
      .sort((a, b) => {
        if (levels.includes('campaign') && a.project !== b.project) return a.project.localeCompare(b.project)
        if (levels.includes('creator')) {
          const an = a.creatorName || '', bn = b.creatorName || ''
          if (an !== bn) return an.localeCompare(bn)
        }
        return 0
      })
      .map(t => ({
        ...t,
        assignedAt:  fmtDate(taskTimeline[t.id]?.assignedAt),
        submittedAt: fmtDate(taskTimeline[t.id]?.submittedAt),
        completedAt: fmtDate(taskTimeline[t.id]?.completedAt),
      }))

    return { sheets: [{ name: 'Detail', rows, columns }] }
  }

  // Summary — one row per unique combination of enabled levels (a group-by rollup)
  const groups = new Map()
  for (const t of scopedTasks) {
    const campaign = t.project
    const creator  = t.creatorName || 'Unassigned'
    const key = [levels.includes('campaign') ? campaign : '', levels.includes('creator') ? creator : ''].join('::')
    if (!groups.has(key)) groups.set(key, { campaign, creator, tasks: [] })
    groups.get(key).tasks.push(t)
  }

  const columns = []
  if (levels.includes('campaign')) columns.push({ key: 'campaign', label: 'Campaign' })
  if (levels.includes('creator'))  columns.push({ key: 'creator', label: 'Creator' })
  for (const m of SUMMARY_METRICS) if (metrics.includes(m.key)) columns.push(m)

  const rows = [...groups.values()].map(g => {
    const completed = g.tasks.filter(t => t.status === 'Completed')
    const overdue    = g.tasks.filter(t => t.status === 'Overdue').length
    const campaign   = campaignByName.get(g.campaign)
    return {
      campaign: g.campaign,
      creator:  g.creator,
      totalTasks:     g.tasks.length,
      completed:      completed.length,
      overdue,
      completionRate: g.tasks.length ? Math.round((completed.length / g.tasks.length) * 100) : 0,
      budget:         campaign?.budget ?? 0,
      coinsEarned:    completed.reduce((s, t) => s + (t.coins || 0), 0),
    }
  }).sort((a, b) => (a.campaign || '').localeCompare(b.campaign || '') || (a.creator || '').localeCompare(b.creator || ''))

  return { sheets: [{ name: 'Summary', rows, columns }] }
}
