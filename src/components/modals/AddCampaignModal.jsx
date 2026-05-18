import { useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useCampaignStore } from '@/store/campaignStore'
import { cn } from '@/lib/utils'

const schema = z.object({
  name:        z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  status:      z.string().default('Planning'),
  budget:      z.coerce.number().min(0).default(0),
  startDate:   z.string().default(''),
  endDate:     z.string().default(''),
  color:       z.string().default('#6C5CE7'),
})

const COLORS = ['#6C5CE7','#0891B2','#D97706','#059669','#DC2626','#7C3AED','#DB2777','#EA580C']
const INPUT  = 'w-full bg-[#16161C] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const LABEL  = 'block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5'

export default function AddCampaignModal() {
  const open        = useUIStore(s => s.addCampaignOpen)
  const close       = useUIStore(s => s.closeAddCampaign)
  const showToast   = useUIStore(s => s.showToast)
  const addCampaign = useCampaignStore(s => s.addCampaign)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name:'', description:'', status:'Planning', budget:0, startDate:'', endDate:'', color:'#6C5CE7' },
  })

  const selectedColor = watch('color')

  useEffect(() => { if (!open) reset() }, [open])

  async function onSubmit(data) {
    await addCampaign(data)
    showToast(`${data.name} campaign created`)
    close()
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-modal-overlay" />
        <Dialog.Content className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] max-h-[90vh] overflow-y-auto bg-[#111116] border border-white/10 rounded-[18px] shadow-2xl animate-modal-content outline-none">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/7">
            <h2 className="font-syne text-[16px] font-bold text-white">New Campaign</h2>
            <button onClick={close} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
            <div>
              <label className={LABEL}>Campaign Name *</label>
              <input {...register('name')} placeholder="e.g. Ramadan 2026" className={INPUT} />
              {errors.name && <p className="text-rose-400 text-[11px] mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className={LABEL}>Description</label>
              <input {...register('description')} placeholder="Short campaign description…" className={INPUT} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Status</label>
                <select {...register('status')} className={INPUT}>
                  {['Planning','Active','Completed','On Hold'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Budget (RM)</label>
                <input type="number" {...register('budget')} className={INPUT} placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Start Date</label>
                <input type="date" {...register('startDate')} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>End Date</label>
                <input type="date" {...register('endDate')} className={INPUT} />
              </div>
            </div>

            <div>
              <label className={LABEL}>Color</label>
              <div className="flex gap-2 mt-1">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setValue('color', c)}
                    className={cn('w-7 h-7 rounded-full transition-all', selectedColor === c ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-[#111116] scale-110' : 'opacity-50 hover:opacity-90')}
                    style={{ background: c }} />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={close} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-50">
                {isSubmitting ? 'Creating…' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
