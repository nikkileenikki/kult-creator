import { useState, useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'
import { creatorAuthHeaders } from '@/lib/creatorAuth'
import { Clock, CheckCircle2, CircleDot, AlertCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react'

const STATUS_STYLE = {
  'Not Started':  'text-white/40 bg-white/5 border-white/10',
  'In Progress':  'text-blue-300 bg-blue-500/10 border-blue-500/20',
  'Under Review': 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  'Completed':    'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
}

function camel(row) {
  if (!row) return row
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v
  }
  return out
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const due = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((due - now) / 86400000)
}

function DueBadge({ dueDate }) {
  if (!dueDate) return null
  const days = daysUntil(dueDate)
  const overdue  = days < 0
  const dueToday = days === 0
  const urgent   = days <= 2 && days >= 0
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
      overdue  ? 'text-rose-300 bg-rose-500/10 border-rose-500/20'   :
      dueToday ? 'text-rose-300 bg-rose-500/10 border-rose-500/20'   :
      urgent   ? 'text-amber-300 bg-amber-500/10 border-amber-500/20' :
                 'text-white/30 bg-white/5 border-white/8'
    }`}>
      <Clock size={9} />
      {overdue ? 'Overdue' : dueToday ? 'Due today' : `${days}d left`}
    </span>
  )
}

function MyTaskRow({ task, onSubmitProof }) {
  const [proofOpen,  setProofOpen]  = useState(false)
  const [proof,      setProof]      = useState('')
  const [submitting, setSubmitting] = useState(false)
  const showToast = useUIStore(s => s.showToast)

  const isCompleted   = task.status === 'Completed'
  const isInProgress  = task.status === 'In Progress'
  const isUnderReview = task.status === 'Under Review'

  async function handleSubmit() {
    if (!proof.trim()) { showToast('Please describe what you completed', 'error'); return }
    setSubmitting(true)
    try {
      await onSubmitProof(task.id, proof.trim())
      setProofOpen(false)
      setProof('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`rounded-[14px] border transition-colors ${
      isCompleted   ? 'border-white/5 bg-white/[0.015]'      :
      isUnderReview ? 'border-amber-500/15 bg-amber-500/4'   :
                      'border-blue-500/15 bg-blue-500/5'
    }`}>
      <div className="p-4">
        {/* Campaign + Brand */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {task.campaignColor && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: task.campaignColor }} />}
          <span className="text-[11px] text-white/40">{task.project}</span>
          {task.brandName && <><span className="text-white/15 text-[11px]">·</span><span className="text-[11px] text-white/30">{task.brandName}</span></>}
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <DueBadge dueDate={task.dueDate} />
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_STYLE[task.status] ?? STATUS_STYLE['Not Started']}`}>
              {task.status}
            </span>
          </div>
        </div>

        {/* Task name */}
        <div className="flex items-start gap-2 mb-2">
          <div className={`mt-0.5 flex-shrink-0 ${isCompleted ? 'text-emerald-400' : isUnderReview ? 'text-amber-400' : 'text-blue-400'}`}>
            {isCompleted ? <CheckCircle2 size={14} /> : isUnderReview ? <AlertCircle size={14} /> : <CircleDot size={14} />}
          </div>
          <div className="text-[14px] font-semibold text-white leading-snug">{task.task}</div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-[12px] text-white/40 leading-relaxed mb-2 pl-[22px]">{task.description}</p>
        )}

        {/* Notes for creator */}
        {task.notes && (
          <div className="pl-[22px] mb-2">
            <p className="text-[12px] text-violet-300/60 leading-relaxed border-l-2 border-violet-500/25 pl-2 italic">{task.notes}</p>
          </div>
        )}

        {/* Proof read-back */}
        {isUnderReview && task.proofText && (
          <div className="pl-[22px] mb-2">
            <p className="text-[11px] text-amber-300/50 italic">Submitted: "{task.proofText}"</p>
          </div>
        )}
        {isUnderReview && !task.proofText && (
          <div className="pl-[22px]">
            <p className="text-[11px] text-amber-400/50">Proof submitted — awaiting review</p>
          </div>
        )}

        {/* Submit proof button */}
        {isInProgress && (
          <div className="pl-[22px] mt-2">
            <button
              onClick={() => setProofOpen(v => !v)}
              className="inline-flex items-center gap-1.5 text-[11px] text-amber-400/70 hover:text-amber-300 transition-colors"
            >
              {proofOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {proofOpen ? 'Cancel' : 'Submit proof of completion'}
            </button>
          </div>
        )}
      </div>

      {/* Proof panel */}
      {proofOpen && isInProgress && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <p className="text-[11px] text-white/30 mb-2">Describe what you completed or paste a link:</p>
          <textarea
            value={proof}
            onChange={e => setProof(e.target.value)}
            rows={3}
            placeholder="e.g. Posted TikTok reel at https://tiktok.com/… — 12k views in 24h"
            className="w-full bg-[#111116] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 resize-none transition-all"
          />
          <div className="flex items-center justify-end gap-2 mt-2">
            <button onClick={() => { setProofOpen(false); setProof('') }} className="text-[12px] text-white/30 hover:text-white/60 transition-colors px-3 py-1.5">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !proof.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 text-amber-300 text-[12px] font-semibold transition-all disabled:opacity-40"
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const FILTERS = ['All', 'In Progress', 'Under Review', 'Completed']

export default function CreatorMyTasks({ session }) {
  const showToast = useUIStore(s => s.showToast)
  const [myTasks,    setMyTasks]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [taskFilter, setTaskFilter] = useState('All')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/creator-portal/tasks', { headers: creatorAuthHeaders() })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setMyTasks((data.myTasks ?? []).map(camel))
      } catch (e) {
        showToast('Failed to load tasks: ' + e.message, 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  async function submitProof(taskId, proof) {
    try {
      const res = await fetch(`/api/creator-portal/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...creatorAuthHeaders() },
        body: JSON.stringify({ status: 'Under Review', proof }),
      })
      if (!res.ok) throw new Error(await res.text())
      const updated = camel(await res.json())
      setMyTasks(prev => prev.map(t => t.id === taskId ? updated : t))
      showToast('Proof submitted — awaiting review!')
    } catch {
      showToast('Failed to submit proof', 'error')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-white/30 text-[13px]">Loading…</div>

  const filtered = taskFilter === 'All' ? myTasks : myTasks.filter(t => t.status === taskFilter)

  const counts = {
    'In Progress':  myTasks.filter(t => t.status === 'In Progress').length,
    'Under Review': myTasks.filter(t => t.status === 'Under Review').length,
    'Completed':    myTasks.filter(t => t.status === 'Completed').length,
  }

  return (
    <div id="creator-my-tasks" className="animate-[fadeUp_.3s_ease] max-w-2xl">
      <div className="mb-6">
        <h1 className="font-syne text-[20px] font-extrabold text-white tracking-tight">My Tasks</h1>
        <p className="text-[12px] text-white/30 mt-1">Tasks you have accepted</p>
      </div>

      {myTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-[14px] bg-[#1A1A24] border border-white/7 text-white/20">
          <Zap size={24} className="mb-2 opacity-30" />
          <span className="text-[13px]">No tasks yet — browse the marketplace to accept one</span>
        </div>
      ) : (
        <>
          <div id="my-tasks-filter-bar" className="flex items-center gap-1 mb-4 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setTaskFilter(f)}
                id={`filter-${f.toLowerCase().replace(/\s+/g, '-')}`}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all ${
                  taskFilter === f
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-white/30 hover:text-white/60 border border-transparent hover:border-white/10'
                }`}
              >
                {f}
                {f !== 'All' && counts[f] > 0 && (
                  <span className="ml-1 text-[9px] opacity-60">{counts[f]}</span>
                )}
              </button>
            ))}
            <span className="ml-auto font-mono text-[10px] text-white/20">{myTasks.length} total</span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-20 rounded-[12px] bg-[#1A1A24] border border-white/7 text-white/20 text-[13px]">
              No {taskFilter.toLowerCase()} tasks
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(t => <MyTaskRow key={t.id} task={t} onSubmitProof={submitProof} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
