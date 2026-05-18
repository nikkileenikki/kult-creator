import { Users, Calendar, AlertCircle, TrendingUp, Award } from 'lucide-react'

export default function MetricsGrid({ activeCreators, dueThisWeek, overdue, completionRate, pendingRecruits }) {
  const metrics = [
    { icon: Users,       label: 'Active Creators',  val: activeCreators,      delta: '↑ 3 this month',      deltaColor: 'text-emerald-400', iconBg: 'bg-violet-400/15 text-violet-300' },
    { icon: Calendar,    label: 'Due This Week',     val: dueThisWeek,         delta: '3 due tomorrow',       deltaColor: 'text-amber-300',   iconBg: 'bg-amber-400/12 text-amber-300' },
    { icon: AlertCircle, label: 'Overdue',           val: overdue,             delta: 'Needs attention',      deltaColor: 'text-rose-400',    iconBg: 'bg-rose-400/12 text-rose-400' },
    { icon: TrendingUp,  label: 'Completion Rate',   val: `${completionRate}%`, delta: '↑ 5% vs last month',  deltaColor: 'text-emerald-400', iconBg: 'bg-emerald-400/12 text-emerald-400' },
    { icon: Award,       label: 'Recruit Requests',  val: pendingRecruits,     delta: 'Pending review',       deltaColor: 'text-amber-300',   iconBg: 'bg-teal-400/12 text-teal-400' },
  ]

  return (
    <div className="grid grid-cols-5 gap-3 mb-5">
      {metrics.map((m, i) => (
        <div key={i} className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px] hover:-translate-y-0.5 hover:border-white/12 transition-all cursor-default relative overflow-hidden">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3.5 ${m.iconBg}`}>
            <m.icon size={15} strokeWidth={2} />
          </div>
          <div className="font-syne text-[32px] font-extrabold text-white leading-none tracking-tight">{m.val}</div>
          <div className="text-[11px] text-white/30 font-medium uppercase tracking-[.05em] mt-1.5">{m.label}</div>
          <div className={`text-[11px] mt-2 ${m.deltaColor}`}>{m.delta}</div>
        </div>
      ))}
    </div>
  )
}
