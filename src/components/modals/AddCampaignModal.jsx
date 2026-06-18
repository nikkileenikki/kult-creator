import { useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useCampaignStore } from '@/store/campaignStore'
import { useBrandStore } from '@/store/brandStore'
import { cn } from '@/lib/utils'

const schema = z.object({
  name:        z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  status:      z.string().default('Planning'),
  budget:      z.coerce.number().min(0).default(0),
  startDate:   z.string().default(''),
  endDate:     z.string().default(''),
  color:       z.string().default('#6C5CE7'),
  brandId:     z.string().default(''),
}).refine(d => !d.startDate || !d.endDate || d.endDate >= d.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
})

const COLORS = ['#6C5CE7','#0891B2','#D97706','#059669','#DC2626','#7C3AED','#DB2777','#EA580C']
const INPUT  = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const LABEL  = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'
const ERR    = 'text-[11px] text-rose-400 mt-1'

export default function AddCampaignModal() {
  const open        = useUIStore(s => s.addCampaignOpen)
  const close       = useUIStore(s => s.closeAddCampaign)
  const showToast   = useUIStore(s => s.showToast)
  const addCampaign = useCampaignStore(s => s.addCampaign)
  const brands      = useBrandStore(s => s.brands)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name:'', description:'', status:'Planning', budget:0, startDate:'', endDate:'', color:'#6C5CE7', brandId:'' },
  })

  const selectedColor = watch('color')
  const watchStart    = watch('startDate')
  const watchEnd      = watch('endDate')

  useEffect(() => { if (!open) reset() }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(data) {
    const brand = brands.find(b => b.id === data.brandId)
    await addCampaign({ ...data, brandName: brand?.name ?? '' })
    showToast(`${data.name} campaign created`)
    close()
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-modal-overlay" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 animate-modal-content"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <div className="bg-[#111116] border border-white/[0.07] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <div>
                <Dialog.Title className="font-syne text-[15px] font-bold text-white">New Campaign</Dialog.Title>
                <Dialog.Description className="text-[12px] text-white/30 mt-0.5">Create a new campaign to track tasks and creators</Dialog.Description>
              </div>
              <button onClick={close} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">

                  {/* LEFT COLUMN */}
                  <div className="space-y-4">

                    {/* Campaign Name */}
                    <div>
                      <label className={LABEL}>Campaign Name</label>
                      <input {...register('name')} placeholder="e.g. Ramadan 2026" className={INPUT} />
                      {errors.name && <p className={ERR}>{errors.name.message}</p>}
                    </div>

                    {/* Brand */}
                    <div>
                      <label className={LABEL}>Brand <span className="normal-case font-normal text-white/20">(optional)</span></label>
                      <select {...register('brandId')} className={INPUT}>
                        <option value="">No brand</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className={LABEL}>Description <span className="normal-case font-normal text-white/20">(optional)</span></label>
                      <textarea {...register('description')} rows={3} placeholder="Short campaign description…" className={cn(INPUT, 'resize-none')} />
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-4">

                    {/* Status + Budget */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL}>Status</label>
                        <select {...register('status')} className={INPUT}>
                          {['Planning','Active','Completed','On Hold'].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={LABEL}>Budget (RM)</label>
                        <input type="number" {...register('budget')} placeholder="0" className={INPUT} />
                      </div>
                    </div>

                    {/* Start + End Date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL}>Start Date</label>
                        <input type="date" {...register('startDate')} max={watchEnd || undefined} onWheel={e => e.currentTarget.blur()} className={cn(INPUT, '[color-scheme:dark]')} />
                      </div>
                      <div>
                        <label className={LABEL}>End Date</label>
                        <input type="date" {...register('endDate')} min={watchStart || undefined} onWheel={e => e.currentTarget.blur()} className={cn(INPUT, '[color-scheme:dark]')} />
                        {errors.endDate && <p className={ERR}>{errors.endDate.message}</p>}
                      </div>
                    </div>

                    {/* Color */}
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
                  </div>

                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.07]">
                <button type="button" onClick={close} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all shadow-[0_0_16px_rgba(108,92,231,.35)] hover:-translate-y-px disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating…' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
