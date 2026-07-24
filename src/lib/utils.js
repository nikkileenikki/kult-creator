import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Compact number formatting: 850 -> "850", 12400 -> "12K", 1000000 -> "1M"
export function formatCompactNumber(n) {
  if (n == null || isNaN(n)) return '0'
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${trimZero(n / 1_000_000)}M`
  if (abs >= 1_000)     return `${trimZero(n / 1_000)}K`
  return String(n)
}

function trimZero(n) {
  return Number(n.toFixed(1)).toString()
}
