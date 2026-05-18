import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useRecruitStore } from '@/store/recruitStore'
import {
  LayoutGrid, FolderOpen, Users, Star, UserPlus, User, Settings
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
  const requests = useRecruitStore(s => s.requests)
  const pending  = requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length

  return (
    <aside className="w-[228px] bg-[#111116] border-r border-white/7 flex flex-col flex-shrink-0 relative overflow-hidden">
      {/* glow */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-violet-600/10 blur-2xl pointer-events-none" />

      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2.5 border-b border-white/7 flex-shrink-0">
        <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center shadow-[0_0_16px_rgba(108,92,231,.4)] flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span className="font-syne text-[16px] font-extrabold text-white tracking-tight">CreatorOS</span>
        <span className="ml-auto font-mono text-[9px] text-white/20">v2.0</span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2.5">
        {NAV.map(group => (
          <div key={group.section} className="mb-1">
            <p className="font-mono text-[9px] font-medium text-white/20 uppercase tracking-[.1em] px-2 pt-3 pb-1">{group.section}</p>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-normal transition-all duration-150 mb-0.5 relative',
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[18px] before:bg-violet-400 before:rounded-r-sm before:shadow-[0_0_8px_rgba(108,92,231,.8)]'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                )}
              >
                <item.icon size={15} strokeWidth={1.8} className="flex-shrink-0" />
                {item.label}
                {item.badge && pending > 0 && (
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
      <div className="p-2.5 border-t border-white/7 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5 border border-white/7 cursor-pointer hover:border-white/12 transition-all">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center font-syne text-[11px] font-bold text-white flex-shrink-0">NK</div>
          <div>
            <div className="text-[12px] font-medium text-white">Nikki</div>
            <div className="text-[10px] text-white/30">Campaign Manager</div>
          </div>
          <Settings size={13} className="ml-auto text-white/20" />
        </div>
      </div>
    </aside>
  )
}
