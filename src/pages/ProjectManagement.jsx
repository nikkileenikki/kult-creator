import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useInternalProjectStore } from '@/store/internalProjectStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import * as Dialog from '@radix-ui/react-dialog'
import { Plus, X, Trash2, Pencil, Kanban, List, ChevronRight, FolderOpen, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'

// ── Constants ────────────────────────────────────────────────────────────────

const PROJ_COLORS  = ['#6C5CE7','#0891B2','#D97706','#059669','#DC2626','#7C3AED','#DB2777','#EA580C']
const PROJ_STATUS  = ['Planning', 'Active', 'On Hold', 'Completed']
const TASK_STATUS  = ['To Do', 'In Progress', 'In Review', 'Blocked', 'Done']
const PRIORITY_OPT = ['Low', 'Medium', 'High', 'Urgent']

const PRIORITY_DOT    = { Urgent:'bg-rose-400', High:'bg-orange-400', Medium:'bg-amber-400', Low:'bg-emerald-400' }
const PRIORITY_TXT    = { Urgent:'text-rose-400', High:'text-orange-400', Medium:'text-amber-400', Low:'text-emerald-400' }
const PRIORITY_BORDER = { Urgent:'border-l-rose-500', High:'border-l-orange-400', Medium:'border-l-amber-400', Low:'border-l-emerald-400/60' }
const PRIORITY_BADGE  = { Urgent:'bg-rose-500/15 text-rose-300 border-rose-500/30', High:'bg-orange-500/15 text-orange-300 border-orange-500/30', Medium:'bg-amber-500/15 text-amber-300 border-amber-500/30', Low:'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' }
const PRIORITY_ROW_BG = { Urgent:'bg-rose-500/[0.04]', High:'', Medium:'', Low:'' }
const STATUS_COLOR = {
  'To Do':      'text-white/40 bg-white/5 border-white/10',
  'In Progress':'text-blue-300 bg-blue-500/10 border-blue-500/20',
  'In Review':  'text-amber-300 bg-amber-500/10 border-amber-500/20',
  'Blocked':    'text-rose-300 bg-rose-500/10 border-rose-500/20',
  'Done':       'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
}
const KANBAN_HDR = {
  'To Do':      'text-white/40',
  'In Progress':'text-blue-400',
  'In Review':  'text-amber-400',
  'Blocked':    'text-rose-400',
  'Done':       'text-emerald-400',
}
const PROJ_STATUS_DOT = { Active:'bg-emerald-400', Planning:'bg-amber-400', 'On Hold':'bg-white/30', Completed:'bg-blue-400' }

const INPUT = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const LABEL = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

function fmtCreatedAt(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })
}

// ── Mention Textarea ─────────────────────────────────────────────────────────

function MentionTextarea({ value, onChange, placeholder, rows, className, pics }) {
  const [mention, setMention] = useState(null) // { query, start } while "@" is active
  const [idx, setIdx]         = useState(0)
  const ref = useRef(null)

  const filtered = useMemo(() => {
    if (!mention) return []
    return pics.filter(p => p.toLowerCase().includes(mention.query.toLowerCase()))
  }, [mention, pics])

  function handleChange(e) {
    const val    = e.target.value
    const cursor = e.target.selectionStart
    const before = val.slice(0, cursor)
    const atIdx  = before.lastIndexOf('@')
    if (atIdx >= 0) {
      const afterAt = before.slice(atIdx + 1)
      if (!/\s/.test(afterAt)) {
        setMention({ query: afterAt, start: atIdx })
        setIdx(0)
        onChange(e)
        return
      }
    }
    setMention(null)
    onChange(e)
  }

  function selectMention(pic) {
    const ta     = ref.current
    const before = value.slice(0, mention.start)
    const after  = value.slice(ta.selectionStart)
    const next   = `${before}@${pic} ${after}`
    onChange({ target: { value: next } })
    setMention(null)
    setTimeout(() => {
      const pos = mention.start + pic.length + 2
      ta.setSelectionRange(pos, pos)
      ta.focus()
    }, 0)
  }

  function handleKeyDown(e) {
    if (!mention || filtered.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); if (filtered[idx]) selectMention(filtered[idx]) }
    if (e.key === 'Escape')    setMention(null)
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setMention(null), 150)}
        rows={rows}
        placeholder={placeholder}
        className={className}
      />
      {mention && filtered.length > 0 && (
        <div className="absolute z-20 left-0 top-full mt-1 w-52 bg-[#1A1A22] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="px-3 py-1.5 border-b border-white/[0.05]">
            <span className="text-[10px] text-white/25 uppercase tracking-wider">Tag team member</span>
          </div>
          {filtered.map((p, i) => (
            <button
              key={p}
              type="button"
              onMouseDown={() => selectMention(p)}
              className={cn('w-full text-left px-3 py-2 text-[12px] transition-colors flex items-center gap-2', i === idx ? 'bg-violet-600/20 text-violet-200' : 'text-white/70 hover:bg-white/5')}
            >
              <span className="w-5 h-5 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-[9px] font-bold text-violet-300 flex-shrink-0">
                {p[0]}
              </span>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Project Form Modal ────────────────────────────────────────────────────────

function ProjectModal({ open, onClose, initial, onSave }) {
  const [form, setForm] = useState({ name:'', description:'', status:'Active', priority:'Medium', dueDate:'', color:'#6C5CE7' })
  useEffect(() => { if (open) setForm(initial ?? { name:'', description:'', status:'Active', priority:'Medium', dueDate:'', color:'#6C5CE7' }) }, [open, initial])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    await onSave(form)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-modal-overlay" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 animate-modal-content" onOpenAutoFocus={e => e.preventDefault()}>
          <div className="bg-[#111116] border border-white/[0.07] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <div>
                <Dialog.Title className="font-syne text-[15px] font-bold text-white">{initial ? 'Edit Project' : 'New Project'}</Dialog.Title>
                <Dialog.Description className="text-[12px] text-white/30 mt-0.5">Internal team project</Dialog.Description>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all"><X size={15} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <div className="col-span-2">
                    <label className={LABEL}>Project Name</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Q3 Content Strategy" className={INPUT} required />
                  </div>
                  <div className="col-span-2">
                    <label className={LABEL}>Description <span className="normal-case font-normal text-white/20">(optional)</span></label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Scope, goals, or context…" className={cn(INPUT, 'resize-none')} />
                  </div>
                  <div>
                    <label className={LABEL}>Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value)} className={INPUT}>
                      {PROJ_STATUS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Priority</label>
                    <select value={form.priority} onChange={e => set('priority', e.target.value)} className={INPUT}>
                      {PRIORITY_OPT.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Due Date <span className="normal-case font-normal text-white/20">(optional)</span></label>
                    <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className={cn(INPUT, '[color-scheme:dark]')} />
                  </div>
                  <div>
                    <label className={LABEL}>Color</label>
                    <div className="flex gap-2 mt-1">
                      {PROJ_COLORS.map(c => (
                        <button key={c} type="button" onClick={() => set('color', c)}
                          className={cn('w-7 h-7 rounded-full transition-all', form.color === c ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-[#111116] scale-110' : 'opacity-50 hover:opacity-90')}
                          style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.07]">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all shadow-[0_0_16px_rgba(108,92,231,.35)] hover:-translate-y-px">
                  {initial ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── Task Form Modal ───────────────────────────────────────────────────────────

function TaskModal({ open, onClose, initial, projectId, onSave, pics }) {
  const [form, setForm] = useState({ title:'', description:'', status:'To Do', priority:'Medium', assignee:'', dueDate:'' })
  useEffect(() => { if (open) setForm(initial ?? { title:'', description:'', status:'To Do', priority:'Medium', assignee: pics[0] ?? '', dueDate:'' }) }, [open, initial, pics])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    await onSave({ ...form, projectId })
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-modal-overlay" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 animate-modal-content" onOpenAutoFocus={e => e.preventDefault()}>
          <div className="bg-[#111116] border border-white/[0.07] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <div>
                <Dialog.Title className="font-syne text-[15px] font-bold text-white">{initial ? 'Edit Task' : 'New Task'}</Dialog.Title>
                <Dialog.Description className="text-[12px] text-white/30 mt-0.5">Internal team task</Dialog.Description>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all"><X size={15} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className={LABEL}>Task Title</label>
                  <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Draft content calendar" className={INPUT} required />
                </div>
                <div>
                  <label className={LABEL}>Description <span className="normal-case font-normal text-white/20">(optional · type @ to tag)</span></label>
                  <MentionTextarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Details, links, or context… type @ to tag someone" className={cn(INPUT, 'resize-none')} pics={pics} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Status</label>
                    <select value={form.status} onChange={e => set('status', e.target.value)} className={INPUT}>
                      {TASK_STATUS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Priority</label>
                    <select value={form.priority} onChange={e => set('priority', e.target.value)} className={INPUT}>
                      {PRIORITY_OPT.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Assignee</label>
                    <select value={form.assignee} onChange={e => set('assignee', e.target.value)} className={INPUT}>
                      <option value="">Unassigned</option>
                      {pics.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Due Date <span className="normal-case font-normal text-white/20">(optional)</span></label>
                    <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className={cn(INPUT, '[color-scheme:dark]')} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.07]">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all shadow-[0_0_16px_rgba(108,92,231,.35)] hover:-translate-y-px">
                  {initial ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

// ── Kanban DnD ───────────────────────────────────────────────────────────────

function ProjKanbanCard({ task, onCardClick, handleDeleteTask, canManage }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id, disabled: !canManage })
  return (
    <div
      ref={setNodeRef}
      {...(canManage ? listeners : {})}
      {...attributes}
      onClick={() => !isDragging && onCardClick(task)}
      className={cn(
        'group bg-[#1E1E28] border border-l-2 border-white/7 rounded-xl p-4 select-none transition-all',
        canManage ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        isDragging ? 'opacity-40' : 'hover:border-violet-500/30 hover:bg-[#23233A] hover:shadow-[0_4px_16px_rgba(0,0,0,.4)]',
        PRIORITY_BORDER[task.priority],
      )}
    >
      <div className="text-[12px] font-semibold text-white leading-snug mb-1.5">{task.title}</div>
      {task.description && <div className="text-[11px] text-white/50 line-clamp-3 mb-3">{task.description}</div>}
      <div className="mb-2">
        <span className={cn('text-[9px] px-1.5 py-px rounded border font-medium', PRIORITY_BADGE[task.priority])}>{task.priority}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/35">{task.assignee || 'Unassigned'}</span>
        <div className="flex items-center gap-1.5">
          {task.dueDate && <span className="font-mono text-[10px] text-white/25">{task.dueDate}</span>}
          {canManage && (
            <button
              onClick={e => { e.stopPropagation(); handleDeleteTask(task.id) }}
              className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ProjKanbanCol({ col, tasks, onCardClick, handleDeleteTask, openNewTask, isOver, canManage }) {
  const { setNodeRef } = useDroppable({ id: col, disabled: !canManage })
  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-48 flex flex-col min-h-0">
      <div className={cn('flex items-center justify-between mb-2 pb-2 border-b flex-shrink-0 transition-colors', isOver ? 'border-violet-500/40' : 'border-white/[0.06]')}>
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${KANBAN_HDR[col]}`}>{col}</span>
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] text-white/20">{tasks.length}</span>
          {canManage && (
            <button onClick={() => openNewTask(col)} className="w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/5 transition-all">
              <Plus size={11} />
            </button>
          )}
        </div>
      </div>
      <div className={cn('space-y-2.5 overflow-y-auto flex-1 pr-0.5 rounded-lg transition-colors', isOver && 'bg-violet-500/5')}>
        {tasks.map(t => <ProjKanbanCard key={t.id} task={t} onCardClick={onCardClick} handleDeleteTask={handleDeleteTask} canManage={canManage} />)}
        {tasks.length === 0 && canManage && (
          <button
            onClick={() => openNewTask(col)}
            className="w-full text-center text-[11px] text-white/15 hover:text-white/30 py-5 border border-dashed border-white/[0.05] rounded-xl transition-all"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  )
}

function ProjKanban({ projTasks, updateTask, openNewTask, handleDeleteTask, onCardClick, canManage }) {
  const [activeTask, setActiveTask] = useState(null)
  const [overId,     setOverId]     = useState(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragStart({ active }) {
    if (!canManage) return
    setActiveTask(projTasks.find(t => t.id === active.id) ?? null)
  }
  function handleDragOver({ over }) { if (canManage) setOverId(over?.id ?? null) }
  async function handleDragEnd({ active, over }) {
    setActiveTask(null); setOverId(null)
    if (!canManage || !over) return
    const task = projTasks.find(t => t.id === active.id)
    if (!task || task.status === over.id) return
    await updateTask(task.id, { status: over.id })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2 flex-1 min-h-0">
        {TASK_STATUS.map(col => (
          <ProjKanbanCol
            key={col}
            col={col}
            tasks={projTasks.filter(t => t.status === col)}
            onCardClick={onCardClick}
            handleDeleteTask={handleDeleteTask}
            openNewTask={openNewTask}
            isOver={overId === col}
            canManage={canManage}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="bg-[#1E1E28] border border-violet-500/50 rounded-xl p-4 shadow-2xl opacity-95 rotate-1 cursor-grabbing">
            <div className="text-[12px] font-semibold text-white leading-snug">{activeTask.title}</div>
            <div className="text-[10px] text-white/35 mt-1">{activeTask.assignee || 'Unassigned'}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function ProjectManagement() {
  const { projects, tasks, loading, fetchProjects, fetchTasks, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask } = useInternalProjectStore()
  const storedPics = useAuthStore(s => s.pics)
  const can        = useAuthStore(s => s.can)
  const canManage  = can('projects.manage')
  const showToast  = useUIStore(s => s.showToast)
  const PICS = storedPics.length ? storedPics : ['Sarah K.', 'Lina M.']

  const [searchParams, setSearchParams] = useSearchParams()
  const openProjectId = searchParams.get('proj')
  const openTaskId    = searchParams.get('task')

  const [selectedId,  setSelectedId]  = useState(null)
  const [view,        setView]        = useState('kanban')
  const [projModal,   setProjModal]   = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [taskModal,   setTaskModal]   = useState(false)
  const [editTask,    setEditTask]    = useState(null)
  const [taskStatus,  setTaskStatus]  = useState(null) // pre-fill status for quick-add
  const [detailTask,  setDetailTask]  = useState(null) // task detail panel

  useEffect(() => { fetchProjects() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sort projects oldest → newest
  const sortedProjects = useMemo(() =>
    [...projects].sort((a, b) => new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0)),
    [projects]
  )

  // Derived state — declared here so the useEffects below can safely reference them
  const selected   = sortedProjects.find(p => p.id === selectedId)
  const projTasks  = useMemo(() => tasks.filter(t => t.projectId === selectedId), [tasks, selectedId])

  const stats = useMemo(() => ({
    total:      projTasks.length,
    todo:       projTasks.filter(t => t.status === 'To Do').length,
    inProgress: projTasks.filter(t => t.status === 'In Progress').length,
    blocked:    projTasks.filter(t => t.status === 'Blocked').length,
    done:       projTasks.filter(t => t.status === 'Done').length,
  }), [projTasks])

  // Auto-select oldest project (first in sorted list)
  useEffect(() => {
    if (sortedProjects.length > 0 && !selectedId) setSelectedId(sortedProjects[0].id)
  }, [sortedProjects.length, selectedId])

  // Load tasks when project is selected
  useEffect(() => {
    if (selectedId) fetchTasks(selectedId)
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate to project from notification link
  useEffect(() => {
    if (openProjectId && projects.length > 0) setSelectedId(openProjectId)
  }, [openProjectId, projects])

  // Open task detail from notification link once tasks are loaded
  useEffect(() => {
    if (!openTaskId || projTasks.length === 0) return
    const task = projTasks.find(t => t.id === openTaskId)
    if (task) { setDetailTask(task); setSearchParams({}, { replace: true }) }
  }, [openTaskId, projTasks]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSaveProject(form) {
    if (editProject) {
      await updateProject(editProject.id, form)
      showToast('Project updated')
    } else {
      const p = await addProject(form)
      setSelectedId(p.id)
      showToast('Project created')
    }
    setEditProject(null)
  }

  async function handleSaveTask(form) {
    const mentions = (PICS || []).filter(name => (form.description || '').includes(`@${name}`))
    if (editTask) {
      await updateTask(editTask.id, { ...form, mentions })
      showToast('Task updated')
    } else {
      await addTask({ ...form, status: taskStatus ?? form.status, mentions })
      showToast('Task added')
    }
    setEditTask(null); setTaskStatus(null)
  }

  async function handleDeleteProject(id) {
    if (!window.confirm('Delete this project and all its tasks?')) return
    await deleteProject(id)
    setSelectedId(sortedProjects.find(p => p.id !== id)?.id ?? null)
    showToast('Project deleted')
  }

  async function handleDeleteTask(id) {
    if (!window.confirm('Delete this task?')) return
    await deleteTask(id)
    showToast('Task deleted')
  }

  function openNewTask(status) {
    setEditTask(null)
    setTaskStatus(status)
    setTaskModal(true)
  }

  function openEditTask(t) {
    setEditTask(t)
    setTaskStatus(null)
    setTaskModal(true)
  }

  return (
    <div className="flex gap-6 h-full min-h-0">

      {/* ── Project Sidebar ── */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-syne text-[14px] font-bold text-white">Projects</h2>
          {canManage && (
            <button
              onClick={() => { setEditProject(null); setProjModal(true) }}
              className="w-7 h-7 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-400 flex items-center justify-center transition-all"
            >
              <Plus size={13} />
            </button>
          )}
        </div>

        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {loading && sortedProjects.length === 0 && (
            <div className="text-[12px] text-white/25 px-2 py-4 text-center">Loading…</div>
          )}
          {!loading && sortedProjects.length === 0 && (
            <div className="text-[12px] text-white/25 px-2 py-6 text-center">
              <FolderOpen size={24} className="mx-auto mb-2 opacity-30" />
              No projects yet
            </div>
          )}
          {sortedProjects.map(p => {
            const ptasks = tasks.filter(t => t.projectId === p.id)
            const done = ptasks.filter(t => t.status === 'Done').length
            const isActive = p.id === selectedId
            return (
              <div
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  'group relative flex gap-2.5 px-3 py-3 rounded-xl cursor-pointer transition-all border border-l-2',
                  isActive
                    ? 'bg-violet-600/12 border-violet-500/25 text-white'
                    : 'bg-[#1E1E28] border-white/7 text-white/60 hover:border-white/12 hover:text-white/80',
                  PRIORITY_BORDER[p.priority],
                )}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: p.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div className="text-[12px] font-semibold leading-snug truncate">{p.name}</div>
                    {canManage && (
                      <button
                        onClick={e => { e.stopPropagation(); setEditProject(p); setProjModal(true) }}
                        className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-white/70 transition-all flex-shrink-0 mt-px"
                      >
                        <Pencil size={10} />
                      </button>
                    )}
                  </div>
                  {p.description && <div className="text-[11px] text-white/30 truncate mt-0.5">{p.description}</div>}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className={`w-1 h-1 rounded-full flex-shrink-0 ${PROJ_STATUS_DOT[p.status] ?? 'bg-white/20'}`} />
                    <span className="text-[10px] text-white/30">{p.status}</span>
                    <span className={cn('text-[10px] px-1.5 py-px rounded border font-medium', PRIORITY_BADGE[p.priority])}>{p.priority}</span>
                    {ptasks.length > 0 && (
                      <span className="text-[10px] text-white/25 ml-auto">{done}/{ptasks.length}</span>
                    )}
                  </div>
                  {p.createdAt && (
                    <div className="text-[9px] text-white/20 font-mono mt-1 truncate">{fmtCreatedAt(p.createdAt)}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Task Board ── */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20">
            <FolderOpen size={36} className="mb-3 opacity-30" />
            <p className="text-[14px]">Select or create a project</p>
          </div>
        ) : (
          <>
            {/* Project header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: selected.color }} />
                  <h1 className="font-syne text-[20px] font-bold text-white">{selected.name}</h1>
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLOR[selected.status] ?? 'text-white/30 bg-white/5 border-white/10'}`}>{selected.status}</span>
                </div>
                {selected.description && <p className="text-[12px] text-white/30 mt-1 ml-5.5">{selected.description}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {canManage && (
                  <>
                    <button
                      onClick={() => { setEditProject(selected); setProjModal(true) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/7 hover:border-white/12 text-white/40 hover:text-white/70 text-[12px] transition-all"
                    >
                      <Pencil size={11} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(selected.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/7 hover:border-rose-500/30 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 text-[12px] transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </>
                )}
                <div className="flex items-center gap-1 bg-[#1A1A22] border border-white/[0.07] rounded-lg p-1">
                  <button onClick={() => setView('kanban')} className={cn('p-1.5 rounded-md transition-all', view==='kanban' ? 'bg-violet-600/20 text-violet-300' : 'text-white/30 hover:text-white/60')} title="Kanban"><Kanban size={13} /></button>
                  <button onClick={() => setView('list')}   className={cn('p-1.5 rounded-md transition-all', view==='list'   ? 'bg-violet-600/20 text-violet-300' : 'text-white/30 hover:text-white/60')} title="List"><List size={13} /></button>
                </div>
                {canManage && (
                  <button
                    onClick={() => openNewTask('To Do')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-300 hover:bg-violet-600/25 text-[12px] font-semibold transition-all"
                  >
                    <Plus size={13} /> Add Task
                  </button>
                )}
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-3">
              {[
                { label:'Total',       val: stats.total,      color:'text-white/50' },
                { label:'To Do',       val: stats.todo,       color:'text-white/40' },
                { label:'In Progress', val: stats.inProgress, color:'text-blue-400' },
                { label:'Blocked',     val: stats.blocked,    color:'text-rose-400' },
                { label:'Done',        val: stats.done,       color:'text-emerald-400' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center gap-1.5 bg-[#1E1E28] border border-white/7 rounded-lg px-3 py-1.5">
                  <span className={`font-syne text-[16px] font-bold ${color}`}>{val}</span>
                  <span className="text-[10px] text-white/25">{label}</span>
                </div>
              ))}
              {selected.dueDate && (
                <div className="ml-auto text-[11px] text-white/25 font-mono">Due {selected.dueDate}</div>
              )}
            </div>

            {/* Task content */}
            {projTasks.length === 0 && view === 'list' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-white/20 border border-dashed border-white/5 rounded-2xl">
                <p className="text-[13px]">No tasks yet</p>
                {canManage && (
                  <button onClick={() => openNewTask('To Do')} className="mt-3 text-violet-400 text-[12px] hover:underline">+ Add first task</button>
                )}
              </div>
            ) : view === 'kanban' ? (

              /* Kanban */
              <ProjKanban projTasks={projTasks} updateTask={updateTask} openNewTask={openNewTask} handleDeleteTask={handleDeleteTask} onCardClick={setDetailTask} canManage={canManage} />

            ) : (

              /* List */
              <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden flex-1">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Task', 'Status', 'Priority', 'Assignee', 'Due Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                      ))}
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {projTasks.map(t => (
                      <tr key={t.id} onClick={() => setDetailTask(t)} className={cn('border-b border-white/[0.04] last:border-0 hover:bg-white/[.025] cursor-pointer transition-colors group', PRIORITY_ROW_BG[t.priority])}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-[13px] text-white/80">{t.title}</div>
                              {t.description && <div className="text-[11px] text-white/30 mt-0.5 truncate max-w-xs">{t.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLOR[t.status]}`}>{t.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', PRIORITY_BADGE[t.priority])}>{t.priority}</span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-white/40">{t.assignee || '—'}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-white/30">{t.dueDate || '—'}</td>
                        <td className="px-4 py-3">
                          {canManage && (
                            <button
                              onClick={e => { e.stopPropagation(); handleDeleteTask(t.id) }}
                              className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ProjectModal
        open={projModal}
        onClose={() => { setProjModal(false); setEditProject(null) }}
        initial={editProject ? { name: editProject.name, description: editProject.description, status: editProject.status, priority: editProject.priority, dueDate: editProject.dueDate, color: editProject.color } : null}
        onSave={handleSaveProject}
      />
      <TaskModal
        open={taskModal}
        onClose={() => { setTaskModal(false); setEditTask(null); setTaskStatus(null) }}
        initial={editTask ? { title: editTask.title, description: editTask.description, status: editTask.status, priority: editTask.priority, assignee: editTask.assignee, dueDate: editTask.dueDate } : null}
        projectId={selectedId}
        onSave={handleSaveTask}
        pics={PICS}
      />

      {/* Task Detail Panel */}
      {detailTask && (
        <div className="fixed inset-0 z-40 flex justify-end pointer-events-none">
          <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={() => setDetailTask(null)} />
          <div className="relative w-[400px] bg-[#111116] border-l border-white/[0.07] flex flex-col shadow-2xl pointer-events-auto animate-[slideInRight_.2s_ease]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLOR[detailTask.status]}`}>{detailTask.status}</span>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', PRIORITY_BADGE[detailTask.priority])}>{detailTask.priority}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {canManage && (
                  <button
                    onClick={() => { openEditTask(detailTask); setDetailTask(null) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/7 hover:border-white/12 text-white/50 hover:text-white text-[12px] transition-all"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                )}
                <button
                  onClick={() => setDetailTask(null)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <h2 className="font-syne text-[18px] font-bold text-white leading-snug">{detailTask.title}</h2>

              {detailTask.description && (
                <div>
                  <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Description</div>
                  <p className="text-[13px] text-white/60 leading-relaxed whitespace-pre-wrap">{detailTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Assignee</div>
                  <div className="text-[13px] text-white/70">{detailTask.assignee || 'Unassigned'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Due Date</div>
                  <div className="font-mono text-[13px] text-white/70">{detailTask.dueDate || '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Status</div>
                  <div className="text-[13px] text-white/70">{detailTask.status}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Priority</div>
                  <div className={`text-[13px] font-medium ${PRIORITY_TXT[detailTask.priority]}`}>{detailTask.priority}</div>
                </div>
                {detailTask.createdAt && (
                  <div className="col-span-2">
                    <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1">Created</div>
                    <div className="font-mono text-[12px] text-white/40">{fmtCreatedAt(detailTask.createdAt)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {canManage && (
              <div className="px-5 py-4 border-t border-white/[0.07]">
                <button
                  onClick={async () => {
                    await handleDeleteTask(detailTask.id)
                    setDetailTask(null)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/7 hover:border-rose-500/20 text-white/40 hover:text-rose-400 text-[12px] transition-all"
                >
                  <Trash2 size={12} /> Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
