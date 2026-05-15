import { useEffect, useState } from 'react'
import { useCreatorStore } from '@/store/creatorStore'
import { useTaskStore } from '@/store/taskStore'
import { useRecruitStore } from '@/store/recruitStore'
import { getTier } from '@/lib/tierUtils'
import { fetchDashboardMetrics, fetchTierDistribution, fetchActivityFeed } from '@/lib/api/analytics'
import MetricsGrid from '@/components/dashboard/MetricsGrid'
import RecentTasksTable from '@/components/dashboard/RecentTasksTable'
import TierSnapshot from '@/components/dashboard/TierSnapshot'
import ActivityFeed from '@/components/dashboard/ActivityFeed'

export default function Dashboard() {
  const creators = useCreatorStore(s => s.creators)
  const tasks    = useTaskStore(s => s.tasks)
  const requests = useRecruitStore(s => s.requests)

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
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Good morning, Nikki 👋</h1>
          <p className="text-[12px] text-white/30 mt-1">
            May 2026 · Ramadan Campaign active · {pendingRecruits} pending recruit requests
          </p>
        </div>
      </div>

      <MetricsGrid
        activeCreators={metrics?.activeCreators ?? creators.filter(c => c.status === 'Active').length}
        dueThisWeek={metrics?.dueThisWeek ?? tasks.filter(t => t.status !== 'Completed' && t.status !== 'Overdue').length}
        overdue={metrics?.overdue ?? tasks.filter(t => t.status === 'Overdue').length}
        completionRate={metrics?.completionRate ?? (tasks.length ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0)}
        pendingRecruits={metrics?.pendingRecruits ?? pendingRecruits}
      />

      <div className="grid grid-cols-[1fr_300px] gap-4">
        <RecentTasksTable tasks={tasks} />

        <div className="flex flex-col gap-4">
          <TierSnapshot tierCounts={tierCounts.length ? tierCounts : ['Platinum','Diamond','Gold','Silver','Bronze'].map(name => ({
            name: name.toLowerCase(),
            count: creators.filter(c => getTier(c.coins).name === name).length,
          }))} />
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}
