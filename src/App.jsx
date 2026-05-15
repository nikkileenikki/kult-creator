import { Routes, Route } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Dashboard from '@/pages/Dashboard'
import Projects from '@/pages/Projects'
import Creators from '@/pages/Creators'
import Recruit from '@/pages/Recruit'
import Tiering from '@/pages/Tiering'
import Persona from '@/pages/Persona'
import AddTaskModal from '@/components/modals/AddTaskModal'
import AddCreatorModal from '@/components/modals/AddCreatorModal'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

const TOAST_STYLES = {
  success: { cls: 'bg-emerald-500/12 border-emerald-500/25 text-emerald-300', Icon: CheckCircle2, iconCls: 'text-emerald-400' },
  error:   { cls: 'bg-rose-500/12 border-rose-500/25 text-rose-300',          Icon: AlertCircle,   iconCls: 'text-rose-400' },
  info:    { cls: 'bg-violet-500/12 border-violet-500/25 text-violet-300',    Icon: Info,          iconCls: 'text-violet-400' },
}

function Toast() {
  const toast = useUIStore(s => s.toast)
  if (!toast) return null
  const { cls, Icon, iconCls } = TOAST_STYLES[toast.type] || TOAST_STYLES.success
  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] font-medium shadow-2xl animate-toast-in',
      cls,
    )}>
      <Icon size={15} className={cn('flex-shrink-0', iconCls)} />
      {toast.message}
    </div>
  )
}

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0D0D10]">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/recruit"  element={<Recruit />} />
            <Route path="/tiering"  element={<Tiering />} />
            <Route path="/persona"  element={<Persona />} />
          </Routes>
        </main>
      </div>

      {/* Global modals */}
      <AddTaskModal />
      <AddCreatorModal />

      {/* Toast */}
      <Toast />
    </div>
  )
}
