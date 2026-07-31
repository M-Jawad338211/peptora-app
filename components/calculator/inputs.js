'use client'

import { useId } from 'react'

/** Uppercase eyebrow label used above every calculator input. */
export function InputLabel({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="eyebrow mb-1.5 block">
      {children}
    </label>
  )
}

/**
 * Numeric text input. `inputMode="decimal"` brings up the numeric keypad on
 * phones while still allowing a decimal point.
 */
export function NumberInput({ label, suffix, className = '', ...props }) {
  const id = useId()
  return (
    <div className={className}>
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="w-full rounded-[10px] border border-hairline bg-navy px-3.5 py-3 text-[15px] text-tx placeholder:text-tx3-body"
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[13px] text-tx3-body">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Segmented radio group — used for dose units, syringe type and the
 * reconstituted toggle. A real radiogroup so arrow keys work.
 */
export function ChipGroup({ label, options, value, onChange, name }) {
  return (
    <div>
      {label && <p className="eyebrow mb-1.5">{label}</p>}
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value
          const text = typeof opt === 'string' ? opt : opt.label
          const active = val === value
          return (
            <button
              key={String(val)}
              type="button"
              role="radio"
              aria-checked={active}
              name={name}
              onClick={() => onChange(val)}
              className={`min-h-[38px] rounded-[8px] border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
                active
                  ? 'border-teal bg-teal/12 text-teal'
                  : 'border-hairline bg-white/5 text-tx2 hover:text-tx'
              }`}
            >
              {text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
