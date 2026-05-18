import { useCreatorStore } from '@/store/creatorStore'
import { getTier, TIERS } from '@/lib/tierUtils'
import Avatar from '@/components/shared/Avatar'
import Badge from '@/components/shared/Badge'
import ProgressBar from '@/components/shared/ProgressBar'

const TIER_EMOJI  = { Platinum:'👑', Diamond:'💎', Gold:'🥇', Silver:'🥈', Bronze:'🥉' }
const TIER_BADGE  = { Platinum:'platinum', Diamond:'diamond', Gold:'gold', Silver:'silver', Bronze:'bronze' }
const TIER_COUNT_COLOR = { Platinum:'text-purple-300', Diamond:'text-blue-300', Gold:'text-amber-300', Silver:'text-gray-300', Bronze:'text-rose-300' }
const TIER_BORDER = { Platinum:'border-purple-400/25', Diamond:'border-blue-400/20', Gold:'border-amber-400/20', Silver:'border-white/7', Bronze:'border-white/7' }

export default function Tiering() {
  const creators = useCreatorStore(s => s.creators)
  const sorted = [...creators].sort((a, b) => b.coins - a.coins)
  const maxCoins = sorted[0]?.coins || 1

  const tierCounts = TIERS.map(t => ({
    ...t,
    count: creators.filter(c => getTier(c.coins).name === t.name).length,
  }))

  return (
    <div className="animate-[fadeUp_.3s_ease]">
      <div className="mb-5">
        <h1 className="font-syne text-[22px] font-extrabold text-white tracking-tight">Creator Tiering</h1>
        <p className="text-[12px] text-white/30 mt-1">Coin-based progression · 100 coins per completed task</p>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[...tierCounts].reverse().map(t => (
          <div key={t.name} className={`bg-[#1E1E28] border ${TIER_BORDER[t.name]} rounded-[14px] p-[18px] text-center hover:-translate-y-0.5 transition-all cursor-default`}>
            <span className="text-[26px] block mb-2">{TIER_EMOJI[t.name]}</span>
            <div className="font-syne text-[13px] font-bold text-white">{t.name}</div>
            <div className="font-mono text-[9px] text-white/25 mt-1 tracking-[.03em]">{t.min.toLocaleString()}{t.max === Infinity ? '+' : ` – ${t.max.toLocaleString()}`} coins</div>
            <div className={`font-syne text-[28px] font-extrabold mt-2.5 ${TIER_COUNT_COLOR[t.name]}`}>{t.count}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">

        {/* Leaderboard */}
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/7">
            <span className="font-syne text-[14px] font-bold text-white">Coin Leaderboard</span>
            <span className="font-mono text-[10px] text-white/25">Total: {creators.reduce((s,c)=>s+c.coins,0).toLocaleString()} 🪙</span>
          </div>
          {sorted.map((c, i) => {
            const tier = getTier(c.coins)
            const rankColors = ['text-amber-300','text-gray-300','text-rose-300']
            return (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/7 last:border-0 hover:bg-white/[.025] transition-colors cursor-pointer">
                <span className={`font-syne text-[14px] font-extrabold w-6 text-center flex-shrink-0 ${rankColors[i] || 'text-white/25'}`}>#{i+1}</span>
                <Avatar initials={c.initials} color={c.avatarColor} size="sm" />
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-white">{c.name}</div>
                  <div className="font-mono text-[10px] text-white/30 mt-0.5">{c.coins.toLocaleString()} coins · {c.platform}</div>
                </div>
                <div className="w-24">
                  <ProgressBar value={(c.coins / maxCoins) * 100} tierColor={tier.name.toLowerCase()} height="h-1" />
                </div>
                <Badge variant={TIER_BADGE[tier.name]}>{tier.name}</Badge>
              </div>
            )
          })}
        </div>

        {/* Rules */}
        <div className="bg-[#1E1E28] border border-white/7 rounded-[14px] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-white/7">
            <span className="font-syne text-[13px] font-bold text-white">Tier Rules</span>
          </div>
          {[...TIERS].reverse().map(t => (
            <div key={t.name} className="flex items-center gap-3 px-4 py-3 border-b border-white/7">
              <span className="text-[18px]">{TIER_EMOJI[t.name]}</span>
              <Badge variant={TIER_BADGE[t.name]} className="min-w-[76px] justify-center">{t.name}</Badge>
              <span className="text-white/20 text-[14px]">→</span>
              <span className="font-mono text-[12px] text-white/40">
                {t.min.toLocaleString()}{t.max === Infinity ? '+ coins' : ` – ${t.max.toLocaleString()} coins`}
              </span>
            </div>
          ))}
          <div className="px-4 py-4 bg-violet-600/6 border-t border-white/7">
            <div className="font-mono text-[10px] text-white/25 uppercase tracking-[.06em] mb-1.5">Default coin award</div>
            <div className="font-syne text-[22px] font-extrabold text-violet-300">100 🪙</div>
            <div className="text-[11px] text-white/25 mt-1">per completed task</div>
          </div>
        </div>

      </div>
    </div>
  )
}
