import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { useTaskStore } from '@/store/taskStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { getTier, getProgress, coinsToNextTier } from '@/lib/tierUtils'
import { PLATFORMS, PICS, CONTACT_METHODS, AVATAR_COLOR_OPTIONS, NICHES } from '@/lib/data'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import ProgressBar from '@/components/shared/ProgressBar'
import { ChevronRight, Pencil, X, Check, Plus, CheckCircle2, Star, Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const TAG_COLORS = ['tag-teal','tag-purple','tag-amber','tag-blue','tag-coral','tag-green']
const TAG_STYLE  = {
  'tag-teal':   'bg-teal-400/12 text-teal-400',
  'tag-purple': 'bg-violet-400/15 text-violet-300',
  'tag-amber':  'bg-amber-400/12 text-amber-300',
  'tag-blue':   'bg-blue-400/12 text-blue-400',
  'tag-coral':  'bg-rose-400/12 text-rose-300',
  'tag-green':  'bg-emerald-400/12 text-emerald-400',
}

const INPUT  = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all'
const SELECT = 'w-full bg-[#1A1A22] border border-white/[0.07] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-violet-500/50 transition-all'
const LABEL  = 'block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1'

function TagInput({ items = [], onChange, placeholder }) {
  const [val, setVal] = useState('')
  const arr = Array.isArray(items) ? items : []

  function add() {
    const trimmed = val.trim()
    if (trimmed && !arr.includes(trimmed)) onChange([...arr, trimmed])
    setVal('')
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {arr.map((item, i) => (
          <span key={i} className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-violet-500/12 text-violet-300 border border-violet-500/20">
            {item}
            <button type="button" onClick={() => onChange(arr.filter((_, j) => j !== i))} className="text-violet-400/60 hover:text-violet-200 ml-0.5">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className={INPUT}
        />
        <button type="button" onClick={add} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/7 text-white/40 hover:text-white transition-all">
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

const PRIORITY_COLOR = {
  Urgent: 'text-rose-400',
  High:   'text-amber-400',
  Medium: 'text-blue-400',
  Low:    'text-emerald-400',
}

const MASK = '••••••••••'

function MaskedField({ value, revealed, onToggle, canReveal }) {
  if (!value) return <span className="text-white/20 italic text-[12px]">Not set</span>
  return (
    <div className="flex items-center gap-1.5">
      <span className={`font-medium text-[12px] ${revealed ? 'text-white' : 'text-white/40 tracking-widest'}`}>
        {revealed ? value : MASK}
      </span>
      {canReveal ? (
        <button type="button" onClick={onToggle} className="text-white/25 hover:text-white/70 transition-colors flex-shrink-0">
          {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      ) : (
        <Lock size={11} className="text-white/20 flex-shrink-0" title="Only the assigned PIC can reveal this field" />
      )}
    </div>
  )
}

export default function Persona() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const creator    = useCreatorStore(s => s.creators.find(c => c.id === id))
  const updateCreator = useCreatorStore(s => s.updateCreator)
  const showToast  = useUIStore(s => s.showToast)
  const canViewContacts = useAuthStore(s => s.canViewContacts)
  const tasks = useTaskStore(s => s.tasks)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(null)
  const [saving, setSaving]   = useState(false)
  const [revealed, setRevealed] = useState({ phone: false, email: false })

  const completedTasks = tasks.filter(t => t.creatorId === id && t.status === 'Completed')
  const canReveal = canViewContacts(creator?.pic)

  if (!creator) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white/30">
        <p className="text-[14px]">Creator not found.</p>
        <button onClick={() => navigate('/creators')} className="mt-3 text-violet-400 text-[13px] hover:underline">
          ← Back to Creators
        </button>
      </div>
    )
  }

  const tier     = getTier(creator.coins)
  const progress = getProgress(creator.coins)
  const toNext   = coinsToNextTier(creator.coins)
  const persona  = creator.persona ?? {}

  function startEdit() {
    setDraft({
      name: creator.name, initials: creator.initials,
      platform: creator.platform, secondaryPlatform: creator.secondaryPlatform ?? '',
      niche: [creator.niche, creator.secondaryNiche].filter(Boolean).join(', '), secondaryNiche: '',
      followers: creator.followers, status: creator.status,
      pic: creator.pic, contact: creator.contact, avatarColor: creator.avatarColor,
      contactNumber: creator.contactNumber ?? '', email: creator.email ?? '',
      platformUsername: creator.platformUsername ?? '', dateOfBirth: creator.dateOfBirth ?? '',
      persona: {
        contentStyle:      persona.contentStyle      ?? '',
        toneOfVoice:       persona.toneOfVoice       ?? '',
        brandFitTags:      Array.isArray(persona.brandFitTags) ? [...persona.brandFitTags] : [],
        audienceAgeRange:  persona.audienceAgeRange  ?? '',
        audienceGender:    persona.audienceGender    ?? '',
        audienceLocations: persona.audienceLocations ?? '',
        engagementStyle:   persona.engagementStyle   ?? '',
        pastCollabs:       Array.isArray(persona.pastCollabs) ? [...persona.pastCollabs] : [],
        dos:               Array.isArray(persona.dos)  ? [...persona.dos]  : [],
        donts:             Array.isArray(persona.donts) ? [...persona.donts] : [],
        internalNotes:     persona.internalNotes     ?? '',
      },
    })
    setEditing(true)
  }

  function cancelEdit() { setDraft(null); setEditing(false) }

  async function saveEdit() {
    setSaving(true)
    try {
      const { persona: p, ...basic } = draft
      await updateCreator(creator.id, { ...basic, persona: p })
      showToast(`${draft.name} updated`)
      setEditing(false)
      setDraft(null)
    } catch (e) {
      showToast('Failed to save: ' + (e?.message ?? 'unknown error'), 'error')
    } finally {
      setSaving(false)
    }
  }

  function setField(key, val) {
    setDraft(d => ({ ...d, [key]: val }))
  }

  function setPersonaField(key, val) {
    setDraft(d => ({ ...d, persona: { ...d.persona, [key]: val } }))
  }

  const d  = draft ?? {}
  const dp = d.persona ?? {}

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => navigate('/creators')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1E28] border border-white/7 text-white/40 hover:text-white/70 hover:border-white/12 transition-all text-[12px] font-medium">
          ← Creators
        </button>
        <ChevronRight size={14} className="text-white/20" />
        <span className="text-white/30 text-[13px]">{creator.name}</span>
        <ChevronRight size={14} className="text-white/20" />
        <span className="text-white text-[13px]">Profile</span>

        <div className="ml-auto flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white/50 hover:text-white hover:bg-white/5 transition-all">
                <X size={13} /> Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold transition-all disabled:opacity-50">
                <Check size={13} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={startEdit} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/7 text-white/60 hover:text-white text-[13px] font-semibold transition-all">
              <Pencil size={13} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Rejection banner */}
      {creator.status === 'Rejected' && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/8 border border-rose-500/20 flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
          <div>
            <div className="text-[11px] font-semibold text-rose-400/80 uppercase tracking-wider mb-0.5">Application Rejected</div>
            <div className="text-[13px] text-rose-300/70">
              {persona.rejectionReason || <span className="italic text-rose-300/30">No reason recorded</span>}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[270px_1fr] gap-4">

        {/* Sidebar */}
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
          <div className="px-5 pt-6 pb-5 text-center border-b border-white/7 bg-gradient-to-b from-violet-600/8 to-transparent">
            <Avatar initials={editing ? d.initials : creator.initials} color={editing ? d.avatarColor : creator.avatarColor} size="xl" className="mx-auto" />

            {editing ? (
              <div className="mt-3 space-y-2 text-left">
                <div>
                  <label className={LABEL}>Full Name</label>
                  <input value={d.name} onChange={e => setField('name', e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Initials</label>
                  <input value={d.initials} onChange={e => setField('initials', e.target.value.toUpperCase().slice(0,3))} maxLength={3} className={cn(INPUT, 'text-center font-bold uppercase tracking-widest')} />
                </div>
                <div>
                  <label className={LABEL}>Avatar Color</label>
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    {AVATAR_COLOR_OPTIONS.map(opt => (
                      <button key={opt.key} type="button" onClick={() => setField('avatarColor', opt.key)}
                        className={cn(`w-6 h-6 rounded-full bg-gradient-to-br ${opt.gradient} transition-all`,
                          d.avatarColor === opt.key ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-[#1E1E28] scale-110' : 'opacity-50 hover:opacity-90'
                        )} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="font-syne text-[18px] font-extrabold text-white mt-3 tracking-tight">{creator.name}</div>
                <div className="text-[12px] text-white/30 mt-1">
                  {creator.platform}{creator.secondaryPlatform && <span className="opacity-60"> / {creator.secondaryPlatform}</span>} · {[creator.niche, creator.secondaryNiche].filter(Boolean).join(', ')}
                </div>
                <div className="flex justify-center gap-1.5 mt-2.5">
                  <Badge variant={tier.name.toLowerCase()}>
                    {tier.name === 'Platinum' ? '👑' : tier.name === 'Diamond' ? '💎' : tier.name === 'Gold' ? '🥇' : tier.name === 'Silver' ? '🥈' : '🥉'} {tier.name}
                  </Badge>
                  <Badge variant={creator.status === 'Active' ? 'green' : 'amber'}>{creator.status}</Badge>
                </div>
                <div className="font-mono text-[11px] text-white/25 mt-2">{creator.coins.toLocaleString()} 🪙 · {toNext === 0 ? 'Max tier' : `${toNext.toLocaleString()} to next`}</div>
                <div className="mt-2.5 px-1">
                  <ProgressBar value={progress} tierColor={tier.name.toLowerCase()} height="h-[5px]" />
                </div>
              </>
            )}
          </div>

          <div>
            {editing ? (
              <div className="p-4 space-y-3">
                {[
                  { label: 'Primary Platform',   key: 'platform',          type: 'select', options: PLATFORMS },
                  { label: 'Secondary Platform', key: 'secondaryPlatform', type: 'select', options: PLATFORMS, optional: true },
                  { label: 'Niches',             key: 'niche',             type: 'multi',  options: NICHES },
                  { label: 'Status',             key: 'status',            type: 'select', options: ['Active','On Hold'] },
                  { label: 'PIC',                key: 'pic',               type: 'select', options: PICS },
                  { label: 'Contact',            key: 'contact',           type: 'select', options: CONTACT_METHODS },
                ].map(f => (
                  <div key={f.key}>
                    <label className={LABEL}>
                      {f.label}
                      {f.optional && <span className="normal-case font-normal text-white/20 ml-1">(optional)</span>}
                    </label>
                    {f.type === 'multi' ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {f.options.map(o => {
                          const vals = (d[f.key] ?? '').split(', ').filter(Boolean)
                          const on = vals.includes(o)
                          return (
                            <button
                              key={o}
                              type="button"
                              onClick={() => {
                                const next = on ? vals.filter(x => x !== o) : [...vals, o]
                                setField(f.key, next.join(', '))
                              }}
                              className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${on ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/5 border-white/7 text-white/40 hover:border-white/20'}`}
                            >
                              {o}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <select value={d[f.key] ?? ''} onChange={e => setField(f.key, e.target.value)} className={SELECT}>
                        {f.optional && <option value="">None</option>}
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                ))}
                <div>
                  <label className={LABEL}>Followers</label>
                  <input type="number" value={d.followers ?? ''} onChange={e => setField('followers', Number(e.target.value))} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Contact Number</label>
                  {canReveal ? (
                    <input value={d.contactNumber ?? ''} onChange={e => setField('contactNumber', e.target.value)} placeholder="+60 12-345 6789" className={INPUT} />
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1A1A22] border border-white/[0.07] rounded-lg text-[12px] text-white/30 italic">
                      <Lock size={11} className="flex-shrink-0 text-white/20" />
                      Only {creator.pic} or Admin can edit contact details
                    </div>
                  )}
                </div>
                <div>
                  <label className={LABEL}>Email</label>
                  {canReveal ? (
                    <input type="email" value={d.email ?? ''} onChange={e => setField('email', e.target.value)} placeholder="name@email.com" className={INPUT} />
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1A1A22] border border-white/[0.07] rounded-lg text-[12px] text-white/30 italic">
                      <Lock size={11} className="flex-shrink-0 text-white/20" />
                      Only {creator.pic} or Admin can edit contact details
                    </div>
                  )}
                </div>
                <div>
                  <label className={LABEL}>Platform Username</label>
                  <input value={d.platformUsername ?? ''} onChange={e => setField('platformUsername', e.target.value)} placeholder="@username" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Date of Birth</label>
                  <input type="date" value={d.dateOfBirth ?? ''} onChange={e => setField('dateOfBirth', e.target.value)} className={cn(INPUT, '[color-scheme:dark]')} />
                </div>
              </div>
            ) : (
              <div>
                {[
                  ['Followers',      (creator.followers/1000).toFixed(0) + 'K'],
                  ['Platform',       creator.platform],
                  ...(creator.secondaryPlatform ? [['2nd Platform', creator.secondaryPlatform]] : []),
                  ['Niches', [creator.niche, creator.secondaryNiche].filter(Boolean).join(', ')],
                  ['Tasks Done',     creator.tasksCompleted],
                  ['Joined',         creator.joinedDate],
                  ['PIC',            creator.pic],
                  ['Contact',        creator.contact],
                  ...(creator.platformUsername ? [['Username', creator.platformUsername]] : []),
                  ...(creator.dateOfBirth ? [['Date of Birth', creator.dateOfBirth]] : []),
                ].map(([label, val]) => (
                  <div key={label} className={`flex px-4 py-2.5 border-b border-white/7 text-[12px] ${label === 'Niches' ? 'flex-col gap-1.5' : 'justify-between items-center'}`}>
                    <span className="text-white/30">{label}</span>
                    {label === 'Niches' ? (
                      <div className="flex flex-wrap gap-1.5">
                        {String(val).split(', ').filter(Boolean).map(n => (
                          <span key={n} className="text-[11px] px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-medium">{n}</span>
                        ))}
                      </div>
                    ) : (
                      <span className={`font-medium ${label === 'Contact' ? 'text-violet-400' : 'text-white'}`}>{val}{label === 'Contact' ? ' ↗' : ''}</span>
                    )}
                  </div>
                ))}
                {(creator.contactNumber || creator.email) && (
                  <div className="mx-3 my-2 px-3 py-2 bg-white/[.025] border border-white/7 rounded-lg space-y-2">
                    <div className="font-mono text-[9px] font-medium text-white/20 uppercase tracking-wider mb-2">Private Contact Info</div>
                    {creator.contactNumber && (
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-white/30">Phone</span>
                        <MaskedField
                          value={creator.contactNumber}
                          revealed={revealed.phone}
                          onToggle={() => setRevealed(r => ({ ...r, phone: !r.phone }))}
                          canReveal={canReveal}
                        />
                      </div>
                    )}
                    {creator.email && (
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="text-white/30">Email</span>
                        <MaskedField
                          value={creator.email}
                          revealed={revealed.email}
                          onToggle={() => setRevealed(r => ({ ...r, email: !r.email }))}
                          canReveal={canReveal}
                        />
                      </div>
                    )}
                    {!canReveal && (
                      <div className="text-[10px] text-white/20 italic mt-1">Only {creator.pic} or Admin can reveal</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main */}
        <div className="flex flex-col gap-3.5">

          {/* Content profile */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px]">
            <div className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em] mb-3.5">Content Profile</div>
            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              {[['contentStyle','Content Style'],['toneOfVoice','Tone of Voice']].map(([key, label]) => (
                <div key={key}>
                  <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.05em] mb-1">{label}</div>
                  {editing
                    ? <input value={dp[key] ?? ''} onChange={e => setPersonaField(key, e.target.value)} className={INPUT} />
                    : <div className="text-[13px] text-white">{persona[key] || <span className="text-white/20 italic">Not set</span>}</div>
                  }
                </div>
              ))}
            </div>
            <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.05em] mb-2">Brand Fit Tags</div>
            {editing
              ? <TagInput items={dp.brandFitTags} onChange={v => setPersonaField('brandFitTags', v)} placeholder="Add tag and press Enter" />
              : <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(persona.brandFitTags) ? persona.brandFitTags : []).map((tag, i) => (
                    <span key={tag} className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${TAG_STYLE[TAG_COLORS[i % TAG_COLORS.length]]}`}>{tag}</span>
                  ))}
                </div>
            }
          </div>

          {/* Demographics */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px]">
            <div className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em] mb-3.5">Audience Demographics</div>
            <div className="grid grid-cols-3 gap-2.5 mb-3.5">
              {[
                ['audienceAgeRange','Primary age range'],
                ['audienceGender','Gender split'],
                ['audienceLocations','Top locations'],
              ].map(([key, label]) => (
                <div key={key} className="bg-[#16161C] border border-white/7 rounded-[9px] p-3">
                  {editing
                    ? <input value={dp[key] ?? ''} onChange={e => setPersonaField(key, e.target.value)} placeholder={label} className={cn(INPUT, 'mb-1 text-[13px] font-bold')} />
                    : <div className="font-syne text-[18px] font-extrabold text-white">{persona[key] || '—'}</div>
                  }
                  <div className="text-[10px] text-white/25 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.05em] mb-1.5">Engagement Style</div>
            {editing
              ? <textarea value={dp.engagementStyle ?? ''} onChange={e => setPersonaField('engagementStyle', e.target.value)} rows={2} className={cn(INPUT, 'resize-none')} />
              : <div className="text-[13px] text-white/60">{persona.engagementStyle || <span className="italic text-white/20">Not set</span>}</div>
            }
          </div>

          {/* Past collabs */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px]">
            <div className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em] mb-3">Past Collaborations</div>
            {editing
              ? <TagInput items={dp.pastCollabs} onChange={v => setPersonaField('pastCollabs', v)} placeholder="Add brand and press Enter" />
              : <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(persona.pastCollabs) ? persona.pastCollabs : []).map((brand, i) => (
                    <span key={brand} className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${TAG_STYLE[TAG_COLORS[i % TAG_COLORS.length]]}`}>{brand}</span>
                  ))}
                </div>
            }
          </div>

          {/* Do's & Don'ts */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px]">
            <div className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em] mb-3.5">Do's & Don'ts</div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-emerald-400/6 border border-emerald-400/15 rounded-[9px] p-3.5">
                <div className="font-mono text-[9px] font-medium text-emerald-400 uppercase tracking-[.08em] mb-2.5">Do's</div>
                {editing
                  ? <TagInput items={dp.dos} onChange={v => setPersonaField('dos', v)} placeholder="Add item and press Enter" />
                  : <ul className="space-y-1.5">
                      {(Array.isArray(persona.dos) ? persona.dos : []).map(d => (
                        <li key={d} className="flex items-start gap-2 text-[12px] text-emerald-300/70 leading-snug">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />{d}
                        </li>
                      ))}
                    </ul>
                }
              </div>
              <div className="bg-rose-400/6 border border-rose-400/15 rounded-[9px] p-3.5">
                <div className="font-mono text-[9px] font-medium text-rose-400 uppercase tracking-[.08em] mb-2.5">Don'ts</div>
                {editing
                  ? <TagInput items={dp.donts} onChange={v => setPersonaField('donts', v)} placeholder="Add item and press Enter" />
                  : <ul className="space-y-1.5">
                      {(Array.isArray(persona.donts) ? persona.donts : []).map(d => (
                        <li key={d} className="flex items-start gap-2 text-[12px] text-rose-300/70 leading-snug">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0 mt-1.5" />{d}
                        </li>
                      ))}
                    </ul>
                }
              </div>
            </div>
          </div>

          {/* Internal notes */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px]">
            <div className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em] mb-3">Internal Notes</div>
            {editing
              ? <textarea value={dp.internalNotes ?? ''} onChange={e => setPersonaField('internalNotes', e.target.value)} rows={4} className={cn(INPUT, 'resize-none font-mono text-[12px]')} placeholder="Add internal notes…" />
              : <div className="bg-[#16161C] border border-white/7 rounded-[9px] p-3.5 font-mono text-[12px] text-white/40 leading-relaxed">
                  {persona.internalNotes || <span className="italic text-white/20">No notes</span>}
                </div>
            }
          </div>

          {/* Completed tasks */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px]">
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em]">Completed Tasks</div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                {completedTasks.length}
              </span>
            </div>
            {completedTasks.length === 0
              ? <div className="text-[12px] text-white/20 italic">No completed tasks yet.</div>
              : <div className="space-y-2">
                  {completedTasks.map(t => (
                    <div key={t.id} className="bg-[#16161C] border border-white/7 rounded-[9px] px-3.5 py-2.5">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] text-white truncate">{t.task}</div>
                          <div className="text-[11px] text-white/30 mt-0.5">{t.project}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {t.rating > 0 && (
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(n => (
                                <Star key={n} size={10} className={n <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'} />
                              ))}
                            </div>
                          )}
                          <span className={`text-[11px] font-medium ${PRIORITY_COLOR[t.priority] ?? 'text-white/40'}`}>{t.priority}</span>
                          <span className="text-[11px] text-amber-400 font-mono">+{t.coins} 🪙</span>
                          <span className="text-[11px] text-white/25">{t.dueDate}</span>
                        </div>
                      </div>
                      {t.review && (
                        <div className="mt-2 ml-[22px] text-[11px] text-white/35 italic border-l border-white/7 pl-2.5">
                          {t.review}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
            }
          </div>

        </div>
      </div>
    </div>
  )
}
