import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useBrandStore } from '@/store/brandStore'
import { BRAND_INDUSTRIES } from '@/lib/data'

const BRAND_COLORS = ['#6C5CE7','#0891B2','#D97706','#059669','#DC2626','#7C3AED','#DB2777','#EA580C','#8B5CF6','#EE4D2D']
const INPUT = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const LABEL = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'

export default function AddBrandModal() {
  const open       = useUIStore(s => s.addBrandOpen)
  const close      = useUIStore(s => s.closeAddBrand)
  const showToast  = useUIStore(s => s.showToast)
  const addBrand   = useBrandStore(s => s.addBrand)

  const [name,     setName]     = useState('')
  const [industry, setIndustry] = useState(BRAND_INDUSTRIES[0])
  const [color,    setColor]    = useState('#6C5CE7')
  const [website,  setWebsite]  = useState('')
  const [saving,   setSaving]   = useState(false)

  function reset() {
    setName(''); setIndustry(BRAND_INDUSTRIES[0]); setColor('#6C5CE7'); setWebsite('')
  }

  function handleClose() { reset(); close() }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await addBrand({ name: name.trim(), industry, color, website: website.trim() })
      showToast(`${name.trim()} added`)
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-modal-overlay" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-modal-content"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <div className="bg-[#111116] border border-white/[0.07] rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
              <div>
                <Dialog.Title className="font-syne text-[15px] font-bold text-white">New Brand</Dialog.Title>
                <Dialog.Description className="text-[12px] text-white/30 mt-0.5">Add a brand to track campaigns</Dialog.Description>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Brand Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Wardah" className={INPUT} required />
                </div>
                <div>
                  <label className={LABEL}>Industry</label>
                  <select value={industry} onChange={e => setIndustry(e.target.value)} className={INPUT}>
                    {BRAND_INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={LABEL}>Website <span className="normal-case font-normal text-white/20">(optional)</span></label>
                <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. brand.com" className={INPUT} />
              </div>

              <div>
                <label className={LABEL}>Color</label>
                <div className="flex gap-2 flex-wrap mt-1">
                  {BRAND_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-[#111116] scale-110' : 'opacity-50 hover:opacity-90'}`}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={handleClose} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !name.trim()} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-50">
                  <Check size={13} /> {saving ? 'Creating…' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
