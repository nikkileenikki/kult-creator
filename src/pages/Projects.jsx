import { useState } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useUIStore } from '@/store/uiStore'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import { Pencil } from 'lucide-react'

const STATUS_BADGE = { 'In Progress':'blue','Under Review':'amber','Completed':'green','Overdue':'red','Not Started':'gray' }
const PRIORITY_DOT  = { Urgent:'bg-rose-400 shadow-[0_0_4px_rgba(248,113,113,.5)]',High:'bg-orange-400',Medium:'bg-amber-400',Low:'bg-emerald-400' }
const AV_COLORS     = ['v','b','g','r','t','i']

const KANBAN_COLS = ['Not Started','In Progress','Under Review','Completed','Overdue']

export default function Projects() {
  const tasks      = useTaskStore(s => s.tasks)
  const openEdit   = useUIStore(s => s.openEditTask)
  const [view, setView] = useState('table')

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Projects</h1>
          <p className="text-[12px] text-white/30 mt-1">All campaigns · {tasks.length} tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#16161C] border border-white/7 rounded-lg overflow-hidden p-0.5 gap-0.5">
            {['table','kanban'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-all capitalize ${view===v?'bg-[#1E1E28] text-white':'text-white/30 hover:text-white/60'}`}>
                {v === 'table' ? '⊞ Table' : '⧉ Kanban'}
              </button>
            ))}
          </div>
          <select className="text-[12px] px-2.5 py-1.5 border border-white/7 rounded-lg bg-[#1E1E28] text-white/40 font-figtree outline-none hover:border-white/12 cursor-pointer">
            <option>All Projects</option>
            <option>Ramadan Campaign</option>
            <option>Brand Launch Q2</option>
            <option>Skincare Series</option>
          </select>
        </div>
      </div>

      {view === 'table' && (
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#16161C]">
                {['Creator','Task / Deliverable','Project','Status','PIC','Due Date','Priority','Coins'].map(h => (
                  <th key={h} className="px-3.5 py-2.5 text-left font-mono text-[10px] font-medium text-white/20 uppercase tracking-[.08em] border-b border-white/7 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={t.id} onClick={() => openEdit(t.id)} className="border-b border-white/7 last:border-0 hover:bg-white/[.025] transition-colors cursor-pointer group">
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={t.creatorName.split(' ').map(n=>n[0]).join('')} color={AV_COLORS[i % AV_COLORS.length]} size="sm" />
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
                  <td className={`px-3.5 py-3 font-mono text-[11px] ${t.status==='Overdue'?'text-rose-400 font-semibold':'text-white/30'}`}>{t.dueDate}</td>
                  <td className="px-3.5 py-3"><span className="flex items-center gap-1.5 text-[12px] text-white/40"><span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.priority]}`} />{t.priority}</span></td>
                  <td className={`px-3.5 py-3 font-mono text-[12px] ${t.status==='Completed'?'text-emerald-400 font-medium':'text-white/30'}`}>{t.status==='Completed'?`+${t.coins}`:t.coins}</td>
                  <td className="px-3.5 py-3">
                    <Pencil size={12} className="text-white/0 group-hover:text-white/30 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'kanban' && (
        <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-1">
          {KANBAN_COLS.map(col => {
            const colTasks = tasks.filter(t => t.status === col)
            return (
              <div key={col} className="bg-[#16161C] border border-white/7 rounded-[14px] p-3 min-h-[300px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-syne text-[12px] font-bold text-white/40">{col}</span>
                  <span className="font-mono text-[10px] bg-white/6 border border-white/7 text-white/25 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                {colTasks.map((t, i) => (
                  <div key={t.id} onClick={() => openEdit(t.id)} className={`bg-[#1E1E28] border rounded-[9px] p-3 mb-2 last:mb-0 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,.3)] transition-all ${col==='Overdue'?'border-rose-500/30':'border-white/7 hover:border-violet-500/40'}`}>
                    <div className="font-mono text-[9px] text-violet-400 uppercase tracking-[.06em] mb-1.5">{t.project}</div>
                    <div className="text-[12px] font-medium text-white mb-1.5 leading-snug">{t.task}</div>
                    <div className="text-[11px] text-white/30 mb-2">{t.creatorName} · {t.platform}</div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                        <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[t.priority]}`} />
                        {t.priority}
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
