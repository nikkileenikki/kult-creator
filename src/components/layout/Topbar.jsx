import { Bell, Search, LogOut } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useEffect, useMemo } from 'react'
import NotificationsPanel from './NotificationsPanel'

const ROLE_AVATAR_COLOR = {
  admin:   'from-amber-500 to-amber-400',
  manager: 'from-violet-500 to-violet-400',
  pic:     'from-blue-500 to-blue-400',
  viewer:  'from-white/20 to-white/10',
}

function getUserInitials(displayName) {
  if (!displayName) return '?'
  return displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}


const PAGE_META = {
  '/':          { cta: null, action: null, placeholder: 'Search tasks…',     permission: null },
  '/campaigns': { cta: null, action: null, placeholder: 'Search campaigns…', permission: null },
  '/creators':  { cta: null, action: null, placeholder: 'Search creators…',  permission: null },
  '/brands':    { cta: null, action: null, placeholder: 'Search brands…',    permission: null },
  '/niche':     { cta: null, action: null, placeholder: 'Search niches…',    permission: null },
  '/recruit':   { cta: null, action: null, placeholder: 'Search requests…',  permission: null },
  '/tiering':   { cta: null,           action: null,               placeholder: 'Search creators…',  permission: null },
  '/settings':  { cta: null,           action: null,               placeholder: 'Search…',           permission: null },
  '/users':     { cta: null,           action: null,               placeholder: 'Search users…',     permission: null },
  '/users/new': { cta: null,           action: null,               placeholder: 'Search…',           permission: null },
}

export default function Topbar() {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname]
    ?? (pathname.startsWith('/creator/') ? { cta: null, action: null, placeholder: 'Search profile…' } : PAGE_META['/'])

  const openAddTask         = useUIStore(s => s.openAddTask)
  const openAddCreator      = useUIStore(s => s.openAddCreator)
  const openAddCampaign     = useUIStore(s => s.openAddCampaign)
  const openAddBrand        = useUIStore(s => s.openAddBrand)
  const toggleNotifications = useUIStore(s => s.toggleNotifications)
  const notificationsOpen   = useUIStore(s => s.notificationsOpen)
  const globalSearch        = useUIStore(s => s.globalSearch)
  const setGlobalSearch     = useUIStore(s => s.setGlobalSearch)
  const user                = useAuthStore(s => s.user)
  const logout              = useAuthStore(s => s.logout)
  const can                 = useAuthStore(s => s.can)

  useEffect(() => { setGlobalSearch('') }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const tasks           = useTaskStore(s => s.tasks)
  const dismissedAlerts = useUIStore(s => s.dismissedAlerts)
  const mentions        = useNotificationStore(s => s.mentions.filter(n => !n.read))
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
        {/* Logged-in user display + logout */}
        {user && (
          <div className="flex items-center gap-2 h-[34px] px-2.5 rounded-lg bg-[#1E1E28] border border-white/7">
            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${ROLE_AVATAR_COLOR[user.role] ?? 'from-white/20 to-white/10'} flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0`}>
              {getUserInitials(user.displayName)}
            </div>
            <span className="text-[12px] font-medium text-white/70">{user.displayName}</span>
            <button
              onClick={logout}
              title="Sign out"
              className="ml-1 text-white/25 hover:text-white/70 transition-colors flex-shrink-0"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className={`relative w-[34px] h-[34px] bg-[#1E1E28] border rounded-lg flex items-center justify-center transition-all ${(alertCount + mentions.length) > 0 ? 'border-violet-500/40 text-violet-300 hover:border-violet-400/60 hover:text-violet-200' : 'border-white/7 text-white/40 hover:border-white/12 hover:text-white/80'}`}
          >
            <Bell size={15} strokeWidth={1.8} />
            {(alertCount + mentions.length) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-violet-500 rounded-full border border-[#111116] flex items-center justify-center font-mono text-[9px] font-bold text-white animate-pulse">
                {alertCount + mentions.length}
              </span>
            )}
          </button>
          {notificationsOpen && <NotificationsPanel />}
        </div>

        {/* CTA — only shown when the page has an action AND the user has the required permission */}
        {meta.cta && (!meta.permission || can(meta.permission)) && (
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
