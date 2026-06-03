import { useMemo } from 'react'
import { useRecruitStore } from '@/store/recruitStore'
import { useUIStore } from '@/store/uiStore'
import { Mail, Phone, Video, ExternalLink } from 'lucide-react'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'

const STATUS_BADGE = { Pending: 'amber', 'Under Review': 'blue', Approved: 'green', Rejected: 'red' }

const COLLAB_COLOR = {
  'Gifted products':            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  'Affiliated/commission-based':'bg-blue-500/10 border-blue-500/20 text-blue-400',
  'Long-term partnership':      'bg-violet-500/10 border-violet-500/20 text-violet-400',
  'Paid campaign':              'bg-amber-500/10 border-amber-500/20 text-amber-400',
}

export default function Recruit() {
  const requests     = useRecruitStore(s => s.requests)
  const updateStatus = useRecruitStore(s => s.updateStatus)
  const showToast    = useUIStore(s => s.showToast)
  const globalSearch = useUIStore(s => s.globalSearch)
  const pending      = requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length

  const displayed = useMemo(() => {
    const active = requests.filter(r => r.status !== 'Approved' && r.status !== 'Rejected')
    if (!globalSearch) return active
    const q = globalSearch.toLowerCase()
    return active.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.niche.toLowerCase().includes(q) ||
      r.tiktokUsername?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q)
    )
  }, [requests, globalSearch])

  async function handleApprove(id) {
    await updateStatus(id, 'Approved')
    showToast('Creator approved and added to All Creators')
  }

  async function handleReject(id) {
    await updateStatus(id, 'Rejected')
    showToast('Creator rejected and archived', 'error')
  }

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

      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-3.5">
        {displayed.map(r => {
          const isFormSubmission = r.source === 'Registration Form'
          const categories = r.niche ? r.niche.split(', ').filter(Boolean) : []
          const collabPrefs = r.collabPreference?.length ? r.collabPreference : []

          return (
            <div key={r.id} className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px] flex flex-col gap-3 transition-all">

              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar initials={r.initials} color={r.avatarColor} size="md" />
                  <div>
                    <div className="font-syne text-[15px] font-bold text-white">{r.name}</div>
                    <div className="text-[12px] text-white/30 mt-0.5">
                      {r.tiktokUsername
                        ? <span className="text-violet-400/80">{r.tiktokUsername}</span>
                        : r.platform}
                      {' · '}
                      {r.followerRange || `${(r.followers / 1000).toFixed(0)}K`} followers
                    </div>
                  </div>
                </div>
                <Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge>
              </div>

              {/* Contact info — only for form submissions */}
              {isFormSubmission && (r.email || r.contactNumber || r.videoLink) && (
                <div className="flex flex-col gap-1.5 bg-white/[.03] border border-white/7 rounded-lg px-3 py-2.5">
                  {r.email && (
                    <a href={`mailto:${r.email}`} className="flex items-center gap-2 text-[12px] text-white/60 hover:text-white transition-colors">
                      <Mail size={12} className="text-white/25 flex-shrink-0" />
                      {r.email}
                    </a>
                  )}
                  {r.contactNumber && (
                    <div className="flex items-center gap-2 text-[12px] text-white/60">
                      <Phone size={12} className="text-white/25 flex-shrink-0" />
                      {r.contactNumber}
                    </div>
                  )}
                  {r.videoLink && (
                    <a
                      href={r.videoLink.startsWith('http') ? r.videoLink : `https://${r.videoLink}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[12px] text-violet-400/80 hover:text-violet-300 transition-colors truncate"
                    >
                      <ExternalLink size={12} className="flex-shrink-0" />
                      {r.videoLink}
                    </a>
                  )}
                </div>
              )}

              {/* Content categories */}
              {categories.length > 0 && (
                <div>
                  <div className="text-[9px] font-medium text-white/20 uppercase tracking-wider mb-1.5">Content</div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(cat => (
                      <span key={cat} className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/7 text-white/50 font-medium">{cat}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Collab preferences */}
              {collabPrefs.length > 0 && (
                <div>
                  <div className="text-[9px] font-medium text-white/20 uppercase tracking-wider mb-1.5">Collab Preference</div>
                  <div className="flex flex-wrap gap-1.5">
                    {collabPrefs.map(pref => (
                      <span key={pref} className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${COLLAB_COLOR[pref] ?? 'bg-white/5 border-white/7 text-white/40'}`}>
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement bars */}
              <div className="space-y-1.5">
                {[
                  { label: 'Followers', val: Math.min(100, r.followers / 5000) },
                  ...(r.engagementRate > 0 ? [{ label: 'Eng. Rate', val: Math.min(100, r.engagementRate * 8) }] : []),
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-white/25 w-16">{b.label}</span>
                    <div className="flex-1 h-1 rounded-full bg-white/6 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-700 to-violet-400" style={{ width: `${b.val}%` }} />
                    </div>
                    <span className="font-mono text-[10px] text-white/40">
                      {b.label === 'Followers' ? (r.followerRange || `${(r.followers / 1000).toFixed(0)}K`) : `${r.engagementRate}%`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Meta row */}
              <div className="text-[11px] text-white/25 border-t border-white/7 pt-2.5 flex items-center gap-2 flex-wrap">
                <span>Applied <span className="text-white/45">{r.appliedDate}</span></span>
                <span>·</span>
                <span>Source: <span className="text-white/45">{r.source}</span></span>
                <span>·</span>
                <span>PIC: <span className="text-white/45">{r.pic}</span></span>
                {r.liveExperience && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Video size={10} className="text-white/25" />
                      <span className={r.liveExperience === 'Yes' ? 'text-emerald-400' : 'text-white/40'}>
                        Live {r.liveExperience === 'Yes' ? 'experienced' : 'no experience'}
                      </span>
                    </span>
                  </>
                )}
              </div>

              {/* Description (for non-form entries) */}
              {r.description && !isFormSubmission && (
                <p className="text-[12px] text-white/40 leading-relaxed">{r.description}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-0.5">
                <button onClick={() => handleApprove(r.id)}
                  className="bg-emerald-400/12 text-emerald-400 border border-emerald-400/20 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-emerald-400/20 transition-all">
                  ✓ Approve
                </button>
                <button onClick={() => handleReject(r.id)}
                  className="bg-rose-400/12 text-rose-400 border border-rose-400/20 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-rose-400/20 transition-all">
                  ✕ Reject
                </button>
                {r.status === 'Pending' && (
                  <button onClick={() => updateStatus(r.id, 'Under Review')}
                    className="bg-blue-400/12 text-blue-400 border border-blue-400/20 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-blue-400/20 transition-all">
                    ⟳ Review
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
