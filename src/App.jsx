import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import CreatorSidebar from '@/components/layout/CreatorSidebar'
import Topbar from '@/components/layout/Topbar'
import Dashboard from '@/pages/Dashboard'
import Campaigns from '@/pages/Campaigns'
import Creators from '@/pages/Creators'
import Recruit from '@/pages/Recruit'
import Tiering from '@/pages/Tiering'
import Persona from '@/pages/Persona'
import Niche from '@/pages/Niche'
import Brands from '@/pages/Brands'
import ProjectManagement from '@/pages/ProjectManagement'
import Reports from '@/pages/Reports'
import Settings from '@/pages/Settings'
import Users from '@/pages/Users'
import NewUser from '@/pages/NewUser'
import Login from '@/pages/Login'
import CreatorLogin from '@/pages/CreatorLogin'
import CreatorDashboard from '@/pages/portal/CreatorDashboard'
import CreatorMyTasks from '@/pages/portal/CreatorMyTasks'
import CreatorTasks from '@/pages/portal/CreatorTasks'
import CreatorAccount from '@/pages/portal/CreatorAccount'
import CreatorAccounts from '@/pages/CreatorAccounts'
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
import { useNicheStore } from '@/store/nicheStore'
import { useInternalProjectStore } from '@/store/internalProjectStore'
import { useNotificationStore } from '@/store/notificationStore'
import { creatorAuthClient } from '@/lib/creatorAuth'
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

function CreatorPortalShell() {
  const [session,   setSession]   = useState(undefined)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    document.documentElement.classList.add('portal-route')
    document.body.classList.add('portal-route')
    return () => {
      document.documentElement.classList.remove('portal-route')
      document.body.classList.remove('portal-route')
    }
  }, [])

  useEffect(() => {
    creatorAuthClient.getSession()
      .then(s => setSession(s?.user ?? null))
      .catch(() => setSession(null))
      .finally(() => setIsPending(false))
  }, [])

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#0D0D10] flex items-center justify-center">
        <div className="text-white/30 text-[13px]">Loading…</div>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D0D10]">
      <CreatorSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/portal"              element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="/portal/dashboard"  element={<CreatorDashboard session={session} />} />
          <Route path="/portal/my-tasks"   element={<CreatorMyTasks session={session} />} />
          <Route path="/portal/browse"     element={<CreatorTasks session={session} />} />
          <Route path="/portal/tasks"      element={<Navigate to="/portal/my-tasks" replace />} />
          <Route path="/portal/account"    element={<CreatorAccount session={session} />} />
          <Route path="*"                  element={<Navigate to="/portal/dashboard" replace />} />
        </Routes>
      </main>
      <Toast />
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()

  // Creator-facing routes — completely separate from internal app
  if (pathname === '/login') return <><CreatorLogin /><Toast /></>
  if (pathname.startsWith('/portal')) return <CreatorPortalShell />

  // Internal app
  const token = useAuthStore(s => s.token)
  const user  = useAuthStore(s => s.user)

  const fetchCreators  = useCreatorStore(s => s.fetchCreators)
  const fetchTasks     = useTaskStore(s => s.fetchTasks)
  const fetchRecruits  = useRecruitStore(s => s.fetchRecruits)
  const fetchCampaigns = useCampaignStore(s => s.fetchCampaigns)
  const fetchBrands    = useBrandStore(s => s.fetchBrands)
  const fetchPics         = useAuthStore(s => s.fetchPics)
  const fetchNiches       = useNicheStore(s => s.fetchNiches)
  const fetchIntProjects  = useInternalProjectStore(s => s.fetchProjects)
  const startPolling = useNotificationStore(s => s.startPolling)

  useEffect(() => {
    if (!token || !user) return
    fetchCreators()
    fetchTasks()
    fetchRecruits()
    fetchCampaigns()
    fetchBrands()
    fetchPics()
    fetchNiches()
    fetchIntProjects()
    if (user?.displayName) startPolling(user.displayName)
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
            <Route path="/"                 element={<Dashboard />} />
            <Route path="/campaigns"        element={<Campaigns />} />
            <Route path="/projects"         element={<ProjectManagement />} />
            <Route path="/reports"          element={<Reports />} />
            <Route path="/creators"         element={<Creators />} />
            <Route path="/brands"           element={<Brands />} />
            <Route path="/recruit"          element={<Recruit />} />
            <Route path="/tiering"          element={<Tiering />} />
            <Route path="/niche"            element={<Niche />} />
            <Route path="/creator/:id"      element={<Persona />} />
            <Route path="/settings"         element={<Settings />} />
            <Route path="/users"            element={<Users />} />
            <Route path="/users/new"        element={<NewUser />} />
            <Route path="/creator-accounts" element={<CreatorAccounts />} />
            <Route path="*"                 element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global modals */}
      <AddTaskModal />
      <AddCreatorModal />
      <AddCampaignModal />
      <AddBrandModal />
      <EditTaskModal />

      <Toast />
    </div>
  )
}
