import { useRecruitStore } from '@/store/recruitStore'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'

const STATUS_BADGE = { Pending:'amber', 'Under Review':'blue', Approved:'green', Rejected:'red' }

export default function Recruit() {
  const requests = useRecruitStore(s => s.requests)
  const updateStatus = useRecruitStore(s => s.updateStatus)
  const pending = requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Recruit Requests</h1>
          <p className="text-[12px] text-white/30 mt-1">Review and approve new creator applications</p>
        </div>
        <Badge variant={pending > 0 ? 'amber' : 'green'}>
          {pending > 0 ? `${pending} Pending` : 'All Reviewed'}
        </Badge>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(310px,1fr))] gap-3.5">
        {requests.map(r => {
          const isDone = r.status === 'Approved' || r.status === 'Rejected'
          return (
            <div key={r.id} className={`bg-[#1E1E28] border rounded-[14px] p-[18px] transition-all ${r.status==='Approved'?'border-emerald-500/30 opacity-60':r.status==='Rejected'?'border-rose-500/20 opacity-50':'border-white/7'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={r.initials} color={r.avatarColor} size="md" />
                  <div>
                    <div className="font-syne text-[15px] font-bold text-white">{r.name}</div>
                    <div className="text-[12px] text-white/30 mt-0.5">{r.platform} · {(r.followers/1000).toFixed(0)}K followers</div>
                  </div>
                </div>
                <Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {r.tags.map(tag => (
                  <span key={tag} className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/7 text-white/40 font-medium">{tag}</span>
                ))}
              </div>

              {/* Bars */}
              <div className="space-y-1.5 mb-3">
                {[
                  { label: 'Followers', val: Math.min(100, r.followers/5000) },
                  { label: 'Eng. Rate', val: Math.min(100, r.engagementRate * 8) },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-white/25 w-16">{b.label}</span>
                    <div className="flex-1 h-1 rounded-full bg-white/6 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-700 to-violet-400" style={{ width: `${b.val}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-white/40">
                      {b.label === 'Followers' ? `${(r.followers/1000).toFixed(0)}K` : `${r.engagementRate}%`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-white/30 py-2.5 border-t border-b border-white/7 mb-3 leading-relaxed">
                Applied <span className="text-white/50 font-medium">{r.appliedDate}</span> · Source: <span className="text-white/50 font-medium">{r.source}</span> · PIC: <span className="text-white/50 font-medium">{r.pic}</span>
              </div>

              <p className="text-[12px] text-white/40 leading-relaxed mb-3">{r.description}</p>

              {!isDone && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(r.id, 'Approved')}
                    className="bg-emerald-400/12 text-emerald-400 border border-emerald-400/20 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-emerald-400/20 transition-all font-figtree">
                    ✓ Approve
                  </button>
                  <button onClick={() => updateStatus(r.id, 'Rejected')}
                    className="bg-rose-400/12 text-rose-400 border border-rose-400/20 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-rose-400/20 transition-all font-figtree">
                    ✕ Reject
                  </button>
                  {r.status === 'Pending' && (
                    <button onClick={() => updateStatus(r.id, 'Under Review')}
                      className="bg-blue-400/12 text-blue-400 border border-blue-400/20 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-blue-400/20 transition-all font-figtree">
                      ⟳ Review
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
