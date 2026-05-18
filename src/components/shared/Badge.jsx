import { cn } from '@/lib/utils'

const VARIANTS = {
  green:    'bg-emerald-400/12 text-emerald-400',
  red:      'bg-rose-400/12 text-rose-400',
  amber:    'bg-amber-400/12 text-amber-300',
  blue:     'bg-blue-400/12 text-blue-400',
  purple:   'bg-violet-400/15 text-violet-300',
  gray:     'bg-white/6 text-white/50 border border-white/10',
  teal:     'bg-teal-400/12 text-teal-400',
  platinum: 'bg-purple-400/15 text-purple-300 border border-purple-400/25',
  diamond:  'bg-blue-400/15 text-blue-300 border border-blue-400/20',
  gold:     'bg-amber-400/15 text-amber-300 border border-amber-400/20',
  silver:   'bg-gray-400/12 text-gray-300 border border-gray-400/20',
  bronze:   'bg-rose-400/12 text-rose-300 border border-rose-400/20',
}

export default function Badge({ children, variant = 'gray', className }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap',
      VARIANTS[variant] || VARIANTS.gray,
      className
    )}>
      {children}
    </span>
  )
}
