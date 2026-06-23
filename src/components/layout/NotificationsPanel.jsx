import { useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTaskStore } from '@/store/taskStore'
import { useUIStore } from '@/store/uiStore'
import { useNotificationStore } from '@/store/notificationStore'
import { X, CheckCheck, AtSign } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NotificationsPanel() {
  const panelRef         = useRef(null)
  const navigate         = useNavigate()
  const tasks            = useTaskStore(s => s.tasks)
  const openEdit         = useUIStore(s => s.openEditTask)
  const close            = useUIStore(s => s.closeNotifications)
  const dismissedAlerts  = useUIStore(s => s.dismissedAlerts)
  const dismissAlert     = useUIStore(s => s.dismissAlert)
  const dismissAllAlerts = useUIStore(s => s.dismissAllAlerts)
  const mentions         = useNotificationStore(s => s.mentions)
  const markRead         = useNotificationStore(s => s.markRead)
  const markAllRead      = useNotificationStore(s => s.markAllRead)

  useEffect(() => {
    function onClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) close()
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [close])

  const { overdue, dueSoon } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const limit = new Date(today)
    limit.setDate(today.getDate() + 3)
    const overdue = tasks.filter(t => t.status === 'Overdue' && !dismissedAlerts.has(t.id))
    const dueSoon = tasks.filter(t => {
      if (t.status === 'Completed' || t.status === 'Overdue') return false
      if (dismissedAlerts.has(t.id)) return false
      const due = new Date(t.dueDate)
      return due >= today && due <= limit
    })
    return { overdue, dueSoon }
  }, [tasks, dismissedAlerts])

  const taskAlertIds = [...overdue, ...dueSoon].map(t => t.id)
  const totalCount   = mentions.length + overdue.length + dueSoon.length
  const isEmpty      = totalCount === 0

  async function handleMentionClick(n) {
    await markRead(n.id)
    navigate(`/projects?proj=${n.projectId}&task=${n.taskId}`)
    close()
  }

  async function handleMarkAllRead() {
    await markAllRead()
    dismissAllAlerts(taskAlertIds)
  }

  function fmtTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <div
      ref={panelRef}
      className="absolute top-[calc(100%+8px)] right-0 z-50 w-[320px] bg-[#111116] border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,.6)] overflow-hidden animate-[fadeUp_.15s_ease]"
    >
      <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-syne text-[13px] font-bold text-white">Notifications</span>
          {!isEmpty && (
            <span className="font-mono text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
              {totalCount}
            </span>
          )}
        </div>
        {!isEmpty && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/70 transition-colors"
          >
            <CheckCheck size={13} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="px-4 py-8 text-center">
          <div className="text-2xl mb-2">✓</div>
          <div className="text-[13px] text-white/30">All caught up!</div>
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">

          {/* Mentions section */}
          {mentions.length > 0 && (
            <div>
              <div className="px-4 py-2 font-mono text-[9px] text-violet-400/60 uppercase tracking-[.08em] bg-violet-500/5 flex items-center gap-1.5">
                <AtSign size={9} />
                Mentions · {mentions.length}
              </div>
              {mentions.map(n => (
                <div key={n.id} className="flex items-center border-b border-white/[0.05] group hover:bg-white/[.02] transition-colors">
                  <button
                    onClick={() => handleMentionClick(n)}
                    className="flex-1 text-left px-4 py-3"
                  >
                    <div className="text-[13px] font-medium text-white leading-snug">{n.taskTitle}</div>
                    <div className="text-[11px] text-white/30 mt-0.5">
                      {n.message} · <span className="text-violet-400/70">{fmtTime(n.createdAt)}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => markRead(n.id)}
                    className="px-3 py-3 text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    title="Dismiss"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Overdue */}
          {overdue.length > 0 && (
            <div>
              <div className="px-4 py-2 font-mono text-[9px] text-rose-400/60 uppercase tracking-[.08em] bg-rose-500/5">
                Overdue · {overdue.length}
              </div>
              {overdue.map(t => (
                <div key={t.id} className="flex items-center border-b border-white/[0.05] group hover:bg-white/[.02] transition-colors">
                  <button onClick={() => { openEdit(t.id); close() }} className="flex-1 text-left px-4 py-3">
                    <div className="text-[13px] font-medium text-white leading-snug">{t.task}</div>
                    <div className="text-[11px] text-white/30 mt-0.5">
                      {t.creatorName} · <span className="text-rose-400">{t.dueDate}</span>
                    </div>
                  </button>
                  <button onClick={() => dismissAlert(t.id)} className="px-3 py-3 text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" title="Dismiss">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Due Soon */}
          {dueSoon.length > 0 && (
            <div>
              <div className="px-4 py-2 font-mono text-[9px] text-amber-400/60 uppercase tracking-[.08em] bg-amber-500/5">
                Due Soon · {dueSoon.length}
              </div>
              {dueSoon.map(t => (
                <div key={t.id} className="flex items-center border-b border-white/[0.05] last:border-0 group hover:bg-white/[.02] transition-colors">
                  <button onClick={() => { openEdit(t.id); close() }} className="flex-1 text-left px-4 py-3">
                    <div className="text-[13px] font-medium text-white leading-snug">{t.task}</div>
                    <div className="text-[11px] text-white/30 mt-0.5">
                      {t.creatorName} · <span className="text-amber-400">{t.dueDate}</span>
                    </div>
                  </button>
                  <button onClick={() => dismissAlert(t.id)} className="px-3 py-3 text-white/20 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" title="Dismiss">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
