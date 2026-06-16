import { Routes, Route } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Dashboard from '@/pages/Dashboard'
import Campaigns from '@/pages/Campaigns'
import Creators from '@/pages/Creators'
import Recruit from '@/pages/Recruit'
import Tiering from '@/pages/Tiering'
import Persona from '@/pages/Persona'
import Niche from '@/pages/Niche'
import Brands from '@/pages/Brands'
import Settings from '@/pages/Settings'
import Users from '@/pages/Users'
import NewUser from '@/pages/NewUser'
import Login from '@/pages/Login'
import AddTaskModal from '@/components/modals/AddTaskModal'
import AddCreatorModal from '@/components/modals/AddCreatorModal'
import AddCampaignModal from '@/components/modals/AddCampaignModal'
import AddBrandModal from '@/components/modals/AddBrandModal'
import EditTaskModal from '@/components/modals/EditTaskModal'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useCreatorStore } from '@/store/creatorStore'
import { useTaskStore } from '@/store/taskStore'
import { useRecruitStore } from '@/store/recruitStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useBrandStore } from '@/store/brandStore'
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
  const token = useAuthStore(s => s.token)
  const user  = useAuthStore(s => s.user)

  const fetchCreators  = useCreatorStore(s => s.fetchCreators)
  const fetchTasks     = useTaskStore(s => s.fetchTasks)
  const fetchRecruits  = useRecruitStore(s => s.fetchRecruits)
  const fetchCampaigns = useCampaignStore(s => s.fetchCampaigns)
  const fetchBrands    = useBrandStore(s => s.fetchBrands)
  const fetchPics      = useAuthStore(s => s.fetchPics)

  useEffect(() => {
    if (!token || !user) return
    fetchCreators()
    fetchTasks()
    fetchRecruits()
    fetchCampaigns()
    fetchBrands()
    fetchPics()
  }, [token, user]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!token || !user) {
    return <Login />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0D0D10]">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/campaigns"   element={<Campaigns />} />
            <Route path="/creators"    element={<Creators />} />
            <Route path="/brands"      element={<Brands />} />
            <Route path="/recruit"     element={<Recruit />} />
            <Route path="/tiering"     element={<Tiering />} />
            <Route path="/niche"       element={<Niche />} />
            <Route path="/creator/:id" element={<Persona />} />
            <Route path="/settings"    element={<Settings />} />
            <Route path="/users"       element={<Users />} />
            <Route path="/users/new"   element={<NewUser />} />
          </Routes>
        </main>
      </div>

      {/* Global modals */}
      <AddTaskModal />
      <AddCreatorModal />
      <AddCampaignModal />
      <AddBrandModal />
      <EditTaskModal />

      {/* Toast */}
      <Toast />
    </div>
  )
}
