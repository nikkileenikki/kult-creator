import { useState } from 'react'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'

const STATUS_BADGE = {
  'In Progress':  'blue',
  'Under Review': 'amber',
  'Completed':    'green',
  'Overdue':      'red',
  'Not Started':  'gray',
}

const PRIORITY_DOT = {
  Urgent: 'bg-rose-400 shadow-[0_0_5px_rgba(248,113,113,.5)]',
  High:   'bg-orange-400',
  Medium: 'bg-amber-400',
  Low:    'bg-emerald-400',
}

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Under Review', 'Completed', 'Overdue']

const AVATAR_COLORS = ['v','b','g','r','t','i']

const SELECT = 'text-[12px] px-2.5 py-1.5 border border-white/7 rounded-lg bg-[#16161C] text-white/40 outline-none hover:border-white/12 cursor-pointer'

export default function RecentTasksTable({ tasks = [] }) {
  const [filterProject, setFilterProject] = useState('')
  const [filterStatus,  setFilterStatus]  = useState('')

  const projects = [...new Set(tasks.map(t => t.project).filter(Boolean))].sort()

  const visible = tasks
    .filter(t => !filterProject || t.project === filterProject)
    .filter(t => !filterStatus  || t.status  === filterStatus)
    .slice(0, 5)

  return (
    <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
      <div className="px-4 py-3.5 border-b border-white/7 flex items-center gap-3">
        <span className="font-syne text-[13px] font-bold text-white">Recent Tasks</span>
        <div className="ml-auto flex gap-2">
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className={SELECT}>
            <option value="">All Campaigns</option>
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={SELECT}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#16161C]">
            {['Creator','Task','Status','PIC','Due','Priority','Coins'].map(h => (
              <th key={h} className="px-3.5 py-2.5 text-left font-mono text-[10px] font-medium text-white/20 uppercase tracking-[.08em] border-b border-white/7 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map(t => (
            <tr key={t.id} className="border-b border-white/7 last:border-0 hover:bg-white/[.025] transition-colors cursor-pointer">
              <td className="px-3.5 py-3">
                <div className="flex items-center gap-2">
                  <Avatar
                    initials={t.creatorName.split(' ').map(n => n[0]).join('')}
                    color={AVATAR_COLORS[parseInt(t.creatorId) - 1] || 'v'}
                    size="sm"
                  />
                  <div>
                    <div className="text-[13px] font-medium text-white">{t.creatorName}</div>
                    <div className="text-[11px] text-white/30">{t.platform}</div>
                  </div>
                </div>
              </td>
              <td className="px-3.5 py-3 text-[13px] text-white/70">{t.task}</td>
              <td className="px-3.5 py-3"><Badge variant={STATUS_BADGE[t.status]}>{t.status}</Badge></td>
              <td className="px-3.5 py-3 text-[12px] text-white/40">{t.pic}</td>
              <td className={`px-3.5 py-3 font-mono text-[11px] ${t.status === 'Overdue' ? 'text-rose-400 font-semibold' : 'text-white/30'}`}>
                {t.dueDate.slice(5)}
              </td>
              <td className="px-3.5 py-3">
                <span className="flex items-center gap-1.5 text-[12px] text-white/40">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority]}`} />
                  {t.priority}
                </span>
              </td>
              <td className={`px-3.5 py-3 font-mono text-[12px] ${t.status === 'Completed' ? 'text-emerald-400 font-medium' : 'text-white/30'}`}>
                {t.status === 'Completed' ? `+${t.coins}` : t.coins}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
