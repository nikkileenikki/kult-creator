import { useNavigate } from 'react-router-dom'
import { useCreatorStore } from '@/store/creatorStore'
import { getTier, getProgress, coinsToNextTier } from '@/lib/tierUtils'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import ProgressBar from '@/components/shared/ProgressBar'

const TIER_BADGE = { Platinum:'platinum', Diamond:'diamond', Gold:'gold', Silver:'silver', Bronze:'bronze' }
const TIER_EMOJI = { Platinum:'👑', Diamond:'💎', Gold:'🥇', Silver:'🥈', Bronze:'🥉' }

export default function Creators() {
  const creators = useCreatorStore(s => s.creators)
  const navigate = useNavigate()

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Creators</h1>
          <p className="text-[12px] text-white/30 mt-1">{creators.length} creators · All tiers</p>
        </div>
        <div className="flex gap-2">
          {['All Tiers','All Platforms','All Statuses'].map(f => (
            <select key={f} className="text-[12px] px-2.5 py-1.5 border border-white/7 rounded-lg bg-[#1E1E28] text-white/40 font-figtree outline-none hover:border-white/12 cursor-pointer">
              <option>{f}</option>
            </select>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
        {creators.map(c => {
          const tier = getTier(c.coins)
          const progress = getProgress(c.coins)
          const toNext = coinsToNextTier(c.coins)

          return (
            <div
              key={c.id}
              onClick={() => navigate(`/persona/${c.id}`)}
              className="bg-[#1E1E28] border border-white/7 rounded-[14px] p-[18px] cursor-pointer transition-all duration-200 hover:border-violet-500/40 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,.3)] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start gap-3 mb-3.5">
                <Avatar initials={c.initials} color={c.avatarColor} size="md" />
                <div className="flex-1">
                  <div className="font-syne text-[15px] font-bold text-white tracking-tight">{c.name}</div>
                  <div className="text-[11px] text-white/30 mt-0.5">{c.platform} · {c.niche}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant={TIER_BADGE[tier.name]}>{TIER_EMOJI[tier.name]} {tier.name}</Badge>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.status==='Active'?'bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,.5)]':'bg-amber-400'}`} />
                    <span className="font-mono text-[11px] text-white/25 ml-auto">{c.coins.toLocaleString()} 🪙</span>
                  </div>
                </div>
              </div>

              <div className="mb-3.5">
                <div className="flex justify-between font-mono text-[10px] text-white/25 mb-1.5">
                  <span>{toNext > 0 ? `${toNext.toLocaleString()} to ${getTier(c.coins + toNext).name}` : 'Max tier reached'}</span>
                  <span>{c.coins.toLocaleString()}{toNext > 0 ? ` / ${(c.coins + toNext).toLocaleString()}` : ''}</span>
                </div>
                <ProgressBar value={progress} tierColor={tier.name.toLowerCase()} height="h-1" />
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-white/7 pt-3.5">
                <div>
                  <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.04em]">Followers</div>
                  <div className="font-syne text-[14px] font-bold text-white mt-0.5">{(c.followers/1000).toFixed(0)}K</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.04em]">Tasks</div>
                  <div className="font-syne text-[14px] font-bold text-white mt-0.5">{c.tasksCompleted}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.04em]">Status</div>
                  <div className={`text-[11px] font-medium mt-0.5 ${c.status==='Active'?'text-emerald-400':'text-amber-300'}`}>{c.status}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
