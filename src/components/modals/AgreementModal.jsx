import { useState, useEffect } from 'react'
import { X, FileDown } from 'lucide-react'
import { downloadAgreementDocx } from '@/lib/agreementDoc'

const INPUT = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-2.5 py-2 text-[12px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const LABEL = 'block text-[10px] font-semibold text-white/35 uppercase tracking-wider mb-1'

export default function AgreementModal({ creatorName, creatorEmail, creatorPhone, onClose }) {
  const [agreement, setAgreement] = useState({
    astroSignatory1Name: 'MUHAMMAD MUZAMIL BIN HUSSIN', astroSignatory1Email: 'mell_hussin@kult.my',
    counterparty1Name: creatorName || '', counterparty1Phone: creatorPhone || '', counterparty1Email: creatorEmail || '', counterparty1Nric: '',
    ccRepName: '', ccRepEmail: '',
    signingOrderRequired: 'No', signingOrderSequence: '',
    cesBoardRequired: 'No',
    costCentre: 'A300DH006', contractAmount: 'RM0',
    stampDutyParty: 'Astro',
    specialRequests: 'Auto-reminder',
  })
  const [generating, setGenerating] = useState(false)

  function setField(patch) { setAgreement(a => ({ ...a, ...patch })) }

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const filename = `Agreement-${(creatorName || 'creator').replace(/[^\w\-]+/g, '_')}-${new Date().toISOString().slice(0, 10)}.docx`
      await downloadAgreementDocx(filename, agreement)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 z-[91] -translate-x-1/2 -translate-y-1/2 w-full max-w-[720px] px-4 animate-modal-content">
        <div className="bg-[#111116] border border-white/7 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">

          <div className="flex items-center justify-between px-6 py-5 border-b border-white/7 flex-shrink-0">
            <div>
              <div className="font-syne text-[16px] font-bold text-white">Generate Agreement Sheet</div>
              <div className="text-[12px] text-white/30 mt-0.5">{creatorName}</div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-3">
            <div className="text-[12px] text-white/40">Fill in the DocuSign & stamping details, then generate the routing sheet as a .docx.</div>

            <div>
              <div className={LABEL.replace('mb-1', 'mb-1.5')}>Astro Signatory</div>
              <div className="grid grid-cols-2 gap-2">
                <input className={INPUT} placeholder="Name" value={agreement.astroSignatory1Name} onChange={e => setField({ astroSignatory1Name: e.target.value })} />
                <input className={INPUT} placeholder="Email" value={agreement.astroSignatory1Email} onChange={e => setField({ astroSignatory1Email: e.target.value })} />
              </div>
            </div>

            <div>
              <div className={LABEL.replace('mb-1', 'mb-1.5')}>Counterparty Signatory</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input className={INPUT} placeholder="Name" value={agreement.counterparty1Name} onChange={e => setField({ counterparty1Name: e.target.value })} />
                <input className={INPUT} placeholder="Phone number" value={agreement.counterparty1Phone} onChange={e => setField({ counterparty1Phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className={INPUT} placeholder="Email" value={agreement.counterparty1Email} onChange={e => setField({ counterparty1Email: e.target.value })} />
                <input className={INPUT} placeholder="NRIC/Passport" value={agreement.counterparty1Nric} onChange={e => setField({ counterparty1Nric: e.target.value })} />
              </div>
            </div>

            <div>
              <div className={LABEL.replace('mb-1', 'mb-1.5')}>Counterparty Representative to be Copied</div>
              <div className="grid grid-cols-2 gap-2">
                <input className={INPUT} placeholder="Name" value={agreement.ccRepName} onChange={e => setField({ ccRepName: e.target.value })} />
                <input className={INPUT} placeholder="Email" value={agreement.ccRepEmail} onChange={e => setField({ ccRepEmail: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={LABEL}>Signing Order Required?</div>
                <div className="flex gap-2">
                  {['No', 'Yes'].map(v => (
                    <button key={v} type="button" onClick={() => setField({ signingOrderRequired: v })}
                      className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${agreement.signingOrderRequired === v ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/5 border-white/7 text-white/50 hover:border-white/20'}`}>
                      {v}
                    </button>
                  ))}
                </div>
                {agreement.signingOrderRequired === 'Yes' && (
                  <input className={INPUT + ' mt-2'} placeholder="e.g. A to sign first, then followed by B" value={agreement.signingOrderSequence} onChange={e => setField({ signingOrderSequence: e.target.value })} />
                )}
              </div>
              <div>
                <div className={LABEL}>CES / Board Paper Required?</div>
                <div className="flex gap-2">
                  {['No', 'Yes'].map(v => (
                    <button key={v} type="button" onClick={() => setField({ cesBoardRequired: v })}
                      className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${agreement.cesBoardRequired === v ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/5 border-white/7 text-white/50 hover:border-white/20'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={LABEL}>Cost Centre for Stamp Duty</div>
                <input className={INPUT} value={agreement.costCentre} onChange={e => setField({ costCentre: e.target.value })} />
              </div>
              <div>
                <div className={LABEL}>Contract Amount</div>
                <input className={INPUT} value={agreement.contractAmount} onChange={e => setField({ contractAmount: e.target.value })} />
              </div>
            </div>

            <div>
              <div className={LABEL}>Which Party Will Bear the Stamp Duty?</div>
              <div className="flex gap-2">
                {['Astro', 'Counterparty', 'Shared'].map(v => (
                  <button key={v} type="button" onClick={() => setField({ stampDutyParty: v })}
                    className={`flex-1 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${agreement.stampDutyParty === v ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/5 border-white/7 text-white/50 hover:border-white/20'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={LABEL}>Any Special Requests?</div>
              <textarea rows={2} className={INPUT + ' resize-none'} value={agreement.specialRequests} onChange={e => setField({ specialRequests: e.target.value })} />
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-white/7 px-6 py-4 flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all">Close</button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-1.5 bg-violet-500/15 text-violet-300 border border-violet-500/25 py-2 rounded-lg text-[13px] font-semibold hover:bg-violet-500/25 disabled:opacity-50 transition-all"
            >
              <FileDown size={14} /> {generating ? 'Generating…' : 'Generate & Download .docx'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
