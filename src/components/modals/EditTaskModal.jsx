import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Coins } from 'lucide-react'
import { useEffect } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useCreatorStore } from '@/store/creatorStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import { PICS } from '@/lib/data'
import { cn } from '@/lib/utils'

const schema = z.object({
  creatorId: z.string().optional(),
  task:      z.string().min(1, 'Task name is required').max(100),
  project:   z.string().min(1, 'Select a project'),
  status:    z.enum(['Not Started', 'In Progress', 'Under Review', 'Completed', 'Overdue']),
  priority:  z.enum(['Low', 'Medium', 'High', 'Urgent']),
  pic:       z.string().min(1, 'PIC is required'),
  dueDate:   z.string().min(1, 'Due date is required'),
  coins:     z.coerce.number().min(0).max(10000),
  notes:     z.string().default(''),
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
  const task       = useTaskStore(s => s.tasks.find(t => t.id === taskId))
  const creators   = useCreatorStore(s => s.creators)
  const campaigns  = useCampaignStore(s => s.campaigns)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (task) reset({
      creatorId: task.creatorId ?? '',
      task:      task.task,
      project:   task.project,
      status:    task.status,
      priority:  task.priority,
      pic:       task.pic,
      dueDate:   task.dueDate,
      coins:     task.coins,
      notes:     task.notes ?? '',
    })
  }, [task, reset])

  const watchStatus    = watch('status')
  const watchCreatorId = watch('creatorId')
  const wasCompleted   = task?.status === 'Completed'
  const willComplete   = watchStatus === 'Completed' && !wasCompleted

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
                <Dialog.Title className="font-syne text-[15px] font-bold text-white">Edit Task</Dialog.Title>
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
                  <select {...register('creatorId')} className={INPUT}>
                    <option value="">Unassigned</option>
                    {creators.filter(c => c.status !== 'Rejected').map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.platform}</option>
                    ))}
                  </select>
                </div>

                {/* Task name */}
                <div>
                  <label className={LABEL}>Task / Deliverable</label>
                  <input {...register('task')} className={INPUT} />
                  {errors.task && <p className={ERR}>{errors.task.message}</p>}
                </div>

                {/* Project + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Project</label>
                    <select {...register('project')} className={INPUT}>
                      {campaigns.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Status</label>
                    <select {...register('status')} className={INPUT}>
                      {['Not Started','In Progress','Under Review','Completed','Overdue'].map(s => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Priority + PIC */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Priority</label>
                    <select {...register('priority')} className={INPUT}>
                      {['Low','Medium','High','Urgent'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>PIC</label>
                    <select {...register('pic')} className={INPUT}>
                      {PICS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                {/* Due date + Coins */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Due Date</label>
                    <input type="date" {...register('dueDate')} className={cn(INPUT, '[color-scheme:dark]')} />
                    {errors.dueDate && <p className={ERR}>{errors.dueDate.message}</p>}
                  </div>
                  <div>
                    <label className={LABEL}>Coins</label>
                    <input type="number" {...register('coins')} min={0} max={10000} className={INPUT} />
                    {errors.coins && <p className={ERR}>{errors.coins.message}</p>}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={LABEL}>Notes for Creator</label>
                  <textarea
                    {...register('notes')}
                    rows={2}
                    placeholder="Specific instructions, references, or creative direction…"
                    className={cn(INPUT, 'resize-none')}
                  />
                </div>

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

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.07]">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all shadow-[0_0_16px_rgba(108,92,231,.35)] hover:-translate-y-px disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
