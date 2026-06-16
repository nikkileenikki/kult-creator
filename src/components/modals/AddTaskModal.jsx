import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useCreatorStore } from '@/store/creatorStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import Avatar from '@/components/shared/Avatar'
import { cn } from '@/lib/utils'

const schema = z.object({
  creatorId: z.string().optional(),
  task:      z.string().min(1, 'Task name is required').max(100, 'Max 100 characters'),
  project:   z.string().min(1, 'Select a project'),
  status:    z.enum(['Not Started', 'In Progress', 'Under Review', 'Completed', 'Overdue']),
  priority:  z.enum(['Low', 'Medium', 'High', 'Urgent']),
  pic:       z.string().min(1, 'PIC is required'),
  dueDate:   z.string().min(1, 'Due date is required'),
  coins:     z.coerce.number().min(0, 'Min 0').max(10000, 'Max 10,000'),
  notes:     z.string().default(''),
})

const INPUT = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const LABEL = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'
const ERR   = 'text-[11px] text-rose-400 mt-1'

export default function AddTaskModal() {
  const open       = useUIStore(s => s.addTaskOpen)
  const prefill    = useUIStore(s => s.addTaskPrefill)
  const closeModal = useUIStore(s => s.closeAddTask)
  const showToast  = useUIStore(s => s.showToast)
  const addTask    = useTaskStore(s => s.addTask)
  const creators   = useCreatorStore(s => s.creators)
  const campaigns  = useCampaignStore(s => s.campaigns)
  const storedPics = useAuthStore(s => s.pics)
  const PICS = storedPics.length ? storedPics : ['Sarah K.', 'Lina M.']

  const defaultProject = campaigns[0]?.name ?? ''

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      creatorId: '',
      task:      '',
      project:   defaultProject,
      status:    'Not Started',
      priority:  'Medium',
      pic:       PICS[0],
      dueDate:   '',
      coins:     100,
      notes:     '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        creatorId: prefill?.creatorId ?? '',
        task:      '',
        project:   prefill?.project ?? defaultProject,
        status:    'Not Started',
        priority:  'Medium',
        pic:       PICS[0],
        dueDate:   '',
        coins:     100,
        notes:     '',
      })
    }
  }, [open, prefill]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCreatorId = watch('creatorId')
  const selectedCreator   = creators.find(c => c.id === selectedCreatorId)

  function onClose() {
    reset()
    closeModal()
  }

  async function onSubmit(data) {
    const creator = creators.find(c => c.id === data.creatorId)
    await addTask({
      creatorId:   data.creatorId || '',
      creatorName: creator?.name ?? 'Unassigned',
      platform:    creator?.platform ?? '',
      task:        data.task,
      project:     data.project,
      status:      data.status,
      priority:    data.priority,
      pic:         data.pic,
      dueDate:     data.dueDate,
      coins:       data.coins,
      notes:       data.notes,
    })
    showToast(creator ? `Task added for ${creator.name}` : 'Task added (unassigned)')
    onClose()
  }

  const projectLocked = !!prefill?.project
  const creatorLocked = !!prefill?.creatorId

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
                <Dialog.Title className="font-syne text-[15px] font-bold text-white">Add Task</Dialog.Title>
                <Dialog.Description className="text-[12px] text-white/30 mt-0.5">
                  {prefill?.project ? `Campaign: ${prefill.project}` : 'Assign a new deliverable to a creator'}
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
                  <label className={LABEL}>Creator <span className="text-white/20 normal-case font-normal">(optional)</span></label>
                  <div className="relative">
                    {selectedCreator && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Avatar initials={selectedCreator.initials} color={selectedCreator.avatarColor} size="sm" />
                      </div>
                    )}
                    <select
                      {...register('creatorId')}
                      disabled={creatorLocked}
                      className={cn(INPUT, selectedCreator ? 'pl-11' : '', creatorLocked ? 'opacity-60 cursor-not-allowed' : '')}
                    >
                      <option value="">Unassigned</option>
                      {creators.filter(c => c.status !== 'Rejected').map(c => (
                        <option key={c.id} value={c.id}>{c.name} — {c.platform}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Task name */}
                <div>
                  <label className={LABEL}>Task / Deliverable</label>
                  <input {...register('task')} placeholder="e.g. Film Lifestyle Reel" className={INPUT} />
                  {errors.task && <p className={ERR}>{errors.task.message}</p>}
                </div>

                {/* Project + Status row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Project</label>
                    <select
                      {...register('project')}
                      disabled={projectLocked}
                      className={cn(INPUT, projectLocked ? 'opacity-60 cursor-not-allowed' : '')}
                    >
                      {campaigns.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    {errors.project && <p className={ERR}>{errors.project.message}</p>}
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

                {/* Priority + PIC row */}
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
                    {errors.pic && <p className={ERR}>{errors.pic.message}</p>}
                  </div>
                </div>

                {/* Due date + Coins row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Due Date</label>
                    <input type="date" {...register('dueDate')} onWheel={e => e.currentTarget.blur()} className={cn(INPUT, '[color-scheme:dark]')} />
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
                  <label className={LABEL}>Notes for Creator <span className="text-white/20 normal-case font-normal">(optional)</span></label>
                  <textarea
                    {...register('notes')}
                    rows={2}
                    placeholder="Specific instructions, references, or creative direction…"
                    className={cn(INPUT, 'resize-none')}
                  />
                </div>
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
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
