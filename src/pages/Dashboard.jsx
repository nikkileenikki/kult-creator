import { useCreatorStore } from '@/store/creatorStore'
import { useTaskStore } from '@/store/taskStore'
import { useRecruitStore } from '@/store/recruitStore'
import { ACTIVITY_FEED } from '@/lib/data'
import { getTier } from '@/lib/tierUtils'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { Users, Calendar, AlertCircle, TrendingUp, Award } from 'lucide-react'

const STATUS_BADGE = {
  'In Progress':   'blue',
  'Under Review':  'amber',
  'Completed':     'green',
  'Overdue':       'red',
  'Not Started':   'gray',
}

const PRIORITY_DOT = {
  Urgent: 'bg-rose-400 shadow-[0_0_5px_rgba(248,113,113,.5)]',
  High:   'bg-orange-400',
  Medium: 'bg-amber-400',
  Low:    'bg-emerald-400',
}

const ACTIVITY_DOT = { green:'bg-emerald-400', amber:'bg-amber-400', blue:'bg-blue-400', red:'bg-rose-400', purple:'bg-violet-400' }

export default function Dashboard() {
  const creators = useCreatorStore(s => s.creators)
  const tasks = useTaskStore(s => s.tasks)
  const requests = useRecruitStore(s => s.requests)

  const active = creators.filter(c => c.status === 'Active').length
  const dueThisWeek = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Overdue').length
  const overdue = tasks.filter(t => t.status === 'Overdue').length
  const completed = tasks.filter(t => t.status === 'Completed').length
  const completionRate = Math.round((completed / tasks.length) * 100)
  const pendingRecruits = requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length

  const tiers = ['Platinum','Diamond','Gold','Silver','Bronze']
  const tierCounts = tiers.map(t => ({ name: t.toLowerCase(), count: creators.filter(c => getTier(c.coins).name === t).length }))
  const maxCount = Math.max(...tierCounts.map(t => t.count), 1)

  const TIER_COLORS = { platinum:'from-purple-700 to-purple-300', diamond:'from-blue-700 to-blue-300', gold:'from-amber-600 to-amber-300', silver:'from-gray-500 to-gray-300', bronze:'from-rose-700 to-rose-300' }

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Good morning, Nikki 👋</h1>
          <p className="text-[12px] text-white/30 mt-1">May 5, 2026 · Ramadan Campaign active · {pendingRecruits} pending recruit requests</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { icon: Users, label: 'Active Creators', val: active, delta: '↑ 3 this month', deltaColor: 'text-emerald-400', color: 'mc-purple', iconBg: 'bg-violet-400/15 text-violet-300' },
          { icon: Calendar, label: 'Due This Week', val: dueThisWeek, delta: '3 due tomorrow', deltaColor: 'text-amber-300', color: 'mc-amber', iconBg: 'bg-amber-400/12 text-amber-300' },
          { icon: AlertCircle, label: 'Overdue', val: overdue, delta: 'Needs attention', deltaColor: 'text-rose-400', color: 'mc-red', iconBg: 'bg-rose-400/12 text-rose-400' },
          { icon: TrendingUp, label: 'Completion Rate', val: `${completionRate}%`, delta: '↑ 5% vs last month', deltaColor: 'text-emerald-400', color: 'mc-green', iconBg: 'bg-emerald-400/12 text-emerald-400' },
          { icon: Award, label: 'Recruit Requests', val: pendingRecruits, delta: 'Pending review', deltaColor: 'text-amber-300', color: 'mc-teal', iconBg: 'bg-teal-400/12 text-teal-400' },
        ].map((m, i) => (
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

      {/* Main grid */}
      <div className="grid grid-cols-[1fr_300px] gap-4">

        {/* Task table */}
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-white/7 flex items-center gap-3">
            <span className="font-syne text-[13px] font-bold text-white">Recent Tasks</span>
            <div className="ml-auto flex gap-2">
              {['All Projects','All Statuses'].map(p => (
                <select key={p} className="text-[12px] px-2.5 py-1.5 border border-white/7 rounded-lg bg-[#16161C] text-white/40 font-figtree outline-none hover:border-white/12 cursor-pointer">
                  <option>{p}</option>
                </select>
              ))}
            </div>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#16161C]">
                {['Creator','Task','Project','Status','PIC','Due','Priority','Coins'].map(h => (
                  <th key={h} className="px-3.5 py-2.5 text-left font-mono text-[10px] font-medium text-white/20 uppercase tracking-[.08em] border-b border-white/7 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0,5).map(t => (
                <tr key={t.id} className="border-b border-white/7 last:border-0 hover:bg-white/[.025] transition-colors cursor-pointer">
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={t.creatorName.split(' ').map(n=>n[0]).join('')} color={['v','b','g','r','t','i'][parseInt(t.creatorId)-1] || 'v'} size="sm" />
                      <div>
                        <div className="text-[13px] font-medium text-white">{t.creatorName}</div>
                        <div className="text-[11px] text-white/30">{t.platform}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 text-[13px] text-white/70">{t.task}</td>
                  <td className="px-3.5 py-3"><span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/7 text-white/40">{t.project}</span></td>
                  <td className="px-3.5 py-3"><Badge variant={STATUS_BADGE[t.status]}>{t.status}</Badge></td>
                  <td className="px-3.5 py-3 text-[12px] text-white/40">{t.pic}</td>
                  <td className={`px-3.5 py-3 font-mono text-[11px] ${t.status==='Overdue'?'text-rose-400 font-semibold':'text-white/30'}`}>{t.dueDate.slice(5)}</td>
                  <td className="px-3.5 py-3">
                    <span className="flex items-center gap-1.5 text-[12px] text-white/40">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority]}`} />
                      {t.priority}
                    </span>
                  </td>
                  <td className={`px-3.5 py-3 font-mono text-[12px] ${t.status==='Completed'?'text-emerald-400 font-medium':'text-white/30'}`}>
                    {t.status==='Completed'?`+${t.coins}`:t.coins}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Tier distribution */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-white/7">
              <span className="font-syne text-[13px] font-bold text-white">Tier Distribution</span>
            </div>
            {tierCounts.map(({ name, count }) => (
              <div key={name} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/7 last:border-0">
                <span className="text-[12px] font-medium text-white/50 capitalize w-16">{name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/6 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${TIER_COLORS[name]}`} style={{ width: `${(count/maxCount)*100}%` }} />
                </div>
                <span className="font-mono text-[11px] text-white/30 w-3 text-right">{count}</span>
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden flex-1">
            <div className="px-4 py-3.5 border-b border-white/7">
              <span className="font-syne text-[13px] font-bold text-white">Recent Activity</span>
            </div>
            {ACTIVITY_FEED.map(a => (
              <div key={a.id} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-white/7 last:border-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${ACTIVITY_DOT[a.color]}`} />
                <div>
                  <div className="text-[12px] text-white/50 leading-relaxed" dangerouslySetInnerHTML={{ __html: a.text }} />
                  <div className="font-mono text-[10px] text-white/20 mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
