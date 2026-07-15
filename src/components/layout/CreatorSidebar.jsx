import { NavLink } from 'react-router-dom'
import { LayoutGrid, ListTodo, ShoppingBag, Settings, LogOut } from 'lucide-react'
import { creatorAuthClient } from '@/lib/creatorAuth'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/portal/dashboard', label: 'Dashboard',   icon: LayoutGrid },
  { to: '/portal/my-tasks',  label: 'My Tasks',    icon: ListTodo },
  { to: '/portal/browse',    label: 'Browse Tasks', icon: ShoppingBag },
]

const LINK = ({ isActive }) => cn(
  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-normal transition-all duration-150 mb-0.5 relative',
  isActive
    ? 'bg-violet-600/15 text-violet-300 font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-[18px] before:bg-violet-400 before:rounded-r-sm before:shadow-[0_0_8px_rgba(108,92,231,.8)]'
    : 'text-white/40 hover:bg-white/5 hover:text-white/80'
)

export default function CreatorSidebar() {
  function signOut() {
    creatorAuthClient.signOut().then(() => { window.location.href = '/login' })
  }

  return (
    <aside id="creator-sidebar" className="w-[228px] bg-[#111116] border-r border-white/7 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div id="creator-sidebar-logo" className="px-4 py-5 border-b border-white/7 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center shadow-[0_0_16px_rgba(108,92,231,.4)]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-syne text-[14px] font-extrabold text-white tracking-tight">Creator Engine</span>
        </div>
      </div>

      {/* Nav */}
      <nav id="creator-sidebar-nav" className="flex-1 overflow-y-auto px-2.5 py-2.5">
        <p className="font-mono text-[9px] font-medium text-white/20 uppercase tracking-[.1em] px-2 pt-3 pb-1">Menu</p>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} id={`creator-nav-${label.toLowerCase().replace(/\s+/g, '-')}`} className={LINK}>
            <Icon size={15} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div id="creator-sidebar-footer" className="p-2.5 border-t border-white/7 flex-shrink-0 space-y-1">
        <NavLink id="creator-nav-account" to="/portal/account" className={LINK}>
          <Settings size={15} strokeWidth={1.8} />
          Account Settings
        </NavLink>
        <button
          id="creator-signout-btn"
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-white/30 hover:text-rose-400 hover:bg-rose-500/8 transition-all"
        >
          <LogOut size={15} strokeWidth={1.8} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
