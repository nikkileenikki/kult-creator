import { Routes, Route } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Dashboard from '@/pages/Dashboard'
import Projects from '@/pages/Projects'
import Creators from '@/pages/Creators'
import Recruit from '@/pages/Recruit'
import Tiering from '@/pages/Tiering'
import Persona from '@/pages/Persona'

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
    </div>
  )
}
