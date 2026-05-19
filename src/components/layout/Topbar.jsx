import { Bell, Search, ChevronDown } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useTaskStore } from '@/store/taskStore'
import { useEffect, useMemo } from 'react'
import NotificationsPanel from './NotificationsPanel'

const USERS = ['Sarah K.', 'Lina M.', 'Admin']
const USER_INITIALS = { 'Sarah K.': 'SK', 'Lina M.': 'LM', 'Admin': 'AD' }
const USER_COLOR = { 'Sarah K.': 'from-violet-500 to-violet-400', 'Lina M.': 'from-teal-500 to-teal-400', 'Admin': 'from-amber-500 to-amber-400' }

const PAGE_META = {
  '/':          { cta: 'Add Task',     action: 'openAddTask',     placeholder: 'Search tasks…' },
  '/campaigns': { cta: 'Add Campaign', action: 'openAddCampaign', placeholder: 'Search campaigns…' },
  '/creators':  { cta: 'Add Creator',  action: 'openAddCreator',  placeholder: 'Search creators…' },
  '/brands':    { cta: 'New Brand',    action: 'openAddBrand',    placeholder: 'Search brands…' },
  '/niche':     { cta: 'Add Creator',  action: 'openAddCreator',  placeholder: 'Search niches…' },
  '/recruit':   { cta: null,           action: null,               placeholder: 'Search requests…' },
  '/tiering':   { cta: null,           action: null,               placeholder: 'Search creators…' },
  '/settings':  { cta: null,           action: null,               placeholder: 'Search…' },
}

export default function Topbar() {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname]
    ?? (pathname.startsWith('/persona/') ? { cta: null, action: null, placeholder: 'Search profile…' } : PAGE_META['/'])

  const openAddTask         = useUIStore(s => s.openAddTask)
  const openAddCreator      = useUIStore(s => s.openAddCreator)
  const openAddCampaign     = useUIStore(s => s.openAddCampaign)
  const openAddBrand        = useUIStore(s => s.openAddBrand)
  const toggleNotifications = useUIStore(s => s.toggleNotifications)
  const notificationsOpen   = useUIStore(s => s.notificationsOpen)
  const globalSearch        = useUIStore(s => s.globalSearch)
  const setGlobalSearch     = useUIStore(s => s.setGlobalSearch)
  const currentUser         = useUIStore(s => s.currentUser)
  const setCurrentUser      = useUIStore(s => s.setCurrentUser)

  useEffect(() => { setGlobalSearch('') }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const tasks           = useTaskStore(s => s.tasks)
  const dismissedAlerts = useUIStore(s => s.dismissedAlerts)
  const alertCount = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const limit = new Date(today); limit.setDate(today.getDate() + 3)
    return tasks.filter(t => {
      if (dismissedAlerts.has(t.id)) return false
      if (t.status === 'Overdue') return true
      if (t.status === 'Completed') return false
      const due = new Date(t.dueDate)
      return due >= today && due <= limit
    }).length
  }, [tasks, dismissedAlerts])

  function handleCTA() {
    if (meta.action === 'openAddTask')     openAddTask()
    if (meta.action === 'openAddCreator')  openAddCreator()
    if (meta.action === 'openAddCampaign') openAddCampaign()
    if (meta.action === 'openAddBrand')    openAddBrand()
  }

  return (
    <header className="h-[58px] bg-[#111116] border-b border-white/7 flex items-center px-5 gap-4 flex-shrink-0 w-full z-10">
      {/* Logo — fixed width matches sidebar (20px header-left-pad + 208px = 228px) */}
      <div className="flex items-center gap-2.5 pr-5 border-r border-white/7 flex-shrink-0 w-[208px]">
        <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center shadow-[0_0_12px_rgba(108,92,231,.4)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span className="font-syne text-[15px] font-extrabold text-white tracking-tight whitespace-nowrap">Creator Engine</span>
      </div>

      {/* Search — hidden on dashboard */}
      {pathname !== '/' && (
        <div className="flex items-center gap-2 bg-[#1E1E28] border border-white/7 rounded-lg px-3 py-[7px] w-56 hover:border-white/14 focus-within:border-violet-500/40 focus-within:ring-1 focus-within:ring-violet-500/15 transition-all">
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
      )}

      <div className="ml-auto flex items-center gap-2">
        {/* Current user selector */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 h-[34px] px-2.5 rounded-lg bg-[#1E1E28] border border-white/7 hover:border-white/14 transition-all">
            {currentUser ? (
              <>
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${USER_COLOR[currentUser] ?? 'from-white/20 to-white/10'} flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0`}>
                  {USER_INITIALS[currentUser] ?? currentUser.slice(0,2).toUpperCase()}
                </div>
                <span className="text-[12px] font-medium text-white/70">{currentUser}</span>
              </>
            ) : (
              <span className="text-[12px] text-white/30">Select user</span>
            )}
            <ChevronDown size={11} className="text-white/30" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-36 bg-[#1E1E28] border border-white/10 rounded-xl shadow-2xl py-1 z-50 hidden group-hover:block">
            {USERS.map(u => (
              <button key={u} onClick={() => setCurrentUser(u)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition-colors hover:bg-white/5 ${currentUser === u ? 'text-violet-300' : 'text-white/60'}`}>
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${USER_COLOR[u]} flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0`}>
                  {USER_INITIALS[u]}
                </div>
                {u}
              </button>
            ))}
          </div>
        </div>

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
