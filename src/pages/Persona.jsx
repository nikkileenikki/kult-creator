import { useNavigate } from 'react-router-dom'
import { CREATORS } from '@/lib/data'
import { getTier, getProgress, coinsToNextTier } from '@/lib/tierUtils'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import ProgressBar from '@/components/shared/ProgressBar'
import { ChevronRight } from 'lucide-react'

const creator = CREATORS[0] // Siti Rania as default
const TAG_COLORS = ['tag-teal','tag-purple','tag-amber','tag-blue','tag-coral','tag-green']
const TAG_STYLE = {
  'tag-teal':   'bg-teal-400/12 text-teal-400',
  'tag-purple': 'bg-violet-400/15 text-violet-300',
  'tag-amber':  'bg-amber-400/12 text-amber-300',
  'tag-blue':   'bg-blue-400/12 text-blue-400',
  'tag-coral':  'bg-rose-400/12 text-rose-300',
  'tag-green':  'bg-emerald-400/12 text-emerald-400',
}

export default function Persona() {
  const navigate = useNavigate()
  const tier = getTier(creator.coins)
  const progress = getProgress(creator.coins)
  const toNext = coinsToNextTier(creator.coins)
  const { persona } = creator

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-[13px]">
        <button onClick={() => navigate('/creators')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1E28] border border-white/7 text-white/40 hover:text-white/70 hover:border-white/12 transition-all text-[12px] font-medium">
          ← Creators
        </button>
        <ChevronRight size={14} className="text-white/20" />
        <span className="text-white/30">{creator.name}</span>
        <ChevronRight size={14} className="text-white/20" />
        <span className="text-white">Persona</span>
      </div>

      <div className="grid grid-cols-[270px_1fr] gap-4">

        {/* Sidebar */}
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
          <div className="px-5 pt-6 pb-5 text-center border-b border-white/7 bg-gradient-to-b from-violet-600/8 to-transparent">
            <Avatar initials={creator.initials} color={creator.avatarColor} size="xl" className="mx-auto" />
            <div className="font-syne text-[18px] font-extrabold text-white mt-3 tracking-tight">{creator.name}</div>
            <div className="text-[12px] text-white/30 mt-1">{creator.platform} · {creator.niche}</div>
            <div className="flex justify-center gap-1.5 mt-2.5">
              <Badge variant={tier.name.toLowerCase()}>{tier.name === 'Platinum' ? '👑' : tier.name === 'Diamond' ? '💎' : tier.name === 'Gold' ? '🥇' : tier.name === 'Silver' ? '🥈' : '🥉'} {tier.name}</Badge>
              <Badge variant={creator.status === 'Active' ? 'green' : 'amber'}>{creator.status}</Badge>
            </div>
            <div className="font-mono text-[11px] text-white/25 mt-2">{creator.coins.toLocaleString()} 🪙 · {toNext === 0 ? 'Max tier reached' : `${toNext.toLocaleString()} to next tier`}</div>
            <div className="mt-2.5 px-1">
              <ProgressBar value={progress} tierColor={tier.name.toLowerCase()} height="h-[5px]" />
            </div>
          </div>
          <div>
            {[
              ['Followers', (creator.followers/1000).toFixed(0) + 'K'],
              ['Platform', creator.platform],
              ['Niche', creator.niche],
              ['Tasks Done', creator.tasksCompleted],
              ['Joined', creator.joinedDate],
              ['PIC', creator.pic],
              ['Contact', creator.contact],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-center px-4 py-2.5 border-b border-white/7 last:border-0 text-[12px]">
                <span className="text-white/30">{label}</span>
                <span className={`font-medium ${label === 'Contact' ? 'text-violet-400 cursor-pointer' : 'text-white'}`}>{val}{label === 'Contact' ? ' ↗' : ''}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex flex-col gap-3.5">

          {/* Content profile */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px]">
            <div className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em] mb-3.5">Content Profile</div>
            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              {[['Content style', persona.contentStyle], ['Tone of voice', persona.toneOfVoice]].map(([label, val]) => (
                <div key={label}>
                  <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.05em] mb-1">{label}</div>
                  <div className="text-[13px] text-white">{val}</div>
                </div>
              ))}
            </div>
            <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.05em] mb-2">Brand Fit Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {persona.brandFitTags.map((tag, i) => (
                <span key={tag} className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${TAG_STYLE[TAG_COLORS[i % TAG_COLORS.length]]}`}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px]">
            <div className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em] mb-3.5">Audience Demographics</div>
            <div className="grid grid-cols-3 gap-2.5 mb-3.5">
              {[
                ['Primary age range', persona.audienceAgeRange],
                ['Gender split', persona.audienceGender],
                ['Top locations', persona.audienceLocations],
              ].map(([label, val]) => (
                <div key={label} className="bg-[#16161C] border border-white/7 rounded-[9px] p-3">
                  <div className="font-syne text-[18px] font-extrabold text-white">{val}</div>
                  <div className="text-[10px] text-white/25 mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.05em] mb-1.5">Engagement Style</div>
            <div className="text-[13px] text-white/60">{persona.engagementStyle}</div>
          </div>

          {/* Past collabs */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px]">
            <div className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em] mb-3">Past Collaborations</div>
            <div className="flex flex-wrap gap-1.5">
              {persona.pastCollabs.map((brand, i) => (
                <span key={brand} className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${TAG_STYLE[TAG_COLORS[i % TAG_COLORS.length]]}`}>{brand}</span>
              ))}
            </div>
          </div>

          {/* Do's & Don'ts */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px]">
            <div className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em] mb-3.5">Do's & Don'ts</div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-emerald-400/6 border border-emerald-400/15 rounded-[9px] p-3.5">
                <div className="font-mono text-[9px] font-medium text-emerald-400 uppercase tracking-[.08em] mb-2.5">Do's</div>
                <ul className="space-y-1.5">
                  {persona.dos.map(d => (
                    <li key={d} className="flex items-start gap-2 text-[12px] text-emerald-300/70 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-rose-400/6 border border-rose-400/15 rounded-[9px] p-3.5">
                <div className="font-mono text-[9px] font-medium text-rose-400 uppercase tracking-[.08em] mb-2.5">Don'ts</div>
                <ul className="space-y-1.5">
                  {persona.donts.map(d => (
                    <li key={d} className="flex items-start gap-2 text-[12px] text-rose-300/70 leading-snug">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0 mt-1.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Internal notes */}
          <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px]">
            <div className="font-mono text-[10px] font-medium text-white/25 uppercase tracking-[.08em] mb-3">Internal Notes</div>
            <div className="bg-[#16161C] border border-white/7 rounded-[9px] p-3.5 font-mono text-[12px] text-white/40 leading-relaxed">{persona.internalNotes}</div>
          </div>

        </div>
      </div>
    </div>
  )
}
