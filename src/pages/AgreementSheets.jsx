import { useState } from 'react'
import { useRecruitStore } from '@/store/recruitStore'
import { useUIStore } from '@/store/uiStore'
import { Mail, FileDown } from 'lucide-react'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'
import AgreementModal from '@/components/modals/AgreementModal'

export default function AgreementSheets() {
  const requests      = useRecruitStore(s => s.requests)
  const globalSearch   = useUIStore(s => s.globalSearch)
  const [target, setTarget] = useState(null)

  const approved = requests.filter(r => r.status === 'Approved').filter(r =>
    !globalSearch || r.name.toLowerCase().includes(globalSearch.toLowerCase()) || r.email?.toLowerCase().includes(globalSearch.toLowerCase())
  )

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="mb-5">
        <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Agreement Sheets</h1>
        <p className="text-[12px] text-white/30 mt-1">Generate the ASTRO DocuSign & Stamping Information Sheet for approved creators</p>
      </div>

      {approved.length === 0 ? (
        <div className="text-[13px] text-white/25 italic py-12 text-center">No approved creators yet.</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3.5">
          {approved.map(r => (
            <div key={r.id} className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar initials={r.initials} color={r.avatarColor} size="md" />
                  <div className="min-w-0">
                    <div className="font-syne text-[15px] font-bold text-white truncate">{r.name}</div>
                    {r.email && (
                      <div className="flex items-center gap-1.5 text-[12px] text-white/40 truncate">
                        <Mail size={11} className="text-white/20 flex-shrink-0" />
                        {r.email}
                      </div>
                    )}
                  </div>
                </div>
                <Badge variant="green">Approved</Badge>
              </div>
              <button
                onClick={() => setTarget(r)}
                className="w-full flex items-center justify-center gap-1.5 bg-violet-500/12 text-violet-300 border border-violet-500/20 py-2 rounded-lg text-[13px] font-semibold hover:bg-violet-500/20 transition-all"
              >
                <FileDown size={14} /> Generate Agreement Sheet
              </button>
            </div>
          ))}
        </div>
      )}

      {target && (
        <AgreementModal creatorName={target.name} creatorEmail={target.email} onClose={() => setTarget(null)} />
      )}
    </div>
  )
}
