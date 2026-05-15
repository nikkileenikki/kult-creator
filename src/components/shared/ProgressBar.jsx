import { cn } from '@/lib/utils'
import { PROGRESS_BAR_CLASSES } from '@/lib/tierUtils'

export default function ProgressBar({ value = 0, tierColor = 'bronze', height = 'h-1', className }) {
  const barClass = PROGRESS_BAR_CLASSES[tierColor] || PROGRESS_BAR_CLASSES.bronze
  return (
    <div className={cn('w-full bg-white/6 rounded-full overflow-hidden', height, className)}>
      <div
        className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', barClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
