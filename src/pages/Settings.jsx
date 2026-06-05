import { useState } from 'react'
import { useCreatorStore } from '@/store/creatorStore'
import { useTaskStore } from '@/store/taskStore'
import { useRecruitStore } from '@/store/recruitStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import { request, USE_MOCK } from '@/lib/api'
import { RotateCcw, AlertTriangle } from 'lucide-react'

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Settings() {
  const fetchCreators  = useCreatorStore(s => s.fetchCreators)
  const fetchTasks     = useTaskStore(s => s.fetchTasks)
  const fetchRecruits  = useRecruitStore(s => s.fetchRecruits)
  const fetchCampaigns = useCampaignStore(s => s.fetchCampaigns)
  const showToast      = useUIStore(s => s.showToast)
  const [confirming, setConfirming] = useState(false)
  const [loading,    setLoading]    = useState(false)

  async function handleReset() {
    if (!confirming) { setConfirming(true); return }
    setLoading(true)
    setConfirming(false)
    try {
      if (USE_MOCK) { showToast('Mock mode: no DB to reset', 'info'); return }
      await request('POST', '/reset')
      await Promise.all([fetchCreators(), fetchTasks(), fetchRecruits(), fetchCampaigns()])
      showToast('Database reset — demo data restored')
    } catch (e) {
      showToast('Reset failed: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-[fadeUp_.3s_ease] max-w-2xl">
      <div className="mb-6">
        <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-[12px] text-white/30 mt-1">App configuration and user management</p>
      </div>

      <div className="space-y-4">
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/7">
              <span className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em]">Data Management</span>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[14px] font-semibold text-white mb-1">Reset to Demo Data</div>
                  <div className="text-[12px] text-white/40 leading-relaxed">
                    Truncates all tables (creators, tasks, campaigns, recruits, activity) and reseeds with the original mock data. This cannot be undone.
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-50 ${
                    confirming
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {loading ? <RotateCcw size={14} className="animate-spin" /> : confirming ? <AlertTriangle size={14} /> : <RotateCcw size={14} />}
                  {loading ? 'Resetting…' : confirming ? 'Confirm reset?' : 'Reset Data'}
                </button>
              </div>
              {confirming && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[12px] text-rose-400/70">Click again to confirm — all data will be permanently deleted.</span>
                  <button onClick={() => setConfirming(false)} className="text-[11px] text-white/30 hover:text-white/60 transition-all ml-auto">Cancel</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-white/15 font-mono px-1">
            <span>CreatorOS v2.0</span>
            <span>·</span>
            <span>{USE_MOCK ? 'Mock mode' : 'Live mode'}</span>
          </div>
        </div>
      </div>
  )
}
