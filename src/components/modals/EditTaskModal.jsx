import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Coins, Star, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useCreatorStore } from '@/store/creatorStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const schema = z.object({
  creatorId: z.string().optional(),
  task:        z.string().min(1, 'Task name is required').max(100),
  description: z.string().default(''),
  project:   z.string().min(1, 'Select a project'),
  status:    z.enum(['Not Started', 'In Progress', 'Under Review', 'Completed', 'Overdue']),
  priority:  z.enum(['Low', 'Medium', 'High', 'Urgent']),
  pic:       z.string().min(1, 'PIC is required'),
  dueDate:   z.string().min(1, 'Due date is required'),
  coins:     z.coerce.number().min(0).max(10000),
  notes:     z.string().default(''),
  rating:    z.coerce.number().min(0).max(5).default(0),
  review:    z.string().default(''),
})

const INPUT = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const LABEL = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'
const ERR   = 'text-[11px] text-rose-400 mt-1'

export default function EditTaskModal() {
  const open       = useUIStore(s => s.editTaskOpen)
  const taskId     = useUIStore(s => s.editTaskId)
  const closeModal = useUIStore(s => s.closeEditTask)
  const showToast  = useUIStore(s => s.showToast)
  const updateTask = useTaskStore(s => s.updateTask)
  const deleteTask = useTaskStore(s => s.deleteTask)
  const task       = useTaskStore(s => s.tasks.find(t => t.id === taskId))
  const creators   = useCreatorStore(s => s.creators)
  const campaigns  = useCampaignStore(s => s.campaigns)
  const canEdit    = useAuthStore(s => s.can('creators.edit'))
  const storedPics = useAuthStore(s => s.pics)
  const PICS = storedPics.length ? storedPics : ['Sarah K.', 'Lina M.']

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (task) reset({
      creatorId: task.creatorId ?? '',
      task:        task.task,
      description: task.description ?? '',
      project:     task.project,
      status:    task.status,
      priority:  task.priority,
      pic:       task.pic,
      dueDate:   task.dueDate,
      coins:     task.coins,
      notes:     task.notes ?? '',
      rating:    task.rating ?? 0,
      review:    task.review ?? '',
    })
  }, [task, reset])

  const watchStatus    = watch('status')
  const watchCreatorId = watch('creatorId')
  const watchRating    = watch('rating') ?? 0
  const wasCompleted   = task?.status === 'Completed'
  const willComplete   = watchStatus === 'Completed' && !wasCompleted
  const showReview     = wasCompleted || willComplete

  const selectedCreator    = creators.find(c => c.id === watchCreatorId)
  const displayCreatorName = selectedCreator?.name ?? task?.creatorName ?? 'Unassigned'

  function onClose() {
    reset()
    closeModal()
  }

  async function onSubmit(data) {
    const creator = creators.find(c => c.id === data.creatorId)
    const updates = {
      ...data,
      creatorId:   data.creatorId || '',
      creatorName: creator?.name ?? (data.creatorId ? task?.creatorName : 'Unassigned'),
      platform:    creator?.platform ?? (data.creatorId ? task?.platform : ''),
    }
    await updateTask(taskId, updates)
    if (willComplete) {
      showToast(`Task completed — ${data.coins} coins awarded to ${displayCreatorName}`)
    } else {
      showToast('Task updated')
    }
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-modal-overlay" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 animate-modal-content"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <div className="bg-[#111116] border border-white/[0.07] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <div>
                <div className="flex items-center gap-2">
                <Dialog.Title className="font-syne text-[15px] font-bold text-white">{canEdit ? 'Edit Task' : 'Task Details'}</Dialog.Title>
                {!canEdit && <span className="text-[10px] text-white/30 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">View only</span>}
              </div>
                <Dialog.Description className="text-[12px] text-white/30 mt-0.5">
                  {displayCreatorName} · {selectedCreator?.platform ?? task?.platform ?? ''}
                </Dialog.Description>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                {/* Creator */}
                <div>
                  <label className={LABEL}>Creator</label>
                  <select {...register('creatorId')} disabled={!canEdit} className={cn(INPUT, !canEdit && 'opacity-60 cursor-not-allowed')}>
                    <option value="">Unassigned</option>
                    {creators.filter(c => c.status !== 'Rejected' && c.status !== 'Suspended').map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.platform}</option>
                    ))}
                  </select>
                </div>

                {/* Task name */}
                <div>
                  <label className={LABEL}>Task / Deliverable</label>
                  <input {...register('task')} readOnly={!canEdit} className={cn(INPUT, !canEdit && 'opacity-60 cursor-not-allowed')} />
                  {errors.task && <p className={ERR}>{errors.task.message}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className={LABEL}>Description <span className="text-white/20 normal-case font-normal">(optional)</span></label>
                  <textarea
                    {...register('description')}
                    readOnly={!canEdit}
                    rows={2}
                    placeholder="Brief context, goals, or link references…"
                    className={cn(INPUT, 'resize-none', !canEdit && 'opacity-60 cursor-not-allowed')}
                  />
                </div>

                {/* Project + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Project</label>
                    <select {...register('project')} disabled={!canEdit} className={cn(INPUT, !canEdit && 'opacity-60 cursor-not-allowed')}>
                      {campaigns.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Status</label>
                    {wasCompleted ? (
                      <div className={cn(INPUT, 'flex items-center justify-between opacity-60 cursor-not-allowed select-none')}>
                        <span className="text-emerald-400 font-medium">Completed</span>
                        <span className="text-[10px] text-white/30 font-mono uppercase tracking-wide">Locked</span>
                      </div>
                    ) : (
                      <select {...register('status')} disabled={!canEdit} className={cn(INPUT, !canEdit && 'opacity-60 cursor-not-allowed')}>
                        {['Not Started','In Progress','Under Review','Completed','Overdue'].map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Priority + PIC */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Priority</label>
                    <select {...register('priority')} disabled={!canEdit} className={cn(INPUT, !canEdit && 'opacity-60 cursor-not-allowed')}>
                      {['Low','Medium','High','Urgent'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>PIC</label>
                    <select {...register('pic')} disabled={!canEdit} className={cn(INPUT, !canEdit && 'opacity-60 cursor-not-allowed')}>
                      {PICS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                {/* Due date + Coins */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Due Date</label>
                    <input type="date" {...register('dueDate')} readOnly={!canEdit} onWheel={e => e.currentTarget.blur()} className={cn(INPUT, '[color-scheme:dark]', !canEdit && 'opacity-60 cursor-not-allowed')} />
                    {errors.dueDate && <p className={ERR}>{errors.dueDate.message}</p>}
                  </div>
                  <div>
                    <label className={LABEL}>Coins</label>
                    <input type="number" {...register('coins')} readOnly={!canEdit} min={0} max={10000} className={cn(INPUT, !canEdit && 'opacity-60 cursor-not-allowed')} />
                    {errors.coins && <p className={ERR}>{errors.coins.message}</p>}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={LABEL}>Notes for Creator</label>
                  <textarea
                    {...register('notes')}
                    readOnly={!canEdit}
                    rows={2}
                    placeholder="Specific instructions, references, or creative direction…"
                    className={cn(INPUT, 'resize-none', !canEdit && 'opacity-60 cursor-not-allowed')}
                  />
                </div>

                {/* Rating + Review (shown for completed tasks) */}
                {showReview && (
                  <div className="space-y-3 px-3 py-3.5 bg-amber-500/5 border border-amber-500/15 rounded-lg">
                    <div className="font-mono text-[10px] font-medium text-amber-400/70 uppercase tracking-wider">Performance Review</div>
                    <div>
                      <label className={LABEL}>Rating</label>
                      <div className="flex gap-1.5 mt-1">
                        {[1,2,3,4,5].map(n => (
                          <button
                            key={n}
                            type="button"
                            disabled={!canEdit}
                            onClick={() => canEdit && setValue('rating', watchRating === n ? 0 : n, { shouldValidate: true })}
                            className={cn('transition-all', !canEdit && 'cursor-not-allowed')}
                          >
                            <Star
                              size={22}
                              className={n <= watchRating ? 'text-amber-400 fill-amber-400' : 'text-white/15'}
                            />
                          </button>
                        ))}
                        {watchRating > 0 && (
                          <span className="ml-1 self-center text-[12px] text-amber-400/60 font-mono">{watchRating}/5</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className={LABEL}>Review Notes</label>
                      <textarea
                        {...register('review')}
                        readOnly={!canEdit}
                        rows={2}
                        placeholder="Notes on performance, quality, timeliness…"
                        className={cn(INPUT, 'resize-none', !canEdit && 'opacity-60 cursor-not-allowed')}
                      />
                    </div>
                  </div>
                )}

                {/* Coin award notice */}
                {willComplete && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/8 border border-emerald-500/20 rounded-lg">
                    <Coins size={14} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-[12px] text-white/40">
                      Marking as complete will award <span className="text-emerald-300 font-semibold">{watch('coins')} coins</span> to {displayCreatorName}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.07]">
                <div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm('Delete this task? This cannot be undone.')) return
                        await deleteTask(taskId)
                        showToast('Task deleted')
                        onClose()
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-rose-500/15 border border-white/7 hover:border-rose-500/20 text-white/40 hover:text-rose-400 text-[13px] font-semibold transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
                    {canEdit ? 'Cancel' : 'Close'}
                  </button>
                  {canEdit && (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all shadow-[0_0_16px_rgba(108,92,231,.35)] hover:-translate-y-px disabled:opacity-50"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
