'use client'

import { dilution_note } from '@/lib/reconstitution'

/** Trims the trailing ".0" so a clean draw reads "20 units", not "20.0 units". */
function fmtUnits(n) {
  return n >= 10 ? Math.round(n).toString() : n.toFixed(1).replace(/\.0$/, '')
}

/**
 * Mode B's water control. Replaces the old "preferred draw size" number input,
 * which asked the user to specify a means (syringe units) when all they had was
 * an end (how much water to add) — and then rounded their answer away.
 *
 * Each card is an outcome computed forward from a real volume, so the units
 * shown are the units they will get.
 */
export default function DilutionPicker({
  dilution,
  value,
  onChange,
  syringeType = 'U-100',
  doseLabel,
}) {
  const label = 'How much BAC water to add?'

  if (!dilution?.options?.length) {
    return (
      <div>
        <p className="eyebrow mb-1.5">{label}</p>
        <p className="text-[13px] leading-5 text-tx3-body">
          Enter a vial strength and target dose to see your options.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="eyebrow mb-1.5">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-3 gap-2 sm:grid-cols-5"
      >
        {dilution.options.map((o) => {
          const active = o.water_ml === value
          const recommended = o.water_ml === dilution.recommended_water_ml
          const note = dilution_note(o, syringeType)
          const units = fmtUnits(o.units_per_dose)
          return (
            <button
              key={o.water_ml}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.water_ml)}
              aria-label={`Add ${o.water_ml} millilitres — draw ${units} units per dose${
                note ? `, ${note.toLowerCase()}` : ''
              }${recommended ? ', recommended' : ''}`}
              className={`min-h-[76px] rounded-[10px] border px-2 py-2.5 text-center transition-colors ${
                active
                  ? 'border-teal bg-teal/12'
                  : 'border-hairline bg-white/5 hover:border-hairline-strong'
              }`}
            >
              <span
                className={`block font-mono text-[15px] font-bold ${
                  active ? 'text-teal' : 'text-tx'
                }`}
              >
                {o.water_ml} mL
              </span>
              <span className="mt-0.5 block text-[12px] text-tx2">
                {units} units
              </span>
              <span
                className={`mt-0.5 block text-[10px] leading-[13px] ${
                  o.quality === 'tiny' || o.quality === 'over'
                    ? 'text-warn'
                    : recommended
                      ? 'text-teal'
                      : 'text-tx3-body'
                }`}
              >
                {note ?? (recommended ? 'Recommended' : ' ')}
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-[12px] leading-5 text-tx3-body">
        Every option gives the same{doseLabel ? ` ${doseLabel}` : ''} dose — more
        water only spreads it across more units on the barrel, which is easier to
        measure accurately.
      </p>
    </div>
  )
}
