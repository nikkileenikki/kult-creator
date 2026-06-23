import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { useTaskStore } from '@/store/taskStore'
import { useRecruitStore } from '@/store/recruitStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { getTier } from '@/lib/tierUtils'
import { fetchDashboardMetrics, fetchTierDistribution, fetchActivityFeed } from '@/lib/api/analytics'
import MetricsGrid from '@/components/dashboard/MetricsGrid'
import RecentTasksTable from '@/components/dashboard/RecentTasksTable'
import TierSnapshot from '@/components/dashboard/TierSnapshot'
import ActivityFeed from '@/components/dashboard/ActivityFeed'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getMonthYear() {
  return new Date().toLocaleString('en-MY', { month: 'long', year: 'numeric' })
}

function CampaignProgressCard({ campaign, tasks, onClick }) {
  const done     = tasks.filter(t => t.status === 'Completed').length
  const overdue  = tasks.filter(t => t.status === 'Overdue').length
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[220px] bg-[#1E1E28] border border-white/7 rounded-[12px] overflow-hidden cursor-pointer hover:border-violet-500/30 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.3)] transition-all group"
    >
      <div className="h-[2px]" style={{ background: campaign.color }} />
      <div className="p-3.5">
        <div className="flex items-start justify-between mb-2">
          <div className="font-syne text-[13px] font-bold text-white group-hover:text-violet-300 transition-colors leading-snug flex-1 min-w-0 mr-2 truncate">{campaign.name}</div>
          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0 ${campaign.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400' : campaign.status === 'Planning' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/8 text-white/30'}`}>
            {campaign.status}
          </span>
        </div>
        <div className="mb-2.5">
          <div className="flex justify-between font-mono text-[9px] text-white/25 mb-1">
            <span>{done}/{tasks.length} tasks</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: campaign.color }} />
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          {overdue > 0 && <span className="text-rose-400">{overdue} overdue</span>}
          {campaign.budget > 0 && <span className="text-emerald-400/60 ml-auto">RM {(campaign.budget/1000).toFixed(0)}k</span>}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const creators     = useCreatorStore(s => s.creators)
  const tasks        = useTaskStore(s => s.tasks)
  const requests     = useRecruitStore(s => s.requests)
  const campaigns    = useCampaignStore(s => s.campaigns)
  const navigate     = useNavigate()
  const authUser     = useAuthStore(s => s.user)
  const can          = useAuthStore(s => s.can)
  const openAddTask  = useUIStore(s => s.openAddTask)

  const [metrics, setMetrics]       = useState(null)
  const [tierCounts, setTierCounts] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(() => {
    fetchDashboardMetrics().then(setMetrics)
    fetchTierDistribution().then(setTierCounts)
    fetchActivityFeed().then(setActivities)
  }, [creators, tasks, requests])

  const pendingRecruits = requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">{getGreeting()}, {authUser?.displayName?.split(' ')[0] ?? 'there'} 👋</h1>
          <p className="text-[12px] text-white/30 mt-1">
            {getMonthYear()} · {pendingRecruits} pending recruit request{pendingRecruits !== 1 ? 's' : ''}
          </p>
        </div>
        {can('creators.edit') && (
          <button
            onClick={openAddTask}
            className="flex items-center gap-1.5 px-4 py-[7px] rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-300 hover:bg-violet-600/25 text-[13px] font-semibold transition-all"
          >
            + Add Task
          </button>
        )}
      </div>

      <MetricsGrid
        activeCreators={metrics?.activeCreators ?? creators.filter(c => c.status === 'Active').length}
        dueThisWeek={metrics?.dueThisWeek ?? tasks.filter(t => t.status !== 'Completed' && t.status !== 'Overdue').length}
        overdue={metrics?.overdue ?? tasks.filter(t => t.status === 'Overdue').length}
        completionRate={metrics?.completionRate ?? (tasks.length ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0)}
        pendingRecruits={metrics?.pendingRecruits ?? pendingRecruits}
      />

      {/* Campaign Progress Row */}
      {campaigns.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-mono text-[10px] text-white/25 uppercase tracking-[.08em]">Active Campaigns</span>
            <button onClick={() => navigate('/campaigns')} className="text-[11px] text-violet-400/70 hover:text-violet-300 transition-colors font-medium">
              View all →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {campaigns.map(c => (
              <CampaignProgressCard
                key={c.id}
                campaign={c}
                tasks={tasks.filter(t => t.project === c.name)}
                onClick={() => navigate('/campaigns')}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-[1fr_300px] gap-4">
        <RecentTasksTable tasks={tasks} />

        <div className="flex flex-col gap-4">
          <TierSnapshot tierCounts={tierCounts.length ? tierCounts : ['Platinum','Diamond','Gold','Silver','Bronze'].map(name => ({
            name: name.toLowerCase(),
            count: creators.filter(c => c.status !== 'Rejected' && getTier(c.coins).name === name).length,
          }))} />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}
