import { useEffect, useRef, useMemo } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useUIStore } from '@/store/uiStore'

export default function NotificationsPanel() {
  const panelRef   = useRef(null)
  const tasks      = useTaskStore(s => s.tasks)
  const openEdit   = useUIStore(s => s.openEditTask)
  const close      = useUIStore(s => s.closeNotifications)

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

    const overdue = tasks.filter(t => t.status === 'Overdue')
    const dueSoon = tasks.filter(t => {
      if (t.status === 'Completed' || t.status === 'Overdue') return false
      const due = new Date(t.dueDate)
      return due >= today && due <= limit
    })
    return { overdue, dueSoon }
  }, [tasks])

  const isEmpty = overdue.length === 0 && dueSoon.length === 0

  function handleClick(id) {
    openEdit(id)
    close()
  }

  return (
    <div
      ref={panelRef}
      className="absolute top-[calc(100%+8px)] right-0 z-50 w-[320px] bg-[#111116] border border-white/[0.08] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,.6)] overflow-hidden animate-[fadeUp_.15s_ease]"
    >
      <div className="px-4 py-3 border-b border-white/[0.07]">
        <span className="font-syne text-[13px] font-bold text-white">Notifications</span>
        {!isEmpty && (
          <span className="ml-2 font-mono text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
            {overdue.length + dueSoon.length}
          </span>
        )}
      </div>

      {isEmpty ? (
        <div className="px-4 py-8 text-center">
          <div className="text-2xl mb-2">✓</div>
          <div className="text-[13px] text-white/30">All caught up!</div>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto">
          {overdue.length > 0 && (
            <div>
              <div className="px-4 py-2 font-mono text-[9px] text-rose-400/60 uppercase tracking-[.08em] bg-rose-500/5">
                Overdue · {overdue.length}
              </div>
              {overdue.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleClick(t.id)}
                  className="w-full text-left px-4 py-3 border-b border-white/[0.05] hover:bg-white/[.03] transition-colors"
                >
                  <div className="text-[13px] font-medium text-white leading-snug">{t.task}</div>
                  <div className="text-[11px] text-white/30 mt-0.5">
                    {t.creatorName} · <span className="text-rose-400">{t.dueDate}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {dueSoon.length > 0 && (
            <div>
              <div className="px-4 py-2 font-mono text-[9px] text-amber-400/60 uppercase tracking-[.08em] bg-amber-500/5">
                Due Soon · {dueSoon.length}
              </div>
              {dueSoon.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleClick(t.id)}
                  className="w-full text-left px-4 py-3 border-b border-white/[0.05] last:border-0 hover:bg-white/[.03] transition-colors"
                >
                  <div className="text-[13px] font-medium text-white leading-snug">{t.task}</div>
                  <div className="text-[11px] text-white/30 mt-0.5">
                    {t.creatorName} · <span className="text-amber-400">{t.dueDate}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
