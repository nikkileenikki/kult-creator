import { cn } from '@/lib/utils'

const AVATAR_COLORS = {
  v: 'bg-gradient-to-br from-violet-600 to-violet-400',
  b: 'bg-gradient-to-br from-blue-600 to-blue-400',
  g: 'bg-gradient-to-br from-emerald-600 to-emerald-400',
  a: 'bg-gradient-to-br from-amber-600 to-amber-400',
  r: 'bg-gradient-to-br from-rose-700 to-rose-400',
  t: 'bg-gradient-to-br from-teal-700 to-teal-400',
  i: 'bg-gradient-to-br from-purple-700 to-purple-400',
}

const SIZES = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-[13px]',
  lg: 'w-12 h-12 text-[16px]',
  xl: 'w-16 h-16 text-[21px]',
}

export default function Avatar({ initials, color = 'v', size = 'md', className }) {
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center text-white font-syne font-bold flex-shrink-0',
      AVATAR_COLORS[color] || AVATAR_COLORS.v,
      SIZES[size],
      className
    )}>
      {initials}
    </div>
  )
}
