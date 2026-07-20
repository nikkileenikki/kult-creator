import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, X, Check } from 'lucide-react'

const LABEL = 'block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5'
const CHIP  = 'inline-flex items-center gap-1.5 bg-[#3A3A4E] text-white text-[12px] px-2.5 py-1.5 rounded-md'

export default function TagMultiSelect({ label, options, selected, onChange, getKey, getLabel, placeholder, compact }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function toggle(key) {
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key])
  }

  return (
    <div className={compact ? 'min-w-[160px]' : undefined}>
      {label && <div className={LABEL}>{label}</div>}
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className={cn(
            'w-full flex items-center justify-between rounded-lg bg-[#1A1A22] border border-white/[0.07] text-white/50 hover:border-white/15 transition-all',
            compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2.5 text-[13px]',
          )}
        >
          <span className="truncate">{selected.length > 0 ? `${selected.length} selected` : (placeholder ?? `Add ${label?.toLowerCase() ?? 'item'}`)}</span>
          <ChevronDown size={compact ? 11 : 13} className={cn('transition-transform text-white/30 flex-shrink-0 ml-1', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-30 min-w-[200px] max-h-[240px] overflow-y-auto bg-[#111116] border border-white/10 rounded-lg shadow-2xl py-1">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-[12px] text-white/20">No options available</div>
            ) : options.map(o => {
              const key = getKey(o)
              const isSelected = selected.includes(key)
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => toggle(key)}
                  className={cn(
                    'w-full flex items-center justify-between text-left px-3 py-2 text-[12px] transition-colors',
                    isSelected ? 'text-white bg-violet-500/10' : 'text-white/70 hover:bg-white/5',
                  )}
                >
                  <span className="truncate">{getLabel(o)}</span>
                  {isSelected && <Check size={13} className="text-violet-400 flex-shrink-0 ml-2" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map(key => {
            const opt = options.find(o => getKey(o) === key)
            return (
              <span key={key} className={CHIP}>
                {opt ? getLabel(opt) : key}
                <button type="button" onClick={() => toggle(key)} className="text-white/50 hover:text-white transition-colors">
                  <X size={11} />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
