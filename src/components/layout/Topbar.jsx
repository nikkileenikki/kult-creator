import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'

const PAGE_META = {
  '/':          { title: 'Dashboard',        cta: 'Add Task',     action: 'openAddTask' },
  '/campaigns': { title: 'Campaigns',        cta: 'Add Campaign', action: 'openAddCampaign' },
  '/creators':  { title: 'Creators',         cta: 'Add Creator',  action: 'openAddCreator' },
  '/niche':     { title: 'Niche',            cta: 'Add Creator',  action: 'openAddCreator' },
  '/recruit':   { title: 'Recruit Requests', cta: null,           action: null },
  '/tiering':   { title: 'Tiering',          cta: null,           action: null },
}

export default function Topbar() {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname]
    ?? (pathname.startsWith('/persona/') ? { title: 'Creator Persona', cta: null, action: null } : PAGE_META['/'])
  const openAddTask     = useUIStore(s => s.openAddTask)
  const openAddCreator  = useUIStore(s => s.openAddCreator)
  const openAddCampaign = useUIStore(s => s.openAddCampaign)

  function handleCTA() {
    if (meta.action === 'openAddTask')     openAddTask()
    if (meta.action === 'openAddCreator')  openAddCreator()
    if (meta.action === 'openAddCampaign') openAddCampaign()
  }

  return (
    <header className="h-[58px] bg-[#111116] border-b border-white/7 flex items-center px-6 gap-4 flex-shrink-0">
      <span className="font-syne text-[15px] font-bold text-white tracking-tight">{meta.title}</span>

      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#1E1E28] border border-white/7 rounded-lg px-3 py-[7px] w-52 text-[12px] text-white/30 cursor-text hover:border-white/12 transition-all">
          <Search size={13} className="flex-shrink-0" />
          <span>Search creators, tasks...</span>
          <kbd className="ml-auto font-mono text-[9px] bg-[#16161C] border border-white/7 px-1 py-0.5 rounded text-white/20">⌘K</kbd>
        </div>

        {/* Notification bell */}
        <div className="relative w-[34px] h-[34px] bg-[#1E1E28] border border-white/7 rounded-lg flex items-center justify-center cursor-pointer hover:border-white/12 transition-all text-white/40 hover:text-white/80">
          <Bell size={15} strokeWidth={1.8} />
          <span className="absolute top-[7px] right-[7px] w-1.5 h-1.5 bg-violet-500 rounded-full border border-[#111116]" />
        </div>

        {/* CTA — hidden when no action defined for this page */}
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
