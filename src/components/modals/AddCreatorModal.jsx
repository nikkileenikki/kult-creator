import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useCreatorStore } from '@/store/creatorStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useNicheStore } from '@/store/nicheStore'
import { PLATFORMS, CONTACT_METHODS, AVATAR_COLOR_OPTIONS } from '@/lib/data'
import Avatar from '@/components/shared/Avatar'
import { cn } from '@/lib/utils'

const schema = z.object({
  name:              z.string().min(2, 'Name must be at least 2 characters').max(50),
  initials:          z.string().min(1, 'Required').max(3, 'Max 3 characters').toUpperCase(),
  platform:          z.string().min(1, 'Select a platform'),
  secondaryPlatform: z.string().default(''),
  niche:             z.string().min(1, 'Niche is required'),
  followers:         z.coerce.number().min(0, 'Min 0').max(100_000_000, 'Too large'),
  status:            z.enum(['Active', 'Pending to sign', 'Suspended', 'Rejected']),
  pic:               z.string().min(1, 'PIC is required'),
  contact:           z.string().min(1, 'Select a contact method'),
  avatarColor:       z.string().min(1),
  contactNumber:     z.string().default(''),
  email:             z.string().default(''),
  platformUsername:  z.string().default(''),
  dateOfBirth:       z.string().default(''),
})

const INPUT = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const LABEL = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'
const ERR   = 'text-[11px] text-rose-400 mt-1'

export default function AddCreatorModal() {
  const open       = useUIStore(s => s.addCreatorOpen)
  const closeModal = useUIStore(s => s.closeAddCreator)
  const showToast  = useUIStore(s => s.showToast)
  const addCreator = useCreatorStore(s => s.addCreator)
  const storedPics  = useAuthStore(s => s.pics)
  const PICS        = storedPics.length ? storedPics : ['Sarah K.', 'Lina M.']
  const nichesData  = useNicheStore(s => s.niches)
  const NICHES      = nichesData.map(n => n.name)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name:              '',
      initials:          '',
      platform:          PLATFORMS[0],
      secondaryPlatform: '',
      niche:             '',
      followers:         0,
      status:            'Active',
      pic:               PICS[0],
      contact:           CONTACT_METHODS[0],
      avatarColor:       'v',
      contactNumber:     '',
      email:             '',
      platformUsername:  '',
      dateOfBirth:       '',
    },
  })

  const name        = watch('name')
  const avatarColor = watch('avatarColor')
  const initials    = watch('initials')

  useEffect(() => {
    if (!name) return
    const parts = name.trim().split(/\s+/).filter(Boolean)
    const auto  = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
    setValue('initials', auto, { shouldValidate: false })
  }, [name, setValue])

  function onClose() {
    reset()
    closeModal()
  }

  async function onSubmit(data) {
    await addCreator(data)
    showToast(`${data.name} added as a Bronze creator`)
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-modal-overlay" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 animate-modal-content"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <div className="bg-[#111116] border border-white/[0.07] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <div>
                <Dialog.Title className="font-syne text-[15px] font-bold text-white">Add Creator</Dialog.Title>
                <Dialog.Description className="text-[12px] text-white/30 mt-0.5">Onboard a new creator at Bronze tier</Dialog.Description>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">

                  {/* LEFT COLUMN */}
                  <div className="space-y-4">

                    {/* Avatar Color */}
                    <div>
                      <label className={LABEL}>Avatar Color</label>
                      <div className="flex items-center gap-4">
                        <Avatar initials={initials || '??'} color={avatarColor} size="lg" />
                        <div className="flex gap-2 flex-wrap">
                          {AVATAR_COLOR_OPTIONS.map(opt => (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setValue('avatarColor', opt.key, { shouldValidate: true })}
                              title={opt.label}
                              className={cn(
                                `w-8 h-8 rounded-full bg-gradient-to-br ${opt.gradient} transition-all`,
                                avatarColor === opt.key
                                  ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-[#111116] scale-110'
                                  : 'opacity-50 hover:opacity-90 hover:scale-105',
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Name + Initials */}
                    <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
                      <div>
                        <label className={LABEL}>Full Name</label>
                        <input {...register('name')} placeholder="e.g. Siti Rania" className={INPUT} />
                        {errors.name && <p className={ERR}>{errors.name.message}</p>}
                      </div>
                      <div style={{ width: 80 }}>
                        <label className={LABEL}>Initials</label>
                        <input {...register('initials')} maxLength={3} placeholder="SR" className={cn(INPUT, 'text-center font-bold uppercase tracking-widest')} />
                        {errors.initials && <p className={ERR}>{errors.initials.message}</p>}
                      </div>
                    </div>

                    {/* Primary + Secondary Platform */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL}>Primary Platform</label>
                        <select {...register('platform')} className={INPUT}>
                          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                        </select>
                        {errors.platform && <p className={ERR}>{errors.platform.message}</p>}
                      </div>
                      <div>
                        <label className={LABEL}>Secondary <span className="normal-case text-white/20 font-normal">(optional)</span></label>
                        <select {...register('secondaryPlatform')} className={INPUT}>
                          <option value="">None</option>
                          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Platform Username + Date of Birth */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL}>Username <span className="normal-case text-white/20 font-normal">(optional)</span></label>
                        <input {...register('platformUsername')} placeholder="e.g. @username" className={INPUT} />
                      </div>
                      <div>
                        <label className={LABEL}>Date of Birth <span className="normal-case text-white/20 font-normal">(optional)</span></label>
                        <input type="date" {...register('dateOfBirth')} className={cn(INPUT, '[color-scheme:dark]')} />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-4">

                    {/* Niches */}
                    <div>
                      <label className={LABEL}>Niches</label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {NICHES.map(n => {
                          const vals = (watch('niche') ?? '').split(', ').filter(Boolean)
                          const on = vals.includes(n)
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => {
                                const next = on ? vals.filter(x => x !== n) : [...vals, n]
                                setValue('niche', next.join(', '), { shouldValidate: true })
                              }}
                              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${on ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/5 border-white/7 text-white/40 hover:border-white/20'}`}
                            >
                              {n}
                            </button>
                          )
                        })}
                      </div>
                      {errors.niche && <p className={ERR}>{errors.niche.message}</p>}
                    </div>

                    {/* Followers + Status */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL}>Followers</label>
                        <input type="number" {...register('followers')} min={0} placeholder="e.g. 50000" className={INPUT} />
                        {errors.followers && <p className={ERR}>{errors.followers.message}</p>}
                      </div>
                      <div>
                        <label className={LABEL}>Status</label>
                        <select {...register('status')} className={INPUT}>
                          <option>Active</option>
                          <option>Pending to sign</option>
                          <option>Suspended</option>
                          <option>Rejected</option>
                        </select>
                      </div>
                    </div>

                    {/* PIC + Contact Method */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL}>PIC</label>
                        <select {...register('pic')} className={INPUT}>
                          {PICS.map(p => <option key={p}>{p}</option>)}
                        </select>
                        {errors.pic && <p className={ERR}>{errors.pic.message}</p>}
                      </div>
                      <div>
                        <label className={LABEL}>Contact Method</label>
                        <select {...register('contact')} className={INPUT}>
                          {CONTACT_METHODS.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Contact Number + Email */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL}>Contact No. <span className="normal-case text-white/20 font-normal">(optional)</span></label>
                        <input {...register('contactNumber')} placeholder="e.g. +60 12-345 6789" className={INPUT} />
                      </div>
                      <div>
                        <label className={LABEL}>Email <span className="normal-case text-white/20 font-normal">(optional)</span></label>
                        <input {...register('email')} type="email" placeholder="e.g. name@email.com" className={INPUT} />
                      </div>
                    </div>

                    {/* Bronze tier note */}
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-500/8 border border-rose-500/15 rounded-lg">
                      <span className="text-base">🥉</span>
                      <span className="text-[12px] text-white/40">
                        New creators start at <span className="text-rose-300 font-semibold">Bronze</span> tier with 0 coins. Coins are awarded per completed task.
                      </span>
                    </div>
                  </div>

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
                  Add Creator
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
