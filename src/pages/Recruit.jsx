import { useMemo, useState, useEffect, useRef } from 'react'
import { useRecruitStore } from '@/store/recruitStore'
import { useUIStore } from '@/store/uiStore'
import { Mail, Phone, ExternalLink, Video, Users, AtSign, X, Calendar, MapPin, Tag } from 'lucide-react'
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

function ProfilePanel({ recruit: r, onClose, onApprove, onReject, onReview }) {
  const panelRef = useRef(null)

  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const isFormSubmission = r.source === 'Registration Form'
  const categories  = r.niche ? r.niche.split(', ').filter(Boolean) : []
  const collabPrefs = r.collabPreference?.length ? r.collabPreference : (r.tags ?? [])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-full z-[81] w-[420px] bg-[#111116] border-l border-white/7 flex flex-col shadow-2xl animate-[slideInRight_.2s_ease]"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/7 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar initials={r.initials} color={r.avatarColor} size="md" />
            <div>
              <div className="font-syne text-[16px] font-bold text-white">{r.name}</div>
              {r.tiktokUsername && (
                <div className="text-[12px] text-violet-400/80 mt-0.5">{r.tiktokUsername}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Contact section */}
          <div className="px-6 py-4 border-b border-white/7">
            <div className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-3">Contact</div>
            <div className="space-y-3">
              {r.email && (
                <Row icon={Mail} label="Email">
                  <a href={`mailto:${r.email}`} className="hover:text-white transition-colors">{r.email}</a>
                </Row>
              )}
              {r.contactNumber && (
                <Row icon={Phone} label="Contact Number">
                  {r.contactNumber}
                </Row>
              )}
              {r.tiktokUsername && (
                <Row icon={AtSign} label="TikTok Username">
                  {r.tiktokUsername}
                </Row>
              )}
              {r.videoLink && (
                <Row icon={ExternalLink} label="Video Sample">
                  <a
                    href={r.videoLink.startsWith('http') ? r.videoLink : `https://${r.videoLink}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-violet-400/80 hover:text-violet-300 transition-colors break-all"
                  >
                    {r.videoLink}
                  </a>
                </Row>
              )}
            </div>
          </div>

          {/* Creator stats */}
          <div className="px-6 py-4 border-b border-white/7">
            <div className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-3">Creator Info</div>
            <div className="grid grid-cols-2 gap-3">
              <Row icon={Users} label="Followers">
                {r.followerRange || `${(r.followers / 1000).toFixed(0)}K`}
              </Row>
              <Row icon={Video} label="Live Experience">
                <span className={r.liveExperience === 'Yes' ? 'text-emerald-400' : r.liveExperience ? 'text-white/40' : 'text-white/20'}>
                  {r.liveExperience || '—'}
                </span>
              </Row>
              {r.engagementRate > 0 && (
                <Row icon={Tag} label="Engagement Rate">
                  {r.engagementRate}%
                </Row>
              )}
            </div>
          </div>

          {/* Content categories */}
          {categories.length > 0 && (
            <div className="px-6 py-4 border-b border-white/7">
              <div className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-3">Primary Content</div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <span key={cat} className="text-[12px] px-3 py-1 rounded-full bg-white/5 border border-white/7 text-white/60 font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collab preferences */}
          {collabPrefs.length > 0 && (
            <div className="px-6 py-4 border-b border-white/7">
              <div className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-3">Collaboration Preference</div>
              <div className="flex flex-wrap gap-1.5">
                {collabPrefs.map(pref => (
                  <span key={pref} className={`text-[12px] px-3 py-1 rounded-full border font-medium ${COLLAB_COLOR[pref] ?? 'bg-white/5 border-white/7 text-white/40'}`}>
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {r.description && (
            <div className="px-6 py-4 border-b border-white/7">
              <div className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-2">About</div>
              <p className="text-[13px] text-white/50 leading-relaxed">{r.description}</p>
            </div>
          )}

          {/* Application meta */}
          <div className="px-6 py-4">
            <div className="text-[10px] font-semibold text-white/25 uppercase tracking-wider mb-3">Application Details</div>
            <div className="space-y-3">
              <Row icon={Calendar} label="Applied Date">{r.appliedDate}</Row>
              <Row icon={MapPin} label="Source">{r.source}</Row>
              <Row icon={Tag} label="PIC">{r.pic}</Row>
            </div>
          </div>
        </div>

        {/* Actions footer */}
        <div className="flex-shrink-0 border-t border-white/7 px-6 py-4 flex gap-2">
          <button
            onClick={() => onApprove(r.id)}
            className="flex-1 bg-emerald-400/12 text-emerald-400 border border-emerald-400/20 py-2 rounded-lg text-[13px] font-semibold hover:bg-emerald-400/20 transition-all"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => onReject(r.id)}
            className="flex-1 bg-rose-400/12 text-rose-400 border border-rose-400/20 py-2 rounded-lg text-[13px] font-semibold hover:bg-rose-400/20 transition-all"
          >
            ✕ Reject
          </button>
          {r.status === 'Pending' && (
            <button
              onClick={() => onReview(r.id)}
              className="flex-1 bg-blue-400/12 text-blue-400 border border-blue-400/20 py-2 rounded-lg text-[13px] font-semibold hover:bg-blue-400/20 transition-all"
            >
              ⟳ Review
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default function Recruit() {
  const requests     = useRecruitStore(s => s.requests)
  const updateStatus = useRecruitStore(s => s.updateStatus)
  const showToast    = useUIStore(s => s.showToast)
  const globalSearch = useUIStore(s => s.globalSearch)
  const pending      = requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length

  const [selectedId, setSelectedId] = useState(null)
  const selected = selectedId ? requests.find(r => r.id === selectedId) : null

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
    setSelectedId(null)
  }

  async function handleReject(id) {
    await updateStatus(id, 'Rejected')
    showToast('Creator rejected and archived', 'error')
    setSelectedId(null)
  }

  async function handleReview(id) {
    await updateStatus(id, 'Under Review')
    showToast('Moved to Under Review')
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

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3.5">
        {displayed.map(r => {
          const isFormSubmission = r.source === 'Registration Form'
          const categories  = r.niche ? r.niche.split(', ').filter(Boolean) : []
          const collabPrefs = r.collabPreference?.length ? r.collabPreference : (r.tags ?? [])
          const isSelected  = selectedId === r.id

          return (
            <div
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className={`bg-[#1E1E28] border rounded-[14px] overflow-hidden flex flex-col cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,.3)] ${isSelected ? 'border-violet-500/50 shadow-[0_0_0_1px_rgba(139,92,246,.2)]' : 'border-white/7 hover:border-violet-500/30'}`}
            >
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

              <div className="border-t border-white/[0.05] mx-[18px]" />

              {/* Quick info */}
              <div className="px-[18px] py-3 space-y-2">
                {r.email && (
                  <div className="flex items-center gap-2 text-[12px] text-white/40">
                    <Mail size={11} className="text-white/20 flex-shrink-0" />
                    {r.email}
                  </div>
                )}
                {r.contactNumber && (
                  <div className="flex items-center gap-2 text-[12px] text-white/40">
                    <Phone size={11} className="text-white/20 flex-shrink-0" />
                    {r.contactNumber}
                  </div>
                )}
                {r.videoLink && (
                  <div className="flex items-center gap-2 text-[12px] text-violet-400/60 truncate">
                    <ExternalLink size={11} className="flex-shrink-0 text-violet-400/40" />
                    <span className="truncate">{r.videoLink}</span>
                  </div>
                )}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="px-[18px] pb-3 flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <span key={cat} className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/7 text-white/40 font-medium">{cat}</span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="mt-auto border-t border-white/[0.05] px-[18px] py-2.5 flex items-center justify-between text-[11px] text-white/25">
                <span>{r.appliedDate} · {r.source}</span>
                {r.liveExperience && (
                  <span className={`flex items-center gap-1 ${r.liveExperience === 'Yes' ? 'text-emerald-400/70' : 'text-white/20'}`}>
                    <Video size={10} />
                    Live {r.liveExperience === 'Yes' ? 'Yes' : 'No'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Profile panel */}
      {selected && (
        <ProfilePanel
          recruit={selected}
          onClose={() => setSelectedId(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onReview={handleReview}
        />
      )}
    </div>
  )
}
