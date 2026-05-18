import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useTaskStore } from '@/store/taskStore'
import { useEffect, useMemo } from 'react'
import NotificationsPanel from './NotificationsPanel'

const PAGE_META = {
  '/':          { cta: 'Add Task',     action: 'openAddTask',     placeholder: 'Search tasks…' },
  '/campaigns': { cta: 'Add Campaign', action: 'openAddCampaign', placeholder: 'Search campaigns…' },
  '/creators':  { cta: 'Add Creator',  action: 'openAddCreator',  placeholder: 'Search creators…' },
  '/niche':     { cta: 'Add Creator',  action: 'openAddCreator',  placeholder: 'Search creators…' },
  '/recruit':   { cta: null,           action: null,               placeholder: 'Search requests…' },
  '/tiering':   { cta: null,           action: null,               placeholder: 'Search creators…' },
}

export default function Topbar() {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname]
    ?? (pathname.startsWith('/persona/') ? { cta: null, action: null, placeholder: 'Search…' } : PAGE_META['/'])

  const openAddTask         = useUIStore(s => s.openAddTask)
  const openAddCreator      = useUIStore(s => s.openAddCreator)
  const openAddCampaign     = useUIStore(s => s.openAddCampaign)
  const toggleNotifications = useUIStore(s => s.toggleNotifications)
  const notificationsOpen   = useUIStore(s => s.notificationsOpen)
  const globalSearch        = useUIStore(s => s.globalSearch)
  const setGlobalSearch     = useUIStore(s => s.setGlobalSearch)

  // Clear search when navigating
  useEffect(() => { setGlobalSearch('') }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const tasks = useTaskStore(s => s.tasks)
  const alertCount = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const limit = new Date(today); limit.setDate(today.getDate() + 3)
    return tasks.filter(t => {
      if (t.status === 'Overdue') return true
      if (t.status === 'Completed') return false
      const due = new Date(t.dueDate)
      return due >= today && due <= limit
    }).length
  }, [tasks])

  function handleCTA() {
    if (meta.action === 'openAddTask')     openAddTask()
    if (meta.action === 'openAddCreator')  openAddCreator()
    if (meta.action === 'openAddCampaign') openAddCampaign()
  }

  return (
    <header className="h-[58px] bg-[#111116] border-b border-white/7 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex items-center gap-2 bg-[#1E1E28] border border-white/7 rounded-lg px-3 py-[7px] w-60 hover:border-white/14 focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/15 transition-all">
        <Search size={13} className="flex-shrink-0 text-white/30" />
        <input
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          placeholder={meta.placeholder}
          className="bg-transparent outline-none text-[13px] text-white placeholder:text-white/25 w-full"
        />
        {globalSearch && (
          <button onClick={() => setGlobalSearch('')} className="text-white/25 hover:text-white/60 text-[11px] leading-none flex-shrink-0">✕</button>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative w-[34px] h-[34px] bg-[#1E1E28] border border-white/7 rounded-lg flex items-center justify-center hover:border-white/12 transition-all text-white/40 hover:text-white/80"
          >
            <Bell size={15} strokeWidth={1.8} />
            {alertCount > 0 && (
              <span className="absolute top-[7px] right-[7px] w-1.5 h-1.5 bg-violet-500 rounded-full border border-[#111116]" />
            )}
          </button>
          {notificationsOpen && <NotificationsPanel />}
        </div>

        {/* CTA */}
        {meta.cta && (
          <button
            onClick={handleCTA}
            className="flex items-center gap-1.5 px-4 py-[7px] rounded-lg bg-violet-600 text-white text-[13px] font-semibold hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(108,92,231,.3)] hover:shadow-[0_0_28px_rgba(108,92,231,.4)] hover:-translate-y-px"
          >
            <span className="text-base leading-none">+</span>
            {meta.cta}
          </button>
        )}
      </div>
    </header>
  )
}
