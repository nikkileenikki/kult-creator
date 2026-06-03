import { useMemo } from 'react'
import { useRecruitStore } from '@/store/recruitStore'
import { useUIStore } from '@/store/uiStore'
import { Mail, Phone, ExternalLink, Video, Users, AtSign } from 'lucide-react'
import Badge from '@/components/shared/Badge'
import Avatar from '@/components/shared/Avatar'

const STATUS_BADGE = { Pending: 'amber', 'Under Review': 'blue', Approved: 'green', Rejected: 'red' }

const COLLAB_COLOR = {
  'Gifted products':             'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  'Affiliated/commission-based': 'bg-blue-500/10    border-blue-500/20    text-blue-400',
  'Long-term partnership':       'bg-violet-500/10  border-violet-500/20  text-violet-400',
  'Paid campaign':               'bg-amber-500/10   border-amber-500/20   text-amber-400',
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <Icon size={12} className="text-white/20 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-medium text-white/20 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-[12px] text-white/70">{children}</div>
      </div>
    </div>
  )
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
      r.niche?.toLowerCase().includes(q) ||
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

      <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-3.5">
        {displayed.map(r => {
          const isFormSubmission = r.source === 'Registration Form'
          const categories  = r.niche ? r.niche.split(', ').filter(Boolean) : []
          const collabPrefs = r.collabPreference?.length ? r.collabPreference : (r.tags ?? [])

          return (
            <div key={r.id} className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden flex flex-col transition-all">

              {/* Header */}
              <div className="flex items-start justify-between px-[18px] pt-[18px] pb-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={r.initials} color={r.avatarColor} size="md" />
                  <div>
                    <div className="font-syne text-[15px] font-bold text-white">{r.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {r.tiktokUsername && (
                        <span className="text-[12px] text-violet-400/80">{r.tiktokUsername}</span>
                      )}
                      {r.tiktokUsername && <span className="text-white/15">·</span>}
                      <span className="text-[12px] text-white/30">
                        {r.followerRange || `${(r.followers / 1000).toFixed(0)}K`} followers
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge>
              </div>

              {/* Divider */}
              <div className="border-t border-white/[0.05] mx-[18px]" />

              {/* Form fields grid */}
              <div className="px-[18px] py-3 grid grid-cols-2 gap-x-4 gap-y-3">

                {/* Email */}
                {r.email && (
                  <div className="col-span-2">
                    <Row icon={Mail} label="Email">
                      <a href={`mailto:${r.email}`} className="hover:text-white transition-colors truncate block">{r.email}</a>
                    </Row>
                  </div>
                )}

                {/* Contact number */}
                {r.contactNumber && (
                  <Row icon={Phone} label="Contact">
                    {r.contactNumber}
                  </Row>
                )}

                {/* TikTok username */}
                {r.tiktokUsername && (
                  <Row icon={AtSign} label="TikTok">
                    {r.tiktokUsername}
                  </Row>
                )}

                {/* Follower count */}
                <Row icon={Users} label="Followers">
                  {r.followerRange || `${(r.followers / 1000).toFixed(0)}K`}
                </Row>

                {/* Live experience */}
                {(r.liveExperience || isFormSubmission) && (
                  <Row icon={Video} label="Live Experience">
                    <span className={r.liveExperience === 'Yes' ? 'text-emerald-400' : 'text-white/40'}>
                      {r.liveExperience || '—'}
                    </span>
                  </Row>
                )}

                {/* Video link */}
                {r.videoLink && (
                  <div className="col-span-2">
                    <Row icon={ExternalLink} label="Video Link">
                      <a
                        href={r.videoLink.startsWith('http') ? r.videoLink : `https://${r.videoLink}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-violet-400/80 hover:text-violet-300 transition-colors truncate block"
                      >
                        {r.videoLink}
                      </a>
                    </Row>
                  </div>
                )}
              </div>

              {/* Content categories */}
              {categories.length > 0 && (
                <div className="px-[18px] pb-3">
                  <div className="text-[9px] font-medium text-white/20 uppercase tracking-wider mb-1.5">Primary Content</div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(cat => (
                      <span key={cat} className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/7 text-white/50 font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Collab preferences */}
              {collabPrefs.length > 0 && (
                <div className="px-[18px] pb-3">
                  <div className="text-[9px] font-medium text-white/20 uppercase tracking-wider mb-1.5">Collaboration Preference</div>
                  <div className="flex flex-wrap gap-1.5">
                    {collabPrefs.map(pref => (
                      <span key={pref} className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${COLLAB_COLOR[pref] ?? 'bg-white/5 border-white/7 text-white/40'}`}>
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description (manual entries only) */}
              {r.description && !isFormSubmission && (
                <p className="text-[12px] text-white/40 leading-relaxed px-[18px] pb-3">{r.description}</p>
              )}

              {/* Footer meta */}
              <div className="mt-auto border-t border-white/[0.05] px-[18px] py-2.5 flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/25">
                <span>Applied <span className="text-white/45">{r.appliedDate}</span></span>
                <span className="text-white/10">·</span>
                <span>Source: <span className="text-white/45">{r.source}</span></span>
                <span className="text-white/10">·</span>
                <span>PIC: <span className="text-white/45">{r.pic}</span></span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-[18px] pb-[18px]">
                <button onClick={() => handleApprove(r.id)}
                  className="bg-emerald-400/12 text-emerald-400 border border-emerald-400/20 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-emerald-400/20 transition-all">
                  ✓ Approve
                </button>
                <button onClick={() => handleReject(r.id)}
                  className="bg-rose-400/12 text-rose-400 border border-rose-400/20 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-rose-400/20 transition-all">
                  ✕ Reject
                </button>
                {r.status === 'Pending' && (
                  <button onClick={() => updateStatus(r.id, 'Under Review')}
                    className="bg-blue-400/12 text-blue-400 border border-blue-400/20 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-blue-400/20 transition-all">
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
