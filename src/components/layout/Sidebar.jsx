import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useRecruitStore } from '@/store/recruitStore'
import { useUIStore } from '@/store/uiStore'
import {
  LayoutGrid, FolderOpen, Users, Star, UserPlus, User, Settings, ChevronLeft, ChevronRight,
} from 'lucide-react'

const NAV = [
  { section: 'Overview', items: [
    { to: '/',          label: 'Dashboard',       icon: LayoutGrid },
    { to: '/campaigns', label: 'Campaigns',        icon: FolderOpen },
  ]},
  { section: 'Creators', items: [
    { to: '/creators',  label: 'All Creators',     icon: Users },
    { to: '/niche',     label: 'Niche',             icon: User },
    { to: '/tiering',   label: 'Tiering',           icon: Star },
    { to: '/recruit',   label: 'Recruit Requests',  icon: UserPlus, badge: true },
  ]},
]

export default function Sidebar() {
  const requests  = useRecruitStore(s => s.requests)
  const pending   = requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length
  const collapsed = useUIStore(s => s.sidebarCollapsed)
  const toggle    = useUIStore(s => s.toggleSidebar)
  const navigate  = useNavigate()

  return (
    <aside className={cn(
      'bg-[#111116] border-r border-white/7 flex flex-col flex-shrink-0 relative overflow-hidden transition-all duration-200',
      collapsed ? 'w-[64px]' : 'w-[228px]',
    )}>
      {/* glow */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-violet-600/10 blur-2xl pointer-events-none" />

      {/* Logo */}
      <div className={cn(
        'px-4 py-5 flex items-center gap-2.5 border-b border-white/7 flex-shrink-0',
        collapsed && 'justify-center px-0',
      )}>
        <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center shadow-[0_0_16px_rgba(108,92,231,.4)] flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        {!collapsed && (
          <>
            <span className="font-syne text-[16px] font-extrabold text-white tracking-tight">CreatorOS</span>
            <span className="ml-auto font-mono text-[9px] text-white/20">v2.0</span>
          </>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2.5">
        {NAV.map(group => (
          <div key={group.section} className="mb-1">
            {!collapsed && (
              <p className="font-mono text-[9px] font-medium text-white/20 uppercase tracking-[.1em] px-2 pt-3 pb-1">{group.section}</p>
            )}
            {collapsed && <div className="pt-3" />}
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-normal transition-all duration-150 mb-0.5 relative',
                  collapsed && 'justify-center px-0 py-2.5',
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[18px] before:bg-violet-400 before:rounded-r-sm before:shadow-[0_0_8px_rgba(108,92,231,.8)]'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                )}
              >
                <div className="relative flex-shrink-0">
                  <item.icon size={15} strokeWidth={1.8} />
                  {item.badge && pending > 0 && collapsed && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-[#111116]" />
                  )}
                </div>
                {!collapsed && item.label}
                {!collapsed && item.badge && pending > 0 && (
                  <span className="ml-auto font-mono text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-400/12 text-amber-300 border border-amber-400/20">
                    {pending}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-white/7 flex-shrink-0 space-y-1.5">
        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-all',
            collapsed && 'justify-center px-0',
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : (
            <>
              <ChevronLeft size={14} />
              <span className="text-[11px] font-medium">Collapse</span>
            </>
          )}
        </button>

        {/* User */}
        {!collapsed ? (
          <div onClick={() => navigate('/settings')} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5 border border-white/7 cursor-pointer hover:border-white/12 transition-all">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center font-syne text-[11px] font-bold text-white flex-shrink-0">NK</div>
            <div>
              <div className="text-[12px] font-medium text-white">Nikki</div>
              <div className="text-[10px] text-white/30">Campaign Manager</div>
            </div>
            <Settings size={13} className="ml-auto text-white/20" />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center font-syne text-[11px] font-bold text-white cursor-pointer" title="Nikki">NK</div>
          </div>
        )}
      </div>
    </aside>
  )
}
