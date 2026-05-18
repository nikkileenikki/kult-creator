export const TIERS = [
  { name: 'Bronze',   min: 0,    max: 499,   emoji: '🥉', color: 'bronze',   pb: 'pb-bronze' },
  { name: 'Silver',   min: 500,  max: 1499,  emoji: '🥈', color: 'silver',   pb: 'pb-silver' },
  { name: 'Gold',     min: 1500, max: 3999,  emoji: '🥇', color: 'gold',     pb: 'pb-gold'   },
  { name: 'Diamond',  min: 4000, max: 7999,  emoji: '💎', color: 'diamond',  pb: 'pb-diamond' },
  { name: 'Platinum', min: 8000, max: Infinity, emoji: '👑', color: 'platinum', pb: 'pb-platinum' },
]

export function getTier(coins) {
  return TIERS.find(t => coins >= t.min && coins <= t.max) || TIERS[0]
}

export function getNextTier(coins) {
  const idx = TIERS.findIndex(t => coins >= t.min && coins <= t.max)
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null
}

export function getProgress(coins) {
  const tier = getTier(coins)
  if (tier.max === Infinity) return 100
  const range = tier.max - tier.min + 1
  const progress = coins - tier.min
  return Math.round((progress / range) * 100)
}

export function coinsToNextTier(coins) {
  const next = getNextTier(coins)
  return next ? next.min - coins : 0
}

export const TIER_BADGE_CLASSES = {
  platinum: 'bg-purple-500/15 text-purple-300 border border-purple-400/25',
  diamond:  'bg-blue-500/15 text-blue-300 border border-blue-400/20',
  gold:     'bg-amber-500/15 text-amber-300 border border-amber-400/20',
  silver:   'bg-gray-400/12 text-gray-300 border border-gray-400/20',
  bronze:   'bg-rose-500/12 text-rose-300 border border-rose-400/20',
}

export const PROGRESS_BAR_CLASSES = {
  platinum: 'from-purple-700 to-purple-300',
  diamond:  'from-blue-700 to-blue-300',
  gold:     'from-amber-600 to-amber-300',
  silver:   'from-gray-500 to-gray-300',
  bronze:   'from-rose-700 to-rose-300',
}
